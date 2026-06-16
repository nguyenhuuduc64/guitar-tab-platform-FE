import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
    Play, Pause, Type, Sliders, Sparkles, SlidersHorizontal,
    Volume2, Share2, ChevronDown, RotateCw, SkipForward, SkipBack, ListMusic, Loader2, Settings
} from "lucide-react";
// Import component Modal vào đây
import { ConfigAudioModal } from "../../../components/common/ConfigAudioModal";

const DEBUG = true;
const DEBUG_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

interface Track {
    id: string;
    title: string;
    subTitle: string;
    duration: string;
    description: string;
    tags: string[];
    coverUrl: string;
    lyrics?: string;
    audioUrl?: string;
}

const INITIAL_TRACKS: Track[] = [
    {
        id: "init-1",
        title: "Heartbreak Souvenirs",
        subTitle: "Meloflow Demo",
        duration: "3:58",
        description: "A widescreen pop ballad with a late-night glow and a cinematic chorus.",
        tags: ["pop", "ballad", "cinematic"],
        coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80",
        lyrics: "[Intro]\n(Melancholic Piano)\n\n[Verse 1]\nFound a box of memories today\nFaded photographs of yesterday\nWalking down the streets we used to know\nWhere the neon lights no longer glow..."
    }
];

export default function SunoMeloflowLightUI() {
    const location = useLocation();

    const [chords, setChords] = useState<string>("");
    const [lyrics, setLyrics] = useState<string>("");
    const [styles, setStyles] = useState<string>("pop, acoustic guitar, happy");
    const [loading, setLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const [mode, setMode] = useState<"Simple" | "Advanced">("Advanced");
    const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
    const [activeTrack, setActiveTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [durationSec, setDurationSec] = useState<number>(180);

    // State điều khiển mở Config Modal
    const [configModal, setConfigModal] = useState<{
        isOpen: boolean;
        chordId: string;
        audioUrl: string;
        initialLyrics: string;
    }>({
        isOpen: false,
        chordId: "",
        audioUrl: "",
        initialLyrics: ""
    });

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioHtmlRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (location.state && (location.state as { aiLyrics?: string }).aiLyrics) {
            setLyrics((location.state as { aiLyrics: string }).aiLyrics);
        }
    }, [location.state]);

    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (isPlaying && activeTrack) {
            timerRef.current = setInterval(() => {
                if (audioHtmlRef.current) {
                    setCurrentTime(Math.floor(audioHtmlRef.current.currentTime));
                } else {
                    setCurrentTime((prev) => (prev >= durationSec ? 0 : prev + 1));
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying, durationSec, activeTrack]);

    const appendAndPlayTrack = (id: string, audioUrl: string) => {
        const generatedTrack: Track = {
            id: id,
            title: chords.trim().substring(0, 24) || "Mock Test Composition",
            subTitle: DEBUG ? "DEBUG Mock Mode" : "Sonauto AI V3",
            duration: "6:12",
            description: styles || "Bản nhạc mô phỏng cấu trúc giao diện sáng.",
            tags: styles.split(",").map(s => s.trim()).filter(Boolean),
            coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
            lyrics: lyrics.trim() ? lyrics : undefined,
            audioUrl: audioUrl
        };

        setTracks((prevTracks) => [generatedTrack, ...prevTracks]);
        setLoading(false);
        setStatusMessage("");
        handleSelectTrack(generatedTrack);
    };

    const startPolling = (taskId: string) => {
        setStatusMessage("Bài hát đang được khởi tạo...");

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const statusResponse = await fetch(`/api-sonauto/v1/generations/status/${taskId}`, { method: "GET" });
                if (!statusResponse.ok) throw new Error("Không thể kiểm tra trạng thái bài hát.");

                const statusData = await statusResponse.json();
                const status = typeof statusData === "string" ? statusData : statusData.status;

                if (status === "SUCCESS") {
                    setStatusMessage("Đang nạp file âm thanh thành phẩm...");
                    const resultResponse = await fetch(`/api-sonauto/v1/generations/${taskId}`, { method: "GET" });
                    if (!resultResponse.ok) throw new Error("Không thể tải thông tin bài hát.");

                    const resultData = await resultResponse.json();
                    if (resultData.song_paths && resultData.song_paths.length > 0) {
                        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                        appendAndPlayTrack(taskId, resultData.song_paths[0]);
                    } else {
                        throw new Error("Không tìm thấy đường dẫn âm thanh.");
                    }
                } else if (status === "FAILURE") {
                    throw new Error("Quá trình xử lý bài hát từ phía Sonauto AI bị lỗi.");
                } else {
                    setStatusMessage(`AI đang xử lý (Trạng thái: ${status})...`);
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Có lỗi xảy ra trong quá trình Polling.";
                setError(msg);
                setLoading(false);
                setStatusMessage("");
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            }
        }, 5000);
    };

    const handleGenerateMusic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chords.trim()) {
            setError("Vui lòng nhập chuỗi hợp âm hoặc prompt mô tả giai điệu.");
            return;
        }

        setTracks([]);
        setLoading(true);
        setError(null);

        if (DEBUG) {
            setStatusMessage("[DEBUG] Đang giả lập luồng gọi Sonauto V3...");
            setTimeout(() => {
                setStatusMessage("[DEBUG] AI đang xử lý (Trạng thái: SUCCESS)...");
                setTimeout(() => {
                    appendAndPlayTrack(`mock-${Date.now()}`, DEBUG_AUDIO_URL);
                }, 1000);
            }, 1000);
            return;
        }

        try {
            setStatusMessage("Đang gửi yêu cầu tạo bài hát đến Sonauto V3...");
            const fullPrompt = `Chord Progression: ${chords.trim()}. Style: ${styles}`;

            const response = await fetch("/api-sonauto/v1/generations/v3", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    ...(lyrics.trim() && { lyrics: lyrics.trim() })
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.message || "Gửi yêu cầu tạo nhạc thất bại.");
            }

            const data = await response.json();
            if (data.task_id) {
                startPolling(data.task_id);
            } else {
                throw new Error("Hệ thống không trả về task_id hợp lệ.");
            }
        } catch (err: unknown) {
            console.error("Sonauto Generate Error:", err);
            const msg = err instanceof Error ? err.message : "Có lỗi kết nối xảy ra khi gọi Sonauto API.";
            setError(msg);
            setLoading(false);
            setStatusMessage("");
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleSelectTrack = (track: Track) => {
        setActiveTrack(track);
        setIsPlaying(true);
        setCurrentTime(0);

        const parts = track.duration.split(":");
        const totalSecs = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        setDurationSec(isNaN(totalSecs) ? 180 : totalSecs);

        if (audioHtmlRef.current) {
            audioHtmlRef.current.pause();
            if (track.audioUrl) {
                audioHtmlRef.current.src = track.audioUrl;
                audioHtmlRef.current.load();
                audioHtmlRef.current.play().catch(() => { });
            }
        }
    };

    const togglePlayPause = () => {
        if (!audioHtmlRef.current) {
            setIsPlaying(!isPlaying);
            return;
        }
        if (isPlaying) {
            audioHtmlRef.current.pause();
            setIsPlaying(false);
        } else {
            audioHtmlRef.current.play().catch(() => { });
            setIsPlaying(true);
        }
    };

    // Hàm trigger mở modal
    const handleOpenConfig = (e: React.MouseEvent, track: Track) => {
        e.stopPropagation(); // Chặn hành vi click lan ra component cha (select track)
        setConfigModal({
            isOpen: true,
            chordId: track.id,
            audioUrl: track.audioUrl || "",
            initialLyrics: track.lyrics || ""
        });
    };

    return (
        <div className="w-full min-h-screen bg-[#F5F5F3] text-[#222222] font-sans antialiased">

            <audio
                ref={audioHtmlRef}
                onLoadedMetadata={() => {
                    if (audioHtmlRef.current) setDurationSec(Math.floor(audioHtmlRef.current.duration));
                }}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
            />

            {/* STATE 1: DASHBOARD */}
            {!activeTrack ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 h-screen overflow-hidden divide-x divide-zinc-200 bg-[#EFEFEF]">

                    <form onSubmit={handleGenerateMusic} className="lg:col-span-4 p-6 bg-[#FBFBFB] flex flex-col justify-between overflow-y-auto">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="bg-zinc-200/60 p-1 rounded-lg flex gap-1 w-fit border border-zinc-300/50">
                                    {(["Simple", "Advanced"] as const).map((t) => (
                                        <button type="button" key={t} onClick={() => setMode(t)} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${mode === t ? "bg-white text-zinc-900 shadow-sm border border-zinc-200" : "text-zinc-500"}`}>{t}</button>
                                    ))}
                                </div>
                                {DEBUG && <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-700 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Debug On</span>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block">Chuỗi hợp âm / Ý tưởng nhạc</label>
                                <input type="text" value={chords} onChange={(e) => setChords(e.target.value)} disabled={loading} placeholder="Ví dụ: C - G - Am - F" className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-400 text-sm text-zinc-800 disabled:bg-zinc-100" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><Type size={13} /> Lyrics (Tùy chọn)</label>
                                <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} disabled={loading} placeholder="Nhập lời bài hát tại đây..." rows={5} className="w-full p-4 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-400 text-sm text-zinc-800 font-mono resize-none disabled:bg-zinc-100" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"><Sliders size={13} /> Phong cách & Nhạc cụ (Tags)</label>
                                <textarea value={styles} onChange={(e) => setStyles(e.target.value)} disabled={loading} placeholder="Ví dụ: pop, rock" rows={2} className="w-full p-4 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-400 text-sm text-zinc-800 resize-none disabled:bg-zinc-100" />
                            </div>

                            {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">{error}</div>}

                            {statusMessage && (
                                <div className="flex items-center gap-2 p-3 bg-indigo-50 text-indigo-700 text-xs rounded-xl border border-indigo-100">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                                    <span>{statusMessage}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-zinc-200">
                            <button type="submit" disabled={loading} className={`w-full text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${loading ? "bg-zinc-400 cursor-not-allowed" : "bg-zinc-900 hover:bg-zinc-800"}`}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SlidersHorizontal size={14} />}
                                {loading ? "Đang xử lý luồng AI..." : "Generate Music"}
                            </button>
                        </div>
                    </form>

                    <div className="lg:col-span-8 p-8 flex flex-col overflow-y-auto bg-[#F5F5F3]">
                        <div className="w-full max-w-2xl mx-auto space-y-2.5">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-2">Your Generations</h3>
                            {tracks.map((track) => (
                                <div key={track.id} onClick={() => handleSelectTrack(track)} className="flex items-center gap-4 p-3.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl transition-all cursor-pointer group shadow-sm relative">
                                    <img src={track.coverUrl} alt={track.title} className="w-11 h-11 rounded-lg object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-zinc-800 truncate group-hover:text-black pr-16">{track.title}</h4>
                                        <p className="text-xs text-zinc-500 font-medium mt-0.5">{track.subTitle} • {track.duration}</p>
                                    </div>

                                    {/* Nút Cấu hình hiển thị khi hover vào item list */}
                                    <button
                                        onClick={(e) => handleOpenConfig(e, track)}
                                        className="opacity-0 group-hover:opacity-100 absolute right-4 p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-lg transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                                    >
                                        <Settings size={14} />
                                        Cấu hình
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (

                /* STATE 2: PLAYER VIEW */
                <div className="w-full h-screen relative flex flex-col justify-between overflow-hidden bg-[#EAE8E4]">
                    <div
                        className="absolute top-0 left-0 h-full w-[52%] bg-cover bg-center select-none pointer-events-none z-0"
                        style={{
                            backgroundImage: `url(${activeTrack.coverUrl})`,
                            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)'
                        }}
                    />

                    <button onClick={() => { setActiveTrack(null); setIsPlaying(false); if (audioHtmlRef.current) audioHtmlRef.current.pause(); }} className="absolute top-6 right-8 z-50 p-2 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer">
                        <ChevronDown size={22} />
                    </button>

                    <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 w-full h-full items-center px-16 lg:px-28 gap-12">
                        <div className="lg:col-span-6 hidden lg:block" />

                        <div className="lg:col-span-6 space-y-8 text-left lg:pl-8">
                            <div className="space-y-1">
                                <h1 className="text-4xl lg:text-[54px] font-serif font-normal text-zinc-900 leading-tight tracking-tight">{activeTrack.title}</h1>
                                <p className="text-sm font-semibold text-zinc-500 tracking-wider uppercase">{activeTrack.subTitle}</p>
                            </div>

                            <div className="max-w-xl h-64 overflow-y-auto pr-4 scrollbar-none select-text">
                                {activeTrack.lyrics ? (
                                    <pre className="text-[17px] text-zinc-800 font-sans font-medium leading-relaxed whitespace-pre-wrap">{activeTrack.lyrics}</pre>
                                ) : (
                                    <p className="text-xl text-zinc-700 font-serif leading-relaxed italic">{activeTrack.description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 bg-gradient-to-t from-white/60 to-transparent pt-12 pb-6 px-8 backdrop-blur-sm">
                        <div className="w-full flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="min-w-[200px]">
                                    <h4 className="text-sm font-bold text-zinc-900 truncate">{activeTrack.title}</h4>
                                    <p className="text-xs text-zinc-500 font-medium mt-0.5">{activeTrack.subTitle}</p>
                                </div>

                                <div className="flex items-center gap-5 translate-x-12">
                                    <RotateCw size={14} className="text-zinc-500 hover:text-zinc-900 cursor-pointer" />
                                    <SkipBack size={16} className="text-zinc-600 hover:text-zinc-900 cursor-pointer" />
                                    <button onClick={togglePlayPause} className="w-10 h-10 rounded-full bg-zinc-900/10 hover:bg-zinc-900/20 border border-zinc-950/5 text-zinc-900 flex items-center justify-center transition-all cursor-pointer">
                                        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                                    </button>
                                    <SkipForward size={16} className="text-zinc-600 hover:text-zinc-900 cursor-pointer" />
                                    <ListMusic size={15} className="text-zinc-500 hover:text-zinc-900 cursor-pointer" />
                                </div>

                                <div className="flex items-center gap-4 text-zinc-500 min-w-[200px] justify-end">
                                    <Volume2 size={16} className="hover:text-zinc-900 cursor-pointer" />
                                    <Share2 size={16} className="hover:text-zinc-900 cursor-pointer" />

                                    {/* Thêm nút cấu hình ở góc phải thanh điều khiển nhạc */}
                                    <button
                                        onClick={(e) => handleOpenConfig(e, activeTrack)}
                                        className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 text-xs font-bold bg-white/40 hover:bg-white/80 px-2.5 py-1 rounded-lg border border-zinc-300/40 transition-all cursor-pointer"
                                    >
                                        <Settings size={14} /> Cấu hình
                                    </button>

                                    <ChevronDown size={16} className="hover:text-zinc-900 cursor-pointer" />
                                </div>
                            </div>

                            <div className="w-full flex items-center gap-3 text-[11px] font-bold text-zinc-500">
                                <span className="w-8 text-right">{formatTime(currentTime)}</span>
                                <div
                                    className="flex-1 h-[2px] bg-zinc-300 rounded-full relative cursor-pointer group"
                                    onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const clickX = e.clientX - rect.left;
                                        const width = rect.width;
                                        const newTime = (clickX / width) * durationSec;
                                        if (audioHtmlRef.current) audioHtmlRef.current.currentTime = newTime;
                                        setCurrentTime(Math.floor(newTime));
                                    }}
                                >
                                    <div className="absolute top-0 left-0 bottom-0 bg-zinc-800 rounded-full" style={{ width: `${(currentTime / durationSec) * 100}%` }}>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="w-8 text-left">{formatTime(durationSec)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Render Config Modal tập trung ở dưới cùng component */}
            {configModal.isOpen && (
                <ConfigAudioModal
                    isOpen={configModal.isOpen}
                    chordId={configModal.chordId}
                    audioUrl={configModal.audioUrl}
                    initialLyrics={configModal.initialLyrics}
                    onClose={() => setConfigModal(prev => ({ ...prev, isOpen: false }))}
                    onSaveSuccess={() => {
                        alert("Đã cấu hình và lưu thành công bài hát!");
                    }}
                />
            )}

        </div>
    );
}