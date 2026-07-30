import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../../helper";
import { type Chord } from "../../types/chord";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../ui/pagination";

interface SongTableProps {
    songs: Chord[];
    loading?: boolean;
    error?: string | null;
    isHasMenu?: boolean;
    useScroll?: boolean;
}

export const SongTable = ({
    songs = [],
    loading = false,
    error = null,
    isHasMenu = false,
    useScroll = false,
}: SongTableProps) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [songs]);

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
        return <div className="text-center p-5 text-sm text-slate-500">Đang tải danh sách bài hát...</div>;
    }

    if (error) {
        return <div className="text-red-550 p-5 text-sm text-center">{error}</div>;
    }

    if (mappedSongs.length === 0) {
        return (
            <div className="text-center text-gray-400 p-10 text-sm">
                Không có bài hát nào
            </div>
        );
    }

    const totalPages = Math.ceil(mappedSongs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSongs = mappedSongs.slice(startIndex, endIndex);

    const displayedSongs = useScroll ? mappedSongs : paginatedSongs;

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const listContent = (
        <div className="flex flex-col gap-4">
            {displayedSongs.map((song, index) => {
                const globalIndex = useScroll ? index : startIndex + index;
                return (
                    <div
                        key={song.id}
                        className="relative bg-card-bg border border-border-subtle p-5 shadow-xs hover:shadow-md transition-all cursor-pointer rounded-xl dark:bg-slate-900/50"
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
                                        ${globalIndex === 0
                                            ? "bg-yellow-400 text-white shadow-xs"
                                            : globalIndex === 1
                                                ? "bg-gray-350 text-white shadow-xs"
                                                : globalIndex === 2
                                                    ? "bg-orange-400 text-white shadow-xs"
                                                    : "bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
                                        }
                                    `}
                                >
                                    #{globalIndex + 1}
                                </div>

                                {/* INFO */}
                                <div>
                                    <h3 className="text-sm font-bold text-main-fg group-hover:text-[var(--primary-color)] transition-colors">
                                        {song.title}
                                    </h3>

                                    <p className="text-[11px] text-main-fg/40 mt-1 font-medium">
                                        {song.artist}
                                    </p>

                                    <p className="text-[11px] text-main-fg/40 mt-1">
                                        {song.user}, {song.time}
                                    </p>
                                </div>
                            </div>

                            {/* VIEW */}
                            <div className="text-[11px] text-main-fg/40 font-semibold bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-sm">
                                {song.views} lượt xem
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
                                                className="text-[var(--primary-color)] font-bold bg-blue-50/50 dark:bg-slate-800/60 px-1 rounded-sm mx-0.5"
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
                                    className="text-[11px] px-2 py-0.5 bg-card-inner border border-border-subtle rounded-sm text-main-fg/60 font-semibold"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* NUT 3 CHAM CAU HINH */}
                        {isHasMenu && (
                            <button
                                className="absolute bottom-4 right-4 p-1 rounded-full hover:bg-gray-150 text-main-fg/60 hover:text-main-fg transition-colors border-none bg-transparent"
                                onClick={(e) => {
                                    e.stopPropagation();
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
                                        d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            {useScroll ? (
                <div
                    className="overflow-y-auto pr-2 max-h-[580px] flex flex-col gap-4
                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-neutral-300
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
                        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-750
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600"
                >
                    {listContent}
                </div>
            ) : (
                listContent
            )}

            {!useScroll && totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    size="default"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage - 1);
                                    }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        size="default"
                                        href="#"
                                        isActive={page === currentPage}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(page);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    size="default"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handlePageChange(currentPage + 1);
                                    }}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
};

const extractChords = (text: string): string[] => {
    if (!text) return [];

    const matches = text.match(/\[(.*?)\]/g) || [];

    const chords = matches.map((c) => c.replace(/[[\]]/g, ""));

    return [...new Set(chords)];
};