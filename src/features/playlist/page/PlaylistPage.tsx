import { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import instance from "../../../config/axios";
import { fetchArtists } from "../../../services/artistService";
import { SidebarLeft } from "../../home/components/SidebarLeft";
import { RankingRight } from "../../home/components/RankingRight";
import { type Chord } from "../../../types/chord";
import { type Artist } from "../../../types/artist";
import { useNavigate } from "react-router-dom";
import { ArtistSlider } from "../../../components/common/ArtistSlider";
import { type AudioItem } from "../../../types/audio";

export const PlaylistPage = () => {
    const navigate = useNavigate();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [audios, setAudios] = useState<AudioItem[]>([]);
    const [chords, setChords] = useState<Chord[]>([]);
    const [loading, setLoading] = useState(true);

    // Audio Playback States
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                // Fetch artists
                const artistsList = await fetchArtists();
                setArtists(artistsList || []);

                // Fetch audios
                const audiosRes = await instance.get("/audios");
                setAudios(audiosRes.data?.result || []);

                // Fetch chords (all) to map metadata for audios
                const chordsRes = await instance.get("/chords?size=100");
                setChords(chordsRes.data?.result?.data || []);
            } catch (err) {
                console.error("Failed to load library data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Stop audio on unmount
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
            }
        };
    }, [audioElement]);

    // Drag-to-Scroll Event Handlers
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
        const walk = (x - containerStartX) * 1.5; // Scroll speed multiplier
        container.scrollLeft = scrollLeft - walk;
    };

    // Navigation and Action Handlers

    const handleAudioCardClick = (chordId: string, e: React.MouseEvent) => {
        const container = e.currentTarget.parentElement;
        if (container && container.dataset.hasMoved === "true") {
            // Dragged, don't trigger click
            return;
        }
        if (chordId) {
            navigate(`/song/${chordId}`);
        }
    };

    const handlePlayAudio = (item: AudioItem, e: React.MouseEvent) => {
        e.stopPropagation(); // Avoid card container clicks

        if (playingAudioId === item.id) {
            audioElement?.pause();
            setPlayingAudioId(null);
            return;
        }

        if (audioElement) {
            audioElement.pause();
        }

        const audio = new Audio(item.url);
        audio.play()
            .then(() => {
                setPlayingAudioId(item.id);
                setAudioElement(audio);
            })
            .catch((err) => {
                console.error("Audio playback error:", err);
                alert("Không thể phát file thu âm này!");
            });

        audio.onended = () => {
            setPlayingAudioId(null);
        };
    };

    const handlePlayButtonClick = (item: AudioItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const container = e.currentTarget.parentElement?.parentElement?.parentElement;
        if (container && container.dataset.hasMoved === "true") {
            return;
        }
        handlePlayAudio(item, e);
    };

    // Helper to map chord details for audio card
    const getChordMeta = (chordId: string) => {
        const chord = chords.find((c) => c.id === chordId);
        return {
            title: chord ? chord.title : "Chưa có tiêu đề",
            artist: chord ? (chord.artistName || "Chưa cập nhật") : "Chưa cập nhật nghệ sĩ",
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center dark:bg-slate-950">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Đang tải dữ liệu thư viện...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto animate-in fade-in duration-500 min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans">
            {/* LEFT SIDEBAR */}
            <aside className="w-64 shrink-0 hidden lg:block z-30">
                <SidebarLeft />
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-4 md:p-6 flex gap-6 overflow-x-hidden">
                <div className="flex-1 flex flex-col gap-8 min-w-0">

                    {/* SECTION 1: POPULAR ARTISTS (IMAGE 1 STYLE) */}
                    <ArtistSlider
                        title="Nghệ sĩ phổ biến"
                        artists={artists}
                        emptyText="Chưa có nghệ sĩ nào trong hệ thống"
                        hasBorder={true}
                    />

                    {/* SECTION 2: TRENDING SONGS/AUDIOS (IMAGE 2 STYLE) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                                Những bài hát thịnh hành
                            </h2>
                        </div>

                        {audios.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-none p-8 text-center text-slate-400 text-sm">
                                Chưa có bản thu âm nào
                            </div>
                        ) : (
                            <div
                                onMouseDown={handleMouseDown}
                                onMouseLeave={handleMouseLeaveOrUp}
                                onMouseUp={handleMouseLeaveOrUp}
                                onMouseMove={handleMouseMove}
                                className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide select-none cursor-grab active:cursor-grabbing"
                            >
                                {audios.map((item) => {
                                    const isPlaying = playingAudioId === item.id;
                                    const meta = getChordMeta(item.chordId);

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={(e) => handleAudioCardClick(item.chordId, e)}
                                            className="w-[140px] sm:w-[150px] shrink-0 flex flex-col items-start bg-transparent border-0 cursor-pointer select-none group transition-transform duration-300 hover:scale-[1.02]"
                                        >
                                            {/* Rounded Square Image Container */}
                                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700/60 relative">
                                                <img
                                                    src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500"
                                                    alt="Audio cover"
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    draggable={false}
                                                />

                                                {/* Play/Pause Overlay */}
                                                <div className={`absolute inset-0 bg-black/35 flex items-center justify-center transition-opacity duration-300
                                                    ${isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                                    <button
                                                        onClick={(e) => handlePlayButtonClick(item, e)}
                                                        className={`w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 active:scale-95 outline-none cursor-pointer
                                                            ${isPlaying ? "scale-105 border border-indigo-500" : ""}`}
                                                    >
                                                        {isPlaying ? (
                                                            <Pause size={16} fill="currentColor" />
                                                        ) : (
                                                            <Play size={16} fill="currentColor" className="ml-0.5" />
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Wave effect representation when playing */}
                                                {isPlaying && (
                                                    <div className="absolute bottom-2 left-2 flex gap-0.5 items-end h-2.5">
                                                        <span className="w-[1.5px] bg-indigo-500 animate-bounce h-1.5" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                                                        <span className="w-[1.5px] bg-indigo-500 animate-bounce h-2.5" style={{ animationDelay: '0.3s', animationDuration: '0.4s' }} />
                                                        <span className="w-[1.5px] bg-indigo-500 animate-bounce h-1" style={{ animationDelay: '0.5s', animationDuration: '0.7s' }} />
                                                        <span className="w-[1.5px] bg-indigo-500 animate-bounce h-2" style={{ animationDelay: '0.2s', animationDuration: '0.5s' }} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Text Info Below Image */}
                                            <div className="w-full mt-3 text-left">
                                                <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm truncate w-full group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                                                    {meta.title}
                                                </h3>
                                                <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate w-full">
                                                    {meta.artist}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <aside className="w-[350px] shrink-0 hidden xl:flex flex-col h-fit sticky top-0 bg-white dark:bg-transparent">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm md:text-base flex-shrink-0 uppercase tracking-wider">
                        Hot trong tuần
                    </h3>
                    <div className="flex-1 overflow-y-auto min-h-0
                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-neutral-200
                        [&::-webkit-scrollbar-thumb]:rounded-none
                        hover:[&::-webkit-scrollbar-thumb]:bg-neutral-300
                        dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700">
                        <RankingRight />
                    </div>
                </aside>
            </main>
        </div>
    );
};
