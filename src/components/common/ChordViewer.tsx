import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Music2 } from "lucide-react";
import { getArtistById } from "../../services/artistService";
import GuitarChordDiagram from "../chords/GuitarChordDiagram";
import { getChordData } from "../../constants/chords";
import type { Artist } from "../../types/artist";

interface ChordViewerProps {
    chord: {
        id?: string;
        title?: string;
        content: string;
        artistId?: string;
    };
    onOpenPlaylist?: () => void;
}

const ChordViewer = ({ chord, onOpenPlaylist }: ChordViewerProps) => {
    const navigate = useNavigate();
    const [artist, setArtist] = useState<Artist | null>(null);
    const [hoveredChord, setHoveredChord] = useState<string | null>(null);
    const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
    const [autoScroll, setAutoScroll] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const popupRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<any>(null);
    const countdownIntervalRef = useRef<any>(null);

    useEffect(() => {
        if (!chord.artistId) {
            setArtist(null);
            return;
        }
        getArtistById(chord.artistId)
            .then((data) => setArtist(data))
            .catch((err) => console.error("Lỗi tải thông tin ca sĩ:", err));
    }, [chord.artistId]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setHoveredChord(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        clearInterval(scrollIntervalRef.current);
        clearInterval(countdownIntervalRef.current);

        if (!autoScroll) {
            setCountdown(5);
            return;
        }

        let current = 5;
        setCountdown(current);

        countdownIntervalRef.current = setInterval(() => {
            current -= 1;
            setCountdown(current);

            if (current <= 0) {
                clearInterval(countdownIntervalRef.current);
                scrollIntervalRef.current = setInterval(() => {
                    if (!scrollContainerRef.current) return;
                    const container = scrollContainerRef.current;
                    container.scrollBy({ top: 1, behavior: "smooth" });

                    const isBottom =
                        container.scrollTop + container.clientHeight >=
                        container.scrollHeight - 5;
                    if (isBottom) {
                        clearInterval(scrollIntervalRef.current);
                        setAutoScroll(false);
                    }
                }, 25);
            }
        }, 1000);

        return () => {
            clearInterval(scrollIntervalRef.current);
            clearInterval(countdownIntervalRef.current);
        };
    }, [autoScroll]);

    const renderContent = (content: string) => {
        return content.split("\n").map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={idx} className="h-4" />;

            const sectionRegex = /^\[(Chorus|Outro|Verse\s*\d*|Pre-Chorus|Intro)\]$/i;
            if (sectionRegex.test(trimmed)) {
                const sectionName = trimmed.replace(/[\[\]]/g, "");
                return (
                    <div key={idx} className="mt-4 mb-2 font-bold text-sm text-red-500 uppercase tracking-wider block w-full font-sans">
                        {sectionName}
                    </div>
                );
            }

            // Regex tách chính xác text và hợp âm dạng [Am]
            const parts = line.split(/(\[[^\]]+\])/g);
            if (parts.length === 1) {
                return <div key={idx} className="text-gray-800 my-1 font-mono min-h-[1.5rem]">{line}</div>;
            }

            const chordLine: React.ReactNode[] = [];
            const textLine: React.ReactNode[] = [];
            let currentChord = "";

            parts.forEach((part, pIdx) => {
                if (part.startsWith("[") && part.endsWith("]")) {
                    currentChord = part.slice(1, -1);
                } else {
                    if (currentChord) {
                        // Tính độ dài text đi kèm để tạo khoảng không khoảng trống trên hàng hợp âm
                        const spaceLength = Math.max(part.length, currentChord.length + 1);
                        const padAmount = spaceLength - currentChord.length;
                        const cleanChord = currentChord; // Tránh closure reference sai giá trị

                        chordLine.push(
                            <span
                                key={`c-${pIdx}`}
                                className="text-red-500 font-bold text-sm select-none cursor-pointer hover:text-red-700 transition-colors inline-block"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredChord(cleanChord);
                                    setPopupPos({
                                        x: rect.left + rect.width / 2,
                                        y: rect.top,
                                    });
                                }}
                            >
                                {cleanChord}
                                {"\u00A0".repeat(padAmount)}
                            </span>
                        );

                        textLine.push(
                            <span key={`t-${pIdx}`} className="text-gray-800 text-[15px]">
                                {part + "\u00A0".repeat(Math.max(0, currentChord.length + 1 - part.length))}
                            </span>
                        );
                        currentChord = "";
                    } else if (part) {
                        // Đoạn text bình thường không có hợp âm đứng trước
                        chordLine.push(<span key={`c-space-${pIdx}`}>{"\u00A0".repeat(part.length)}</span>);
                        textLine.push(<span key={`t-${pIdx}`} className="text-gray-800 text-[15px]">{part}</span>);
                    }
                }
            });

            return (
                <div key={idx} className="flex flex-col font-mono leading-relaxed w-full mb-2 whitespace-pre">
                    {/* Hàng hợp âm phía trên */}
                    <div className="h-5 flex items-center select-none">{chordLine}</div>
                    {/* Hàng lời dịch phía dưới */}
                    <div className="flex items-center">{textLine}</div>
                </div>
            );
        });
    };

    const currentChordData = hoveredChord ? getChordData(hoveredChord) : null;

    return (
        <div
            ref={scrollContainerRef}
            className="w-full md:flex-[2] bg-white rounded-sm shadow-sm overflow-y-auto border border-gray-100"
        >
            <div className="p-6">
                <div className="flex flex-col gap-3 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-800">
                            {chord.title}
                        </h1>
                        <button className="p-2 bg-blue-100 text-blue-500 rounded-full hover:scale-105 transition">
                            <Star size={18} fill="currentColor" />
                        </button>
                        <button
                            onClick={onOpenPlaylist}
                            className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition flex items-center gap-2"
                        >
                            <Music2 size={16} /> Thêm playlist
                        </button>
                        <button
                            onClick={() => setAutoScroll(!autoScroll)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${autoScroll
                                ? "bg-green-500 text-white shadow"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {autoScroll
                                ? countdown > 0
                                    ? `Cuộn sau ${countdown}s`
                                    : "Đang cuộn..."
                                : "Auto Scroll"}
                        </button>
                    </div>
                    {artist ? (
                        <p
                            onClick={() => navigate(`/nghe-sy/${artist.id}`)}
                            className="text-sm text-gray-500 cursor-pointer hover:text-blue-500 hover:underline w-fit"
                        >
                            {artist.name}
                        </p>
                    ) : (
                        <p className="text-sm text-gray-400">
                            {chord.artistId ? "Đang tải ca sĩ..." : "Chưa cập nhật ca sĩ"}
                        </p>
                    )}
                </div>

                {/* DOM ĐÃ FIX: Đồng bộ whitespace-pre-wrap, leading-[2.2] và scale-75, rounded-xl cho popup */}
                <div className="whitespace-pre-wrap text-[15px] leading-[2.2] text-gray-800">
                    {renderContent(chord.content)}
                </div>
            </div>

            {hoveredChord && currentChordData && (
                <div
                    ref={popupRef}
                    className="fixed z-50"
                    style={{
                        top: popupPos.y - 180,
                        left: popupPos.x,
                        transform: "translateX(-50%)",
                    }}
                >
                    <div className="bg-white shadow-2xl rounded-xl p-2 border border-gray-100 scale-75">
                        <GuitarChordDiagram initialChordName={hoveredChord} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChordViewer;