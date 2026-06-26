// FollowingCard.tsx
import { UserCheck, UserPlus, Loader2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FollowingCardProps {
    user: {
        id: string;
        username: string;
        fullName: string;
        imageUrl?: string;
        isFollowing?: boolean;
    };
    onFollow?: (userId: string) => void;
    onUnfollow?: (userId: string) => void;
    isLoading?: boolean;
}

export function FollowingCard({ user, onFollow, onUnfollow, isLoading }: FollowingCardProps) {
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div
                    className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden shrink-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${user.id}`)}
                >
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                            <span className="text-xl font-medium">
                                {user.fullName?.charAt(0) || user.username?.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>
                <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${user.id}`)}
                >
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-200 truncate">
                        {user.fullName}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                        @{user.username}
                    </p>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
                <button
                    onClick={() => {
                        if (user.isFollowing) {
                            onUnfollow?.(user.id);
                        } else {
                            onFollow?.(user.id);
                        }
                    }}
                    disabled={isLoading}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer ${user.isFollowing
                        ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                        : "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                        }`}
                >
                    {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : user.isFollowing ? (
                        <>
                            <UserCheck className="w-3 h-3" />
                            Đang theo dõi
                        </>
                    ) : (
                        <>
                            <UserPlus className="w-3 h-3" />
                            Theo dõi
                        </>
                    )}
                </button>
                <button
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                >
                    <MessageCircle className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}