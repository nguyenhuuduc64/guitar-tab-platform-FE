import React from 'react';
import Comment, { type CommentData, type CommentProps } from './Comment';

export interface CommentListProps {
    comments: CommentData[];
    currentUserId?: string;
    onLike?: (commentId: string) => void;
    onReply?: (commentId: string) => void;
    onShare?: (commentId: string) => void;
    onTranslate?: (commentId: string) => void;
    onMore?: (commentId: string) => void;
    onEdit?: (commentId: string, content: string) => void;
    onDelete?: (commentId: string) => void;
    className?: string;
}

export function CommentList({
    comments,
    currentUserId,
    onLike,
    onReply,
    onShare,
    onTranslate,
    onMore,
    onEdit,
    onDelete,
    className = ''
}: CommentListProps) {
    if (comments.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-sm text-zinc-500 dark:text-slate-400">Chưa có bình luận nào</p>
                <p className="text-xs text-zinc-400 dark:text-slate-500 mt-1">Hãy là người đầu tiên bình luận</p>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {comments.map((comment) => (
                <Comment
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    onLike={() => onLike?.(comment.id)}
                    onReply={() => onReply?.(comment.id)}
                    onShare={() => onShare?.(comment.id)}
                    onTranslate={() => onTranslate?.(comment.id)}
                    onMore={() => onMore?.(comment.id)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export default CommentList;