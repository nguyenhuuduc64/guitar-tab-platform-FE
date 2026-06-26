import React from "react";
import { useNavigate } from "react-router-dom";
import { Music, Eye, Users, Calendar, Play } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/Avatar";
import { Badge } from "../../../components/ui/Badge";

export interface ArtistData {
    id: string;
    name: string;
    slug?: string; // Đổi thành optional
    description?: string;
    imageUrl?: string;
    // Các field mở rộng có thể có
    songCount?: number;
    totalViews?: number;
    followerCount?: number;
    createdAt?: string;
    isFollowing?: boolean;
}

export interface ArtistBoxProps {
    artist: ArtistData;
    variant?: "default" | "compact" | "featured";
    showStats?: boolean;
    showFollowButton?: boolean;
    onFollow?: (artistId: string) => void;
    onUnfollow?: (artistId: string) => void;
    onClick?: (artistId: string) => void;
    className?: string;
    loading?: boolean;
}

export function ArtistBox({
    artist,
    variant = "default",
    showStats = true,
    showFollowButton = false,
    onFollow,
    onUnfollow,
    onClick,
    className = "",
    loading = false
}: ArtistBoxProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick(artist.id);
        } else {
            navigate(`/artists/${artist.id}`);
        }
    };

    const handleFollow = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (artist.isFollowing) {
            onUnfollow?.(artist.id);
        } else {
            onFollow?.(artist.id);
        }
    };

    const formatNumber = (num?: number) => {
        if (!num) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    if (loading) {
        return (
            <Card className={`animate-pulse ${className}`}>
                <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Variant compact
    if (variant === "compact") {
        return (
            <div
                onClick={handleClick}
                className={`group flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 cursor-pointer ${className}`}
            >
                <Avatar size="default" className="w-12 h-12 flex-shrink-0">
                    {artist.imageUrl ? (
                        <AvatarImage src={artist.imageUrl} alt={artist.name} />
                    ) : (
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-bold">
                            {artist.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {artist.name}
                    </h4>
                    {artist.description && (
                        <p className="text-xs text-gray-500 truncate">{artist.description}</p>
                    )}
                    {showStats && (
                        <div className="flex items-center gap-3 mt-1">
                            {artist.songCount !== undefined && (
                                <span className="text-xs text-gray-400">
                                    <span className="font-medium text-gray-600">{artist.songCount}</span> bài hát
                                </span>
                            )}
                            {artist.totalViews !== undefined && (
                                <span className="text-xs text-gray-400">
                                    <Eye className="w-3 h-3 inline mr-0.5" />
                                    {formatNumber(artist.totalViews)}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                {showFollowButton && (
                    <button
                        onClick={handleFollow}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${artist.isFollowing
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                    >
                        {artist.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                    </button>
                )}
            </div>
        );
    }

    // Variant featured
    if (variant === "featured") {
        return (
            <Card
                className={`group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
                onClick={handleClick}
            >
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                    {artist.imageUrl ? (
                        <img
                            src={artist.imageUrl}
                            alt={artist.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl font-bold text-white/20">
                                {artist.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white drop-shadow-md">{artist.name}</h3>
                        {artist.description && (
                            <p className="text-sm text-white/80 truncate">{artist.description}</p>
                        )}
                    </div>
                </div>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {artist.songCount !== undefined && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Music className="w-4 h-4" />
                                    <span>{artist.songCount} bài hát</span>
                                </div>
                            )}
                            {artist.totalViews !== undefined && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Eye className="w-4 h-4" />
                                    <span>{formatNumber(artist.totalViews)} lượt xem</span>
                                </div>
                            )}
                            {artist.followerCount !== undefined && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{formatNumber(artist.followerCount)} người theo dõi</span>
                                </div>
                            )}
                        </div>
                        {showFollowButton && (
                            <button
                                onClick={handleFollow}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${artist.isFollowing
                                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    }`}
                            >
                                {artist.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Variant default
    return (
        <Card
            className={`group hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
            onClick={handleClick}
        >
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Avatar size="lg" className="w-16 h-16 flex-shrink-0">
                        {artist.imageUrl ? (
                            <AvatarImage src={artist.imageUrl} alt={artist.name} />
                        ) : (
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xl font-bold">
                                {artist.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                                {artist.name}
                            </h4>
                            {artist.slug && (
                                <span className="text-xs text-gray-400">@{artist.slug}</span>
                            )}
                        </div>
                        {artist.description && (
                            <p className="text-sm text-gray-500 line-clamp-2">{artist.description}</p>
                        )}
                        {showStats && (
                            <div className="flex items-center gap-4 mt-2">
                                {artist.songCount !== undefined && (
                                    <span className="text-xs text-gray-400">
                                        <Music className="w-3 h-3 inline mr-0.5" />
                                        <span className="font-medium text-gray-600">{artist.songCount}</span> bài hát
                                    </span>
                                )}
                                {artist.totalViews !== undefined && (
                                    <span className="text-xs text-gray-400">
                                        <Eye className="w-3 h-3 inline mr-0.5" />
                                        {formatNumber(artist.totalViews)} lượt xem
                                    </span>
                                )}
                                {artist.createdAt && (
                                    <span className="text-xs text-gray-400">
                                        <Calendar className="w-3 h-3 inline mr-0.5" />
                                        {new Date(artist.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {showFollowButton && (
                            <button
                                onClick={handleFollow}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${artist.isFollowing
                                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                                    }`}
                            >
                                {artist.isFollowing ? "Đang theo dõi" : "Theo dõi"}
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClick();
                            }}
                            className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Play className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default ArtistBox;