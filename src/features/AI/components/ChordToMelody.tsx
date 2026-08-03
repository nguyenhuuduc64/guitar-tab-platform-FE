import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Play, Pause, Type, Sliders, SlidersHorizontal,
    Volume2, Share2, ChevronDown, ChevronLeft, ChevronRight, RotateCw, SkipForward, SkipBack, ListMusic, Loader2, Settings,
    Music, Sparkles, ArrowRight, GripVertical, Trash2
} from "lucide-react";
import instance from "../../../config/axios";
import { getUserInfo } from "../../../utils/auth";
import { DotLoader } from "react-spinners";

const DEBUG = false;
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
    chordLyrics?: string;
    audioUrl?: string;
    chordId?: string;
    contentPlusChord?: string;
    isPublic?: boolean;
}

interface AudioResponse {
    id: string;
    url: string;
    chordId: string;
}

interface ChordResponse {
    id: string;
    title: string;
    artistName?: string;
    content?: string;
    contentPlusChord?: string;
    isPublic?: boolean;
}

const ShootingStarsBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

        // Twinkling stars
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

        // Shooting stars
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
            return {
                x: Math.random() * width * 1.2 - width * 0.2,
                y: Math.random() * (height * 0.4),
                len: Math.random() * 80 + 40,
                speed: Math.random() * 8 + 4,
                angle: Math.PI / 6 + Math.random() * (Math.PI / 12),
                alpha: 1,
                active: true,
            };
        };

        for (let i = 0; i < 3; i++) {
            shootingStars.push(createShootingStar());
        }

        const render = () => {
            const isDark = document.documentElement.classList.contains("dark");
            ctx.clearRect(0, 0, width, height);

            // Draw twinkling stars
            stars.forEach((star) => {
                star.alpha += star.speed;
                if (star.alpha > 1 || star.alpha < 0) {
                    star.speed = -star.speed;
                }
                ctx.fillStyle = isDark
                    ? `rgba(255, 255, 255, ${Math.abs(star.alpha)})`
                    : `rgba(99, 102, 241, ${Math.abs(star.alpha) * 0.45})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw shooting stars
            shootingStars.forEach((star, idx) => {
                if (!star.active) {
                    if (Math.random() < 0.008) {
                        shootingStars[idx] = createShootingStar();
                    }
                    return;
                }

                const dx = Math.cos(star.angle) * star.speed;
                const dy = Math.sin(star.angle) * star.speed;
                star.x += dx;
                star.y += dy;
                star.alpha -= 0.015;

                if (star.alpha <= 0 || star.x > width || star.y > height) {
                    star.active = false;
                    return;
                }

                const grad = ctx.createLinearGradient(
                    star.x,
                    star.y,
                    star.x - Math.cos(star.angle) * star.len,
                    star.y - Math.sin(star.angle) * star.len
                );

                const starColor = isDark ? "255, 255, 255" : "99, 102, 241";
                grad.addColorStop(0, `rgba(${starColor}, ${star.alpha})`);
                grad.addColorStop(0.1, `rgba(${starColor}, ${star.alpha * 0.8})`);
                grad.addColorStop(1, `rgba(${starColor}, 0)`);

                ctx.strokeStyle = grad;
                ctx.lineWidth = isDark ? 2 : 1.5;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x - Math.cos(star.angle) * star.len, star.y - Math.sin(star.angle) * star.len);
                ctx.stroke();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

const getThumbnailUrl = (songId: string | number) => {
    if (!songId) return "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80";
    const strId = String(songId);
    let hash = 0;
    for (let i = 0; i < strId.length; i++) {
        hash = strId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % 85) + 1; // 1 to 85
    return new URL(`../../../assets/thumbnail/anh-thumbnail-${index}.jpg`, import.meta.url).href;
};

const INITIAL_TRACKS: Track[] = [
    {
        id: "init-1",
        title: "Heartbreak Souvenirs",
        subTitle: "Meloflow Demo",
        duration: "3:58",
        description: "Một bản ballad nhạc pop sâu lắng với âm hưởng ban đêm và điệp khúc hoành tráng.",
        tags: ["pop", "ballad", "cinematic"],
        coverUrl: getThumbnailUrl("init-1"),
        lyrics: "[Intro]\n(Melancholic Piano)\n\n[Verse 1]\nFound a box of memories today\nFaded photographs of yesterday\nWalking down the streets we used to know\nWhere the neon lights no longer glow...",
        chordLyrics: "[Intro]\n(Melancholic Piano)\n\n[Verse 1]\n[C]Found a box of memories today\n[G]Faded photographs of yesterday\n[Am]Walking down the streets we used to know\n[F]Where the neon lights no longer glow..."
    }
];

export default function SunoMeloflowLightUI() {
    const location = useLocation();
    const navigate = useNavigate();

    const [chords, setChords] = useState<string>("");
    const [lyrics, setLyrics] = useState<string>("");
    const [chordLyrics, setChordLyrics] = useState<string>("");
    const [styles, setStyles] = useState<string>("pop, acoustic guitar, happy");
    const [generatorTab, setGeneratorTab] = useState<"request" | "lyrics">("request");
    const [promptText, setPromptText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const [mode, setMode] = useState<"text2melody" | "melody2chord">("melody2chord");
    const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
    const [activeTrack, setActiveTrack] = useState<Track | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editTitle, setEditTitle] = useState<string>("");
    const [editIsPublic, setEditIsPublic] = useState<boolean>(true);
    const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [durationSec, setDurationSec] = useState<number>(180);
    const [loadingAudios, setLoadingAudios] = useState<boolean>(false);
    const [isKaraokeMode, setIsKaraokeMode] = useState<boolean>(false);
    const [isKaraokeLoading, setIsKaraokeLoading] = useState<boolean>(false);
    const [karaokeData, setKaraokeData] = useState<any[]>([]);

    const [defaultCategoryId, setDefaultCategoryId] = useState<string>("");
    const [defaultArtistId, setDefaultArtistId] = useState<string>("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioHtmlRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchUserAudios();

        const fetchDefaults = async () => {
            try {
                const catRes = await instance.get("/categories");
                const catData = catRes.data?.result || catRes.data?.data || catRes.data || [];
                if (catData.length > 0) {
                    setDefaultCategoryId(catData[0].id);
                }

                const artistRes = await instance.get("/artists");
                const artistData = artistRes.data?.result || artistRes.data?.data || artistRes.data || [];
                if (artistData.length > 0) {
                    setDefaultArtistId(artistData[0].id);
                }
            } catch (err) {
                console.error("Lỗi khi lấy danh mục/nghệ sĩ mặc định:", err);
            }
        };
        fetchDefaults();
    }, []);

    useEffect(() => {
        if (location.state) {
            if ((location.state as { aiChords?: string }).aiChords) {
                setChords((location.state as { aiChords: string }).aiChords);
            }
            if ((location.state as { aiLyrics?: string }).aiLyrics) {
                setLyrics((location.state as { aiLyrics: string }).aiLyrics);
            }
            if ((location.state as { aiChordLyrics?: string }).aiChordLyrics) {
                setChordLyrics((location.state as { aiChordLyrics: string }).aiChordLyrics);
            }
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
                    const time = Math.floor(audioHtmlRef.current.currentTime);
                    if (time >= 120) {
                        audioHtmlRef.current.pause();
                        setIsPlaying(false);
                        audioHtmlRef.current.currentTime = 0;
                        setCurrentTime(0);
                    } else {
                        setCurrentTime(time);
                    }
                } else {
                    setCurrentTime((prev) => {
                        const next = prev + 1;
                        if (next >= 120) {
                            setIsPlaying(false);
                            return 0;
                        }
                        return next;
                    });
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isPlaying, durationSec, activeTrack]);

    const fetchUserAudios = async () => {
        try {
            setLoadingAudios(true);
            const userData = await getUserInfo();
            if (!userData) {
                console.error("Không tìm thấy user");
                return;
            }

            const res = await instance.get(`/audios/user/${userData.id}`);
            const audioData = res.data.result || [];

            if (audioData.length === 0) {
                setTracks(INITIAL_TRACKS);
                return;
            }

            const audioWithChord = await Promise.all(
                audioData.map(async (audio: AudioResponse) => {
                    try {
                        const chordRes = await instance.get(`/chords/${audio.chordId}`);
                        const chord: ChordResponse = chordRes.data.result;
                        return {
                            ...audio,
                            chordTitle: chord.title || "Không có tiêu đề",
                            artistName: chord.artistName || "",
                            chordContent: chord.content || "",
                            contentPlusChord: chord.contentPlusChord || "",
                            isPublic: chord.isPublic !== undefined ? chord.isPublic : true
                        };
                    } catch (error) {
                        console.error(`Lỗi khi lấy chord cho audio ${audio.id}:`, error);
                        return {
                            ...audio,
                            chordTitle: "Không tìm thấy bài hát",
                            artistName: "",
                            chordContent: "",
                            contentPlusChord: "",
                            isPublic: true
                        };
                    }
                })
            );

            const audioTracks: Track[] = audioWithChord.map((audio: any) => {
                const chordContent = audio.chordContent || "";
                const cleanLyrics = chordContent.replace(/\[.*?\]/g, "");
                return {
                    id: audio.id,
                    title: audio.chordTitle || "Bài hát không tên",
                    subTitle: audio.artistName || "Không có nghệ sĩ",
                    duration: "2:00",
                    description: audio.chordTitle || "",
                    tags: [],
                    coverUrl: getThumbnailUrl(audio.id),
                    audioUrl: audio.url,
                    chordId: audio.chordId,
                    lyrics: cleanLyrics || undefined,
                    chordLyrics: chordContent || undefined,
                    contentPlusChord: audio.contentPlusChord || undefined,
                    isPublic: audio.isPublic
                };
            });

            setTracks([...audioTracks, ...INITIAL_TRACKS]);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách audio:", error);
            setTracks(INITIAL_TRACKS);
        } finally {
            setLoadingAudios(false);
        }
    };

    const appendAndPlayTrack = async (id: string, audioUrl: string, generatedLyrics?: string) => {
        const finalLyrics = generatedLyrics || lyrics.trim() || "";
        const cleanLyrics = (chordLyrics.trim() || finalLyrics || "").replace(/\[.*?\]/g, "");

        if (DEBUG) {
            const generatedTrack: Track = {
                id: id,
                title: "Mock Test Composition",
                subTitle: "AI",
                duration: "2:00",
                description: styles || "Bản nhạc mô phỏng cấu trúc giao diện sáng.",
                tags: styles.split(",").map(s => s.trim()).filter(Boolean),
                coverUrl: getThumbnailUrl(id),
                lyrics: cleanLyrics || "Chưa có lời bài hát",
                chordLyrics: chordLyrics.trim() || finalLyrics || "Chưa có lời bài hát",
                audioUrl: audioUrl,
                isPublic: true
            };
            setTracks((prevTracks) => [generatedTrack, ...prevTracks]);
            setLoading(false);
            setStatusMessage("");
            handleSelectTrack(generatedTrack);
            return;
        }

        try {
            setLoading(true);
            setStatusMessage("Đang tự động lưu bài hát vào cơ sở dữ liệu...");

            // 1. Tạo Chord ở backend
            const chordResponse = await instance.post("/chords", {
                title: chords.trim().substring(0, 24) || "AI Music Track",
                content: chordLyrics.trim() || finalLyrics || "Chưa có lời bài hát",
                isPublic: true,
                artistName: "AI",
                artistId: defaultArtistId || null,
                categoryId: defaultCategoryId || null
            });

            const newChordId = chordResponse.data?.result?.id;

            // 2. Tạo Audio liên kết
            await instance.post("/audios", {
                url: audioUrl,
                chordId: newChordId
            });

            // 3. Khởi tạo đối tượng Track để chơi nhạc
            const generatedTrack: Track = {
                id: id,
                title: "AI Music Track",
                subTitle: "AI",
                duration: "2:00",
                description: styles || "Bản nhạc do AI tạo.",
                tags: styles.split(",").map(s => s.trim()).filter(Boolean),
                coverUrl: getThumbnailUrl(id),
                lyrics: cleanLyrics || "Chưa có lời bài hát",
                chordLyrics: chordLyrics.trim() || finalLyrics || "Chưa có lời bài hát",
                audioUrl: audioUrl,
                chordId: newChordId,
                isPublic: true
            };

            setTracks((prevTracks) => [generatedTrack, ...prevTracks]);
            setLoading(false);
            setStatusMessage("");
            handleSelectTrack(generatedTrack);

            // Tải lại danh sách từ DB để đồng bộ hoàn toàn
            await fetchUserAudios();
        } catch (err) {
            console.error("Lỗi khi tự động lưu bài hát vào thư viện:", err);
            setError("Lỗi tự động lưu bài hát vào thư viện.");
            setLoading(false);
            setStatusMessage("");
        }
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
                        const generatedLyrics = resultData.lyrics || "";
                        if (generatedLyrics) {
                            setLyrics(generatedLyrics);
                        }
                        appendAndPlayTrack(taskId, resultData.song_paths[0], generatedLyrics);
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
        if (generatorTab === "request" && !promptText.trim()) {
            setError("Vui lòng nhập mô tả yêu cầu.");
            return;
        }
        if (generatorTab === "lyrics" && !lyrics.trim()) {
            setError("Vui lòng nhập lời bài hát.");
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
            const fullPrompt = generatorTab === "request"
                ? `Style: ${styles}. Description: ${promptText.trim()}. Max duration: 120 seconds.`
                : `Style: ${styles}. Max duration: 120 seconds.`;

            const response = await fetch("/api-sonauto/v1/generations/v3", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    duration: 120,
                    ...(generatorTab === "lyrics" && lyrics.trim() && { lyrics: lyrics.trim() })
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
        setIsKaraokeMode(false);
        setKaraokeData([]);

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

    const handleToggleKaraoke = async () => {
        if (!activeTrack) return;
        if (isKaraokeMode) {
            setIsKaraokeMode(false);
            return;
        }

        if (activeTrack.contentPlusChord) {
            try {
                const parsed = JSON.parse(activeTrack.contentPlusChord);
                setKaraokeData(parsed);
                setIsKaraokeMode(true);
                return;
            } catch (e) {
                console.error("Lỗi khi parse contentPlusChord từ cache:", e);
            }
        }

        if (!activeTrack.audioUrl) {
            setError("Bài hát hiện tại không có file âm thanh để phân tích.");
            return;
        }

        const lyricsText = activeTrack.lyrics || activeTrack.chordLyrics?.replace(/\[.*?\]/g, "") || "";
        if (!lyricsText.trim()) {
            setError("Không tìm thấy lời bài hát để chạy Karaoke.");
            return;
        }

        try {
            setIsKaraokeLoading(true);
            setError(null);

            const audioResponse = await fetch(activeTrack.audioUrl);
            if (!audioResponse.ok) throw new Error("Không thể tải file âm thanh từ máy chủ.");
            const audioBlob = await audioResponse.blob();
            const audioFile = new File([audioBlob], "song.mp3", { type: "audio/mpeg" });

            const chordForm = new FormData();
            chordForm.append('file', audioFile);
            chordForm.append('model_type', 'BTC');

            const alignForm = new FormData();
            alignForm.append('audio', audioFile);
            alignForm.append('lyric_type', 'text');
            alignForm.append('lyric', lyricsText);

            const [chordRes, alignRes] = await Promise.all([
                fetch('http://localhost:8000/api/analyze', { method: 'POST', body: chordForm })
                    .then(async r => {
                        if (!r.ok) throw new Error("ChordMini phân tích thất bại.");
                        return r.json();
                    }),
                fetch('http://localhost:5000/api/align', { method: 'POST', body: alignForm })
                    .then(async r => {
                        if (!r.ok) throw new Error("Lyric Alignment phân tích thất bại.");
                        return r.json();
                    })
            ]);

            const chordsList = chordRes.chords || [];

            const findChord = (time: number) => {
                const found = chordsList.find((c: any) => time >= c.start && time < c.end);
                return (found && found.chord !== 'N') ? found.chord : '';
            };

            let processedLyrics = null;
            if (alignRes.success && alignRes.alignment) {
                processedLyrics = alignRes.alignment.map((line: any) => ({
                    s: line.s / 1000.0,
                    e: line.e / 1000.0,
                    l: line.l.map((word: any) => {
                        const wordTime = word.s / 1000.0;
                        return {
                            d: word.d,
                            s: wordTime,
                            e: word.e / 1000.0,
                            c: findChord(wordTime)
                        };
                    })
                }));
            }

            if (!processedLyrics) {
                throw new Error("Không thể trích xuất dữ liệu căn chỉnh lời từ API.");
            }

            const jsonString = JSON.stringify(processedLyrics);
            if (activeTrack.chordId) {
                await instance.put(`/chords/${activeTrack.chordId}/content-plus-chord`, {
                    contentPlusChord: jsonString
                });
            }

            const updatedTrack = { ...activeTrack, contentPlusChord: jsonString };
            setActiveTrack(updatedTrack);
            setTracks(prev => prev.map(t => t.id === activeTrack.id ? updatedTrack : t));

            setKaraokeData(processedLyrics);
            setIsKaraokeMode(true);
        } catch (err: any) {
            console.error("Lỗi khi đồng bộ Karaoke hợp âm:", err);
            setError(err.message || "Có lỗi xảy ra trong quá trình gọi AI phân tích.");
        } finally {
            setIsKaraokeLoading(false);
        }
    };

    useEffect(() => {
        if (isKaraokeMode && karaokeData.length > 0) {
            const activeIndex = karaokeData.findIndex(
                (line) => currentTime >= line.s && currentTime < line.e
            );
            if (activeIndex !== -1) {
                const el = document.getElementById(`karaoke-line-${activeIndex}`);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }
        }
    }, [currentTime, isKaraokeMode, karaokeData]);

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
                if (audioHtmlRef.current) audioHtmlRef.current.pause();
            }
        } catch (err) {
            console.error("Lỗi khi xóa bài hát:", err);
            toast.error("Không thể xóa bài hát này.");
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTrack || !activeTrack.chordId) return;

        try {
            setIsSavingSettings(true);
            await instance.put(`/chords/${activeTrack.chordId}`, {
                title: editTitle.trim(),
                isPublic: editIsPublic,
                content: activeTrack.chordLyrics || activeTrack.lyrics || "Chưa có lời bài hát",
                contentPlusChord: activeTrack.contentPlusChord
            });

            const updatedTrack = {
                ...activeTrack,
                title: editTitle.trim(),
                isPublic: editIsPublic
            };
            setActiveTrack(updatedTrack);
            setTracks(prev => prev.map(t => t.chordId === activeTrack.chordId ? { ...t, title: editTitle.trim(), isPublic: editIsPublic } : t));

            setIsEditModalOpen(false);
            toast.success("Đã lưu cài đặt bài hát thành công!");
        } catch (err) {
            console.error("Lỗi khi lưu cài đặt bài hát:", err);
            toast.error("Không thể lưu cài đặt bài hát này.");
        } finally {
            setIsSavingSettings(false);
        }
    };

    // Hàm chuyển đổi route
    const handleModeChange = (newMode: "text2melody" | "melody2chord" | "extend") => {
        if (newMode === "text2melody") {
            navigate("/ai-composer/text2melody");
        } else if (newMode === "melody2chord") {
            navigate("/ai-composer/melody2chord");
        } else if (newMode === "extend") {
            navigate("/ai-composer/extend");
        }
    };

    if (loadingAudios) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#F5F5F3] dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-gray-500 dark:text-zinc-400">Đang tải danh sách audio...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-[#F5F5F3] dark:bg-zinc-950 text-[#222222] dark:text-zinc-100 font-sans antialiased overflow-hidden">
            <audio
                ref={audioHtmlRef}
                onLoadedMetadata={() => {
                    if (audioHtmlRef.current) {
                        const dur = Math.floor(audioHtmlRef.current.duration);
                        setDurationSec(dur > 120 ? 120 : dur);
                    }
                }}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
            />

            <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden relative bg-[#EFEFEF] dark:bg-zinc-900">
                <form onSubmit={handleGenerateMusic} className={`bg-[#FBFBFB] dark:bg-zinc-900 flex flex-col justify-between overflow-y-auto transition-all duration-300 ease-in-out shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 ${sidebarCollapsed ? "w-0 p-0 border-r-0 border-b-0 h-0" : "w-full lg:w-80 h-[380px] lg:h-full p-6"}`}>
                    <div className="space-y-4">
                        {/* Navigation buttons - giống sidebar */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800/60 p-1 rounded-lg w-fit border border-zinc-300/50 dark:border-zinc-700/50">
                                <button
                                    type="button"
                                    onClick={() => handleModeChange("text2melody")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer ${mode === "text2melody"
                                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-750"
                                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-250"
                                        }`}
                                >
                                    <span>tạo lời bài hát</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleModeChange("melody2chord")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer ${mode === "melody2chord"
                                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-750"
                                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-250"
                                        }`}
                                >
                                    <span>tạo giai điệu</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleModeChange("extend")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-250"
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

                        {DEBUG && <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-700 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">Debug On</span>}

                        {/* Tab Switcher for Generator Mode */}
                        <div className="flex bg-zinc-200/50 dark:bg-zinc-800/50 p-1 rounded-xl w-full border border-zinc-300/40 dark:border-zinc-700/50 mb-2.5">
                            <button
                                type="button"
                                onClick={() => setGeneratorTab("request")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${generatorTab === "request"
                                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/30 dark:border-zinc-750"
                                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-250"
                                    }`}
                            >
                                <Sparkles size={12} />
                                <span>Yêu cầu</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setGeneratorTab("lyrics")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${generatorTab === "lyrics"
                                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/30 dark:border-zinc-750"
                                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-250"
                                    }`}
                            >
                                <Type size={12} />
                                <span>Lời bài hát</span>
                            </button>
                        </div>

                        {generatorTab === "request" ? (
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Mô tả yêu cầu</label>
                                <textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} disabled={loading} placeholder="Ví dụ: Một bài hát ballad nhẹ nhàng về mưa chiều Hà Nội buồn cô đơn..." rows={5} className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all duration-200 text-sm text-zinc-800 dark:text-zinc-200 resize-none disabled:bg-zinc-100 dark:disabled:bg-zinc-900" />
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Lời bài hát thuần (không điền hợp âm)</label>
                                <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} disabled={loading} placeholder="Dán lời bài hát thuần của bạn tại đây..." rows={5} className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all duration-200 text-sm text-zinc-800 dark:text-zinc-200 font-mono resize-none disabled:bg-zinc-100 dark:disabled:bg-zinc-900" />
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Phong cách & Nhạc cụ (Tags)</label>
                            <textarea value={styles} onChange={(e) => setStyles(e.target.value)} disabled={loading} placeholder="Ví dụ: pop, rock" rows={2} className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all duration-200 text-sm text-zinc-800 dark:text-zinc-200 resize-none disabled:bg-zinc-100 dark:disabled:bg-zinc-900" />
                        </div>

                        {error && <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/30 animate-fadeIn">{error}</div>}
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <button type="submit" disabled={loading} className={`w-full font-bold text-sm py-3.5 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-white hover:brightness-110 hover:shadow-[0_6px_20px_rgba(255,94,54,0.45)] disabled:opacity-50`}
                            style={
                                loading
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
                </form>

                {/* Collapse Sidebar Button */}
                <button
                    type="button"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-r-md items-center justify-center cursor-pointer shadow-md transition-all duration-300 ${sidebarCollapsed ? "left-0" : "left-80"
                        }`}
                >
                    {sidebarCollapsed ? (
                        <ChevronRight size={14} className="text-zinc-500 dark:text-zinc-400" />
                    ) : (
                        <ChevronLeft size={14} className="text-zinc-500 dark:text-zinc-400" />
                    )}
                </button>

                <div className="flex-1 min-w-0 flex flex-col bg-gradient-to-br from-[#EFF1F5] via-[#F5F5F3] to-[#E5E9F0] dark:from-zinc-950 dark:via-slate-950 dark:to-zinc-900 relative overflow-y-auto">
                    <ShootingStarsBackground />
                    {loading && (
                        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fadeIn gap-6 text-center">
                            {/* Glowing AI Orb with DotLoader */}
                            <div className="relative w-28 h-28 flex items-center justify-center">
                                {/* Glowing Orange Gradient Radial Orb */}
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


                        </div>
                    )}

                    {!activeTrack ? (
                        <div className="w-full max-w-2xl mx-auto space-y-2.5 animate-fadeIn mt-5 px-4 sm:px-6 lg:px-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1">Bản nhạc đã tạo</h3>
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
                                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                                >
                                    <RotateCw size={12} className={loadingAudios ? "animate-spin" : ""} />
                                    Làm mới
                                </button>
                            </div>
                            {tracks.map((track, index) => (
                                <div
                                    key={track.id}
                                    onClick={() => handleSelectTrack(track)}
                                    className="flex items-center gap-4 p-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transform hover:scale-[1.01]"
                                    style={{
                                        animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`
                                    }}
                                >
                                    <img src={track.coverUrl} alt={track.title} className="w-11 h-11 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-black dark:group-hover:text-white pr-16 transition-colors duration-200">{track.title}</h4>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">{track.subTitle} • {track.duration}</p>
                                        {track.chordId && (
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Chord ID: {track.chordId.substring(0, 8)}...</p>
                                        )}
                                    </div>
                                    {!track.id.startsWith("init-") && (
                                        <div className="opacity-0 group-hover:opacity-100 absolute right-4 flex gap-2">
                                            <button
                                                onClick={(e) => handleDeleteTrack(e, track)}
                                                className="p-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-bold cursor-pointer transform hover:scale-105"
                                            >
                                                <Trash2 size={14} />
                                                Xóa
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full h-full overflow-hidden bg-transparent shadow-none animate-fadeIn border-none transition-colors duration-500 relative">
                            <div className="w-full h-full relative flex flex-col z-10">
                                {/* Semi-translucent glass overlay */}
                                <div className="absolute inset-0 bg-white/20 dark:bg-black/35 backdrop-blur-[2px] transition-colors duration-500 z-0" />

                                <button
                                    onClick={() => {
                                        setActiveTrack(null);
                                        setIsPlaying(false);
                                        if (audioHtmlRef.current) audioHtmlRef.current.pause();
                                    }}
                                    className="absolute top-4 right-4 z-20 p-2 text-zinc-650 hover:text-zinc-900 dark:text-white/80 dark:hover:text-white transition-all duration-300 hover:rotate-180 hover:scale-110 cursor-pointer"
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
                                            {activeTrack.audioUrl && (activeTrack.lyrics || activeTrack.chordLyrics) && (
                                                <div className="flex items-center gap-3 bg-zinc-200/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-zinc-300 dark:border-white/10 select-none">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-white/95">
                                                        Hợp âm động (AI)
                                                    </span>
                                                    <button
                                                        onClick={handleToggleKaraoke}
                                                        disabled={isKaraokeLoading}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${isKaraokeLoading
                                                            ? "bg-indigo-400/50 cursor-not-allowed"
                                                            : isKaraokeMode
                                                                ? "bg-indigo-600 hover:bg-indigo-700"
                                                                : "bg-zinc-300 dark:bg-white/20 hover:bg-zinc-400 dark:hover:bg-white/35"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${isKaraokeMode ? "translate-x-6" : "translate-x-1"
                                                                }`}
                                                        >
                                                            {isKaraokeLoading && (
                                                                <Loader2 size={10} className="animate-spin text-indigo-600" />
                                                            )}
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {isKaraokeMode && karaokeData.length > 0 ? (
                                            <div className="flex-1 min-h-0 overflow-y-auto pr-4 scrollbar-none select-text space-y-4 py-2">
                                                {karaokeData.map((line, lineIdx) => {
                                                    const isActiveLine = currentTime >= line.s && currentTime < line.e;
                                                    let lastChord = "";
                                                    return (
                                                        <div
                                                            key={lineIdx}
                                                            id={`karaoke-line-${lineIdx}`}
                                                            className={`flex flex-wrap items-baseline gap-y-1.5 py-2.5 px-4 border-l-4 border-transparent transition-all duration-300 ${isActiveLine
                                                                ? "bg-indigo-50/50 dark:bg-white/10 border-indigo-500 rounded-r-xl opacity-100"
                                                                : "opacity-50 hover:opacity-75"
                                                                }`}
                                                        >
                                                            {line.l.map((word: any, wordIdx: number) => {
                                                                const isActiveWord = currentTime >= word.s && currentTime < word.e;
                                                                const showChord = word.c && word.c !== lastChord;
                                                                if (word.c) {
                                                                    lastChord = word.c;
                                                                }
                                                                return (
                                                                    <span key={wordIdx} className="inline-flex items-baseline select-none">
                                                                        {showChord && (
                                                                            <span className="text-red-500 font-bold font-mono text-sm lg:text-base mr-0.5 drop-shadow-[0_0_1px_rgba(239,68,68,0.4)] select-none">
                                                                                [{word.c}]
                                                                            </span>
                                                                        )}
                                                                        <span
                                                                            className={`text-base lg:text-lg font-sans font-medium transition-all duration-250 ${isActiveWord
                                                                                ? "text-indigo-600 dark:text-indigo-300 font-bold scale-105 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
                                                                                : isActiveLine
                                                                                    ? "text-zinc-800 dark:text-white"
                                                                                    : "text-zinc-500 dark:text-white/80"
                                                                                }`}
                                                                        >
                                                                            {word.d}
                                                                        </span>
                                                                        <span className="w-1 select-none">&nbsp;</span>
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-h-0 overflow-y-auto pr-4 scrollbar-none select-text">
                                                {activeTrack.chordLyrics ? (
                                                    <div className="text-base lg:text-lg text-zinc-800 dark:text-white font-sans font-medium leading-relaxed whitespace-pre-wrap">
                                                        {activeTrack.chordLyrics}
                                                    </div>
                                                ) : activeTrack.lyrics ? (
                                                    <div className="text-base lg:text-lg text-zinc-800 dark:text-white font-sans font-medium leading-relaxed whitespace-pre-wrap">
                                                        {activeTrack.lyrics}
                                                    </div>
                                                ) : (
                                                    <p className="text-xl text-zinc-850 dark:text-white font-serif leading-relaxed italic">
                                                        {activeTrack.description}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="relative z-10 bg-transparent border-t border-zinc-200 dark:border-white/5 pt-4 pb-4 px-6 transition-all duration-500 shrink-0">
                                    <div className="w-full max-w-4xl mx-auto flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-[120px]">
                                                <h4 className="text-sm font-bold text-zinc-800 dark:text-white truncate transition-colors duration-200">{activeTrack.title}</h4>
                                                <p className="text-xs text-zinc-500 dark:text-white/70 font-medium mt-0.5 transition-colors duration-200">{activeTrack.subTitle}</p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <SkipBack size={18} className="text-zinc-500 hover:text-zinc-800 dark:text-white/60 dark:hover:text-white cursor-pointer transition-all duration-200 hover:scale-110" />
                                                <button
                                                    onClick={togglePlayPause}
                                                    className="w-11 h-11 rounded-full bg-[var(--primary-color)] hover:opacity-90 text-white dark:bg-white/20 dark:hover:bg-white/30 dark:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 cursor-pointer"
                                                >
                                                    {isPlaying ? (
                                                        <Pause size={18} fill="currentColor" />
                                                    ) : (
                                                        <Play size={18} fill="currentColor" className="ml-0.5" />
                                                    )}
                                                </button>
                                                <SkipForward size={18} className="text-zinc-500 hover:text-zinc-800 dark:text-white/60 dark:hover:text-white cursor-pointer transition-all duration-200 hover:scale-110" />
                                            </div>

                                            <div className="flex items-center gap-3 text-zinc-550 dark:text-white/60 min-w-[120px] justify-end">
                                                {!activeTrack.id.startsWith("init-") && activeTrack.chordId && (
                                                    <Settings
                                                        size={17}
                                                        onClick={() => {
                                                            setEditTitle(activeTrack.title);
                                                            setEditIsPublic(activeTrack.isPublic !== undefined ? activeTrack.isPublic : true);
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="hover:text-zinc-800 dark:hover:text-white cursor-pointer transition-all duration-200 hover:scale-110"
                                                    />
                                                )}
                                                <Volume2 size={17} className="hover:text-zinc-800 dark:hover:text-white cursor-pointer transition-all duration-200 hover:scale-110" />
                                                <Share2 size={17} className="hover:text-zinc-800 dark:hover:text-white cursor-pointer transition-all duration-200 hover:scale-110" />
                                            </div>
                                        </div>

                                        <div className="w-full flex items-center gap-3 text-[11px] font-bold text-zinc-500 dark:text-white/60">
                                            <span className="w-8 text-right transition-all duration-200">{formatTime(currentTime)}</span>
                                            <div
                                                className="flex-1 h-1.5 bg-zinc-200 dark:bg-white/20 rounded-full relative cursor-pointer group transition-all duration-200 hover:h-2"
                                                onClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const clickX = e.clientX - rect.left;
                                                    const width = rect.width;
                                                    const newTime = (clickX / width) * durationSec;
                                                    if (audioHtmlRef.current) audioHtmlRef.current.currentTime = newTime;
                                                    setCurrentTime(Math.floor(newTime));
                                                }}
                                            >
                                                <div
                                                    className="absolute top-0 left-0 bottom-0 bg-[var(--primary-color)] dark:bg-white rounded-full transition-all duration-300 ease-out"
                                                    style={{ width: `${(currentTime / durationSec) * 100}%` }}
                                                >
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[var(--primary-color)] dark:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:scale-110" />
                                                </div>
                                            </div>
                                            <span className="w-8 text-left transition-all duration-200">{formatTime(durationSec)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Settings Modal */}
            {isEditModalOpen && activeTrack && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl w-full max-w-md shadow-2xl relative select-none">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-4">Cài đặt bài hát</h3>
                        <form onSubmit={handleSaveSettings} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Tên bài hát</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    required
                                    placeholder="Nhập tên bài hát..."
                                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 text-sm text-zinc-800 dark:text-zinc-200"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-150 dark:border-zinc-800 rounded-xl">
                                <div>
                                    <label className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">Chế độ công khai</label>
                                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5 block">Ai cũng có thể tìm kiếm và nghe bản nhạc này</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditIsPublic(!editIsPublic)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer border-none ${editIsPublic ? "bg-indigo-650" : "bg-zinc-300 dark:bg-white/20"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${editIsPublic ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer bg-transparent border-none"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingSettings}
                                    className="px-4 py-2 text-xs font-bold bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 border-none"
                                >
                                    {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Lưu cài đặt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}



            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes scaleIn {
                    from { transform: scale(1); }
                    to { transform: scale(1.05); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out both;
                }
                .animate-slideDown {
                    animation: slideDown 0.6s ease-out both;
                }
                .animate-slideUp {
                    animation: slideUp 0.6s ease-out both;
                }
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-none {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}