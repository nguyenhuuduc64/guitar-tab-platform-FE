import { useNavigate } from "react-router-dom";
import { Play, Clock, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/Badge";
import { formatNumber, formatTimeAgo } from "../../../utils/format";

interface Song {
    id: string;
    title: string;
    artistId: string;
    artistName?: string;
    views: number;
    createdAt: string;
    audio?: {
        id: string;
        url: string;
    } | null;
}

interface AlbumProps {
    album: {
        id: string;
        title: string;
        artistId: string;
        artistName: string;
        artistImage?: string;
        songs: Song[];
        totalViews: number;
        createdAt: string;
        description?: string;
    };
    onPlaySong?: (song: Song) => void;
    currentSong?: Song | null;
    isPlaying?: boolean;
}

export const Album = ({ album, onPlaySong, currentSong, isPlaying }: AlbumProps) => {
    const navigate = useNavigate();

    const handlePlayAll = () => {
        if (album.songs.length > 0 && onPlaySong) {
            onPlaySong(album.songs[0]);
        }
    };

    const getColorByRank = (index: number) => {
        switch (index) {
            case 0:
                return "text-red-600 font-bold";
            case 1:
                return "text-orange-500 font-bold";
            case 2:
                return "text-yellow-500 font-bold";
            case 3:
                return "text-green-500 font-semibold";
            case 4:
                return "text-blue-500 font-semibold";
            case 5:
                return "text-purple-500 font-medium";
            case 6:
                return "text-pink-500 font-medium";
            default:
                return "text-gray-500 dark:text-slate-400";
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 overflow-hidden rounded-xl p-4 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-48 h-48 bg-gradient-to-br from-[--primary-color]/20 to-[#2D6CFF]/20 flex items-center justify-center rounded-sm overflow-hidden flex-shrink-0">
                    {album.artistImage ? (
                        <img
                            src={album.artistImage}
                            alt={album.artistName}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-4xl font-bold text-[--primary-color]/40">
                                    {album.artistName?.[0] || "A"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <Badge className="bg-[--primary-color]/10 text-[--primary-color] border-0 mb-2 rounded-sm">
                        Album nổi bật
                    </Badge>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                        {album.title}
                    </h2>
                    <p
                        className="text-sm text-gray-600 dark:text-slate-350 hover:text-[--primary-color] cursor-pointer mb-2"
                        onClick={() => navigate(`/artists/${album.artistId}`)}
                    >
                        {album.artistName}
                    </p>
                    {album.description && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-3 line-clamp-2">
                            {album.description}
                        </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-slate-550">
                        <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {formatNumber(album.totalViews)} lượt xem
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTimeAgo(album.createdAt)}
                        </span>
                        <span>{album.songs.length} bài hát</span>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <Button
                            className="bg-[--primary-color] hover:bg-[--primary-color]/90 rounded-sm"
                            onClick={handlePlayAll}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Phát tất cả
                        </Button>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800">

                <div className="divide-y divide-gray-50 dark:divide-slate-800/40">
                    {album.songs
                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                        .map((song, index) => {
                            const isCurrentSong = currentSong?.id === song.id;
                            const color = getColorByRank(index);

                            return (
                                <div
                                    key={song.id}
                                    className={`px-4 py-3 grid grid-cols-12 gap-3 items-center cursor-pointer transition-all hover:bg-gray-50/50 dark:hover:bg-slate-800/20 ${isCurrentSong ? 'bg-[--primary-color]/5 dark:bg-[--primary-color]/10' : ''
                                        }`}
                                    onClick={() => {
                                        if (onPlaySong) {
                                            onPlaySong(song);
                                        } else {
                                            navigate(`/song/${song.id}`);
                                        }
                                    }}
                                >
                                    <div className="col-span-1 text-center">
                                        {isCurrentSong && isPlaying ? (
                                            <div className="w-5 h-5 mx-auto flex items-center justify-center">
                                                <div className="w-2 h-2 bg-[--primary-color] rounded-full animate-pulse"></div>
                                            </div>
                                        ) : (
                                            <span className={`text-sm font-bold ${color}`}>
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-span-6">
                                        <p className={`text-sm font-medium truncate ${isCurrentSong ? 'text-[--primary-color]' : color}`}>
                                            {song.title}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate sm:hidden">
                                            {song.artistName || album.artistName}
                                        </p>
                                    </div>
                                    <div className="col-span-3 hidden sm:block">
                                        <p className="text-sm text-gray-500 dark:text-slate-450 truncate">
                                            {song.artistName || album.artistName}
                                        </p>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <span className={`text-xs font-semibold ${color}`}>
                                            {formatNumber(song.views || 0)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};