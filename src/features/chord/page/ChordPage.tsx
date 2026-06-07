import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Plus, Music2, X } from "lucide-react";
import { getYoutubeEmbedUrl } from "../../../helper/youtube";
import { getChordById } from "../../../services/chordService";
import { getArtistById } from "../../../services/artistService";
import GuitarChordDiagram from "../../../components/chords/GuitarChordDiagram";
import { getChordData } from "../../../constants/chords";
import { getUserInfo } from "../../../utils/auth";
import instance from "../../../config/axios";

const ChordPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [chord, setChord] = useState<any>(null);
    const [artist, setArtist] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [hoveredChord, setHoveredChord] = useState<string | null>(null);
    const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

    const [autoScroll, setAutoScroll] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const [openPlaylistModal, setOpenPlaylistModal] = useState(false);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [playlistLoading, setPlaylistLoading] = useState(false);

    const popupRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<any>(null);
    const countdownIntervalRef = useRef<any>(null);

    // REF QUAN TRỌNG: Chống gọi trùng API gây Deadlock
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

                // CHỈ GỌI TĂNG VIEW NẾU CHƯA GỌI TRONG LẦN MOUNT NÀY
                if (!viewCountedRef.current) {
                    viewCountedRef.current = true;
                    await handleIncreaseView(id, userData?.id);
                }

                if (chordData.artistId) {
                    const artistData = await getArtistById(chordData.artistId);
                    setArtist(artistData);
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
            alert("Đã thêm vào playlist");
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
                                {part}
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
        <div className="h-[calc(100vh-64px)] p-4 bg-white">
            <div className="flex flex-col md:flex-row gap-6 h-full">
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
                                    onClick={handleOpenPlaylist}
                                    className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition flex items-center gap-2"
                                >
                                    <Music2 size={16} /> Thêm playlist
                                </button>
                                <button
                                    onClick={() => setAutoScroll(!autoScroll)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        autoScroll
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
                                    onClick={() =>
                                        navigate(`/nghe-sy/${artist.id}`)
                                    }
                                    className="text-sm text-gray-500 cursor-pointer hover:text-blue-500 hover:underline w-fit"
                                >
                                    {artist.name}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400">
                                    Đang tải ca sĩ...
                                </p>
                            )}
                        </div>
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
                                <GuitarChordDiagram
                                    initialChordName={hoveredChord}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full md:flex-[1] bg-white rounded-sm shadow-sm p-4 border border-gray-100">
                    {chord.youtubeUrl && (
                        <div className="w-full h-1/2 md:flex-[1] bg-white shadow-sm border border-gray-100">
                            <iframe
                                className="w-full h-full rounded-xl"
                                src={getYoutubeEmbedUrl(chord.youtubeUrl)}
                                title="YouTube video"
                                allowFullScreen
                            />
                        </div>
                    )}
                    <iframe
                        title="Metronome"
                        src="https://guitarapp.com/metronome.html?embed=true"
                        className="w-full h-full rounded-xl"
                    />
                </div>
            </div>

            {openPlaylistModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold">
                                Thêm vào playlist
                            </h2>
                            <button
                                onClick={() => setOpenPlaylistModal(false)}
                                className="cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex gap-2 mb-5">
                            <input
                                value={newPlaylistName}
                                onChange={(e) =>
                                    setNewPlaylistName(e.target.value)
                                }
                                placeholder="Tên playlist mới..."
                                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400"
                            />
                            <button
                                onClick={handleCreatePlaylist}
                                className="px-4 bg-[var(--primary-color)] text-white rounded-xl hover:bg-purple-700 transition"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            {playlistLoading ? (
                                <div className="text-center py-5">
                                    Đang tải...
                                </div>
                            ) : playlists.length === 0 ? (
                                <div className="text-center text-gray-400 py-5">
                                    Chưa có playlist nào
                                </div>
                            ) : (
                                playlists.map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        onClick={() =>
                                            handleAddToPlaylist(playlist.id)
                                        }
                                        className="w-full text-left border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
                                    >
                                        <div className="font-semibold text-gray-800">
                                            {playlist.name}
                                        </div>
                                        <div className="text-sm text-gray-400 mt-1">
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
