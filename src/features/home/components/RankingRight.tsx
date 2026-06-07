import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../../../config/axios";

export const RankingRight = () => {
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopSongs = async () => {
            try {
                setLoading(true);
                // Sửa endpoint thành /mostViews (hoặc đường dẫn chính xác của Controller)
                const response = await instance.get("/chords/mostViews");

                // Gán trực tiếp result từ ApiResponse
                setSongs(response.data.result || []);
            } catch (err) {
                console.error("Lỗi tải ranking:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTopSongs();
    }, []);

    return (
        <div className="flex flex-col border-l border-border-subtle h-full bg-white">
            <h3 className="font-bold text-white text-center bg-[var(--primary-color)] py-5 uppercase tracking-wider text-sm">
                Xem nhiều nhất
            </h3>

            <div className="flex flex-col divide-y divide-border-subtle/30 overflow-y-auto">
                {loading ? (
                    <div className="py-10 text-center text-xs text-gray-400">
                        Đang tải...
                    </div>
                ) : songs.length === 0 ? (
                    <div className="py-10 text-center text-xs text-gray-400">
                        Chưa có dữ liệu
                    </div>
                ) : (
                    songs.map((song, index) => (
                        <div
                            key={song.id}
                            className="py-5 flex gap-5 group cursor-pointer hover:bg-gray-50 px-6 transition-all"
                            onClick={() => navigate(`/song/${song.id}`)}
                        >
                            <span className="text-[12px] font-black text-gray-300 pt-0.5 group-hover:text-primary transition-colors italic">
                                {(index + 1).toString().padStart(2, "0")}
                            </span>

                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-main-fg group-hover:text-primary leading-tight transition-colors truncate">
                                    {song.title}
                                </p>

                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-[10px] text-gray-500 truncate">
                                        {song.artist?.name || "Chưa cập nhật"}
                                    </p>
                                    <p className="text-[9px] text-primary/60 font-bold">
                                        {song.views?.toLocaleString() || 0} VIEW
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-border-subtle mt-auto">
                <button
                    onClick={() => navigate("/discover")}
                    className="w-full py-2 text-[11px] font-bold text-gray-400 hover:text-primary transition-colors uppercase tracking-widest"
                >
                    Xem tất cả
                </button>
            </div>
        </div>
    );
};
