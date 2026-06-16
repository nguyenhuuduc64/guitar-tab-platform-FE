import { useEffect, useState } from "react";
import {
    Globe,
    Share2,
    Link2,
    Loader2
} from "lucide-react";
import instance from "../../config/axios";
import { type User as UserType } from "../../types/user";

interface SidebarProfileUserProps {
    userId?: string | number;
}

export function SidebarProfileUser({ userId }: SidebarProfileUserProps) {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    const isOwnProfile = !userId;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const endpoint = isOwnProfile ? "/users/my-info" : `/users/${userId}`;
                const response = await instance.get(endpoint);
                setUser(response.data.result);
            } catch (error) {
                console.error("Error fetching sidebar user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleFollowToggle = () => {
        setIsFollowing(!isFollowing);
    };

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-10 bg-white text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full bg-white text-gray-700 flex flex-col items-center px-6 py-8 font-sans border-r border-gray-100 min-h-screen">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm mb-4">
                <img
                    src={user?.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=cover"}
                    alt={user?.fullName || "User Avatar"}
                    className="w-full h-full object-cover target-img"
                />
            </div>

            {/* Name & Followers */}
            <h2 className="text-lg font-bold text-gray-900 tracking-wide mb-1">
                {user?.fullName || "Lex Cho"}
            </h2>
            <p className="text-xs text-gray-400 mb-6">
                922 Followers
            </p>

            {/* Action Buttons */}
            <div className="w-full space-y-2.5 mb-8">
                {!isOwnProfile ? (
                    <>
                        <button
                            onClick={handleFollowToggle}
                            className={`w-full py-2 rounded-full text-xs font-semibold tracking-wider transition-all border ${isFollowing
                                ? "bg-transparent border-gray-200 text-gray-600 hover:bg-gray-50"
                                : "bg-gray-900 border-gray-900 text-white hover:bg-gray-800"
                                }`}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </button>
                        <button className="w-full py-2 bg-transparent border border-gray-200 hover:border-gray-300 text-gray-700 rounded-full text-xs font-semibold tracking-wider transition-colors">
                            Message
                        </button>
                    </>
                ) : (
                    <div className="text-center text-xs text-gray-400 italic border border-dashed border-gray-200 py-2 rounded">
                        Your Profile Space
                    </div>
                )}
            </div>

            {/* Bio Description */}
            <p className="text-xs text-gray-500 text-center leading-relaxed max-w-[180px] mb-6">
                I make occasional beats when I'm bored
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-gray-400 mb-8">
                <a href="#" className="hover:text-gray-900 transition-colors"><Globe size={16} /></a>
                <a href="#" className="hover:text-gray-900 transition-colors"><Share2 size={16} /></a>
                <a href="#" className="hover:text-gray-900 transition-colors"><Link2 size={16} /></a>
            </div>

            {/* Stats Block */}
            <div className="w-full border-t border-gray-100 pt-6 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Songs</span>
                    <span className="font-semibold text-gray-900">16</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Albums</span>
                    <span className="font-semibold text-gray-900">2</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Playlists</span>
                    <span className="font-semibold text-gray-900">5</span>
                </div>
            </div>

            {/* Genres Block */}
            <div className="w-full border-t border-gray-100 pt-6 mt-6">
                <h4 className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-3">Genres</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                    Ambient, Breakbeat, Experimental, Lo-fi, Minimal Techno
                </p>
            </div>
        </div>
    );
}