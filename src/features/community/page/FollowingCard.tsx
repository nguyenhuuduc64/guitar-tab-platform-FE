import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../../../components/common/Dropdown";

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

export function FollowingCard({ user, onUnfollow, isLoading }: FollowingCardProps) {
    const navigate = useNavigate();

    const dropdownItems = [
        {
            name: "Bỏ theo dõi",
            onClick: () => {
                onUnfollow?.(user.id);
            }
        }
    ];

    return (
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-slate-800/40 last:border-b-0">
            {/* Trái: Ảnh và tên */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
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
                            <span className="text-sm font-medium">
                                {user.fullName?.charAt(0) || user.username?.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>
                <div
                    className="cursor-pointer min-w-0"
                    onClick={() => navigate(`/profile/${user.id}`)}
                >
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-200 truncate hover:underline">
                        {user.fullName}
                    </p>
                </div>
            </div>

            {/* Phải: Icon 3 chấm với menu */}
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                <Dropdown
                    items={dropdownItems}
                    trigger={
                        <button className="p-1.5 text-gray-400 hover:text-gray-650 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer bg-transparent border-none">
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <MoreHorizontal className="w-4 h-4" />
                            )}
                        </button>
                    }
                />
            </div>
        </div>
    );
}