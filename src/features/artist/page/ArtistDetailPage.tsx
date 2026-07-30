import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArtistById, fetchArtists } from "../../../services/artistService";
import instance from "../../../config/axios";
import { getYoutubeThumbnailUrl } from "../../../helper/youtube";
import { Play, Music, ChevronRight } from "lucide-react";
import { ArtistSlider } from "../../../components/common/ArtistSlider";

function ArtistDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [artist, setArtist] = useState<any>(null);
    const [songs, setSongs] = useState<any[]>([]);
    const [similarArtists, setSimilarArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch artist details
                const artistData = await getArtistById(id);
                setArtist(artistData);

                // 2. Fetch songs of this artist
                const songRes = await instance.get(`/chords/artist/${id}`);
                const artistSongs = songRes?.data?.result || [];
                setSongs(artistSongs);

                // 3. Fetch similar artists based on genre categories
                try {
                    const allArtists = await fetchArtists() || [];
                    const chordsRes = await instance.get("/chords?size=150");
                    const allChords = chordsRes.data?.result?.data || [];

                    const currentCategoryIds = new Set(
                        artistSongs.map((song: any) => song.categoryId).filter(Boolean)
                    );

                    const matchingChords = allChords.filter(
                        (chord: any) =>
                            chord.artistId !== id &&
                            currentCategoryIds.has(chord.categoryId)
                    );

                    const matchingArtistIds = new Set(
                        matchingChords.map((chord: any) => chord.artistId).filter(Boolean)
                    );

                    let recommended = allArtists.filter(
                        (a: any) => a.id !== id && matchingArtistIds.has(a.id)
                    );

                    if (recommended.length === 0) {
                        recommended = allArtists.filter((a: any) => a.id !== id).slice(0, 6);
                    }

                    setSimilarArtists(recommended);
                } catch (recErr) {
                    console.error("Failed to load recommendations:", recErr);
                }
            } catch (err) {
                console.error(err);
                setSongs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);


    const getMockDuration = (songId: string): string => {
        let sum = 0;
        for (let i = 0; i < songId.length; i++) {
            sum += songId.charCodeAt(i);
        }
        const minutes = 3 + (sum % 3);
        const seconds = sum % 60;
        const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `0${minutes}:${secondsStr}`;
    };

    const totalViews = songs.reduce((sum, song) => sum + (song.views || 0), 0);

    const bannerBgStyle = artist?.backgroundImage
        ? { backgroundImage: `url(${artist.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};
    console.log("banner", bannerBgStyle);
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Đang tải trang cá nhân nghệ sĩ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto animate-in fade-in duration-500 font-sans">

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col gap-8 min-w-0 overflow-y-auto max-h-[calc(100vh-var(--header-height)-var(--subnav-height))]">
                {/* Banner Section */}
                <div
                    className="relative overflow-hidden w-full h-auto min-h-[340px] md:h-[360px] flex items-stretch border-b border-slate-200/40 dark:border-slate-800/40 shadow-md shrink-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-955"
                    style={bannerBgStyle}
                >
                    {/* Theme-adaptive overlays */}
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/55 backdrop-blur-[0.5px] z-0 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-slate-50/50 to-slate-100/80 dark:from-black/85 dark:via-black/45 dark:to-black/75 z-0 transition-all duration-300" />

                    {/* Inner content */}
                    <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6 p-6 md:p-10">
                        {/* Identity (Left side) */}
                        <div className="flex-1 flex flex-col items-start justify-end h-full gap-2 text-left">
                            <span className="px-3 py-1 rounded-full bg-slate-900/10 dark:bg-white/10 text-slate-800 dark:text-white/90 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm border border-slate-900/5 dark:border-white/5 transition-all">
                                Nghệ sĩ
                            </span>
                            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight drop-shadow-sm select-none transition-colors">
                                {artist?.name}
                            </h1>
                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    className="w-12 h-12 rounded-full bg-[var(--primary-color)] hover:opacity-95 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer border-none shrink-0"
                                    onClick={() => {
                                        if (songs.length > 0) {
                                            navigate(`/song/${songs[0].id}`);
                                        }
                                    }}
                                >
                                    <Play size={20} fill="currentColor" className="ml-0.5" />
                                </button>
                                <div className="text-sm font-bold text-slate-650 dark:text-white/90 drop-shadow-xs transition-colors">
                                    {totalViews.toLocaleString("vi-VN")} người quan tâm
                                </div>
                            </div>
                        </div>

                        {/* Bio box (Right side - transparent, scrollable, larger font) */}
                        <div className="w-full md:w-[450px] h-48 flex flex-col shrink-0 text-left">
                            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin text-sm text-slate-700 dark:text-white/95 leading-relaxed text-justify transition-colors">
                                {artist?.description || "Nghệ sĩ này hiện chưa cập nhật tiểu sử chi tiết. Hãy tiếp tục theo dõi để cập nhật các tác phẩm mới nhất của họ."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Popular Songs Section */}
                <div className="space-y-4 shrink-0 p-4 md:p-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                            Bài Hát Nổi Bật
                        </h2>
                    </div>

                    {songs.length === 0 ? (
                        <div className="py-16 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Music className="w-10 h-10 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Nghệ sĩ chưa có bài hát nào được đăng tải</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                            {songs.map((song, index) => (
                                <div
                                    key={song.id}
                                    onClick={() => navigate(`/song/${song.id}`)}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition-all duration-200 cursor-pointer group border border-transparent hover:border-slate-200/40 dark:hover:border-slate-800/40"
                                >
                                    <div className="flex items-center min-w-0 flex-1">
                                        <span className="text-xs font-semibold text-slate-450 dark:text-slate-650 w-6 shrink-0">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>

                                        <div className="w-12 h-12 rounded-lg overflow-hidden mr-3 shrink-0 relative bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                                            {getYoutubeThumbnailUrl(song.youtubeUrl) ? (
                                                <img
                                                    src={getYoutubeThumbnailUrl(song.youtubeUrl)}
                                                    alt={song.title}
                                                    className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=150";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-100 dark:from-slate-800 dark:to-slate-900">
                                                    <Music className="w-5 h-5 text-indigo-300 dark:text-slate-600" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Play size={14} className="text-white fill-white" />
                                            </div>
                                        </div>

                                        <div className="min-w-0 flex-1 pr-4">
                                            <h3 className="font-bold text-slate-850 dark:text-slate-250 text-sm truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                                                {song.title}
                                            </h3>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
                                                {artist?.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center shrink-0">
                                        <span className="text-xs text-slate-450 dark:text-slate-500 font-medium group-hover:hidden transition-all">
                                            {getMockDuration(song.id)}
                                        </span>

                                        <div className="hidden group-hover:flex items-center transition-all">
                                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                                                Hợp âm <ChevronRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Similar Artists Section */}
                <div className="shrink-0 p-4 md:p-8 border-t border-slate-200/50 dark:border-slate-800/55 pt-6">
                    <ArtistSlider
                        title="Nghệ sĩ tương tự"
                        artists={similarArtists}
                        emptyText="Chưa tìm thấy nghệ sĩ nào có thể loại nhạc tương tự"
                        useMusicIcon={true}
                        hasBorder={false}
                        roundedEmptyCard={true}
                    />
                </div>
            </main>
        </div>
    );
}

export default ArtistDetailPage;
