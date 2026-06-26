// components/AlbumList.tsx
import { useEffect, useState } from "react";
import { Album } from "./Album";
import { getTopArtistByViews, type ArtistStats } from "../../../services/artistService";
import { type Album as AlbumType } from "../../../types/album"

interface AlbumListProps {
    onPlaySong?: (song: any) => void;
    currentSong?: any | null;
    isPlaying?: boolean;
}

export const AlbumList = ({ onPlaySong, currentSong, isPlaying }: AlbumListProps) => {
    const [loading, setLoading] = useState(true);
    const [album, setAlbum] = useState<AlbumType | null>(null);
    const [artist, setArtist] = useState<ArtistStats | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const topArtist = await getTopArtistByViews();

                if (topArtist) {
                    setArtist(topArtist);

                    const albumData: AlbumType = {
                        id: `album-${topArtist.artistId}`,
                        title: `Best of ${topArtist.artistName}`,
                        artistId: topArtist.artistId,
                        artistName: topArtist.artistName,
                        artistImage: topArtist.imageUrl,
                        songs: topArtist.songs || [],
                        totalViews: topArtist.totalViews,
                        createdAt: new Date().toISOString(),
                        description: `Tuyển tập những bài hát hay nhất của ${topArtist.artistName}`
                    };

                    setAlbum(albumData);
                }
            } catch (error) {
                console.error("Lỗi tải album:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-sm p-8">
                <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[--primary-color] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-center text-sm text-gray-400 mt-3">Đang tải album...</p>
            </div>
        );
    }

    if (!album || album.songs.length === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-sm p-8 text-center">
                <p className="text-gray-400">Chưa có album nào</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold mb-3 text-sm md:text-base">Album nổi bất</h3>

                <button
                    className="text-xs text-[--primary-color] hover:underline"
                    onClick={() => window.location.href = `/nghe-sy/${album.artistId}`}
                >
                    Xem tất cả
                </button>
            </div>
            <Album
                album={album}
                onPlaySong={onPlaySong}
                currentSong={currentSong}
                isPlaying={isPlaying}
            />
        </div>
    );
};