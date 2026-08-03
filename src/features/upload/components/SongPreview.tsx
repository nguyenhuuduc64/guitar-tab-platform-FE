import React, { useState, useRef, useEffect } from "react";
import { Star } from "lucide-react";
import { getYoutubeEmbedUrl } from "../../../helper/youtube";
import GuitarChordDiagram from "../../../components/chords/GuitarChordDiagram";
import { getChordData } from "../../../constants/chords";
import { useChordContext } from "../../../context/ChordContext";

interface SongPreviewProps {
    title: string;
    artistName: string;
    content: string;
    youtubeUrl?: string;
}

const SongPreview: React.FC<SongPreviewProps> = ({
    title,
    artistName,
    content,
    youtubeUrl
}) => {
    const { transposeChordName } = useChordContext();
    const [hoveredChord, setHoveredChord] = useState<string | null>(null);
    const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
    const [autoScroll, setAutoScroll] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const popupRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<any>(null);
    const countdownIntervalRef = useRef<any>(null);

    // Auto-scroll logic
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
                    const isContainerScrollable = container.scrollHeight > container.clientHeight;

                    if (isContainerScrollable) {
                        container.scrollBy({ top: 1, behavior: "smooth" });
                        const isBottom =
                            container.scrollTop + container.clientHeight >=
                            container.scrollHeight - 5;
                        if (isBottom) {
                            clearInterval(scrollIntervalRef.current);
                            setAutoScroll(false);
                        }
                    } else {
                        window.scrollBy({ top: 1, behavior: "smooth" });
                        const isWindowBottom =
                            window.innerHeight + window.scrollY >=
                            document.documentElement.scrollHeight - 5;
                        if (isWindowBottom) {
                            clearInterval(scrollIntervalRef.current);
                            setAutoScroll(false);
                        }
                    }
                }, 25);
            }
        }, 1000);

        return () => {
            clearInterval(scrollIntervalRef.current);
            clearInterval(countdownIntervalRef.current);
        };
    }, [autoScroll]);

    // Handle click outside to close chord tooltip
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(e.target as Node)
            ) {
                setHoveredChord(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const renderContent = (text: string) => {
        return text.split("\n").map((line, idx) => (
            <p key={idx} className="min-h-[1.5rem]">
                {line.split(/(\[.*?\])/g).map((part, i) => {
                    if (part.startsWith("[")) {
                        const chordName = part.replace(/[\[\]]/g, "");
                        let transposedName = chordName;
                        try {
                            transposedName = transposeChordName(chordName);
                        } catch (err) {
                            // Fallback if transpose helper fails
                        }
                        return (
                            <span
                                key={i}
                                className="text-red-500 font-semibold cursor-pointer hover:text-red-600 transition"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredChord(chordName);
                                    setPopupPos({
                                        x: rect.left + rect.width / 2,
                                        y: rect.top,
                                    });
                                }}
                            >
                                [{transposedName}]
                            </span>
                        );
                    }
                    return part;
                })}
            </p>
        ));
    };

    const currentChordData = hoveredChord ? getChordData(hoveredChord) : null;
    const embedUrl = youtubeUrl ? getYoutubeEmbedUrl(youtubeUrl) : null;

    const hasLeftContent = title.trim() !== "" || artistName.trim() !== "" || content.trim() !== "";
    const hasRightContent = !!embedUrl;

    if (!hasLeftContent && !hasRightContent) {
        return null;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 h-full w-full text-left">
            {/* Left Section: Lyrics and Chords */}
            {hasLeftContent && (
                <div
                    ref={scrollContainerRef}
                    className="w-full lg:flex-[2] bg-white dark:bg-[#111219] rounded-sm lg:overflow-y-auto border border-gray-150 dark:border-slate-800/40 h-auto lg:h-[calc(100vh-64px)] p-3 md:p-4 relative shadow-md animate-fadeIn"
                >
                    <div className="flex flex-col gap-2 mb-3 border-b border-gray-150 dark:border-slate-800 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-slate-100 flex-1 min-w-0 break-words">
                                {title || "Tên bài hát"}
                            </h1>
                            <button className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-full hover:scale-105 transition shrink-0 border-none cursor-pointer">
                                <Star size={16} fill="currentColor" />
                            </button>
                            <button
                                onClick={() => setAutoScroll(!autoScroll)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer border-none ${autoScroll
                                    ? "bg-green-500 text-white shadow"
                                    : " dark:bg-slate-850 text-gray-700 dark:text-slate-350 hover:bg-gray-250 dark:hover:bg-slate-800"
                                    }`}
                            >
                                {autoScroll
                                    ? countdown > 0
                                        ? `Cuộn sau ${countdown}s`
                                        : "Đang cuộn..."
                                    : "Auto Scroll"}
                            </button>
                        </div>
                        {artistName.trim() && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-455 font-medium animate-fadeIn">
                                {artistName}
                            </p>
                        )}
                    </div>

                    {content.trim() && (
                        <div className="whitespace-pre-wrap text-xs sm:text-sm leading-[2.0] text-gray-800 dark:text-slate-200 select-none pb-20 animate-fadeIn">
                            {renderContent(content)}
                        </div>
                    )}

                    {hoveredChord && currentChordData && (
                        <div
                            ref={popupRef}
                            className="fixed z-50 animate-fadeIn"
                            style={{
                                top: popupPos.y - 150,
                                left: popupPos.x,
                                transform: "translateX(-50%)",
                            }}
                        >
                            <div className="bg-white dark:bg-[#111219] shadow-2xl rounded-xl p-1.5 border border-gray-200 dark:border-slate-800 scale-75">
                                <GuitarChordDiagram initialChordName={hoveredChord} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Right Section: YouTube Player Only */}
            {hasRightContent && (
                <div className="w-full lg:flex-[1] bg-white dark:bg-[#111219] flex flex-col gap-3 h-auto lg:h-[calc(100vh-64px)] overflow-y-auto border border-transparent lg:border-gray-150 lg:dark:border-slate-800/40 shadow-md animate-fadeIn">

                    <div className="w-full aspect-video bg-black rounded-none overflow-hidden border border-gray-200 dark:border-slate-800">
                        <iframe
                            className="w-full h-full border-none"
                            src={embedUrl}
                            title="YouTube video player"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SongPreview;
