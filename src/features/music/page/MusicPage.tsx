import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Music,
    Clock,
    Eye,
    TrendingUp,
    Play,
    Heart,
    Disc3,
    User as UserIcon,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Zap,
    Filter,
    X,
    Headphones,
    Mic2,
    ListMusic,
    Library,
    Radio,
    Album,
    SkipBack,
    SkipForward,
    Repeat,
    Shuffle,
    Volume2,
    Maximize2,
    Pause,
    MoreHorizontal,
    Search
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/Badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/Avatar";
import { Separator } from "../../../components/ui/separator";
import { Input } from "../../../components/ui/Input";
import { Slider } from "../../../components/ui/slider";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../../components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import instance from "../../../config/axios";
import { getArtistById } from "../../../services/artistService";
import { formatNumber, formatTimeAgo, formatTime } from "../../../utils/format";
import { RankingRight } from "../../home/components/RankingRight";

import { type Chord } from "../../../types/chord";
import { type Artist, type RankingArtist } from "../../../types/artist";
import { type Category } from "../../../types/category";

type TabType = 'trending' | 'topWeek' | 'newest';

export default function MusicPage() {
    const navigate = useNavigate();
    const audioRef = useRef<HTMLAudioElement>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [chords, setChords] = useState<Chord[]>([]);
    const [allChords, setAllChords] = useState<Chord[]>([]);
    const [featuredSong, setFeaturedSong] = useState<Chord | null>(null);
    const [totalViews, setTotalViews] = useState<number>(0);
    const [artistsMap, setArtistsMap] = useState<Record<string, Artist>>({});
    const [rankingArtists, setRankingArtists] = useState<RankingArtist[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [activeTab, setActiveTab] = useState<TabType>('trending');
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentSong, setCurrentSong] = useState<Chord | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [showPlayer, setShowPlayer] = useState<boolean>(false);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [trendingRes, mostViewsRes, categoriesRes] = await Promise.all([
                    instance.get('/chords/trending'),
                    instance.get('/chords/mostViews'),
                    instance.get('/categories')
                ]);

                const trendingChords = trendingRes.data.result || [];
                const mostViewsChords = mostViewsRes.data.result || [];
                const categoriesData = categoriesRes.data.result || [];

                setCategories(categoriesData);

                const allChordsData = [...trendingChords, ...mostViewsChords];
                const uniqueChords = Array.from(
                    new Map(allChordsData.map((c: Chord) => [c.id, c])).values()
                ) as Chord[];

                const sortedChords = uniqueChords.sort((a, b) => (b.views || 0) - (a.views || 0));
                const featured = sortedChords.length > 0 ? sortedChords[0] : null;
                const total = sortedChords.reduce((sum, c) => sum + (c.views || 0), 0);

                setAllChords(sortedChords);
                setFeaturedSong(featured);
                setTotalViews(total);

                const artistIds = Array.from(
                    new Set(sortedChords.map((c: Chord) => c.artistId).filter(Boolean))
                );

                const artistResults = await Promise.all(
                    artistIds.map(async (id: string) => {
                        try {
                            const res = await getArtistById(id);
                            return {
                                id: id,
                                name: res?.name || "Chưa cập nhật",
                                imageUrl: res?.imageUrl || "",
                                description: res?.description || "",
                                slug: res?.slug || ""
                            };
                        } catch {
                            return { id, name: "Chưa cập nhật", imageUrl: "", description: "", slug: "" };
                        }
                    })
                );

                const newMap: Record<string, Artist> = {};
                artistResults.forEach((item) => { newMap[item.id] = item; });
                setArtistsMap(newMap);

                const artistStatsMap = new Map<string, RankingArtist>();
                sortedChords.forEach((chord: Chord) => {
                    const artistId = chord.artistId;
                    if (!artistId) return;

                    const artistInfo = newMap[artistId];
                    if (artistStatsMap.has(artistId)) {
                        const existing = artistStatsMap.get(artistId)!;
                        existing.totalViews += chord.views || 0;
                        existing.songCount += 1;
                    } else {
                        artistStatsMap.set(artistId, {
                            artistId,
                            artistName: artistInfo?.name || chord.artistName || "Unknown",
                            imageUrl: artistInfo?.imageUrl,
                            totalViews: chord.views || 0,
                            songCount: 1
                        });
                    }
                });

                const sortedArtists = Array.from(artistStatsMap.values())
                    .sort((a, b) => b.totalViews - a.totalViews);

                setRankingArtists(sortedArtists);
                setChords(sortedChords);

                if (featured && featured.audio?.url) {
                    setCurrentSong(featured);
                    setShowPlayer(true);
                }

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu music page:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...allChords];

        if (activeTab === 'trending') {
            filtered = filtered.slice(0, 20);
        } else if (activeTab === 'topWeek') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(c => new Date(c.createdAt) >= weekAgo);
        } else if (activeTab === 'newest') {
            filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        if (selectedCategory !== "all") {
            filtered = filtered.filter(c => c.categoryId === selectedCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(chord =>
                chord.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                chord.artistName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0));

        const totalItems = filtered.length;
        const total = Math.ceil(totalItems / itemsPerPage);
        setTotalPages(total > 0 ? total : 1);

        if (currentPage > total) {
            setCurrentPage(1);
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setChords(filtered.slice(startIndex, endIndex));

    }, [allChords, activeTab, selectedCategory, searchTerm, currentPage]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration || 0;
            setProgress((currentTime / duration) * 100);
            setDuration(duration);
        }
    };

    const handleProgressChange = (value: number[]) => {
        if (audioRef.current && duration) {
            const newTime = (value[0] / 100) * duration;
            audioRef.current.currentTime = newTime;
            setProgress(value[0]);
        }
    };

    const playSong = (chord: Chord) => {
        if (!chord.audio?.url) return;
        setCurrentSong(chord);
        setShowPlayer(true);
        setIsPlaying(true);
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play();
            }
        }, 100);
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setCurrentPage(1);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-[--primary-color] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-400 font-medium">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-[#F8F9FC] dark:bg-[#0a0a0a] min-h-screen text-[#333333] dark:text-slate-100">
            <div className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800/60 p-4 hidden lg:block overflow-y-auto fixed top-[calc(var(--header-height)_+_var(--subnav-height))] left-0 h-screen z-40">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Khám phá</h3>
                        <div className="space-y-1">
                            <button
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-all ${activeTab === 'trending'
                                    ? 'bg-[--primary-color]/10 text-[--primary-color] font-medium'
                                    : 'hover:bg-gray-50 dark:hover:bg-slate-800/40 text-gray-600 dark:text-slate-350'
                                    }`}
                                onClick={() => handleTabChange('trending')}
                            >
                                <Zap className="w-4 h-4" />
                                Thịnh hành
                            </button>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thể loại</h3>
                        <div className="space-y-1">
                            <button
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-all ${selectedCategory === "all"
                                    ? 'bg-[--primary-color]/10 text-[--primary-color] font-medium'
                                    : 'hover:bg-gray-50 dark:hover:bg-slate-800/40 text-gray-600 dark:text-slate-350'
                                    }`}
                                onClick={() => handleCategoryChange("all")}
                            >
                                <span className="w-2 h-2 rounded-full bg-gray-400" />
                                Tất cả
                            </button>
                            {categories.slice(0, 8).map((category) => (
                                <button
                                    key={category.id}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-all ${selectedCategory === category.id
                                        ? 'bg-[--primary-color]/10 text-[--primary-color] font-medium'
                                        : 'hover:bg-gray-50 dark:hover:bg-slate-800/40 text-gray-600 dark:text-slate-350'
                                        }`}
                                    onClick={() => handleCategoryChange(category.id)}
                                >
                                    <span className="w-2 h-2 rounded-full bg-[--primary-color]" />
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Nghệ sĩ nổi bật</h3>
                        <div className="space-y-2">
                            {rankingArtists.slice(0, 5).map((artist) => (
                                <div
                                    key={artist.artistId}
                                    className="flex items-center gap-3 px-2 py-1.5 rounded-sm hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer transition-all"
                                    onClick={() => navigate(`/artists/${artist.artistId}`)}
                                >
                                    <Avatar size="sm" className="rounded-sm">
                                        {artist.imageUrl ? (
                                            <AvatarImage src={artist.imageUrl} alt={artist.artistName} className="rounded-sm" />
                                        ) : (
                                            <AvatarFallback className="rounded-sm">{artist.artistName?.[0] || "A"}</AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{artist.artistName}</p>
                                        <p className="text-xs text-gray-400 dark:text-slate-500">{artist.songCount} bài hát</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 mx-auto w-full pb-32 lg:ml-64 xl:mr-[var(--ranking-right-width)]">
                {/* Search and Sponsor bar */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-550" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm hợp âm, bài hát..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-6 pr-8 bg-transparent border-0 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-950 dark:focus-visible:border-slate-100 transition-all rounded-none text-sm shadow-none focus:outline-none h-9"
                        />
                        {searchTerm && (
                            <button
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 dark:hover:text-slate-350"
                                onClick={() => setSearchTerm("")}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>


                </div>

                {featuredSong && (
                    <div className="relative overflow-hidden mb-10 bg-white dark:bg-black border border-slate-100/80 dark:border-slate-850/40 rounded-3xl p-6 sm:p-8 md:p-10 min-h-[320px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] dark:shadow-none block">
                        {/* Wavy Contour Lines SVG Background */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 800 350" fill="none" preserveAspectRatio="none">
                            {/* Group of contour lines from top-right */}
                            <g className="stroke-slate-100 dark:stroke-[#C5A85C]/20" strokeWidth="1.2">
                                <path d="M 450,-60 C 550,110 680,60 900,60" />
                                <path d="M 420,-60 C 520,120 650,70 870,70" />
                                <path d="M 390,-60 C 490,130 620,80 840,80" />
                                <path d="M 360,-60 C 460,140 590,90 810,90" />
                                <path d="M 330,-60 C 430,150 560,100 780,100" />
                                <path d="M 300,-60 C 400,160 530,110 750,110" />
                                <path d="M 270,-60 C 370,170 500,120 720,120" />
                                <path d="M 240,-60 C 340,180 470,130 690,130" />
                                <path d="M 210,-60 C 310,190 440,140 660,140" />
                                <path d="M 180,-60 C 280,200 410,150 630,150" />
                                <path d="M 150,-60 C 250,210 380,160 600,160" />
                                <path d="M 120,-60 C 220,220 350,170 570,170" />
                            </g>
                            {/* Group of contour lines from bottom-left */}
                            <g className="stroke-slate-100 dark:stroke-[#C5A85C]/12" strokeWidth="1">
                                <path d="M -120,220 C 80,170 120,330 320,250 C 520,170 620,380 820,330" />
                                <path d="M -120,240 C 80,190 120,350 320,270 C 520,190 620,400 820,350" />
                                <path d="M -120,260 C 80,210 120,370 320,290 C 520,210 620,420 820,370" />
                                <path d="M -120,280 C 80,230 120,390 320,310 C 520,230 620,440 820,390" />
                            </g>
                        </svg>

                        {/* Subtle Glows (for dark mode color highlights) */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/[0.03] dark:bg-yellow-500/[0.02] rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/[0.03] dark:bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />

                        {/* CONTAINER TỔNG */}
                        <div className="relative w-full text-center sm:text-left z-10 flex flex-col justify-center">
                            {/* CONTAINER CHUNG CHO TẤT CẢ PHẦN TỬ CẦN BO CONG */}
                            {/* Mobile: Căn giữa dọc flex-col | Tablet/PC: Trở về block để float hoạt động */}
                            <div className="relative overflow-hidden w-full flex flex-col items-center sm:block">

                                {/* Khối Avatar: 
            - Mobile: Hủy float (`sm:float-left`), thu nhỏ size (`w-[160px] h-[160px]`), căn giữa bằng `mb-6`.
            - Tablet/PC: `sm:w-[240px] sm:h-[240px]` kèm hiệu ứng bo cong shape-outside. */}
                                <div className="w-[160px] h-[160px] sm:w-[240px] sm:h-[240px] rounded-full sm:float-left sm:[shape-outside:circle(50%)] sm:[shape-margin:12px] mb-6 sm:mb-2 sm:mr-4">
                                    <img
                                        src={artistsMap[featuredSong.artistId]?.imageUrl || "path-to-avatar.jpg"}
                                        alt="Avatar"
                                        className="w-full h-full rounded-full object-cover shadow-lg"
                                    />
                                </div>

                                {/* 1. Tên nghệ sỹ: Tự động xuống dòng gọn gàng */}
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A253C] dark:text-white tracking-tight mb-4 leading-tight">
                                    {artistsMap[featuredSong.artistId]?.name ? `${artistsMap[featuredSong.artistId].name}` : `${featuredSong.title} Rocks`}
                                </h1>

                                {/* 2. Đoạn văn mô tả: Mobile căn giữa (`text-center`), PC căn đều (`sm:text-justify`) */}
                                <p className="text-sm sm:text-base text-slate-400 leading-relaxed text-justify sm:text-justify mb-6">
                                    {artistsMap[featuredSong.artistId]?.description || featuredSong.content || "Bùi Nguyễn Trung Quân, thường được biết đến với nghệ danh Trung Quân..."}
                                </p>



                            </div>
                        </div>


                    </div>
                )}

                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                            Bài Hát Nổi Bật
                        </h2>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Simple Category Select */}
                            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="w-full sm:w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-lg text-xs h-8">
                                    <SelectValue placeholder="Thể loại" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả thể loại</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {chords.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                            <Music className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
                            <p className="text-gray-400 dark:text-slate-500">Không tìm thấy bài hát nào</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {chords.map((chord, index) => {
                                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                                    const indexString = globalIndex < 10 ? `0${globalIndex}` : `${globalIndex}`;
                                    const artistInfo = artistsMap[chord.artistId];
                                    const isCurrentSong = currentSong?.id === chord.id;

                                    // Generate a stable random duration based on song id
                                    const durationMin = 3 + (chord.id.charCodeAt(0) % 3);
                                    const durationSec = (chord.id.charCodeAt(1) % 60).toString().padStart(2, '0');
                                    const trackDuration = `${durationMin}:${durationSec}`;

                                    return (
                                        <div
                                            key={chord.id}
                                            className={`group flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-white dark:bg-slate-900/40 border border-slate-100/60 dark:border-slate-800/40 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-pointer ${isCurrentSong ? 'ring-2 ring-indigo-500 dark:ring-indigo-650' : ''}`}
                                            onClick={() => {
                                                if (chord.audio?.url) {
                                                    playSong(chord);
                                                } else {
                                                    navigate(`/song/${chord.id}`);
                                                }
                                            }}
                                        >
                                            {/* Left side: Thumbnail & Index & Favorite & Title */}
                                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                                                {/* Thumbnail */}
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800/40">
                                                    {artistInfo?.imageUrl ? (
                                                        <img src={artistInfo.imageUrl} alt={chord.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                                                            <Disc3 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Track Index */}
                                                <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-550 shrink-0 w-5 sm:w-6 text-center">
                                                    {indexString}
                                                </span>

                                                {/* Heart / Favorite Icon */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                    className={`transition-colors shrink-0 ${index === 1 ? 'text-red-500 dark:text-red-400' : 'text-slate-350 hover:text-red-500 dark:text-slate-650 dark:hover:text-red-400'}`}
                                                >
                                                    <Heart className={`w-4 h-4 ${index === 1 ? 'fill-current' : ''}`} />
                                                </button>

                                                {/* Song Title & Artist: Sắp xếp dọc trên mobile, ngang trên PC để không bị vỡ hàng */}
                                                <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
                                                    <span className={`text-sm sm:text-base font-semibold truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none ${isCurrentSong ? 'text-indigo-600 dark:text-indigo-400' : 'text-[#1A253C] dark:text-slate-200'}`}>
                                                        {chord.title}
                                                    </span>
                                                    <span className="hidden sm:block text-slate-300 dark:text-slate-750 font-light">-</span>
                                                    <span className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                                                        {artistInfo?.name || chord.artistName || "Nghệ sĩ"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Album name */}
                                            <div className="hidden md:block w-40 text-left shrink-0 pl-4">
                                                <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 truncate block">
                                                    {chord.categoryName || "Single Album"}
                                                </span>
                                            </div>

                                            {/* Duration */}
                                            <div className="hidden sm:block w-16 text-center shrink-0">
                                                <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">
                                                    {trackDuration}
                                                </span>
                                            </div>

                                            {/* Views: Thu nhỏ kích thước trên mobile để nhường chỗ cho text */}
                                            <div className="w-16 sm:w-28 text-right shrink-0">
                                                <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 block truncate">
                                                    {(chord.views || 0).toLocaleString('en-US')}
                                                </span>
                                            </div>

                                            {/* Options */}
                                            <div className="shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-slate-350 dark:text-slate-650 hover:text-slate-650 dark:hover:text-slate-300 rounded-lg p-1 h-8 w-8 cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/song/${chord.id}`);
                                                    }}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-6 overflow-x-auto">
                                    <Pagination>
                                        <PaginationContent className="flex-wrap gap-1">
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    size="default"
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (currentPage > 1) handlePageChange(currentPage - 1);
                                                    }}
                                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </PaginationItem>

                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (
                                                    <PaginationItem key={pageNum}>
                                                        <PaginationLink
                                                            size="default"
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePageChange(pageNum);
                                                            }}
                                                            isActive={currentPage === pageNum}
                                                        >
                                                            {pageNum}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            })}

                                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                                <PaginationItem>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            )}

                                            <PaginationItem>
                                                <PaginationNext
                                                    size="default"
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                                    }}
                                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="w-[var(--ranking-right-width)] shrink-0 border-l border-gray-100 dark:border-slate-800/60 bg-white/20 dark:bg-slate-900/10 hidden xl:block h-screen fixed top-[112px] right-0 overflow-y-auto
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-neutral-300
    [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700
    dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600">

                <div className="px-3 md:px-4">
                    <h3 className="font-semibold mb-3 text-sm md:text-base text-gray-900 dark:text-white">Hot trong tuần</h3>
                    <RankingRight />
                </div>

                <Separator />

                <div className="mt-6 px-3 md:px-4">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                        <Mic2 className="w-3 h-3 inline mr-1" />
                        Nghệ sĩ hàng đầu
                    </h3>
                    <div className="space-y-3">
                        {rankingArtists.slice(5, 10).map((artist, index) => (
                            <div
                                key={artist.artistId}
                                className="flex items-center gap-3 p-2 rounded-sm hover:bg-gray-50 dark:hover:bg-slate-800/30 cursor-pointer transition-all group"
                                onClick={() => navigate(`/artists/${artist.artistId}`)}
                            >
                                <Avatar size="sm" className="rounded-sm">
                                    {artist.imageUrl ? (
                                        <AvatarImage src={artist.imageUrl} alt={artist.artistName} className="rounded-sm" />
                                    ) : (
                                        <AvatarFallback className="rounded-sm">{artist.artistName?.[0] || "A"}</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{artist.artistName}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-550">{artist.songCount} bài hát</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showPlayer && currentSong && (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800/80 shadow-lg z-50">
                    <audio
                        ref={audioRef}
                        src={currentSong.audio?.url}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />

                    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[--primary-color]/20 to-[#2D6CFF]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {artistsMap[currentSong.artistId]?.imageUrl ? (
                                        <img src={artistsMap[currentSong.artistId].imageUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Disc3 className="w-5 h-5 sm:w-6 sm:h-6 text-[--primary-color]/40" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{currentSong.title}</p>
                                    <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-400 truncate">
                                        {artistsMap[currentSong.artistId]?.name || currentSong.artistName || "Nghệ sĩ"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center gap-1 sm:gap-2 w-full sm:w-auto">
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-350 rounded-sm p-1 sm:p-2"
                                    >
                                        <Shuffle className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-350 rounded-sm p-1 sm:p-2"
                                    >
                                        <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                    <Button
                                        className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white cursor-pointer flex items-center justify-center"
                                        onClick={togglePlay}
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                                        ) : (
                                            <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-350 rounded-sm p-1 sm:p-2"
                                    >
                                        <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-350 rounded-sm p-1 sm:p-2"
                                    >
                                        <Repeat className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2 sm:gap-3 w-full max-w-2xl">
                                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 min-w-[30px] sm:min-w-[40px]">
                                        {formatTime(audioRef.current?.currentTime || 0)}
                                    </span>
                                    <Slider
                                        value={[progress]}
                                        max={100}
                                        step={0.1}
                                        onValueChange={handleProgressChange}
                                        className="flex-1"
                                    />
                                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 min-w-[30px] sm:min-w-[40px]">
                                        {formatTime(duration)}
                                    </span>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-2 min-w-[120px]">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-350 rounded-sm"
                                >
                                    <Volume2 className="w-4 h-4" />
                                </Button>
                                <Slider
                                    value={[80]}
                                    max={100}
                                    step={1}
                                    className="w-20"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-350 rounded-sm"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}