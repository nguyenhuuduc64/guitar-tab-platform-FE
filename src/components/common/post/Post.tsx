import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MoreHorizontal,
    Heart,
    MessageCircle,
    Music,
    Clock,
    User as UserIcon,
    Loader2,
    ExternalLink
} from 'lucide-react';
import ChordViewer from '../ChordViewer';
import CommentList from '../comment/CommentList';
import CommentForm from '../comment/CommentForm';
import instance from '../../../config/axios';

import { type Chord } from '../../../types/chord';
import { type AudioItem as Audio } from '../../../types/audio';
import { type PostData } from '../../../types/post';
import { type CommentData } from '../../../types/comment';
import { type User } from '../../../types/user';

interface PostProps {
    post: PostData;
    currentUserId?: string;
    likeCount?: number;
    commentCount?: number;
    isLiked?: boolean;
    isLikeLoading?: boolean;
    comments?: CommentData[];
    showComments?: boolean;
    loadingComments?: boolean;
    onLike: (postId: string) => void;
    onToggleComments: (postId: string) => void;
    onCommentCreated: (postId: string) => void;
    onDeleteComment: (commentId: string, postId: string) => void;
    onEditComment: (commentId: string, content: string, postId: string) => void;
    formatTimeAgo: (date: string) => string;
    className?: string;
    isFollowing?: boolean;
    onFollowUser?: (userId: string) => void;
    onUnfollowUser?: (userId: string) => void;
    isFollowLoading?: boolean;
}

// Cache user info để tránh gọi API nhiều lần
const userCache = new Map<string, User>();

const WAVEFORM_BARS = [
    12, 18, 15, 22, 28, 20, 25, 30, 35, 24, 28, 38, 42, 35, 30, 25, 20, 18, 15, 12,
    18, 22, 25, 32, 40, 45, 38, 30, 28, 25, 22, 18, 24, 28, 35, 42, 38, 30, 25, 20,
    15, 18, 22, 28, 30, 25, 20, 18, 15, 12, 8, 10, 12, 15, 18, 20, 15, 12, 10, 8
];

const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export function Post({
    post,
    currentUserId,
    likeCount = 0,
    commentCount = 0,
    isLiked = false,
    isLikeLoading = false,
    comments = [],
    showComments = false,
    loadingComments = false,
    onLike,
    onToggleComments,
    onCommentCreated,
    onDeleteComment,
    onEditComment,
    formatTimeAgo,
    className = '',
    isFollowing = false,
    onFollowUser,
    onUnfollowUser,
    isFollowLoading = false
}: PostProps) {
    const navigate = useNavigate();
    const [showFullContent, setShowFullContent] = useState(false);
    const [chordInfo, setChordInfo] = useState<Chord | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlayingLocal, setIsPlayingLocal] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlayingLocal) {
            audioRef.current.pause();
            setIsPlayingLocal(false);
        } else {
            audioRef.current.play();
            setIsPlayingLocal(true);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current && duration > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };
    const [loadingChord, setLoadingChord] = useState(false);
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const commentsContainerRef = useRef<HTMLDivElement>(null);

    const isLongContent = post.content.length > 300;
    const displayContent = showFullContent || !isLongContent
        ? post.content
        : post.content.slice(0, 300) + '...';

    const transformCommentForUI = (comment: CommentData) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: {
            id: comment.userId,
            name: comment.userFullName || comment.username,
            username: comment.username,
            avatar: comment.userImageUrl
        },
        post: {
            id: comment.postId
        }
    });

    // Lấy thông tin user khi bài đăng có userId
    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!post.userId) return;

            // Kiểm tra cache trước
            if (userCache.has(post.userId)) {
                setUserInfo(userCache.get(post.userId) || null);
                return;
            }

            setLoadingUser(true);
            try {
                const res = await instance.get(`/users/${post.userId}`);
                const userData = res.data.result;
                const userInfoData = {
                    id: userData.id,
                    username: userData.username,
                    fullName: userData.fullName,
                    imageUrl: userData.imageUrl
                } as User;
                // Lưu vào cache
                userCache.set(post.userId, userInfoData);
                setUserInfo(userInfoData);
            } catch (error) {
                console.error('Lỗi khi lấy thông tin người dùng:', error);
                // Fallback: dùng username từ post
                setUserInfo({
                    id: post.userId,
                    username: post.username,
                    fullName: post.username,
                    imageUrl: undefined
                } as User);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUserInfo();
    }, [post.userId, post.username]);

    // Lấy thông tin hợp âm khi bài đăng có audio
    useEffect(() => {
        if (post.audio?.chordId && !post.chord) {
            const fetchChord = async () => {
                setLoadingChord(true);
                try {
                    const res = await instance.get(`/chords/${post.audio?.chordId}`);
                    setChordInfo(res.data.result);
                } catch (error) {
                    console.error('Lỗi khi lấy hợp âm:', error);
                } finally {
                    setLoadingChord(false);
                }
            };
            fetchChord();
        }
    }, [post.audio?.chordId, post.chord]);

    useEffect(() => {
        if (showComments && commentsContainerRef.current) {
            setTimeout(() => {
                commentsContainerRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }, [showComments]);

    // Lấy dữ liệu hợp âm từ post.chord hoặc chordInfo đã fetch
    const chordData = post.chord || chordInfo;

    // Lấy thông tin hiển thị từ userInfo hoặc fallback
    const displayName = userInfo?.fullName || post.fullName || post.username;
    const displayUsername = userInfo?.username || post.username;
    const avatarUrl = userInfo?.imageUrl || post.userImage;

    return (
        <div className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-lg p-4 ${className}`}>
            <div className="flex items-start gap-3">
                {/* Ảnh đại diện */}
                <div 
                    onClick={() => navigate(`/profile/${post.userId}`)}
                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                >
                    {loadingUser ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                    ) : avatarUrl && avatarUrl.trim() !== '' ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                            <UserIcon className="w-5 h-5" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <p 
                                    onClick={() => navigate(`/profile/${post.userId}`)}
                                    className="text-sm font-semibold text-gray-900 dark:text-slate-100 cursor-pointer hover:underline"
                                >
                                    {displayName}
                                </p>
                                {currentUserId && post.userId !== currentUserId && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isFollowing) {
                                                onUnfollowUser?.(post.userId);
                                            } else {
                                                onFollowUser?.(post.userId);
                                            }
                                        }}
                                        disabled={isFollowLoading}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all border cursor-pointer ${
                                            isFollowing
                                                ? 'bg-transparent border-gray-300 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/30'
                                                : 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700'
                                        }`}
                                    >
                                        {isFollowLoading ? '...' : isFollowing ? 'Đang theo dõi' : 'Follow'}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                <span className="dark:text-slate-400">@{displayUsername}</span>
                                <span className="w-1 h-1 bg-gray-300 dark:bg-slate-700 rounded-full"></span>
                                <Clock className="w-3 h-3" />
                                <span>{formatTimeAgo(post.createdAt)}</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Nội dung */}
                    <p className="text-sm text-gray-700 dark:text-slate-300 mt-2 whitespace-pre-wrap break-words">
                        {displayContent}
                    </p>
                    {isLongContent && (
                        <button
                            onClick={() => setShowFullContent(!showFullContent)}
                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mt-1 transition-colors"
                        >
                            {showFullContent ? 'Ẩn bớt' : 'Xem thêm'}
                        </button>
                    )}

                    {/* Hình ảnh */}
                    {post.images && post.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {post.images.map((image, index) => (
                                image && image.trim() !== '' ? (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`Hình ảnh ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : null
                            ))}
                        </div>
                    )}

                    {/* Trình phát Audio - Kiểm tra audio tồn tại */}
                    {post.audio && post.audio.url && post.audio.url.trim() !== '' ? (
                        <div className="mt-3 py-2 flex flex-col gap-3 relative overflow-hidden text-slate-850 dark:text-slate-100">
                            {/* Hidden HTML Audio element */}
                            <audio
                                ref={audioRef}
                                src={post.audio.url}
                                preload="metadata"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onEnded={() => setIsPlayingLocal(false)}
                            />

                            {/* Top info row */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    {/* Play/Pause Button */}
                                    <button
                                        type="button"
                                        onClick={handlePlayPause}
                                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 border-none cursor-pointer"
                                    >
                                        {isPlayingLocal ? (
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <rect x="4" y="4" width="4" height="16" />
                                                <rect x="16" y="4" width="4" height="16" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Info text */}
                                    <div className="text-left">
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block leading-none">Nghe nhạc</span>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1 block truncate max-w-[200px] sm:max-w-[320px]">
                                            {chordData?.title || post.audio.title || 'Bản thu âm'} - {chordData?.artistName || post.audio.artistName || 'Thành viên'}
                                        </span>
                                    </div>
                                </div>

                                {/* Right corner Tag and Time */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        {formatTimeAgo(post.createdAt)}
                                    </span>
                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[9px] font-bold border border-slate-200 dark:border-slate-700/60 uppercase tracking-wider">
                                        # Lời
                                    </span>
                                </div>
                            </div>

                            {/* Waveform graphic */}
                            <div className="flex items-end justify-between gap-[2px] h-12 cursor-pointer select-none w-full group/wave relative" onClick={handleSeek}>
                                {WAVEFORM_BARS.map((height, idx) => {
                                    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
                                    const barPercent = (idx / WAVEFORM_BARS.length) * 100;
                                    const isPlayed = barPercent <= progressPercent;
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex-1 rounded-full transition-colors duration-155 ${
                                                isPlayed 
                                                    ? "bg-[#ff5500]" 
                                                    : "bg-slate-200 dark:bg-slate-800"
                                            }`}
                                            style={{ height: `${height}%` }}
                                        />
                                    );
                                })}

                                {/* Float duration marker */}
                                <span className="absolute bottom-1 right-1 text-[9px] text-slate-400 dark:text-slate-500 font-mono select-none">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        // Hiển thị thông báo nếu không có audio
                        post.audio && post.audio.id && (
                            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Music className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                            Audio chưa có file
                                        </p>
                                        {chordData && (
                                            <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                                {chordData.title} - {chordData.artistName || 'Không có nghệ sĩ'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* Hiển thị hợp âm trực tiếp nếu có */}
                    {post.chord && (
                        <div className="mt-3 overflow-auto max-w-full max-h-[320px] custom-scrollbar
                            [&::-webkit-scrollbar]:w-1.5
                            [&::-webkit-scrollbar-track]:bg-transparent
                            [&::-webkit-scrollbar-thumb]:bg-neutral-350
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            hover:[&::-webkit-scrollbar-thumb]:bg-neutral-450
                            dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700
                            dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600">
                            <ChordViewer
                                chord={{
                                    id: post.chord.id,
                                    title: post.chord.title,
                                    content: post.chord.content,
                                    artistId: post.chord.artistId
                                }}
                            />
                        </div>
                    )}

                    {/* Nút tương tác */}
                    <div className="mt-3 flex items-center gap-6">
                        <button
                            onClick={() => onLike(post.id)}
                            disabled={isLikeLoading}
                            className={`flex items-center gap-1 text-sm transition-colors ${isLiked
                                ? 'text-red-500 hover:text-red-600'
                                : 'text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-500'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                            <span>{likeCount}</span>
                        </button>
                        <button
                            onClick={() => onToggleComments(post.id)}
                            className="flex items-center gap-1 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>{commentCount}</span>
                        </button>
                    </div>

                    {/* Khu vực bình luận với thanh cuộn */}
                    {showComments && (
                        <div
                            ref={commentsContainerRef}
                            className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800/80"
                        >
                            {loadingComments ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                </div>
                            ) : (
                                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700 scrollbar-track-gray-100 dark:scrollbar-track-slate-800/50 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-slate-600">
                                    <CommentList
                                        comments={comments.map(transformCommentForUI)}
                                        currentUserId={currentUserId}
                                        onDelete={(commentId) => onDeleteComment(commentId, post.id)}
                                        onEdit={(commentId, content) => onEditComment(commentId, content, post.id)}
                                    />
                                    <CommentForm
                                        postId={post.id}
                                        userId={currentUserId || ''}
                                        onCommentCreated={() => onCommentCreated(post.id)}
                                        className="mt-3 sticky bottom-0 bg-white dark:bg-slate-900 py-2 border-t border-gray-100 dark:border-slate-800/80"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Post;