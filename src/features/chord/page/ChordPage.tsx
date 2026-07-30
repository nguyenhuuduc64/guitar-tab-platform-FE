import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Star, Plus, Music2, X, Eye, User as UserIcon, Play, Pause, RotateCcw } from "lucide-react";
import { getYoutubeEmbedUrl } from "../../../helper/youtube";
import { getChordById } from "../../../services/chordService";
import { getArtistById } from "../../../services/artistService";
import GuitarChordDiagram from "../../../components/chords/GuitarChordDiagram";
import { getChordData } from "../../../constants/chords";
import { getUserInfo } from "../../../utils/auth";
import instance from "../../../config/axios";
import type { Chord } from "../../../types/chord";
import type { Artist } from "../../../types/artist";
import type { User } from "../../../types/user";
import { useChordContext } from "../../../context/ChordContext";

const getThumbnailUrl = (songId: string | number) => {
    if (!songId) return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500";
    const strId = String(songId);
    let hash = 0;
    for (let i = 0; i < strId.length; i++) {
        hash = strId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % 85) + 1; // 1 to 85
    return new URL(`../../../assets/thumbnail/anh-thumbnail-${index}.jpg`, import.meta.url).href;
};

const AudioPlayerCard = ({ 
    url, 
    title, 
    artistName, 
    chordId 
}: { 
    url: string; 
    title: string; 
    artistName?: string; 
    chordId: string;
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => console.error(err));
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = val;
            setCurrentTime(val);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const coverUrl = getThumbnailUrl(chordId);

    return (
        <div 
            className="w-full h-full p-4 sm:p-6 flex flex-col justify-between text-white rounded-none shadow-lg relative overflow-hidden group border border-white/10 bg-cover bg-center bg-no-repeat"
            style={{ 
                backgroundImage: `url(${coverUrl})`
            }}
        >
            <audio
                ref={audioRef}
                src={url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Title & Info */}
            <div className="flex items-center gap-3 sm:gap-4 z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 dark:bg-slate-800/60 rounded-none flex items-center justify-center border border-white/10 shrink-0 shadow-lg overflow-hidden">
                    <img 
                        src={coverUrl} 
                        alt="Cover" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold tracking-tight truncate pr-2">
                        {title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-300 truncate mt-0.5">
                        {artistName || "Nghệ sĩ ẩn danh"}
                    </p>
                </div>
            </div>

            {/* Progress Bar & Time */}
            <div className="space-y-1.5 sm:space-y-2 z-10">
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full accent-indigo-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-0"
                />
                <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 z-10">
                <button
                    onClick={() => {
                        if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                        }
                    }}
                    className="p-2 text-slate-400 hover:text-white transition duration-200"
                    title="Phát lại từ đầu"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-slate-900 rounded-full flex items-center justify-center hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md"
                >
                    {isPlaying ? (
                        <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 fill-current" />
                    ) : (
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 fill-current translate-x-0.5" />
                    )}
                </button>
                <div className="w-8" />
            </div>
        </div>
    );
};

const ChordPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { transposeChordName } = useChordContext();
    const [chord, setChord] = useState<Chord>(null);
    const [artist, setArtist] = useState<Artist>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User>(null);
    const [hoveredChord, setHoveredChord] = useState<string | null>(null);
    const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

    const [autoScroll, setAutoScroll] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const [openPlaylistModal, setOpenPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [playlistLoading, setPlaylistLoading] = useState(false);

    const [relatedChords, setRelatedChords] = useState<any[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);
    const [relatedArtists, setRelatedArtists] = useState<Record<string, Artist>>({});

    const popupRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<any>(null);
    const countdownIntervalRef = useRef<any>(null);

    const viewCountedRef = useRef(false);

    const handleIncreaseView = async (
        targetId: string,
        currentUserId: string | null,
    ) => {
        try {
            await instance.post(`/chords/${targetId}/view`, null, {
                params: {
                    userId: currentUserId || null,
                },
            });
        } catch (err) {
            console.error("Lỗi tăng lượt xem:", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                setLoading(true);

                viewCountedRef.current = false;

                const userData = await getUserInfo();
                setUser(userData);

                const chordData = await getChordById(id);
                console.log("chord", chordData);
                setChord(chordData);

                if (!viewCountedRef.current) {
                    viewCountedRef.current = true;
                    await handleIncreaseView(id, userData?.id);
                }

                if (chordData.artistId) {
                    const artistData = await getArtistById(chordData.artistId);
                    setArtist(artistData);
                }

                if (chordData.categoryName) {
                    setRelatedLoading(true);
                    try {
                        const res = await instance.get("/chords/related", {
                            params: {
                                categoryName: chordData.categoryName,
                                currentChordId: id
                            }
                        });
                        console.log("related", res.data);
                        setRelatedChords(res.data.result || []);
                    } catch (err) {
                        console.error("Lỗi tải bài hát liên quan:", err);
                    } finally {
                        setRelatedLoading(false);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            viewCountedRef.current = false;
        };
    }, [id]);

    useEffect(() => {
        const fetchArtistsForRelated = async () => {
            if (relatedChords.length === 0) return;

            const artistIds = Array.from(
                new Set(relatedChords.map((c) => c.artistId).filter(Boolean))
            );

            const artistResults = await Promise.all(
                artistIds.map(async (id) => {
                    try {
                        const res = await getArtistById(id);
                        return { id, data: res };
                    } catch {
                        return { id, data: null };
                    }
                })
            );

            const artistMap: Record<string, Artist> = {};
            artistResults.forEach((item) => {
                if (item.data) {
                    artistMap[item.id] = item.data;
                }
            });

            setRelatedArtists(artistMap);
        };

        fetchArtistsForRelated();
    }, [relatedChords]);

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

    const fetchPlaylists = async () => {
        try {
            if (!user?.id) return;
            setPlaylistLoading(true);
            const response = await instance.get(`/playlists/user/${user.id}`);
            setPlaylists(response.data.result || []);
        } catch (err) {
            console.error(err);
        } finally {
            setPlaylistLoading(false);
        }
    };

    const handleOpenPlaylist = async () => {
        setOpenPlaylistModal(true);
        await fetchPlaylists();
    };

    const handleAddToPlaylist = async (playlistId: string) => {
        try {
            await instance.post(`/playlists/${playlistId}/chords/${id}`);
            toast.success("Đã thêm vào playlist");
            setOpenPlaylistModal(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreatePlaylist = async () => {
        try {
            if (!newPlaylistName.trim() || !user?.id) return;
            const response = await instance.post("/playlists", {
                name: newPlaylistName,
                description: "",
                userId: user.id,
            });
            const newPlaylist = response.data.result;
            setPlaylists((prev) => [...prev, newPlaylist]);
            setNewPlaylistName("");
            await handleAddToPlaylist(newPlaylist.id);
        } catch (err) {
            console.error(err);
        }
    };

    const renderContent = (content: string) => {
        return content.split("\n").map((line, idx) => (
            <p key={idx}>
                {line.split(/(\[.*?\])/g).map((part, i) => {
                    if (part.startsWith("[")) {
                        const chordName = part.replace(/[\[\]]/g, "");
                        const transposedName = transposeChordName(chordName);
                        return (
                            <span
                                key={i}
                                className="text-red-500 font-semibold cursor-pointer hover:text-red-600 transition"
                                onClick={(e) => {
                                    const rect =
                                        e.currentTarget.getBoundingClientRect();
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

    if (loading)
        return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
    if (!chord)
        return <div className="p-10 text-center">Không tìm thấy bài hát.</div>;

    const currentChordData = hoveredChord ? getChordData(hoveredChord) : null;

    return (
        <div className="h-auto lg:h-[calc(100vh-64px)] p-2 sm:p-3 md:p-4 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 h-full">
                <div
                    ref={scrollContainerRef}
                    className="w-full lg:flex-[2] bg-white dark:bg-slate-900 rounded-sm lg:overflow-y-auto border border-gray-100 dark:border-slate-800/80 h-auto lg:h-[calc(100vh-64px)]"
                >
                    {/* Mobile-only Media Player (Audio first, YouTube second) */}
                    {chord.audio?.url ? (
                        <div className="w-full aspect-video shrink-0 lg:hidden sticky top-[64px] z-20">
                            <AudioPlayerCard
                                url={chord.audio.url}
                                title={chord.title}
                                artistName={artist?.name || chord.artistName}
                                chordId={chord.id}
                            />
                        </div>
                    ) : chord.youtubeUrl ? (
                        <div className="w-full aspect-video bg-white dark:bg-slate-900 shrink-0 rounded-0 lg:hidden sticky top-[64px] z-20">
                            <iframe
                                className="w-full h-full"
                                src={getYoutubeEmbedUrl(chord.youtubeUrl)}
                                title="YouTube video"
                                allowFullScreen
                            />
                        </div>
                    ) : null}

                    <div className="p-3 sm:p-4 md:p-6">
                        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100 flex-1 min-w-0 break-words">
                                    {chord.title}
                                </h1>
                                <button className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-500 rounded-full hover:scale-105 transition shrink-0">
                                    <Star size={18} fill="currentColor" />
                                </button>
                                <button
                                    onClick={handleOpenPlaylist}
                                    className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/30 transition flex items-center gap-2 shrink-0"
                                >
                                    <Music2 size={16} /> <span className="hidden xs:inline">Thêm playlist</span>
                                </button>
                                <button
                                    onClick={() => setAutoScroll(!autoScroll)}
                                    className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${autoScroll
                                        ? "bg-green-500 text-white shadow"
                                        : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-350 hover:bg-gray-200 dark:hover:bg-slate-700"
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
                                    onClick={() =>
                                        navigate(`/nghe-sy/${artist.id}`)
                                    }
                                    className="text-sm text-gray-500 dark:text-slate-400 cursor-pointer hover:text-blue-500 hover:underline w-fit"
                                >
                                    {artist.name}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400 dark:text-slate-500">
                                    Đang tải ca sĩ...
                                </p>
                            )}
                        </div>
                        <div className="whitespace-pre-wrap text-sm sm:text-[15px] leading-[2.2] text-gray-800 dark:text-slate-200">
                            {renderContent(chord.content)}
                        </div>
                    </div>

                    {hoveredChord && currentChordData && (
                        <div
                            ref={popupRef}
                            className="fixed z-50"
                            style={{
                                top: popupPos.y - 160,
                                left: popupPos.x,
                                transform: "translateX(-50%)",
                            }}
                        >
                            <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-xl p-2 border border-gray-100 dark:border-slate-800 scale-50 sm:scale-75">
                                <GuitarChordDiagram
                                    initialChordName={hoveredChord}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full lg:flex-[1] bg-white dark:bg-slate-900 flex flex-col gap-3 sm:gap-4 h-auto lg:h-[calc(100vh-64px)] overflow-y-auto border border-transparent lg:border-gray-100 lg:dark:border-slate-800/80">
                    <div className="w-full aspect-video bg-white dark:bg-slate-900 shrink-0 rounded-0 sticky top-0 z-10 hidden lg:block p-2 lg:p-0">
                        {chord.audio?.url ? (
                            <AudioPlayerCard
                                url={chord.audio.url}
                                title={chord.title}
                                artistName={artist?.name || chord.artistName}
                                chordId={chord.id}
                            />
                        ) : chord.youtubeUrl ? (
                            <iframe
                                className="w-full h-full"
                                src={getYoutubeEmbedUrl(chord.youtubeUrl)}
                                title="YouTube video"
                                allowFullScreen
                            />
                        ) : null}
                    </div>

                    <div className="flex-1 border-t border-gray-100 dark:border-slate-800 p-3 sm:p-4 overflow-y-auto">
                        {relatedLoading ? (
                            <div className="text-sm text-gray-400 dark:text-slate-500 py-2">Đang tải bài hát liên quan...</div>
                        ) : relatedChords.length === 0 ? (
                            <div className="text-sm text-gray-400 dark:text-slate-500 py-2">Không có bài hát cùng giai điệu</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-2 sm:gap-2">
                                {relatedChords.map((item: Chord) => {
                                    const artistInfo = relatedArtists[item.artistId];
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => navigate(`/song/${item.id}`)}
                                            className="flex items-center gap-3 p-2 sm:p-3 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer transition group"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[var(--primary-color)]/10 to-purple-500/10 rounded overflow-hidden flex items-center justify-center dark:from-[var(--primary-color)]/20 dark:to-purple-500/20">
                                                {artistInfo?.imageUrl ? (
                                                    <img
                                                        src={artistInfo.imageUrl}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-slate-500" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-800 dark:text-slate-200 text-sm sm:text-base line-clamp-1 group-hover:text-[var(--primary-color)] transition">
                                                    {item.title}
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                                                    <div className="truncate max-w-[60%] sm:max-w-[70%]">
                                                        {artistInfo?.name || "Chưa cập nhật"}
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <Eye size={12} className="sm:w-3 sm:h-3" />
                                                        <span>{item.views?.toLocaleString() || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {openPlaylistModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-4 sm:p-5 text-gray-900 dark:text-slate-100 border border-transparent dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Thêm vào playlist
                            </h2>
                            <button
                                onClick={() => setOpenPlaylistModal(false)}
                                className="cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition text-gray-400 dark:text-slate-500 hover:text-gray-650 dark:hover:text-slate-300"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex gap-2 mb-4 sm:mb-5">
                            <input
                                value={newPlaylistName}
                                onChange={(e) =>
                                    setNewPlaylistName(e.target.value)
                                }
                                placeholder="Tên playlist mới..."
                                className="flex-1 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-950 text-sm"
                            />
                            <button
                                onClick={handleCreatePlaylist}
                                className="px-4 bg-[var(--primary-color)] text-white rounded-xl hover:bg-purple-700 transition flex items-center justify-center cursor-pointer"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {playlistLoading ? (
                                <div className="text-center py-5 text-sm text-gray-500 dark:text-slate-400">
                                    Đang tải...
                                </div>
                            ) : playlists.length === 0 ? (
                                <div className="text-center text-gray-400 dark:text-slate-500 py-5 text-sm">
                                    Chưa có playlist nào
                                </div>
                            ) : (
                                playlists.map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        onClick={() =>
                                            handleAddToPlaylist(playlist.id)
                                        }
                                        className="w-full text-left border border-gray-200 dark:border-slate-800/80 rounded-xl p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition cursor-pointer"
                                    >
                                        <div className="font-semibold text-gray-800 dark:text-slate-200 text-sm sm:text-base">
                                            {playlist.name}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-400 dark:text-slate-500 mt-1">
                                            {playlist.chords?.length || 0} bài
                                            hát
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChordPage;