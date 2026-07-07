import React, { useState } from 'react';
import { MoreHorizontal, ThumbsUp, Reply, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface User {
    id: string;
    name: string;
    avatar?: string;
    username?: string;
}

export interface Post {
    id: string;
    title?: string;
    content?: string;
}

export interface CommentData {
    id: string;
    content: string;
    createdAt: string | Date;
    updatedAt?: string | Date;
    user: User;
    post?: Post;
}

export interface CommentProps {
    comment: CommentData;
    onLike?: () => void;
    onReply?: () => void;
    onShare?: () => void;
    onTranslate?: () => void;
    onMore?: () => void;
    onEdit?: (commentId: string, content: string) => void;
    onDelete?: (commentId: string) => void;
    currentUserId?: string;
    className?: string;
}

export function Comment({
    comment,
    onLike,
    onReply,
    onShare,
    onTranslate,
    onMore,
    onEdit,
    onDelete,
    currentUserId,
    className = ''
}: CommentProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [showFullContent, setShowFullContent] = useState(false);
    const [replies, setReplies] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showActions, setShowActions] = useState(false);

    const isOwner = currentUserId === comment.user.id;

    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

    const isLongContent = comment.content.length > 150;
    const displayContent = showFullContent || !isLongContent
        ? comment.content
        : comment.content.slice(0, 150) + '...';

    const handleLike = () => {
        if (isLiked) {
            setLikes(likes - 1);
        } else {
            setLikes(likes + 1);
        }
        setIsLiked(!isLiked);
        onLike?.();
    };

    const handleEdit = () => {
        if (editContent.trim()) {
            onEdit?.(comment.id, editContent);
            setIsEditing(false);
            setShowActions(false);
        }
    };

    const handleDelete = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
            onDelete?.(comment.id);
            setShowActions(false);
        }
    };

    return (
        <div className={`w-full bg-white dark:bg-slate-900/60 rounded-xl shadow-sm hover:shadow-md border border-transparent dark:border-slate-800/40 transition-all duration-200 ${className}`}>
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {comment.user.avatar ? (
                                <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                comment.user.name.charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* User info */}
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-zinc-900 dark:text-slate-100">{comment.user.name}</span>
                                {comment.user.username && (
                                    <span className="text-xs text-zinc-500 dark:text-slate-400">@{comment.user.username}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-slate-500">
                                <span>{timeAgo}</span>
                                {comment.updatedAt && new Date(comment.updatedAt) > new Date(comment.createdAt) && (
                                    <>
                                        <span>•</span>
                                        <span className="text-zinc-400 dark:text-slate-500">Đã chỉnh sửa</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* More button - chỉ hiển thị nếu là chủ sở hữu */}
                    {isOwner && (
                        <div className="relative">
                            <button
                                onClick={() => setShowActions(!showActions)}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <MoreHorizontal size={18} className="text-zinc-400 dark:text-slate-500 hover:text-zinc-600 dark:hover:text-slate-300" />
                            </button>

                            {showActions && (
                                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-zinc-200 dark:border-slate-700 py-1 z-10">
                                    <button
                                        onClick={() => {
                                            setIsEditing(true);
                                            setShowActions(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 dark:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Chỉnh sửa
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Xóa
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                {isEditing ? (
                    <div className="mb-3">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-3 border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-zinc-900 dark:text-slate-100 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-950 transition-all text-sm resize-none"
                            rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleEdit}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                                Lưu
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(comment.content);
                                }}
                                className="px-3 py-1.5 bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200 dark:hover:bg-slate-700 text-zinc-700 dark:text-slate-300 text-xs font-medium rounded-lg transition-colors"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mb-3">
                        <p className="text-sm text-zinc-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {displayContent}
                        </p>
                        {isLongContent && (
                            <button
                                onClick={() => setShowFullContent(!showFullContent)}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1 transition-colors"
                            >
                                {showFullContent ? 'Ẩn bớt' : 'Xem thêm'}
                            </button>
                        )}
                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-1">
                                {/* Like button */}
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${isLiked
                                        ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                        : 'text-zinc-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-50 dark:hover:bg-slate-800/40'
                                        }`}
                                >
                                    <ThumbsUp size={15} className={isLiked ? 'fill-blue-600' : ''} />
                                    <span>{likes > 0 ? likes : ''}</span>
                                </button>

                                {/* Reply button */}
                                <button
                                    onClick={onReply}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-50 dark:hover:bg-slate-800/40 transition-all duration-200"
                                >
                                    <Reply size={15} />
                                    <span>Trả lời</span>
                                    {replies > 0 && <span className="text-zinc-400">({replies})</span>}
                                </button>

                                {/* Share button */}
                                <button
                                    onClick={onShare}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-50 dark:hover:bg-slate-800/40 transition-all duration-200"
                                >
                                    <Share2 size={15} />
                                    <span>Chia sẻ</span>
                                </button>
                            </div>

                            {/* Translate button */}
                            {onTranslate && (
                                <button
                                    onClick={onTranslate}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 dark:text-slate-400 hover:text-zinc-700 dark:hover:text-slate-300 hover:bg-zinc-50 dark:hover:bg-slate-800/40 transition-all duration-200"
                                >
                                    Dịch
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Comment;
