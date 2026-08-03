import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Play, Music } from "lucide-react";
import instance from "../../config/axios";

interface AudioItem {
    id: string;
    url: string;
    chordId: string;
    title?: string;
    artistName?: string;
    coverUrl?: string;
}

const getThumbnailUrl = (songId: string | number) => {
    if (!songId) return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500";
    const strId = String(songId);
    let hash = 0;
    for (let i = 0; i < strId.length; i++) {
        hash = strId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % 85) + 1; // 1 to 85
    return new URL(`../../assets/thumbnail/anh-thumbnail-${index}.jpg`, import.meta.url).href;
};

export const AudioGrid = () => {
    const [audios, setAudios] = useState<AudioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAudiosWithDetails = async () => {
            try {
                const response = await instance.get("/audios");
                const audioList = response.data.result || [];

                // Populating audio items with their associated chord details
                const populatedAudios = await Promise.all(
                    audioList.map(async (audio: any) => {
                        if (!audio.chordId) {
                            return {
                                ...audio,
                                title: "Bản thu âm mới",
                                artistName: "Nhạc sĩ ẩn danh",
                                coverUrl: getThumbnailUrl(audio.id)
                            };
                        }
                        try {
                            const chordRes = await instance.get(`/chords/${audio.chordId}`);
                            const chord = chordRes.data.result;
                            let coverUrl = getThumbnailUrl(audio.id);

                            return {
                                ...audio,
                                title: chord.title || "Chưa có tiêu đề",
                                artistName: chord.artistName || "Chưa cập nhật nghệ sĩ",
                                coverUrl
                            };
                        } catch (err) {
                            return {
                                ...audio,
                                title: "Chưa có tiêu đề",
                                artistName: "Chưa cập nhật nghệ sĩ",
                                coverUrl: getThumbnailUrl(audio.id)
                            };
                        }
                    })
                );

                setAudios(populatedAudios);
            } catch (error) {
                console.error("Failed to fetch audios", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAudiosWithDetails();
    }, []);

    const handleChordClick = async (chordId: string) => {
        try {
            await instance.get(`/audios/chord/${chordId}`);
            navigate(`/song/${chordId}`);
        } catch (error) {
            console.error("Failed to verify chord API", error);
        }
    };

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const scrollAmount = container.clientWidth * 0.8;
            if (direction === "left") {
                container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }
    };

    // Mouse drag-to-scroll logic
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        container.dataset.isDown = "true";
        container.dataset.startX = e.pageX.toString();
        container.dataset.scrollLeft = container.scrollLeft.toString();
        container.dataset.hasMoved = "false";
    };

    const handleMouseLeaveOrUp = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        container.dataset.isDown = "false";
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        if (container.dataset.isDown !== "true") return;
        const startX = parseFloat(container.dataset.startX || "0");
        const distance = Math.abs(e.pageX - startX);
        if (distance > 5) {
            container.dataset.hasMoved = "true";
        }
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const containerStartX = startX - container.offsetLeft;
        const scrollLeft = parseFloat(container.dataset.scrollLeft || "0");
        const walk = (x - containerStartX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    };

    const handleCardClick = (chordId: string, e: React.MouseEvent) => {
        const container = e.currentTarget.parentElement;
        if (container && container.dataset.hasMoved === "true") {
            return;
        }
        if (chordId) {
            handleChordClick(chordId);
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-sm text-gray-500 bg-white dark:bg-slate-900 rounded-xl dark:text-slate-400">
                Đang tải danh sách bài hát đề xuất...
            </div>
        );
    }

    if (audios.length === 0) {
        return null;
    }

    return (
        <div className="w-full bg-transparent text-slate-800 dark:text-white relative group select-none h-full flex flex-col justify-between">


            {/* Left Scroll Button */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-2 top-[calc(50%-18px)] -translate-y-1/2 w-15 h-15 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100 z-20 border-none shadow-md"
            >
                <ChevronLeft size={28} />
            </button>

            {/* Right Scroll Button */}
            <button
                onClick={() => scroll("right")}
                className="absolute right-2 top-[calc(50%-18px)] -translate-y-1/2 w-15 h-15 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100 z-20 border-none shadow-md"
            >
                <ChevronRight size={28} />
            </button>

            {/* Scroll Container Wrapper */}
            <div className="flex-1 min-h-0 w-full relative">
                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeaveOrUp}
                    onMouseUp={handleMouseLeaveOrUp}
                    onMouseMove={handleMouseMove}
                    className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide cursor-grab active:cursor-grabbing snap-x snap-mandatory h-full"
                >
                    {audios.map((item) => (
                        <div
                            key={item.id}
                            onClick={(e) => item.chordId && handleCardClick(item.chordId, e)}
                            className="w-[calc((100%-8px)/1.5)] md:w-[calc((100%-16px)/2.5)] lg:w-[calc((100%-24px)/3.5)] shrink-0 flex flex-col items-start bg-transparent hover:bg-slate-150/70 dark:hover:bg-slate-800/30 border-0 cursor-pointer snap-start group/card transition-all duration-300 hover:scale-[1.01] h-full p-1 rounded-2xl"
                        >
                            {/* Cover Image Container */}
                            <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-xs relative border border-slate-200/50 dark:border-slate-850">
                                {item.coverUrl ? (
                                    <img
                                        src={item.coverUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-slate-800 dark:to-slate-900">
                                        <Music className="w-8 h-8 text-indigo-300 dark:text-slate-650" />
                                    </div>
                                )}

                                {/* Play Overlay */}
                                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center shadow-lg transform translate-y-2 group-hover/card:translate-y-0 transition-all duration-300 hover:scale-105 active:scale-95">
                                        <Play size={18} fill="currentColor" className="ml-0.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Title & Artist Info */}
                            <div className="w-full mt-1 text-left shrink-0">
                                <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-[13px] truncate w-full group-hover/card:text-[var(--primary-color)] transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate w-full">
                                    {item.artistName}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};