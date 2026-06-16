import { useNavigate } from "react-router-dom";
import { formatTime } from "../../helper";
import { type Chord } from "../../types/chord";


interface SongTableProps {
    songs: Chord[];
    loading?: boolean;
    error?: string | null;
    isHasMenu?: boolean;
}

export const SongTable = ({
    songs = [],
    loading = false,
    error = null,
    isHasMenu = false,
}: SongTableProps) => {
    const navigate = useNavigate();

    const mappedSongs = songs.map((song) => ({
        id: song.id,
        title: song.title,
        slug: song.slug,
        content: song.content || "",

        artist: song.artistName || "Chưa cập nhật",

        user: song.user?.username || song.user?.fullName || "Ẩn danh",

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
                    className="relative bg-white bg-card-bg border border-border-subtle  p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
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
                                    ${index === 0
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
                    <div className="flex gap-2 flex-wrap mt-4 pr-8">
                        {song.tags.map((tag: string) => (
                            <span
                                key={tag}
                                className="text-[11px] px-2 py-1 bg-card-inner border border-border-subtle rounded-sm text-main-fg/60"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* NUT 3 CHAM CAU HINH */}
                    {isHasMenu && (
                        <button
                            className="absolute bottom-4 right-4 p-1 rounded-full hover:bg-gray-100 text-main-fg/60 hover:text-main-fg transition-colors"
                            onClick={(e) => {
                                e.stopPropagation(); // Không cho navigate vào bài hát khi click nút này
                                // Logic cấu hình xử lý sau
                            }}
                            title="Cấu hình"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                                />
                            </svg>
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

const extractChords = (text: string): string[] => {
    if (!text) return [];

    const matches = text.match(/\[(.*?)\]/g) || [];

    const chords = matches.map((c) => c.replace(/[[\]]/g, ""));

    return [...new Set(chords)];
};