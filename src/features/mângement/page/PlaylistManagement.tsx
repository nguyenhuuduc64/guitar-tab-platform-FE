import { useNavigate } from "react-router-dom";
import {
    Library,
    Users,
    Eye,
    Music,
    Calendar,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    ChevronRight,
    Crown,
    ArrowRight,
    BarChart3,
    Clock,
    Disc3,
    Star,
    TrendingUp,
    Layers,
    BookOpen,
    User as UserIcon,
    FolderOpen,
    Heart,
    Loader2,
    X,
    List,
    Grid,
    Info,
    ListMusic,
    PieChart
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";
import {
    Bar,
    Doughnut,
    Line
} from "react-chartjs-2";
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
    BarElement
} from "chart.js";
import instance from "../../../config/axios";
import { getUserInfo } from "../../../utils/auth";
import { getArtistById } from "../../../services/artistService";
import type { User } from "../../../types/user";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { type Chord } from "../../../types/chord";
import { type ArtistStat } from "../../../types/artist";
import { type Playlist, type PlaylistStats } from "../../../types/playlist";

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
    BarElement
);

type PopupTab = 'overview' | 'songs';

export default function PlaylistManagement() {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<PopupTab>('overview');
    const [stats, setStats] = useState<PlaylistStats>({
        totalPlaylists: 0,
        totalChords: 0,
        totalViews: 0,
        totalArtists: 0,
        topPlaylists: [],
        recentPlaylists: [],
        artistStats: [],
        playlistsByCategory: {}
    });
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [artistsMap, setArtistsMap] = useState<Record<string, { name: string; imageUrl?: string }>>({});
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [contentHeight, setContentHeight] = useState<number>(400);
    const overviewRef = useRef<HTMLDivElement>(null);
    const songsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const userData = await getUserInfo();
                setUser(userData);

                if (!userData?.id) {
                    setError("Không tìm thấy thông tin người dùng");
                    setLoading(false);
                    return;
                }

                const [playlistsRes, chordsAllRes] = await Promise.all([
                    instance.get(`/playlists`),
                    instance.get(`/chords?size=1000`)
                ]);

                const allSystemChords = chordsAllRes.data?.result?.data || [];
                const chordsMap = new Map<string, any>();
                allSystemChords.forEach((c: any) => {
                    chordsMap.set(c.id, c);
                });

                let playlistsData = [];
                if (playlistsRes.data?.result) {
                    playlistsData = Array.isArray(playlistsRes.data.result)
                        ? playlistsRes.data.result
                        : [playlistsRes.data.result];
                } else if (Array.isArray(playlistsRes.data)) {
                    playlistsData = playlistsRes.data;
                }

                if (playlistsData.length === 0) {
                    setPlaylists([]);
                    setStats({
                        totalPlaylists: 0,
                        totalChords: 0,
                        totalViews: 0,
                        totalArtists: 0,
                        topPlaylists: [],
                        recentPlaylists: [],
                        artistStats: [],
                        playlistsByCategory: {}
                    });
                    setLoading(false);
                    return;
                }

                const playlistDetails = await Promise.all(
                    playlistsData.map(async (col: any) => {
                        try {
                            const detailRes = await instance.get(`/playlists/${col.id}`);
                            const detail = detailRes.data?.result || col;
                            const rawChords = detail.chords || [];

                            const chords = rawChords.map((rc: any) => {
                                const systemChord = chordsMap.get(rc.id);
                                return {
                                    ...rc,
                                    artistId: systemChord?.artistId || '',
                                    artistName: systemChord?.artistName || rc.artistName || 'Chưa cập nhật',
                                    categoryName: systemChord?.categoryName || rc.categoryName || 'Khác',
                                    createdAt: systemChord?.createdAt || rc.createdAt,
                                    updatedAt: systemChord?.updatedAt || rc.updatedAt
                                };
                            });

                            const totalViews = chords.reduce((sum: number, chord: any) => sum + (chord.views || 0), 0);
                            const artistSet = new Set(chords.map((c: any) => c.artistId).filter(Boolean));

                            return {
                                ...detail,
                                totalViews,
                                chordCount: chords.length,
                                artistCount: artistSet.size,
                                chords
                            };
                        } catch (err) {
                            return {
                                ...col,
                                chords: [],
                                totalViews: 0,
                                chordCount: 0,
                                artistCount: 0
                            };
                        }
                    })
                );

                const sortedPlaylists = [...playlistDetails].sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0));
                setPlaylists(sortedPlaylists);

                const allChords = playlistDetails.flatMap(col => col.chords || []);
                const totalViews = allChords.reduce((sum, chord) => sum + (chord.views || 0), 0);
                const uniqueArtists = new Set(allChords.map(c => c.artistId).filter(Boolean));

                const artistIds = Array.from(uniqueArtists) as string[];
                const artistResults = await Promise.all(
                    artistIds.map(async (id) => {
                        try {
                            const res = await getArtistById(id);
                            return { id, name: res?.name || "Chưa cập nhật", imageUrl: res?.imageUrl };
                        } catch {
                            return { id, name: "Chưa cập nhật", imageUrl: "" };
                        }
                    })
                );

                const newMap: Record<string, { name: string; imageUrl?: string }> = {};
                artistResults.forEach(item => {
                    newMap[item.id] = { name: item.name, imageUrl: item.imageUrl };
                });
                setArtistsMap(newMap);

                const artistStatsMap = new Map<string, ArtistStat>();
                playlistDetails.forEach(col => {
                    (col.chords || []).forEach((chord: Chord) => {
                        const artistId = chord.artistId;
                        if (!artistId) return;

                        if (artistStatsMap.has(artistId)) {
                            const existing = artistStatsMap.get(artistId)!;
                            existing.playlistCount += 1;
                            existing.totalViews += chord.views || 0;
                            existing.chordCount += 1;
                            if (chord.views > (existing.topChord?.views || 0)) {
                                existing.topChord = chord;
                            }
                        } else {
                            artistStatsMap.set(artistId, {
                                artistId,
                                artistName: newMap[artistId]?.name || chord.artistName || "Unknown",
                                imageUrl: newMap[artistId]?.imageUrl,
                                playlistCount: 1,
                                totalViews: chord.views || 0,
                                chordCount: 1,
                                topChord: chord
                            });
                        }
                    });
                });

                const recentPlaylists = [...playlistDetails].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                const categoryCount: Record<string, number> = {};
                allChords.forEach(chord => {
                    if (chord.categoryName) {
                        categoryCount[chord.categoryName] = (categoryCount[chord.categoryName] || 0) + 1;
                    }
                });

                const finalStats = {
                    totalPlaylists: playlistDetails.length,
                    totalChords: allChords.length,
                    totalViews,
                    totalArtists: uniqueArtists.size,
                    topPlaylists: sortedPlaylists.slice(0, 5),
                    recentPlaylists: recentPlaylists.slice(0, 5),
                    artistStats: Array.from(artistStatsMap.values()).sort((a, b) => b.playlistCount - a.playlistCount),
                    playlistsByCategory: categoryCount
                };

                setStats(finalStats);

            } catch (error: any) {
                setError(error?.message || "Có lỗi xảy ra khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'overview' && overviewRef.current) {
            const height = overviewRef.current.scrollHeight;
            setContentHeight(Math.max(height, 400));
        } else if (activeTab === 'songs' && songsRef.current) {
            const height = songsRef.current.scrollHeight;
            setContentHeight(Math.max(height, 400));
        }
    }, [activeTab, selectedPlaylist]);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatTimeAgo = (dateString: string) => {
        if (!dateString) return "";
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return "Vừa xong";
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const filteredPlaylists = playlists.filter(col =>
        col.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePlaylistClick = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        setActiveTab('overview');
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedPlaylist(null);
        setActiveTab('overview');
    };

    const playlistsViewsData = {
        labels: stats.topPlaylists.map(col =>
            col.name?.length > 10 ? col.name.slice(0, 10) + '...' : col.name || 'Unnamed'
        ),
        datasets: [
            {
                label: 'Lượt xem',
                data: stats.topPlaylists.map(col => col.totalViews || 0),
                backgroundColor: [
                    '#FF2D6C',
                    '#FF8F2D',
                    '#A155FF',
                    '#2D6CFF',
                    '#00C49F'
                ],
                borderColor: [
                    '#FF2D6C',
                    '#FF8F2D',
                    '#A155FF',
                    '#2D6CFF',
                    '#00C49F'
                ],
                borderWidth: 2,
            }
        ]
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
                    },
                    color: theme === 'dark' ? '#94A3B8' : '#A0AEC0',
                },
            },
        },
    };

    const sortedCategories = Object.entries(stats.playlistsByCategory)
        .sort((a, b) => b[1] - a[1]);

    const categoryLabels = sortedCategories.map(([name]) =>
        name.length > 10 ? name.slice(0, 10) + '...' : name
    );
    const categoryData = sortedCategories.map(([_, count]) => count);
    const colors = ['#A155FF', '#2D6CFF', '#00C49F', '#FFBB28', '#FF2D6C', '#845EC2', '#FF6B6B', '#00B4D8'];

    const doughnutData = {
        labels: categoryLabels.length > 0 ? categoryLabels : ['Chưa có dữ liệu'],
        datasets: [
            {
                data: categoryData.length > 0 ? categoryData : [1],
                backgroundColor: categoryData.length > 0
                    ? categoryLabels.map((_, index) => colors[index % colors.length])
                    : ['#E5E7EB'],
                borderWidth: 0,
            }
        ]
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

    const getPlaylistChartData = (playlist: Playlist) => {
        if (!playlist || !playlist.chords || playlist.chords.length === 0) {
            return {
                labels: ['Chưa có dữ liệu'],
                datasets: [
                    {
                        label: 'Lượt xem',
                        data: [0],
                        backgroundColor: ['#E5E7EB'],
                        borderColor: ['#E5E7EB'],
                        borderWidth: 2,
                    }
                ]
            };
        }

        const sortedChords = [...playlist.chords].sort((a, b) => b.views - a.views);
        const topChords = sortedChords.slice(0, 10);

        return {
            labels: topChords.map(chord =>
                chord.title?.length > 15 ? chord.title.slice(0, 15) + '...' : chord.title || 'Unnamed'
            ),
            datasets: [
                {
                    label: 'Lượt xem',
                    data: topChords.map(chord => chord.views || 0),
                    backgroundColor: topChords.map((_, index) => {
                        const hue = (index * 40) % 360;
                        return `hsl(${hue}, 70%, 60%)`;
                    }),
                    borderColor: topChords.map((_, index) => {
                        const hue = (index * 40) % 360;
                        return `hsl(${hue}, 70%, 40%)`;
                    }),
                    borderWidth: 2,
                }
            ]
        };
    };

    const playlistChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.parsed.y} lượt xem`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#EDF2F7',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                    color: '#A0AEC0',
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
                        size: 9,
                    },
                    color: '#A0AEC0',
                },
            },
        },
    };

    if (loading) {
        return (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200 text-slate-850 dark:text-slate-100">
                <div className="flex items-center justify-center min-h-[60vh] w-full">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-[#A155FF] animate-spin" />
                        <p className="text-sm text-gray-400 font-medium">Đang tải dữ liệu playlist...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200 text-slate-850 dark:text-slate-100">
                <div className="flex items-center justify-center min-h-[60vh] w-full">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FolderOpen className="w-8 h-8 text-red-400" />
                        </div>
                        <p className="text-red-500 font-medium">{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Quản lý danh sách hát</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            Quản lý và theo dõi các playlist của bạn
                            {playlists.length > 0 && ` (${playlists.length} playlist)`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-all duration-300 transform hover:scale-105">
                            <Plus className="w-4 h-4 mr-1" />
                            Tạo playlist
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 shadow-sm flex items-center gap-3 border border-gray-50 transition-all duration-300 hover:shadow-md hover:transform hover:scale-105 rounded-xl">
                        <div className="w-11 h-11 rounded-full bg-[#FFE6EE] flex items-center justify-center shrink-0">
                            <Library className="w-5 h-5 text-[#FF2D6C]" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-[#FF2D6C]">{stats.totalPlaylists}</div>
                            <div className="text-xs text-gray-400 font-medium">Playlist</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow-sm flex items-center gap-3 border border-gray-50 transition-all duration-300 hover:shadow-md hover:transform hover:scale-105 rounded-xl">
                        <div className="w-11 h-11 rounded-full bg-[#FFF2E6] flex items-center justify-center shrink-0">
                            <Music className="w-5 h-5 text-[#FF8F2D]" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-[#FF8F2D]">{stats.totalChords}</div>
                            <div className="text-xs text-gray-400 font-medium">Bài hát</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow-sm flex items-center gap-3 border border-gray-50 transition-all duration-300 hover:shadow-md hover:transform hover:scale-105 rounded-xl">
                        <div className="w-11 h-11 rounded-full bg-[#EBF0FF] flex items-center justify-center shrink-0">
                            <Eye className="w-5 h-5 text-[#2D6CFF]" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-[#2D6CFF]">{formatNumber(stats.totalViews)}</div>
                            <div className="text-xs text-gray-400 font-medium">Tổng lượt xem</div>
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow-sm flex items-center gap-3 border border-gray-50 transition-all duration-300 hover:shadow-md hover:transform hover:scale-105 rounded-xl">
                        <div className="w-11 h-11 rounded-full bg-[#E6F9F5] flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-[#00C49F]" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-[#00C49F]">{stats.totalArtists}</div>
                            <div className="text-xs text-gray-400 font-medium">Nghệ sĩ</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Tìm playlist..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white border-gray-200 focus:border-[#A155FF] focus:ring-[#A155FF] transition-all duration-300"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? 'bg-[#A155FF] hover:bg-[#8B3FE0]' : ''}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={viewMode === 'grid' ? 'bg-[#A155FF] hover:bg-[#8B3FE0]' : ''}
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" className="text-gray-600 transition-all duration-300 hover:bg-gray-100">
                            <Filter className="w-4 h-4 mr-1" />
                            Lọc
                        </Button>
                    </div>
                </div>

                <div>
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                        Danh sách playlist ({filteredPlaylists.length})
                    </h2>
                    {filteredPlaylists.length === 0 ? (
                        <div className="text-center py-12 bg-white border border-gray-50">
                            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400">
                                {searchTerm ? 'Không tìm thấy playlist nào' : 'Chưa có playlist nào'}
                            </p>
                            {!searchTerm && (
                                <Button variant="outline" className="mt-3 transition-all duration-300 hover:bg-gray-100">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Tạo playlist đầu tiên
                                </Button>
                            )}
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="bg-white border border-gray-50 overflow-hidden">
                            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <div className="col-span-5">Tên playlist</div>
                                <div className="col-span-2 text-center">Bài hát</div>
                                <div className="col-span-2 text-center">Nghệ sĩ</div>
                                <div className="col-span-2 text-center">Lượt xem</div>
                                <div className="col-span-1 text-right">Ngày tạo</div>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {filteredPlaylists.map((playlist) => (
                                    <div
                                        key={playlist.id}
                                        className="grid grid-cols-12 gap-3 px-4 py-3 hover:bg-gray-50 transition-all duration-200 cursor-pointer items-center"
                                        onClick={() => handlePlaylistClick(playlist)}
                                    >
                                        <div className="col-span-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A155FF]/20 to-[#2D6CFF]/20 flex items-center justify-center flex-shrink-0">
                                                    <Library className="w-5 h-5 text-[#A155FF]/60" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm text-gray-800 truncate">{playlist.name || 'Chưa có tên'}</p>
                                                    {playlist.description && (
                                                        <p className="text-xs text-gray-400 truncate">{playlist.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-center text-sm text-gray-600">
                                            {playlist.chordCount || 0}
                                        </div>
                                        <div className="col-span-2 text-center text-sm text-gray-600">
                                            {playlist.artistCount || 0}
                                        </div>
                                        <div className="col-span-2 text-center text-sm font-medium text-[#A155FF]">
                                            {formatNumber(playlist.totalViews || 0)}
                                        </div>
                                        <div className="col-span-1 text-right text-xs text-gray-400">
                                            {formatTimeAgo(playlist.createdAt)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredPlaylists.map((playlist) => (
                                <Card
                                    key={playlist.id}
                                    className="hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-50 hover:transform hover:scale-105"
                                    onClick={() => handlePlaylistClick(playlist)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-800 truncate">{playlist.name || 'Chưa có tên'}</h3>
                                                {playlist.description && (
                                                    <p className="text-sm text-gray-400 truncate mt-0.5">{playlist.description}</p>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="shrink-0 ml-2">
                                                {playlist.chordCount || 0} bài
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Music className="w-3 h-3" />
                                                {playlist.chordCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {playlist.artistCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {formatNumber(playlist.totalViews || 0)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTimeAgo(playlist.createdAt)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {stats.totalPlaylists > 0 && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white p-6 shadow-sm border border-gray-50 transition-all duration-300 hover:shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                        <BarChart3 className="w-4 h-4 inline mr-2 text-[#A155FF]" />
                                        Playlist có lượt xem cao nhất
                                    </h3>
                                    <Badge variant="outline">Top 5</Badge>
                                </div>
                                <div className="h-64 w-full">
                                    <Bar data={playlistsViewsData} options={barOptions} />
                                </div>
                            </div>

                            <div className="bg-white p-6 shadow-sm border border-gray-50 flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Phân phối theo thể loại</h3>
                                        <p className="text-xs text-gray-400 mt-1">Số lượng hợp âm theo thể loại</p>
                                    </div>
                                    <PieChart className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="h-64 w-full">
                                    {categoryLabels.length > 0 ? (
                                        <Doughnut data={doughnutData} options={doughnutOptions} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                            Chưa có dữ liệu thể loại
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="shadow-sm border-0 bg-white transition-all duration-300 hover:shadow-lg">
                                <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Crown className="w-4 h-4 text-amber-500" />
                                        <CardTitle className="text-sm font-semibold text-gray-900">Nghệ sĩ xuất hiện nhiều nhất</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">Theo playlist</Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100">
                                        {stats.artistStats.slice(0, 5).map((artist, index) => (
                                            <div
                                                key={artist.artistId}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all duration-200 cursor-pointer hover:transform hover:scale-105"
                                                onClick={() => navigate(`/artists/${artist.artistId}`)}
                                            >
                                                <div className="w-8 text-center">
                                                    <span className={`text-sm font-bold ${index === 0 ? 'text-amber-500' :
                                                        index === 1 ? 'text-gray-400' :
                                                            index === 2 ? 'text-amber-600' :
                                                                'text-gray-300'
                                                        }`}>
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A155FF]/20 to-[#2D6CFF]/20 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {artist.imageUrl ? (
                                                        <img src={artist.imageUrl} alt={artist.artistName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="w-5 h-5 text-[#A155FF]/60" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-800 truncate">{artist.artistName}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span>{artist.playlistCount} playlist</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        <span>{artist.chordCount} bài hát</span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-[10px]">
                                                    {formatNumber(artist.totalViews)} views
                                                </Badge>
                                            </div>
                                        ))}
                                        {stats.artistStats.length === 0 && (
                                            <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                                Chưa có dữ liệu nghệ sĩ
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm border-0 bg-white transition-all duration-300 hover:shadow-lg">
                                <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-[#A155FF]" />
                                        <CardTitle className="text-sm font-semibold text-gray-900">Nghệ sĩ nổi bật</CardTitle>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#A155FF]" />
                                            Số playlist
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#00C49F]" />
                                            Tổng lượt xem
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <div className="space-y-4">
                                        {stats.artistStats.slice(0, 8).map((artist) => {
                                            const maxPlaylists = stats.artistStats.length > 0 ? stats.artistStats[0].playlistCount : 1;
                                            const maxViews = stats.artistStats.length > 0 ? stats.artistStats[0].totalViews : 1;
                                            const playlistPercentage = (artist.playlistCount / maxPlaylists) * 100;
                                            const viewsPercentage = (artist.totalViews / maxViews) * 100;

                                            return (
                                                <div
                                                    key={artist.artistId}
                                                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-all duration-200"
                                                    onClick={() => navigate(`/artists/${artist.artistId}`)}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A155FF]/20 to-[#2D6CFF]/20 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {artist.imageUrl ? (
                                                            <img src={artist.imageUrl} alt={artist.artistName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="w-5 h-5 text-[#A155FF]/60" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium text-sm text-gray-800 truncate">{artist.artistName}</p>
                                                            <span className="text-xs text-gray-400">{artist.playlistCount} playlist</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-[#A155FF] rounded-full transition-all duration-500"
                                                                    style={{ width: `${Math.min(playlistPercentage, 100)}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-[#00C49F] rounded-full transition-all duration-500"
                                                                    style={{ width: `${Math.min(viewsPercentage, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-0.5">
                                                            <span className="text-[10px] text-gray-400">Số playlist</span>
                                                            <span className="text-[10px] text-gray-400">Tổng lượt xem: {formatNumber(artist.totalViews)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>

            {showPopup && selectedPlaylist && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
                        <button
                            onClick={closePopup}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900">{selectedPlaylist.name}</h2>
                            {selectedPlaylist.description && (
                                <p className="text-sm text-gray-400 mt-1">{selectedPlaylist.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Music className="w-3 h-3" />
                                    {selectedPlaylist.chordCount || 0} bài hát
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {selectedPlaylist.artistCount || 0} nghệ sĩ
                                </span>
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {formatNumber(selectedPlaylist.totalViews || 0)} lượt xem
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(selectedPlaylist.createdAt)}
                                </span>
                            </div>
                        </div>

                        <div className="border-b border-gray-200">
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === 'overview'
                                        ? 'border-[#A155FF] text-[#A155FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Info className="w-4 h-4 inline mr-2" />
                                    Tổng quan
                                </button>
                                <button
                                    onClick={() => setActiveTab('songs')}
                                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${activeTab === 'songs'
                                        ? 'border-[#A155FF] text-[#A155FF]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <ListMusic className="w-4 h-4 inline mr-2" />
                                    Danh sách bài hát
                                    {selectedPlaylist.chords && selectedPlaylist.chords.length > 0 && (
                                        <Badge variant="outline" className="ml-2 text-[10px]">
                                            {selectedPlaylist.chords.length}
                                        </Badge>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-4" style={{ minHeight: `${contentHeight}px` }}>
                            {activeTab === 'overview' ? (
                                <div ref={overviewRef}>
                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                                <BarChart3 className="w-4 h-4 inline mr-2 text-[#A155FF]" />
                                                Lượt xem các bài hát
                                            </h3>
                                            <Badge variant="outline">
                                                {selectedPlaylist.chords?.length || 0} bài hát
                                            </Badge>
                                        </div>
                                        <div className="h-80 w-full">
                                            <Bar data={getPlaylistChartData(selectedPlaylist)} options={playlistChartOptions} />
                                        </div>
                                    </div>

                                    {selectedPlaylist.chords && selectedPlaylist.chords.length > 0 && (
                                        <div className="border-t border-gray-100 pt-4 mt-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Top bài hát có lượt xem cao nhất</h4>
                                            <div className="space-y-2">
                                                {[...selectedPlaylist.chords]
                                                    .sort((a, b) => b.views - a.views)
                                                    .slice(0, 10)
                                                    .map((chord, index) => (
                                                        <div key={chord.id} className="flex items-center justify-between text-sm py-2 px-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg">
                                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                <span className="text-gray-400 w-6 text-center font-medium">{index + 1}</span>
                                                                <span className="truncate text-gray-700">{chord.title || 'Không tên'}</span>
                                                                {chord.artistName && (
                                                                    <span className="text-xs text-gray-400 shrink-0">- {chord.artistName}</span>
                                                                )}
                                                                {chord.categoryName && (
                                                                    <Badge variant="outline" className="text-[10px] shrink-0">
                                                                        {chord.categoryName}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-[#A155FF] font-semibold shrink-0 ml-4">{formatNumber(chord.views)}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                            {selectedPlaylist.chords.length > 10 && (
                                                <div className="text-center text-xs text-gray-400 mt-2">
                                                    Hiển thị 10/{selectedPlaylist.chords.length} bài hát
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div ref={songsRef}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                                            <ListMusic className="w-4 h-4 inline mr-2 text-[#A155FF]" />
                                            Tất cả bài hát trong playlist
                                        </h3>
                                        <Badge variant="outline">
                                            {selectedPlaylist.chords?.length || 0} bài hát
                                        </Badge>
                                    </div>
                                    {selectedPlaylist.chords && selectedPlaylist.chords.length > 0 ? (
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                            {[...selectedPlaylist.chords]
                                                .sort((a, b) => b.views - a.views)
                                                .map((chord, index) => (
                                                    <div
                                                        key={chord.id}
                                                        className="flex items-center justify-between text-sm py-3 px-4 hover:bg-gray-50 transition-colors duration-200 rounded-lg border border-gray-50 hover:border-gray-200 cursor-pointer"
                                                        onClick={() => {
                                                            closePopup();
                                                            navigate(`/song/${chord.id}`);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                                            <span className="text-gray-400 w-8 text-center font-medium">{index + 1}</span>
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A155FF]/20 to-[#2D6CFF]/20 flex items-center justify-center flex-shrink-0">
                                                                <Disc3 className="w-5 h-5 text-[#A155FF]/60" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-medium text-gray-800 truncate">{chord.title || 'Không tên'}</p>
                                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                    {chord.artistName && (
                                                                        <span>{chord.artistName}</span>
                                                                    )}
                                                                    {chord.categoryName && (
                                                                        <>
                                                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                            <span>{chord.categoryName}</span>
                                                                        </>
                                                                    )}
                                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                    <span>{formatTimeAgo(chord.createdAt)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                <Eye className="w-3 h-3" />
                                                                {formatNumber(chord.views)}
                                                            </span>
                                                            <ChevronRight className="w-4 h-4 text-gray-300" />
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <Music className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>Chưa có bài hát nào trong playlist này</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                            <Button
                                onClick={closePopup}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all duration-300"
                            >
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}