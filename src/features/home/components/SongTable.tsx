import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChords } from "../../../services/chordService";
import { formatTime } from "../../../helper";
export const SongTable = () => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getChords();

                const mapped = (data || []).map((song) => ({
                    id: song.id,
                    title: song.title,
                    slug: song.slug,
                    content: song.content || "",

                    artist: "Chưa cập nhật",
                    user: "Ẩn danh",
                    views: 0,

                    time: formatTime(song.createdAt),

                    preview: (song.content || "").split("\n").slice(0, 2),

                    tags: extractChords(song.content),
                }));

                setSongs(mapped);
            } catch (err) {
                console.error(err);
                setError("Không tải được dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center p-5">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-5">{error}</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            {songs.map((song) => (
                <div
                    key={song.id}
                    className="bg-card-bg border border-border-subtle rounded-sm p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/song/${song.id}`)}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-sm font-bold text-main-fg">
                                {song.title}
                            </h3>

                            <p className="text-[11px] text-main-fg/40 mt-1">
                                {song.artist}
                            </p>

                            <p className="text-[11px] text-main-fg/40 mt-1">
                                {song.user}, {song.time}
                            </p>
                        </div>

                        <div className="text-[11px] text-main-fg/40">
                            {song.views} 👁
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="text-[13px] leading-7 text-main-fg/80 mt-3 space-y-1">
                        {song.preview.map((line, idx) => (
                            <p key={idx}>
                                {line.split(/(\[.*?\])/g).map((part, i) =>
                                    part.startsWith("[") ? (
                                        <span
                                            key={i}
                                            className="text-primary font-bold"
                                        >
                                            {part}
                                        </span>
                                    ) : (
                                        part
                                    ),
                                )}
                            </p>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex gap-2 flex-wrap mt-4">
                        {song.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-[11px] px-2 py-1 bg-card-inner border border-border-subtle rounded-sm text-main-fg/60"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const extractChords = (text) => {
    if (!text) return [];
    const matches = text.match(/\[(.*?)\]/g) || [];
    const chords = matches.map((c) => c.replace(/[\[\]]/g, ""));
    return [...new Set(chords)];
};
