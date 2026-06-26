import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../../../config/axios";
import { getArtistById } from "../../../services/artistService";

const DEFAULT_AVATAR = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRIBQSoi6wS_GnK6B_rfWWgtKY5_UrFZFs9aV-FX8SpzEmuMM2rid8KGDvvurEb4z9mjPIaCkoKYfYoUkELLxUSnfvDSk9Lh9OCfDw2tyN&s=10";

export const RankingRight = () => {
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [artistsMap, setArtistsMap] = useState<Record<string, { name: string; imageUrl: string }>>({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopSongs = async () => {
            try {
                setLoading(true);
                const response = await instance.get("/chords/mostViews");
                setSongs(response.data.result || []);
            } catch (err) {
                console.error("Lỗi tải ranking:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTopSongs();
    }, []);

    useEffect(() => {
        const fetchArtistsInfo = async () => {
            if (songs.length === 0) return;

            const artistIds = Array.from(
                new Set(songs.map((s) => s.artistId).filter(Boolean))
            );

            const artistResults = await Promise.all(
                artistIds.map(async (id) => {
                    try {
                        const res = await getArtistById(id);
                        return {
                            id,
                            name: res?.name || "Chưa cập nhật",
                            imageUrl: res?.imageUrl || ""
                        };
                    } catch {
                        return { id, name: "Chưa cập nhật", imageUrl: "" };
                    }
                })
            );

            const newMap: Record<string, { name: string; imageUrl: string }> = {};
            artistResults.forEach((item) => {
                newMap[item.id] = { name: item.name, imageUrl: item.imageUrl };
            });

            setArtistsMap(newMap);
        };

        fetchArtistsInfo();
    }, [songs]);

    const getRankColor = (idx: number) => {
        switch (idx) {
            case 0: return "text-orange-600 font-extrabold";
            case 1: return "text-amber-600 font-bold";
            case 2: return "text-yellow-600 font-bold";
            default: return "text-gray-800 dark:text-slate-350 font-semibold";
        }
    };

    return (
        <div className="rounded-xl flex flex-col bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 overflow-hidden h-full w-full">
            <div className="flex flex-col divide-y divide-gray-50 dark:divide-slate-800/50 bg-white dark:bg-slate-900 flex-1">
                {loading ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                        Đang tải...
                    </div>
                ) : songs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                        Chưa có dữ liệu
                    </div>
                ) : (
                    songs.slice(0, 8).map((song, index) => {
                        const artistInfo = song.artistId ? artistsMap[song.artistId] : null;
                        const displayArtistName = artistInfo?.name || song.artistName || "Chưa cập nhật";
                        const displayAvatar = artistInfo?.imageUrl || DEFAULT_AVATAR;

                        return (
                            <div
                                key={song.id}
                                className="py-3 px-5 flex items-center gap-4 group cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all bg-white dark:bg-slate-900"
                                onClick={() => navigate(`/song/${song.id}`)}
                            >
                                <span className="text-[13px] font-bold text-gray-500 w-6 h-6 flex items-center justify-center ">
                                    {index + 1}
                                </span>

                                <img
                                    src={displayAvatar}
                                    alt={displayArtistName}
                                    className="w-14 h-14 object-cover border border-gray-100 dark:border-slate-800 shrink-0 rounded-sm"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                                    }}
                                />

                                <div className="flex-1 min-w-0">
                                    <p className={`text-[14px] leading-tight transition-colors truncate group-hover:text-blue-600 ${getRankColor(index)}`}>
                                        {song.title}
                                    </p>
                                    <p className="text-[12px] text-gray-400 truncate mt-0.5">
                                        {displayArtistName}
                                    </p>
                                </div>

                                <div className="text-[12px] text-gray-500 dark:text-slate-400 font-medium shrink-0 text-right">
                                    {song.views?.toLocaleString() || 0}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};