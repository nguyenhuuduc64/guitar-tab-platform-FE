import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Music, X, ChevronLeft, ChevronRight, Play, Pause, RotateCw, Trash2, ChevronDown, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { DotLoader } from "react-spinners";
import instance from "../../../config/axios";
import { toast } from "react-toastify";

function ShootingStarsBackground() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        const stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];
        for (let i = 0; i < 60; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                speed: Math.random() * 0.02 + 0.005,
            });
        }

        const shootingStars: {
            x: number;
            y: number;
            len: number;
            speed: number;
            angle: number;
            alpha: number;
            active: boolean;
        }[] = [];

        const createShootingStar = () => {
            if (Math.random() < 0.15 && shootingStars.length < 3) {
                shootingStars.push({
                    x: Math.random() * width * 1.2 - width * 0.1,
                    y: Math.random() * (height * 0.5),
                    len: Math.random() * 80 + 40,
                    speed: Math.random() * 8 + 4,
                    angle: Math.PI / 4 + (Math.random() * 0.1 - 0.05),
                    alpha: 1,
                    active: true,
                });
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            stars.forEach((star) => {
                star.alpha += star.speed;
                if (star.alpha > 1 || star.alpha < 0.2) star.speed = -star.speed;
                ctx.fillStyle = `rgba(180, 180, 200, ${Math.abs(star.alpha) * 0.5})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            createShootingStar();

            shootingStars.forEach((st, idx) => {
                if (!st.active) return;
                const endX = st.x + st.len * Math.cos(st.angle);
                const endY = st.y + st.len * Math.sin(st.angle);

                const grad = ctx.createLinearGradient(st.x, st.y, endX, endY);
                grad.addColorStop(0, `rgba(255, 120, 50, ${st.alpha})`);
                grad.addColorStop(0.5, `rgba(255, 180, 80, ${st.alpha * 0.6})`);
                grad.addColorStop(1, `rgba(255, 220, 150, 0)`);

                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(st.x, st.y);
                ctx.lineTo(endX, endY);
                ctx.stroke();

                st.x += st.speed * Math.cos(st.angle);
                st.y += st.speed * Math.sin(st.angle);
                st.alpha -= 0.012;

                if (st.alpha <= 0 || st.x > width + 100 || st.y > height + 100) {
                    shootingStars.splice(idx, 1);
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-70" />;
}

interface Track {
    id: string;
    title: string;
    subTitle: string;
    audioUrl: string;
    lyrics?: string;
    chordLyrics?: string;
    chordId?: string;
    coverUrl?: string;
    duration?: string;
}

export function AudioExtend() {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [promptText, setPromptText] = useState<string>("");
    const [contextSeconds, setContextSeconds] = useState<number>(30);
    const [cropDuration, setCropDuration] = useState<number>(0);
    
    const [loading, setLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loadingAudios, setLoadingAudios] = useState<boolean>(false);
    
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
    const [isPlayingInput, setIsPlayingInput] = useState<boolean>(false);
    
    // User tracks and active track state
    const [tracks, setTracks] = useState<Track[]>([]);
    const [activeTrack, setActiveTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [durationSec, setDurationSec] = useState<number>(0);

    const [defaultCategoryId, setDefaultCategoryId] = useState<string>("");
    const [defaultArtistId, setDefaultArtistId] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const inputAudioRef = useRef<HTMLAudioElement | null>(null);
    const mainAudioRef = useRef<HTMLAudioElement | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const defaultCovers = [
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80"
    ];

    const fetchUserAudios = async () => {
        try {
            setLoadingAudios(true);
            const response = await instance.get("/audios?page=1&size=50");
            const rawData = response.data?.result?.data || response.data?.data || response.data || [];

            const audioWithChord = await Promise.all(
                rawData.map(async (audio: any, idx: number) => {
                    try {
                        if (!audio.chordId) return { ...audio, chordTitle: audio.title || `Bản nhạc mở rộng #${idx + 1}` };
                        const chordRes = await instance.get(`/chords/${audio.chordId}`);
                        const chord = chordRes.data?.result || chordRes.data?.data || chordRes.data || {};
                        return {
                            ...audio,
                            chordTitle: chord.title || `Bản nhạc mở rộng #${idx + 1}`,
                            artistName: chord.artistName || chord.artist?.name || "AI Sonauto V3",
                            chordContent: chord.content || "",
                            contentPlusChord: chord.contentPlusChord || ""
                        };
                    } catch (error) {
                        return {
                            ...audio,
                            chordTitle: audio.title || `Bản nhạc mở rộng #${idx + 1}`,
                            artistName: "AI Sonauto V3",
                            chordContent: "",
                            contentPlusChord: ""
                        };
                    }
                })
            );

            const mappedTracks: Track[] = audioWithChord.map((item: any, idx: number) => {
                const cleanLyrics = (item.chordContent || "").replace(/\[.*?\]/g, "");
                return {
                    id: item.id || `audio-${idx}`,
                    title: item.chordTitle || `Bản nhạc mở rộng #${idx + 1}`,
                    subTitle: item.artistName || "AI Sonauto V3 • Mở rộng",
                    audioUrl: item.url || item.audioUrl || "",
                    lyrics: cleanLyrics || "Chưa có lời bài hát cho đoạn mở rộng này.",
                    chordLyrics: item.chordContent || "",
                    chordId: item.chordId || "",
                    coverUrl: defaultCovers[idx % defaultCovers.length],
                    duration: "03:00"
                };
            });

            setTracks(mappedTracks);
        } catch (err) {
            console.error("Lỗi lấy danh sách bài hát:", err);
        } finally {
            setLoadingAudios(false);
        }
    };

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const [catRes, artistRes] = await Promise.allSettled([
                    instance.get("/categories"),
                    instance.get("/artists")
                ]);

                if (catRes.status === "fulfilled") {
                    const catData = catRes.value.data?.result?.data || catRes.value.data?.data || catRes.value.data || [];
                    if (catData.length > 0) setDefaultCategoryId(catData[0].id);
                }

                if (artistRes.status === "fulfilled") {
                    const artistData = artistRes.value.data?.result?.data || artistRes.value.data?.data || artistRes.value.data || [];
                    if (artistData.length > 0) setDefaultArtistId(artistData[0].id);
                }
            } catch (err) {
                console.error("Lỗi lấy thông tin mặc định:", err);
            }
        };

        fetchDefaults();
        fetchUserAudios();

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, []);

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || seconds <= 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 40 * 1024 * 1024) {
                toast.error("Dung lượng file tối đa là 40MB.");
                return;
            }
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
            setIsPlayingInput(false);
            setError(null);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        setIsPlayingInput(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleTogglePlayInput = () => {
        if (!inputAudioRef.current) return;
        if (isPlayingInput) {
            inputAudioRef.current.pause();
            setIsPlayingInput(false);
        } else {
            inputAudioRef.current.play().catch(() => {});
            setIsPlayingInput(true);
        }
    };

    const handleTogglePlayMain = () => {
        if (!mainAudioRef.current) return;
        if (isPlaying) {
            mainAudioRef.current.pause();
            setIsPlaying(false);
        } else {
            mainAudioRef.current.play().catch(() => {});
            setIsPlaying(true);
        }
    };

    const handleSelectTrack = (track: Track) => {
        setActiveTrack(track);
        setIsPlaying(false);
        setCurrentTime(0);
        setDurationSec(0);
        if (mainAudioRef.current) {
            mainAudioRef.current.pause();
            mainAudioRef.current.currentTime = 0;
        }
    };

    const handleDeleteTrack = async (e: React.MouseEvent, track: Track) => {
        e.stopPropagation();
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa bài hát "${track.title}" khỏi thư viện không?`);
        if (!confirmDelete) return;

        try {
            await instance.delete(`/audios/${track.id}`);
            toast.success("Đã xóa bài hát thành công!");
            fetchUserAudios();
            if (activeTrack && activeTrack.id === track.id) {
                setActiveTrack(null);
                setIsPlaying(false);
            }
        } catch (err) {
            console.error("Lỗi khi xóa bài hát:", err);
            toast.error("Không thể xóa bài hát này.");
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(",")[1] || result;
                resolve(base64);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    const saveExtendedTrackToDb = async (generatedAudioUrl: string, lyricsText?: string, titlePrompt?: string) => {
        try {
            const trackTitle = titlePrompt ? `Mở rộng: ${titlePrompt.substring(0, 20)}` : (selectedFile ? `Mở rộng: ${selectedFile.name.replace(/\.[^/.]+$/, "")}` : "Bản nhạc mở rộng AI");

            const chordResponse = await instance.post("/chords", {
                title: trackTitle.substring(0, 30),
                content: lyricsText || "Bản nhạc được mở rộng bằng AI Sonauto V3",
                isPublic: true,
                artistName: "AI",
                artistId: defaultArtistId || null,
                categoryId: defaultCategoryId || null
            });

            const newChordId = chordResponse.data?.result?.id;

            if (newChordId) {
                await instance.post("/audios", {
                    url: generatedAudioUrl,
                    chordId: newChordId
                });
            }

            return { newChordId, trackTitle };
        } catch (err) {
            console.error("Lỗi tự động lưu bản nhạc mở rộng:", err);
            return { newChordId: undefined, trackTitle: "Bản nhạc mở rộng AI" };
        }
    };

    const startPolling = (taskId: string, promptInfo: string) => {
        setStatusMessage("Đang khởi tạo bài hát mở rộng...");

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const statusResponse = await fetch(`/api-sonauto/v1/generations/status/${taskId}`, { method: "GET" });
                if (!statusResponse.ok) throw new Error("Không thể kiểm tra trạng thái bài hát.");

                const statusData = await statusResponse.json();
                const status = typeof statusData === "string" ? statusData : statusData.status;

                if (status === "SUCCESS") {
                    setStatusMessage("Đang nạp và lưu file âm thành phẩm...");
                    const resultResponse = await fetch(`/api-sonauto/v1/generations/${taskId}`, { method: "GET" });
                    if (!resultResponse.ok) throw new Error("Không thể tải thông tin bài hát.");

                    const resultData = await resultResponse.json();
                    if (resultData.song_paths && resultData.song_paths.length > 0) {
                        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                        
                        const finalAudioUrl = resultData.song_paths[0];
                        const finalLyrics = resultData.lyrics || "";

                        const { newChordId, trackTitle } = await saveExtendedTrackToDb(finalAudioUrl, finalLyrics, promptInfo);

                        const newTrack: Track = {
                            id: taskId,
                            title: trackTitle,
                            subTitle: "AI Sonauto V3 • Mở rộng",
                            audioUrl: finalAudioUrl,
                            lyrics: finalLyrics,
                            chordLyrics: finalLyrics,
                            chordId: newChordId,
                            coverUrl: defaultCovers[0],
                            duration: "03:00"
                        };

                        setLoading(false);
                        setStatusMessage("");
                        setActiveTrack(newTrack);
                        fetchUserAudios();
                        toast.success("Mở rộng bản nhạc bằng Sonauto V3 thành công!");
                    } else {
                        throw new Error("Không tìm thấy đường dẫn âm thanh mở rộng.");
                    }
                } else if (status === "FAILURE") {
                    throw new Error("Quá trình xử lý bài hát từ phía Sonauto AI bị lỗi.");
                } else {
                    setStatusMessage(`AI đang xử lý mở rộng nhạc (Trạng thái: ${status})...`);
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Có lỗi xảy ra trong quá trình kiểm tra.";
                setError(msg);
                setLoading(false);
                setStatusMessage("");
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            }
        }, 5000);
    };

    const handleGenerateExtend = async () => {
        if (!selectedFile) {
            setError("Vui lòng tải lên file MP3 / WAV để mở rộng.");
            return;
        }

        setLoading(true);
        setError(null);
        setStatusMessage("Đang đọc và mã hóa file âm thanh...");

        try {
            const audioBase64 = await fileToBase64(selectedFile);

            setStatusMessage("Đang gửi file MP3 đến Sonauto V3 Extend API...");

            const payload: any = {
                audio_base64: audioBase64,
                context_seconds: Math.max(1, Math.min(284, Number(contextSeconds) || 30))
            };

            if (Number(cropDuration) > 0) {
                payload.crop_duration = Number(cropDuration);
            }

            payload.prompt = promptText.trim() || "Continue the song with smooth transition and matching melody";

            const response = await fetch("/api-sonauto/v1/generations/v3/extend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let formattedError = "Gửi yêu cầu mở rộng nhạc thất bại.";
                if (typeof errorData.detail === "string") {
                    formattedError = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    formattedError = errorData.detail
                        .map((item: any) => `${item.loc ? item.loc.join(".") : "field"}: ${item.msg}`)
                        .join(" | ");
                } else if (typeof errorData.detail === "object" && errorData.detail !== null) {
                    formattedError = JSON.stringify(errorData.detail);
                } else if (errorData.message) {
                    formattedError = errorData.message;
                }
                throw new Error(formattedError);
            }

            const data = await response.json();
            if (data.task_id) {
                startPolling(data.task_id, promptText.trim());
            } else {
                throw new Error("Hệ thống không nhận được task_id từ Sonauto.");
            }
        } catch (err: unknown) {
            console.error("Sonauto Extend Error:", err);
            const msg = err instanceof Error ? err.message : "Có lỗi kết nối khi gọi API Sonauto V3 Extend.";
            setError(msg);
            setLoading(false);
            setStatusMessage("");
        }
    };

    return (
        <div className="w-full h-full bg-[#F5F5F3] dark:bg-zinc-950 text-[#222222] dark:text-zinc-150 font-sans antialiased overflow-hidden relative">
            {loading && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fadeIn gap-6 text-center">
                    {/* Glowing AI Orb with DotLoader */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        <div
                            className="absolute inset-0 rounded-full animate-pulse blur-xl opacity-75"
                            style={{
                                background: 'radial-gradient(circle, rgba(255, 94, 54, 0.6) 0%, rgba(255, 160, 0, 0.1) 70%)',
                            }}
                        />
                        <div className="z-10">
                            <DotLoader color="#ff5e36" size={60} speedMultiplier={1.2} />
                        </div>
                    </div>
                    <p className="text-sm font-semibold text-zinc-300 animate-pulse tracking-wider">
                        {statusMessage || "AI đang mở rộng bản nhạc Sonauto V3..."}
                    </p>
                </div>
            )}

            <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden relative bg-[#EFEFEF] dark:bg-zinc-900">
                {/* Left Panel - Form Input */}
                <div className={`bg-[#FBFBFB] dark:bg-zinc-900 flex flex-col justify-between overflow-y-auto lg:overflow-hidden transition-all duration-300 ease-in-out shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 ${sidebarCollapsed ? "w-0 p-0 border-r-0 border-b-0 h-0" : "w-full lg:w-80 h-[460px] lg:h-full p-6"}`}>
                    <div className="flex-1 flex flex-col min-h-0 space-y-4">
                        {/* Navigation buttons - 3 Tabs Switcher */}
                        <div className="flex items-center justify-between gap-2 shrink-0">
                            <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800/60 p-1 rounded-lg w-fit border border-zinc-300/50 dark:border-zinc-700/50">
                                <button
                                    type="button"
                                    onClick={() => navigate("/ai-composer/text2melody")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-250"
                                >
                                    <span>tạo lời bài hát</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/ai-composer/melody2chord")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-250"
                                >
                                    <span>tạo giai điệu</span>
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-750 cursor-default"
                                >
                                    <span>mở rộng</span>
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSidebarCollapsed(true)}
                                className="lg:hidden px-2.5 py-1.5 border border-zinc-300/50 dark:border-zinc-700/50 text-[10px] font-bold text-zinc-550 dark:text-zinc-400 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors uppercase tracking-wider"
                            >
                                Ẩn bảng
                            </button>
                        </div>

                        {/* MP3 File Upload Area */}
                        <div className="space-y-1.5 shrink-0">
                            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                                File âm thanh (MP3 / WAV)
                            </label>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/mp3,audio/wav,audio/m4a,audio/ogg"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {!selectedFile ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-white dark:bg-zinc-950 transition-all duration-200 group text-center"
                                >
                                    <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                                        <Upload size={16} />
                                    </div>
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-0.5">
                                        Tải lên đoạn MP3
                                    </p>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                        Chọn file âm thanh cần mở rộng (tối đa 40MB)
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                            <Music size={15} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 mt-0.5">
                                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {audioUrl && (
                                            <button
                                                type="button"
                                                onClick={handleTogglePlayInput}
                                                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
                                            >
                                                {isPlayingInput ? <Pause size={14} /> : <Play size={14} />}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition cursor-pointer"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    {audioUrl && (
                                        <audio
                                            ref={inputAudioRef}
                                            src={audioUrl}
                                            onEnded={() => setIsPlayingInput(false)}
                                            className="hidden"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sonauto Extend Parameters (Context & Crop) */}
                        <div className="grid grid-cols-2 gap-2 shrink-0">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block truncate">
                                    Độ dài mẫu (s)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={284}
                                    value={contextSeconds}
                                    onChange={(e) => setContextSeconds(Math.max(1, Math.min(284, Number(e.target.value))))}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400"
                                    title="Số giây âm thanh gốc được dùng làm bối cảnh để AI tiếp nối"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block truncate">
                                    Cắt đuôi (s)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={60}
                                    value={cropDuration}
                                    onChange={(e) => setCropDuration(Math.max(0, Number(e.target.value)))}
                                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400"
                                    title="Số giây cắt bỏ ở cuối bản nhạc trước khi nối tiếp"
                                />
                            </div>
                        </div>

                        {/* Prompt Description input */}
                        <div className="flex-1 flex flex-col min-h-0 space-y-1">
                            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block shrink-0">
                                Ghi chú nối nhạc (Prompt)
                            </label>
                            <textarea
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                disabled={loading}
                                placeholder="Ví dụ: Viết tiếp một đoạn verse sôi động với giai điệu guitar solo..."
                                className="w-full flex-1 min-h-[90px] lg:min-h-0 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all duration-200 text-sm text-zinc-800 dark:text-zinc-200 resize-none disabled:bg-zinc-100 dark:disabled:bg-zinc-900"
                            />
                        </div>

                        {error && (
                            <div className="p-2.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2 animate-fadeIn shrink-0">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Submit Button */}
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
                        <button
                            onClick={handleGenerateExtend}
                            disabled={loading || !selectedFile}
                            className="w-full font-bold text-sm py-3.5 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-white hover:brightness-110 hover:shadow-[0_6px_20px_rgba(255,94,54,0.45)] disabled:opacity-50"
                            style={
                                loading || !selectedFile
                                    ? {}
                                    : {
                                        background: 'linear-gradient(135deg, #ff5e36 0%, #ffa000 100%)',
                                        boxShadow: '0 4px 15px rgba(255, 94, 54, 0.3)'
                                      }
                            }
                        >
                            {loading ? "Đang xử lý..." : "Tạo"}
                        </button>
                    </div>
                </div>

                {/* Collapse Sidebar Toggle Button */}
                <button
                    type="button"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-r-md items-center justify-center cursor-pointer shadow-md transition-all duration-300 ${sidebarCollapsed ? "left-0" : "left-80"}`}
                >
                    {sidebarCollapsed ? (
                        <ChevronRight size={14} className="text-zinc-500 dark:text-zinc-400" />
                    ) : (
                        <ChevronLeft size={14} className="text-zinc-500 dark:text-zinc-400" />
                    )}
                </button>

                {/* Right Panel - Result / Track List / Full Player Area (Matching ChordToMelody 1:1) */}
                <div className="flex-1 min-w-0 flex flex-col bg-gradient-to-br from-[#EFF1F5] via-[#F5F5F3] to-[#E5E9F0] dark:from-zinc-950 dark:via-slate-950 dark:to-zinc-900 relative overflow-y-auto">
                    <ShootingStarsBackground />

                    {!activeTrack ? (
                        // Track List View (Matching ChordToMelody 1:1)
                        <div className="w-full max-w-2xl mx-auto space-y-2.5 animate-fadeIn mt-5 px-4 sm:px-6 lg:px-0 relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">
                                        Bản nhạc đã tạo
                                    </h3>
                                    {sidebarCollapsed && (
                                        <button
                                            type="button"
                                            onClick={() => setSidebarCollapsed(false)}
                                            className="lg:hidden text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 px-2 py-0.5 rounded-md cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors uppercase tracking-wider animate-pulse"
                                        >
                                            Mở bảng tạo nhạc
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={fetchUserAudios}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                    <RotateCw size={12} className={loadingAudios ? "animate-spin" : ""} />
                                    Làm mới
                                </button>
                            </div>

                            {tracks.length === 0 ? (
                                <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center bg-white/50 dark:bg-zinc-900/30">
                                    <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center mx-auto mb-3">
                                        <Music size={22} />
                                    </div>
                                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                                        Chưa có bản nhạc mở rộng
                                    </h4>
                                    <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                                        Tải lên file âm thanh MP3 ở khung bên trái và bấm nút Tạo để mở rộng bản nhạc.
                                    </p>
                                </div>
                            ) : (
                                tracks.map((track, index) => (
                                    <div
                                        key={track.id}
                                        onClick={() => handleSelectTrack(track)}
                                        className="flex items-center gap-4 p-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transform hover:scale-[1.01] relative"
                                        style={{
                                            animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`
                                        }}
                                    >
                                        <img src={track.coverUrl} alt={track.title} className="w-11 h-11 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-black dark:group-hover:text-white pr-16 transition-colors duration-200">
                                                {track.title}
                                            </h4>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                                                {track.subTitle} • {track.duration}
                                            </p>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 absolute right-4 flex gap-2">
                                            <button
                                                onClick={(e) => handleDeleteTrack(e, track)}
                                                className="p-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-bold cursor-pointer transform hover:scale-105"
                                            >
                                                <Trash2 size={14} />
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        // Full Player & Lyrics View (Matching ChordToMelody 1:1)
                        <div className="w-full h-full overflow-hidden bg-transparent shadow-none animate-fadeIn border-none transition-colors duration-500 relative">
                            <audio
                                ref={mainAudioRef}
                                src={activeTrack.audioUrl}
                                onTimeUpdate={(e) => setCurrentTime(Math.floor(e.currentTarget.currentTime))}
                                onLoadedMetadata={(e) => setDurationSec(Math.floor(e.currentTarget.duration))}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />

                            <div className="w-full h-full relative flex flex-col z-10">
                                {/* Semi-translucent glass overlay */}
                                <div className="absolute inset-0 bg-white/20 dark:bg-black/35 backdrop-blur-[2px] transition-colors duration-500 z-0" />

                                <button
                                    onClick={() => {
                                        setActiveTrack(null);
                                        setIsPlaying(false);
                                        if (mainAudioRef.current) mainAudioRef.current.pause();
                                    }}
                                    className="absolute top-4 right-4 z-20 p-2 text-zinc-650 hover:text-zinc-900 dark:text-white/80 dark:hover:text-white transition-all duration-300 hover:rotate-180 hover:scale-110 cursor-pointer"
                                    title="Đóng trình phát"
                                >
                                    <ChevronDown size={22} />
                                </button>

                                <div className="relative z-10 flex-1 flex flex-col min-h-0 px-8 lg:px-12 pt-6 pb-4">
                                    <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col min-h-0 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-3 shrink-0">
                                            <div className="space-y-1">
                                                <h1 className="text-3xl lg:text-5xl font-serif font-bold text-zinc-800 dark:text-white leading-tight tracking-tight">
                                                    {activeTrack.title}
                                                </h1>
                                                <p className="text-sm font-semibold text-zinc-500 dark:text-white/90 tracking-wider uppercase">
                                                    {activeTrack.subTitle}
                                                </p>
                                            </div>
                                            {activeTrack.chordId && (
                                                <button
                                                    onClick={() => navigate(`/song/${activeTrack.chordId}`)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-white/60 dark:bg-white/10 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 shrink-0"
                                                >
                                                    <span>Xem hợp âm & lời bài hát</span>
                                                    <ExternalLink size={13} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm">
                                            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                                                Lời bài hát / Gợi ý giai điệu (AI):
                                            </h3>
                                            <pre className="text-sm text-zinc-800 dark:text-zinc-200 font-sans whitespace-pre-wrap leading-relaxed">
                                                {activeTrack.lyrics || activeTrack.chordLyrics || "Chưa có lời bài hát cho đoạn mở rộng này."}
                                            </pre>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Integrated Music Player Bar */}
                                <div className="w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-4 shrink-0 shadow-lg z-20">
                                    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <img src={activeTrack.coverUrl} alt={activeTrack.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                                        {activeTrack.title}
                                                    </h4>
                                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                                        Sonauto V3 Extend
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={handleTogglePlayMain}
                                                    className="w-11 h-11 rounded-full text-white flex items-center justify-center shadow-md transition transform hover:scale-105 cursor-pointer"
                                                    style={{ background: 'linear-gradient(135deg, #ff5e36 0%, #ffa000 100%)' }}
                                                >
                                                    {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="w-full flex items-center gap-3 text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                                            <span className="w-8 text-right">{formatTime(currentTime)}</span>
                                            <div
                                                className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full relative cursor-pointer group hover:h-2 transition-all"
                                                onClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const clickX = e.clientX - rect.left;
                                                    const width = rect.width;
                                                    const newTime = (clickX / width) * (durationSec || 1);
                                                    if (mainAudioRef.current) mainAudioRef.current.currentTime = newTime;
                                                    setCurrentTime(Math.floor(newTime));
                                                }}
                                            >
                                                <div
                                                    className="absolute top-0 left-0 bottom-0 rounded-full transition-all duration-150 ease-out"
                                                    style={{
                                                        width: `${durationSec ? (currentTime / durationSec) * 100 : 0}%`,
                                                        background: 'linear-gradient(90deg, #ff5e36 0%, #ffa000 100%)'
                                                    }}
                                                >
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition" />
                                                </div>
                                            </div>
                                            <span className="w-8 text-left">{formatTime(durationSec)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AudioExtend;
