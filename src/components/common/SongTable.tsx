import React from "react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../../helper";

interface SongTableProps {
    songs: any[];
    loading?: boolean;
    error?: string | null;
}

export const SongTable = ({
    songs = [],
    loading = false,
    error = null,
}: SongTableProps) => {
    const navigate = useNavigate();

    const mappedSongs = songs.map((song) => ({
        id: song.id,
        title: song.title,
        slug: song.slug,
        content: song.content || "",

        artist: song.artist?.name || song.artistName || "Chưa cập nhật",

        user: song.user?.username || song.createdBy || "Ẩn danh",

        views: song.views || 0,

        time: song.createdAt ? formatTime(song.createdAt) : "Không rõ",

        preview: (song.content || "").split("\n").slice(0, 2),

        tags: extractChords(song.content),
    }));

    if (loading) {
        return <div className="text-center p-5">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-5">{error}</div>;
    }

    if (mappedSongs.length === 0) {
        return (
            <div className="text-center text-gray-400 p-10">
                Không có bài hát nào
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {mappedSongs.map((song, index) => (
                <div
                    key={song.id}
                    className="bg-white bg-card-bg border border-border-subtle rounded-sm p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/song/${song.id}`)}
                >
                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-4">
                            {/* RANK */}
                            <div
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center
                                    text-sm font-bold shrink-0
                                    ${
                                        index === 0
                                            ? "bg-yellow-400 text-white"
                                            : index === 1
                                              ? "bg-gray-300 text-white"
                                              : index === 2
                                                ? "bg-orange-400 text-white"
                                                : "bg-gray-100 text-gray-600"
                                    }
                                `}
                            >
                                #{index + 1}
                            </div>

                            {/* INFO */}
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
                        </div>

                        {/* VIEW */}
                        <div className="text-[11px] text-main-fg/40">
                            {song.views} 👁
                        </div>
                    </div>

                    {/* PREVIEW */}
                    <div className="text-[13px] leading-7 text-main-fg/80 mt-3 space-y-1">
                        {song.preview.map((line: string, idx: number) => (
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

                    {/* TAG */}
                    <div className="flex gap-2 flex-wrap mt-4">
                        {song.tags.map((tag: string) => (
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

const extractChords = (text: string): string[] => {
    if (!text) return [];

    const matches = text.match(/\[(.*?)\]/g) || [];

    const chords = matches.map((c) => c.replace(/[\[\]]/g, ""));

    return [...new Set(chords)];
};
