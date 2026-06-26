import React, { useState, useRef, useEffect } from 'react';
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
}

// Cache user info để tránh gọi API nhiều lần
const userCache = new Map<string, User>();

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
    className = ''
}: PostProps) {
    const [showFullContent, setShowFullContent] = useState(false);
    const [chordInfo, setChordInfo] = useState<Chord | null>(null);
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
        <div className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
            <div className="flex items-start gap-3">
                {/* Ảnh đại diện */}
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 overflow-hidden shrink-0">
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
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                                {displayName}
                            </p>
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
                        <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <audio
                                        controls
                                        className="w-full h-8"
                                        preload="metadata"
                                    >
                                        <source src={post.audio.url} type="audio/mpeg" />
                                        <source src={post.audio.url} type="audio/mp3" />
                                        <source src={post.audio.url} type="audio/wav" />
                                        Trình duyệt của bạn không hỗ trợ phát audio.
                                    </audio>
                                </div>
                            </div>

                            {/* Hiển thị thông tin hợp âm nếu có */}
                            {chordData && (
                                <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-900/50 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">
                                            {chordData.title}
                                        </p>
                                        {chordData.artistName && (
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                                {chordData.artistName}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => window.open(`/chords/${chordData.id}`, '_blank')}
                                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
                                    >
                                        Xem hợp âm
                                        <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            )}

                            {/* Đang tải thông tin hợp âm */}
                            {loadingChord && (
                                <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-900/50">
                                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                                </div>
                            )}
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
                        <div className="mt-3">
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