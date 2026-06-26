import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import instance from '../../../config/axios';

export interface CommentFormProps {
    postId: string;
    userId: string;
    onCommentCreated: () => void;
    placeholder?: string;
    className?: string;
}

export function CommentForm({
    postId,
    userId,
    onCommentCreated,
    placeholder = 'Viết bình luận...',
    className = ''
}: CommentFormProps) {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsLoading(true);
        try {
            await instance.post('/comments', {
                content: content.trim(),
                postId,
                userId
            });
            setContent('');
            onCommentCreated();
        } catch (error) {
            console.error('Error creating comment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`${className}`}>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-slate-800/80 hover:bg-zinc-50 dark:hover:bg-slate-700/50 border border-transparent focus:border-indigo-500 rounded-full text-sm text-zinc-800 dark:text-slate-200 placeholder-zinc-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-950 transition-all"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!content.trim() || isLoading}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 text-white text-sm font-medium rounded-full transition-colors disabled:cursor-not-allowed flex items-center gap-1"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đăng'}
                </button>
            </div>
        </form>
    );
}

export default CommentForm;