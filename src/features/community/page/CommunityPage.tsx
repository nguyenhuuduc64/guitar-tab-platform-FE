import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Users,
    UserPlus,
    Loader2,
    Search,
    X,
    User as UserIcon,
    Music
} from "lucide-react";
import instance from "../../../config/axios";
import { getUserInfo } from "../../../utils/auth";
import { FollowingCard } from "./FollowingCard";
import { CreatePostModal } from "./CreatePostModal";
import Post from "../../../components/common/post/Post";

import { type User } from "../../../types/user";
import { type Chord } from "../../../types/chord";
import { type AudioItem as Audio } from "../../../types/audio";
import { type PostData } from "../../../types/post";
import { type CommentData } from "../../../types/comment";

export default function CommunityPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<PostData[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isFollowingLoading, setIsFollowingLoading] = useState<string | null>(null);
    const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [pageSize] = useState<number>(5);
    const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);

    // Post states
    const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
    const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
    const [isLikeLoading, setIsLikeLoading] = useState<Record<string, boolean>>({});

    // Comment states
    const [comments, setComments] = useState<Record<string, CommentData[]>>({});
    const [showComments, setShowComments] = useState<Record<string, boolean>>({});
    const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const userData = await getUserInfo();
                setCurrentUser(userData);

                const isFollowingFeed = location.pathname === "/following-feed";
                const postsRes = await instance.get(isFollowingFeed ? `/posts/following` : `/posts`);
                const postsData = postsRes.data.result || [];

                console.log('Raw posts data:', postsData);

                const postsWithChord = await Promise.all(
                    postsData.map(async (post: PostData) => {
                        // Kiểm tra post có audio không
                        if (post.audio && post.audio.chordId) {
                            try {
                                const chordRes = await instance.get(`/chords/${post.audio.chordId}`);
                                console.log(`Chord for post ${post.id}:`, chordRes.data.result);
                                return {
                                    ...post,
                                    chord: chordRes.data.result,
                                    audio: post.audio // Giữ nguyên audio
                                };
                            } catch (error) {
                                console.error(`Error fetching chord for post ${post.id}:`, error);
                                return {
                                    ...post,
                                    audio: post.audio // Vẫn giữ audio dù không fetch được chord
                                };
                            }
                        }
                        // Nếu không có audio, trả về post nguyên bản
                        return post;
                    })
                );

                console.log('Posts with chord:', postsWithChord);
                setPosts(postsWithChord);

                // Fetch counts for each post
                for (const post of postsWithChord) {
                    try {
                        const [likeCountRes, commentCountRes] = await Promise.all([
                            instance.get(`/likes/post/${post.id}/count`),
                            instance.get(`/comments/post/${post.id}/count`)
                        ]);

                        setLikeCounts(prev => ({ ...prev, [post.id]: likeCountRes.data.result || 0 }));
                        setCommentCounts(prev => ({ ...prev, [post.id]: commentCountRes.data.result || 0 }));

                        if (userData) {
                            const checkLikeRes = await instance.get(`/likes/post/${post.id}/user/${userData.id}/check`);
                            setIsLiked(prev => ({ ...prev, [post.id]: checkLikeRes.data.result || false }));
                        }
                    } catch (error) {
                        console.error(`Error fetching counts for post ${post.id}:`, error);
                    }
                }

                if (userData) {
                    const followingRes = await instance.get(`/users/${userData.id}/following`);
                    setFollowing(followingRes.data.result || []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, pageSize, location.pathname]);

    const loadComments = async (postId: string) => {
        if (loadingComments[postId]) return;

        setLoadingComments(prev => ({ ...prev, [postId]: true }));
        try {
            const res = await instance.get(`/comments/post/${postId}`);
            const commentsData = res.data.result || [];

            const transformedComments = commentsData.map((c: any) => ({
                id: c.id,
                content: c.content,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                postId: c.postId,
                userId: c.userId,
                username: c.username,
                userFullName: c.userFullName || c.username,
                userImageUrl: c.userImageUrl
            }));

            setComments(prev => ({ ...prev, [postId]: transformedComments }));
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    const toggleComments = (postId: string) => {
        const isShowing = showComments[postId];
        setShowComments(prev => ({ ...prev, [postId]: !isShowing }));
        if (!isShowing && !comments[postId]) {
            loadComments(postId);
        }
    };

    const handleCommentCreated = async (postId: string) => {
        await loadComments(postId);
        try {
            const countRes = await instance.get(`/comments/post/${postId}/count`);
            setCommentCounts(prev => ({ ...prev, [postId]: countRes.data.result || 0 }));
        } catch (error) {
            console.error('Error updating comment count:', error);
        }
    };

    const handleDeleteComment = async (commentId: string, postId: string) => {
        try {
            await instance.delete(`/comments/${commentId}`);
            setComments(prev => ({
                ...prev,
                [postId]: prev[postId]?.filter(c => c.id !== commentId) || []
            }));
            const countRes = await instance.get(`/comments/post/${postId}/count`);
            setCommentCounts(prev => ({ ...prev, [postId]: countRes.data.result || 0 }));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleEditComment = async (commentId: string, content: string, postId: string) => {
        try {
            await instance.put(`/comments/${commentId}`, {
                content,
                postId,
                userId: currentUser?.id
            });
            setComments(prev => ({
                ...prev,
                [postId]: prev[postId]?.map(c =>
                    c.id === commentId ? { ...c, content, updatedAt: new Date().toISOString() } : c
                ) || []
            }));
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    const handleLikePost = async (postId: string) => {
        if (isLikeLoading[postId]) return;

        setIsLikeLoading(prev => ({ ...prev, [postId]: true }));

        const currentIsLiked = isLiked[postId];
        const currentCount = likeCounts[postId] || 0;

        setIsLiked(prev => ({ ...prev, [postId]: !currentIsLiked }));
        setLikeCounts(prev => ({ ...prev, [postId]: currentIsLiked ? currentCount - 1 : currentCount + 1 }));

        try {
            if (currentIsLiked) {
                await instance.delete(`/likes/post/${postId}/user/${currentUser?.id}`);
            } else {
                await instance.post('/likes', {
                    postId,
                    userId: currentUser?.id
                });
            }
        } catch (error) {
            setIsLiked(prev => ({ ...prev, [postId]: currentIsLiked }));
            setLikeCounts(prev => ({ ...prev, [postId]: currentCount }));
            console.error('Error toggling like:', error);
        } finally {
            setIsLikeLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    const handleSearchUsers = async (keyword: string) => {
        setSearchTerm(keyword);
        if (!keyword.trim()) {
            setSuggestedUsers([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const res = await instance.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);
            const users = res.data.result || [];

            const followingIds = new Set(following.map(u => u.id));
            const filteredUsers = users.filter((u: User) => u.id !== currentUser?.id && !followingIds.has(u.id));

            setSuggestedUsers(filteredUsers);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error searching users:", error);
        }
    };

    const handleFollow = async (targetUserId: string) => {
        try {
            setIsFollowingLoading(targetUserId);
            await instance.post(`/users/${targetUserId}/follow`);

            let userToFollow = suggestedUsers.find(u => u.id === targetUserId);
            if (!userToFollow) {
                const res = await instance.get(`/users/${targetUserId}`);
                userToFollow = res.data.result;
            }
            if (userToFollow) {
                setFollowing(prev => [...prev, userToFollow!]);
                setSuggestedUsers(prev => prev.filter(u => u.id !== targetUserId));
            }
            setShowSuggestions(false);
        } catch (error) {
            console.error("Error following user:", error);
        } finally {
            setIsFollowingLoading(null);
        }
    };

    const handleUnfollow = async (targetUserId: string) => {
        try {
            setIsFollowingLoading(targetUserId);
            await instance.post(`/users/${targetUserId}/unfollow`);
            setFollowing(prev => prev.filter(u => u.id !== targetUserId));
        } catch (error) {
            console.error("Error unfollowing user:", error);
        } finally {
            setIsFollowingLoading(null);
        }
    };

    const handlePageChange = (pageIndex: number) => {
        if (pageIndex >= 0 && pageIndex < totalPages) {
            setCurrentPage(pageIndex);
        }
    };

    const handlePostSuccess = async () => {
        try {
            const postsRes = await instance.get(`/posts`);
            const postsData = postsRes.data.result || [];

            const postsWithChord = await Promise.all(
                postsData.map(async (post: PostData) => {
                    if (post.audio && post.audio.chordId) {
                        try {
                            const chordRes = await instance.get(`/chords/${post.audio.chordId}`);
                            return {
                                ...post,
                                chord: chordRes.data.result,
                                audio: post.audio
                            };
                        } catch (error) {
                            console.error(`Error fetching chord for post ${post.id}:`, error);
                            return {
                                ...post,
                                audio: post.audio
                            };
                        }
                    }
                    return post;
                })
            );

            setPosts(postsWithChord);
            setTotalPages(postsRes.data.result?.totalPages || 0);
        } catch (error) {
            console.error("Error refreshing posts:", error);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="flex-grow w-full flex bg-gray-50 dark:bg-background text-gray-800 dark:text-slate-100">
            <div className="flex-1 flex">
                <div className="flex-1 p-6 md:p-8 max-w-3xl mx-auto">
                    {/* Create Post Box */}
                    <div className="mb-6">
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                    {currentUser?.imageUrl && currentUser.imageUrl.trim() !== '' ? (
                                        <img
                                            src={currentUser.imageUrl}
                                            alt={currentUser.fullName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsPostModalOpen(true)}
                                    className="flex-1 text-left px-4 py-2.5 bg-gray-100 dark:bg-slate-850 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
                                >
                                    Chọn bài hát bạn thích...
                                </button>
                            </div>
                            <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100 dark:border-slate-800/60">
                                <button
                                    onClick={() => setIsPostModalOpen(true)}
                                    className="px-5 py-2 bg-[var(--primary-color)] text-white hover:opacity-95 text-xs font-bold rounded-full transition-all cursor-pointer shadow-xs active:scale-98 tracking-wider uppercase border-none"
                                >
                                    Đăng bài hát
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
                            {posts.length} bài đăng
                        </p>
                    </div>

                    {/* Suggestions */}
                    {showSuggestions && suggestedUsers.length > 0 && (
                        <div className="mb-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-lg p-4 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-indigo-500" />
                                Gợi ý theo dõi
                            </h3>
                            <div className="space-y-2">
                                {suggestedUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-slate-800/30 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                {user.imageUrl && user.imageUrl.trim() !== '' ? (
                                                    <img
                                                        src={user.imageUrl}
                                                        alt={user.fullName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                                                        <UserIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-slate-200">{user.fullName}</p>
                                                <p className="text-xs text-gray-400 dark:text-slate-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleFollow(user.id)}
                                            disabled={isFollowingLoading === user.id}
                                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {isFollowingLoading === user.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <>
                                                    <UserPlus className="w-3 h-3" />
                                                    Theo dõi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posts List */}
                    {posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <Music className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                            </div>
                            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Chưa có bài đăng nào</p>
                            <p className="text-gray-400 dark:text-slate-500 text-xs mt-1">
                                Hãy là người đầu tiên tạo bài đăng
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <Post
                                    key={post.id}
                                    post={post}
                                    currentUserId={currentUser?.id}
                                    likeCount={likeCounts[post.id] || 0}
                                    commentCount={commentCounts[post.id] || 0}
                                    isLiked={isLiked[post.id] || false}
                                    isLikeLoading={isLikeLoading[post.id] || false}
                                    comments={comments[post.id] || []}
                                    showComments={showComments[post.id] || false}
                                    loadingComments={loadingComments[post.id] || false}
                                    onLike={handleLikePost}
                                    onToggleComments={toggleComments}
                                    onCommentCreated={handleCommentCreated}
                                    onDeleteComment={handleDeleteComment}
                                    onEditComment={handleEditComment}
                                    formatTimeAgo={formatTimeAgo}
                                    isFollowing={following.some(u => u.id === post.userId)}
                                    isFollowLoading={isFollowingLoading === post.userId}
                                    onFollowUser={handleFollow}
                                    onUnfollowUser={handleUnfollow}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-1 text-sm border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-750 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Trước
                            </button>
                            {[...Array(totalPages)].map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePageChange(idx)}
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors cursor-pointer ${currentPage === idx
                                        ? 'bg-indigo-600 text-white border border-indigo-605'
                                        : 'border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-750 dark:text-slate-300'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages - 1}
                                className="px-3 py-1 text-sm border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-750 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar Right - Following */}
                <div className="w-80 shrink-0 border-l border-gray-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/10 hidden lg:block p-6">
                    <div className="sticky top-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Đang theo dõi ({following.length})
                            </h3>
                            <button
                                onClick={() => navigate('/following')}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                            >
                                Xem tất cả
                            </button>
                        </div>

                        {following.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-4 text-center">
                                <Users className="w-8 h-8 text-gray-300 dark:text-slate-650 mx-auto mb-2" />
                                <p className="text-xs text-gray-400 dark:text-slate-500">Bạn chưa theo dõi ai</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {following.slice(0, 5).map((user) => (
                                    <FollowingCard
                                        key={user.id}
                                        user={{ ...user, isFollowing: true }}
                                        onUnfollow={handleUnfollow}
                                        isLoading={isFollowingLoading === user.id}
                                    />
                                ))}
                                {following.length > 5 && (
                                    <button
                                        onClick={() => navigate('/following')}
                                        className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-medium py-2"
                                    >
                                        Xem thêm {following.length - 5} người
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                userId={currentUser?.id || ""}
                onSuccess={handlePostSuccess}
            />
        </div>
    );
}