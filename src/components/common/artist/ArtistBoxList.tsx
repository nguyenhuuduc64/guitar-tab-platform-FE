import React from "react";
import ArtistBox, { type ArtistData, type ArtistBoxProps } from "./ArtistBox";
import { Music } from "lucide-react";

export interface ArtistBoxListProps {
    artists: ArtistData[];
    variant?: ArtistBoxProps["variant"];
    showStats?: boolean;
    showFollowButton?: boolean;
    onFollow?: (artistId: string) => void;
    onUnfollow?: (artistId: string) => void;
    onClick?: (artistId: string) => void;
    loading?: boolean;
    className?: string;
    emptyMessage?: string;
    gridCols?: 2 | 3 | 4;
}

export function ArtistBoxList({
    artists,
    variant = "default",
    showStats = true,
    showFollowButton = false,
    onFollow,
    onUnfollow,
    onClick,
    loading = false,
    className = "",
    emptyMessage = "Chưa có nghệ sĩ nào",
    gridCols = 3
}: ArtistBoxListProps) {
    const gridClasses = {
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    };

    if (loading) {
        return (
            <div className={`grid ${gridClasses[gridCols]} gap-4 ${className}`}>
                {[...Array(6)].map((_, index) => (
                    <ArtistBox
                        key={index}
                        artist={{
                            id: `loading-${index}`,
                            name: "Đang tải..."
                        }}
                        loading={true}
                    />
                ))}
            </div>
        );
    }

    if (artists.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Music className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`grid ${gridClasses[gridCols]} gap-4 ${className}`}>
            {artists.map((artist) => (
                <ArtistBox
                    key={artist.id}
                    artist={artist}
                    variant={variant}
                    showStats={showStats}
                    showFollowButton={showFollowButton}
                    onFollow={onFollow}
                    onUnfollow={onUnfollow}
                    onClick={onClick}
                />
            ))}
        </div>
    );
}

export default ArtistBoxList;