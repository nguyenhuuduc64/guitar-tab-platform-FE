import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Music,
    Users,
    Eye,
    Radio,
    Layers,
    ArrowRight,
    Disc3,
    AlertCircle,
    BarChart3,
    PieChart,
    TrendingUp,
    Clock,
    Calendar,
    Zap,
    Star,
    Hash,
    BookOpen,
    Play,
    FileSpreadsheet
} from "lucide-react";
import { Doughnut, Bar } from "react-chartjs-2";
import { exportDashboardToExcel } from "../utils/excelExport";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    BarElement,
    RadialLinearScale
} from "chart.js";
import { Button } from "../../../components/ui/button";
import instance from "../../../config/axios";
import { getArtistById } from "../../../services/artistService";
import { useTheme } from "../../../context/ThemeContext";
import { type Chord } from "../../../types/chord";
import { type Artist, type ArtistStats } from "../../../types/artist";
import { type CategoryStats, type DashboardStats } from "../../../types/dashboard";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler,
    BarElement,
    RadialLinearScale
);

export default function Dashboard() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalChords: 0,
        totalArtists: 0,
        totalViews: 0,
        topArtist: null,
        topChords: [],
        trendingChords: [],
        recentChords: [],
        artistStats: [],
        categoryStats: []
    });
    const [artistsMap, setArtistsMap] = useState<Record<string, Artist>>({});
    const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [topChordsRes, recentRes, trendingRes, allChordsRes] = await Promise.all([
                    instance.get('/chords/mostViews'),
                    instance.get('/chords?page=0&size=5'),
                    instance.get('/chords/trending'),
                    instance.get('/chords?page=0&size=100')
                ]);

                const topChords = topChordsRes.data.result || [];
                const recentChords = recentRes.data.result?.data || [];
                const trendingChords = trendingRes.data.result || [];
                const allChords = allChordsRes.data.result?.data || [];
                const totalChords = allChordsRes.data.result?.total || topChords.length;

                const artistIds = Array.from(
                    new Set(topChords.map((s: Chord) => s.artistId).filter(Boolean))
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

                const artistStatsMap = new Map<string, ArtistStats>();
                const categoryStatsMap = new Map<string, CategoryStats>();
                let totalViews = 0;

                allChords.forEach((chord: Chord) => {
                    totalViews += chord.views || 0;

                    const artistId = chord.artistId;
                    const artistName = chord.artistName || 'Không có nghệ sĩ';
                    const artistInfo = newMap[artistId];

                    if (artistStatsMap.has(artistId)) {
                        const existing = artistStatsMap.get(artistId)!;
                        existing.totalViews += chord.views || 0;
                        existing.songCount += 1;
                        existing.songs.push(chord);
                        if (chord.views > (existing.topSong?.views || 0)) {
                            existing.topSong = chord;
                        }
                    } else {
                        artistStatsMap.set(artistId, {
                            artistId,
                            artistName: artistInfo?.name || artistName,
                            totalViews: chord.views || 0,
                            songCount: 1,
                            songs: [chord],
                            topSong: chord,
                            imageUrl: artistInfo?.imageUrl,
                            description: artistInfo?.description
                        });
                    }

                    const categoryId = chord.categoryId || 'unknown';
                    const categoryName = chord.categoryName || 'Khác';
                    if (categoryStatsMap.has(categoryId)) {
                        const existing = categoryStatsMap.get(categoryId)!;
                        existing.count += 1;
                        existing.totalViews += chord.views || 0;
                    } else {
                        categoryStatsMap.set(categoryId, {
                            categoryId,
                            categoryName,
                            count: 1,
                            totalViews: chord.views || 0
                        });
                    }
                });

                const categoryColorsArray = ['#A155FF', '#2D6CFF', '#00C49F', '#FFBB28', '#FF2D6C', '#845EC2', '#FF6B6B', '#00B4D8'];
                const categoryColorsMap: Record<string, string> = {};
                Array.from(categoryStatsMap.keys()).forEach((id, index) => {
                    categoryColorsMap[id] = categoryColorsArray[index % categoryColorsArray.length];
                });
                setCategoryColors(categoryColorsMap);

                let topArtist: ArtistStats | null = null;
                let maxViews = 0;
                const artistStatsArray: ArtistStats[] = [];
                for (const [_, artist] of artistStatsMap) {
                    artistStatsArray.push(artist);
                    if (artist.totalViews > maxViews) {
                        maxViews = artist.totalViews;
                        topArtist = artist;
                    }
                }

                artistStatsArray.sort((a, b) => b.totalViews - a.totalViews);
                const categoryStatsArray = Array.from(categoryStatsMap.values())
                    .sort((a, b) => b.count - a.count);

                setStats({
                    totalChords,
                    totalArtists: artistStatsMap.size,
                    totalViews,
                    topArtist,
                    topChords: topChords.slice(0, 5),
                    trendingChords: trendingChords.slice(0, 5),
                    recentChords: recentChords.slice(0, 5),
                    artistStats: artistStatsArray.slice(0, 10),
                    categoryStats: categoryStatsArray.slice(0, 8)
                });

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu dashboard:", error);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const categoryData = {
        labels: stats.categoryStats.map(cat =>
            cat.categoryName.length > 10 ? cat.categoryName.slice(0, 10) + '...' : cat.categoryName
        ),
        datasets: [{
            data: stats.categoryStats.map(cat => cat.count),
            backgroundColor: stats.categoryStats.map(cat => categoryColors[cat.categoryId] || '#A155FF'),
            borderWidth: 0,
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 10,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: {
                        size: 11,
                        family: 'Inter, sans-serif',
                    },
                    color: theme === 'dark' ? '#94A3B8' : '#4A5568'
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} bài (${percentage}%)`;
                    }
                }
            }
        },
        cutout: "65%"
    };

    const topArtistsData = {
        labels: stats.artistStats.slice(0, 7).map(artist =>
            artist.artistName.length > 10 ? artist.artistName.slice(0, 10) + '...' : artist.artistName
        ),
        datasets: [{
            label: 'Lượt xem',
            data: stats.artistStats.slice(0, 7).map(artist => artist.totalViews),
            backgroundColor: [
                '#FF2D6C',
                '#FF8F2D',
                '#A155FF',
                '#2D6CFF',
                '#00C49F',
                '#FF6B6B',
                '#845EC2'
            ],
            borderColor: theme === 'dark' ? '#1e293b' : '#fff',
            borderWidth: 2,
        }]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${formatNumber(context.parsed.y)} lượt xem`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: theme === 'dark' ? '#1E293B' : '#EDF2F7',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 10,
                        family: 'Inter, sans-serif',
                    },
                    color: theme === 'dark' ? '#94A3B8' : '#A0AEC0',
                    callback: function (value: any) {
                        return formatNumber(value);
                    }
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 10,
                        family: 'Inter, sans-serif',
                    },
                    color: theme === 'dark' ? '#94A3B8' : '#A0AEC0',
                },
            },
        },
    };

    if (loading) {
        return (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200 text-slate-850 dark:text-slate-100">
                <div className="flex items-center justify-center min-h-[60vh] w-full">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#A155FF] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-400 font-medium">Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200 text-slate-850 dark:text-slate-100">
                <div className="flex items-center justify-center min-h-[60vh] w-full">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-300 font-medium">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-[#A155FF] hover:bg-[#8B3FE0] text-white"
                        >
                            Thử lại
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200 text-slate-850 dark:text-slate-100">
            <div className="space-y-8 w-full">
                {/* Header Title & Export Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-150 dark:border-slate-800 pb-5">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Bảng điều khiển Admin
                        </h1>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                            Tổng hợp và báo cáo số liệu hoạt động của hệ thống
                        </p>
                    </div>
                    <button
                        onClick={() => exportDashboardToExcel(stats, artistsMap)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors border-none cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Xuất Excel</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 shadow-sm border border-gray-50 dark:border-slate-800 hover:shadow-md transition-all rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{formatNumber(stats.totalChords)}</div>
                                <div className="text-xs text-gray-400 dark:text-slate-400 font-medium mt-1">Tổng hợp âm</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Music className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 shadow-sm border border-gray-50 dark:border-slate-800 hover:shadow-md transition-all rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalArtists}</div>
                                <div className="text-xs text-gray-400 dark:text-slate-400 font-medium mt-1">Tổng nghệ sĩ</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Users className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 shadow-sm border border-gray-50 dark:border-slate-800 hover:shadow-md transition-all rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{formatNumber(stats.totalViews)}</div>
                                <div className="text-xs text-gray-400 dark:text-slate-400 font-medium mt-1">Tổng lượt xem</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 shadow-sm border border-gray-50 dark:border-slate-800 hover:shadow-md transition-all rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.categoryStats.length}</div>
                                <div className="text-xs text-gray-400 dark:text-slate-400 font-medium mt-1">Thể loại</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Layers className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 shadow-sm border border-gray-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Top nghệ sĩ</h3>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Nghệ sĩ có nhiều lượt xem nhất</p>
                            </div>
                            <BarChart3 className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        </div>
                        <div className="h-64 w-full">
                            {stats.artistStats.length > 0 ? (
                                <Bar data={topArtistsData} options={barOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm">
                                    Chưa có dữ liệu nghệ sĩ
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 shadow-sm border border-gray-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Phân phối theo thể loại</h3>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Số lượng hợp âm theo thể loại</p>
                            </div>
                            <PieChart className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                        </div>
                        <div className="h-64 w-full">
                            {stats.categoryStats.length > 0 ? (
                                <Doughnut data={categoryData} options={doughnutOptions} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm">
                                    Chưa có dữ liệu thể loại
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 shadow-sm border border-gray-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Hợp âm thịnh hành</h3>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Top bài hát được xem nhiều nhất</p>
                            </div>
                            <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="space-y-3">
                            {stats.topChords.slice(0, 5).map((chord, index) => {
                                const artistInfo = artistsMap[chord.artistId];
                                return (
                                    <div
                                        key={chord.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/40 hover:bg-gray-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/song/${chord.id}`)}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[#A155FF]/10 flex items-center justify-center text-sm font-bold text-[#A155FF]">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-800 dark:text-slate-200 truncate">{chord.title}</p>
                                            <p className="text-xs text-gray-400 dark:text-slate-400 truncate">
                                                {artistInfo?.name || chord.artistName || 'Nghệ sĩ'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                                            <Eye className="w-3 h-3" />
                                            {formatNumber(chord.views)}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            {new Date(chord.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 shadow-sm border border-gray-50 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 dark:text-slate-200 uppercase tracking-wider">Hợp âm mới</h3>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Cập nhật gần đây</p>
                            </div>
                            <Zap className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="space-y-3">
                            {stats.recentChords.slice(0, 5).map((chord) => {
                                const artistInfo = artistsMap[chord.artistId];
                                return (
                                    <div
                                        key={chord.id}
                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/song/${chord.id}`)}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A155FF]/20 to-[#2D6CFF]/20 flex items-center justify-center flex-shrink-0">
                                            <Disc3 className="w-5 h-5 text-[#A155FF]/60" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-800 dark:text-slate-200 truncate">{chord.title}</p>
                                            <p className="text-xs text-gray-400 dark:text-slate-400 truncate">
                                                {artistInfo?.name || chord.artistName || 'Nghệ sĩ'}
                                            </p>
                                        </div>
                                        <div className="text-[10px] text-gray-400 dark:text-slate-500 flex-shrink-0">
                                            {new Date(chord.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {stats.trendingChords.length > 0 && (
                    <div className="bg-white dark:bg-[#121212] p-8 rounded-none shadow-sm dark:shadow-xl border border-slate-100 dark:border-zinc-850/50 transition-colors duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Những bài hát thịnh hành</h3>
                                <p className="text-xs text-gray-400 dark:text-zinc-400 mt-1">Hợp âm và bài hát được nghe nhiều nhất tuần này</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {stats.trendingChords.slice(0, 5).map((chord) => {
                                const artistInfo = artistsMap[chord.artistId];
                                return (
                                    <div
                                        key={chord.id}
                                        className="group bg-gray-50 dark:bg-[#181818] hover:bg-gray-100 dark:hover:bg-[#282828] p-4 rounded-xl transition-all duration-300 cursor-pointer flex flex-col relative shadow-sm hover:shadow-md dark:shadow-md dark:hover:shadow-xl"
                                        onClick={() => navigate(`/song/${chord.id}`)}
                                    >
                                        <div className="w-full aspect-square rounded-lg overflow-hidden relative">
                                            {artistInfo?.imageUrl ? (
                                                <img src={artistInfo.imageUrl} alt={chord.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                                                    <Disc3 className="w-10 h-10 text-zinc-400 dark:text-zinc-650 animate-pulse" />
                                                </div>
                                            )}
                                            {/* Hover play button - color becomes primary when hovered */}
                                            <div className="absolute bottom-3 right-3 w-10 h-10 bg-white hover:bg-[var(--primary-color)] text-zinc-900 hover:text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 z-10 border border-zinc-200/50 hover:border-transparent">
                                                <Play size={18} fill="currentColor" className="ml-0.5" />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex-1 flex flex-col min-w-0">
                                            <p className="font-bold text-sm text-gray-800 dark:text-white truncate transition-colors duration-200 group-hover:text-[var(--primary-color)]">{chord.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 truncate">{artistInfo?.name || chord.artistName || 'Nghệ sĩ'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}