import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
    Music,
    Search,
    Plus,
    X,
    Eye,
    Pencil,
    Trash2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Headphones,
    MicOff,
    ListMusic
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
import instance from "../../../config/axios";
import { getUserInfo } from "../../../utils/auth";
import { type Chord } from "../../../types/chord";

const SongManagement = () => {
    const navigate = useNavigate();

    // Loading & Error States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    // Song List States
    const [allChords, setAllChords] = useState<Chord[]>([]);
    const [songTab, setSongTab] = useState<'withAudio' | 'withoutAudio'>('withAudio');
    const [songPage, setSongPage] = useState<number>(0);
    const [songSearch, setSongSearch] = useState<string>("");

    // Modal Form States
    const [categories, setCategories] = useState<any[]>([]);
    const [showSongModal, setShowSongModal] = useState(false);
    const [editingSong, setEditingSong] = useState<Chord | null>(null);
    const [songForm, setSongForm] = useState({
        title: "",
        artistName: "",
        categoryId: "",
        content: "",
        youtubeUrl: "",
        isPublic: true
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const userData = await getUserInfo();
            setUser(userData);

            if (!userData?.id) {
                setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.");
                setLoading(false);
                return;
            }

            const [chordsRes, categoriesRes] = await Promise.all([
                instance.get(`/chords?size=1000`),
                instance.get(`/categories`)
            ]);

            const allSystemChords = chordsRes.data?.result?.data || chordsRes.data?.data || [];
            setAllChords(allSystemChords);

            const categoriesData = categoriesRes.data?.data || categoriesRes.data?.result || categoriesRes.data || [];
            setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        } catch (err: any) {
            setError(err?.message || "Có lỗi xảy ra khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter and Pagination Logic
    const filteredSongs = allChords.filter(chord => {
        const hasAudio = chord.audio !== null && chord.audio !== undefined;
        const matchesTab = songTab === 'withAudio' ? hasAudio : !hasAudio;

        const matchesSearch = songSearch.trim() === "" ||
            chord.title.toLowerCase().includes(songSearch.toLowerCase()) ||
            (chord.artistName && chord.artistName.toLowerCase().includes(songSearch.toLowerCase())) ||
            (chord.categoryName && chord.categoryName.toLowerCase().includes(songSearch.toLowerCase()));

        return matchesTab && matchesSearch;
    });

    const SONGS_PER_PAGE = 8;
    const totalSongPages = Math.ceil(filteredSongs.length / SONGS_PER_PAGE);
    const safeSongPage = Math.min(Math.max(0, songPage), Math.max(0, totalSongPages - 1));
    const paginatedSongs = filteredSongs.slice(safeSongPage * SONGS_PER_PAGE, (safeSongPage + 1) * SONGS_PER_PAGE);

    const handleSongTabChange = (tab: 'withAudio' | 'withoutAudio') => {
        setSongTab(tab);
        setSongPage(0);
    };

    const handleDeleteSong = async (id: string, title: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa bài hát "${title}" không?`)) {
            try {
                await instance.delete(`/chords/${id}`);
                toast.success("Xóa bài hát thành công!");
                fetchData();
            } catch (err) {
                console.error("Xóa bài hát thất bại:", err);
                toast.error("Xóa bài hát thất bại. Vui lòng thử lại.");
            }
        }
    };

    const handleOpenAddSong = () => {
        setEditingSong(null);
        setSongForm({
            title: "",
            artistName: "",
            categoryId: categories.length > 0 ? categories[0].id : "",
            content: "",
            youtubeUrl: "",
            isPublic: true
        });
        setShowSongModal(true);
    };

    const handleOpenEditSong = (song: Chord) => {
        setEditingSong(song);
        setSongForm({
            title: song.title || "",
            artistName: song.artistName || "",
            categoryId: song.categoryId || (song.category && song.category.id) || "",
            content: song.content || "",
            youtubeUrl: song.youtubeUrl || "",
            isPublic: song.isPublic
        });
        setShowSongModal(true);
    };

    const handleSaveSong = async () => {
        if (!songForm.title.trim()) {
            toast.warn("Vui lòng nhập tên bài hát");
            return;
        }
        if (!songForm.artistName.trim()) {
            toast.warn("Vui lòng nhập tên nghệ sĩ");
            return;
        }
        if (!songForm.categoryId) {
            toast.warn("Vui lòng chọn thể loại");
            return;
        }
        if (!songForm.content.trim()) {
            toast.warn("Vui lòng nhập nội dung hợp âm");
            return;
        }
        try {
            const payload = {
                title: songForm.title,
                content: songForm.content,
                contentPlusChord: songForm.content,
                categoryId: songForm.categoryId,
                artistName: songForm.artistName,
                youtubeUrl: songForm.youtubeUrl || "",
                userId: user?.id,
                isPublic: songForm.isPublic
            };
            if (editingSong) {
                await instance.put(`/chords/${editingSong.id}`, payload);
                toast.success("Cập nhật bài hát thành công!");
            } else {
                await instance.post(`/chords`, payload);
                toast.success("Thêm bài hát mới thành công!");
            }
            setShowSongModal(false);
            fetchData();
        } catch (err: any) {
            console.error("Lưu bài hát thất bại:", err);
            const errMsg = err.response?.data?.message || "Lưu bài hát thất bại. Vui lòng thử lại.";
            toast.error(errMsg);
        }
    };

    const formatNumber = (num: number) => {
        if (!num) return "0";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    if (loading) {
        return (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200 text-slate-850 dark:text-slate-100">
                <div className="flex items-center justify-center min-h-[60vh] w-full">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-[#A155FF] animate-spin" />
                        <p className="text-sm text-gray-400 font-medium">Đang tải dữ liệu bài hát...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200 text-slate-850 dark:text-slate-100">
                <div className="flex items-center justify-center min-h-[60vh] w-full p-4 text-center">
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-6 rounded-2xl max-w-md">
                        <Music className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-1">Không thể tải dữ liệu</h3>
                        <p className="text-sm text-red-600 dark:text-red-300/80 mb-4">{error}</p>
                        <Button onClick={fetchData} className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg">
                            Thử lại
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const totalChordsCount = allChords.length;
    const withAudioCount = allChords.filter(c => c.audio != null).length;
    const withoutAudioCount = allChords.filter(c => c.audio == null).length;

    return (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200 text-slate-850 dark:text-slate-100">
            <div className="space-y-6 w-full">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                            Quản lý bài hát hệ thống
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Xem, thêm, sửa, xóa toàn bộ danh sách hợp âm và lời bài hát trên hệ thống.
                        </p>
                    </div>
                    <Button
                        onClick={handleOpenAddSong}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-150 dark:shadow-none h-10 py-2 px-4 text-sm font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all duration-300 self-start sm:self-center"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm bài hát mới
                    </Button>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 shadow-xs rounded-xl">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                                <Music className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 uppercase tracking-wider">Tổng bài hát</p>
                                <h3 className="text-2xl font-bold text-slate-850 dark:text-white mt-0.5">{totalChordsCount}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 shadow-xs rounded-xl">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                                <Headphones className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 uppercase tracking-wider">Có Audio</p>
                                <h3 className="text-2xl font-bold text-slate-850 dark:text-white mt-0.5">{withAudioCount}</h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 shadow-xs rounded-xl">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                                <MicOff className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-405 dark:text-slate-500 uppercase tracking-wider">Không có Audio</p>
                                <h3 className="text-2xl font-bold text-slate-850 dark:text-white mt-0.5">{withoutAudioCount}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Card Table */}
                <div className="bg-white dark:bg-slate-900 shadow-sm  rounded-2xl space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start">
                            <button
                                onClick={() => handleSongTabChange('withAudio')}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all duration-200 cursor-pointer ${songTab === 'withAudio'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                Có Audio ({withAudioCount})
                            </button>
                            <button
                                onClick={() => handleSongTabChange('withoutAudio')}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all duration-200 cursor-pointer ${songTab === 'withoutAudio'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                Không có Audio ({withoutAudioCount})
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm bài hát..."
                                value={songSearch}
                                onChange={(e) => {
                                    setSongSearch(e.target.value);
                                    setSongPage(0);
                                }}
                                className="pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-800 border-slate-250 dark:border-slate-700 focus:border-indigo-500 transition-all duration-300 w-full rounded-xl"
                            />
                            {songSearch && (
                                <button
                                    onClick={() => {
                                        setSongSearch("");
                                        setSongPage(0);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border border-gray-100 dark:border-slate-800/80 rounded-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-gray-100 dark:border-slate-800">
                                    <th className="py-3 px-4 w-12 text-center">#</th>
                                    <th className="py-3 px-4">Tên bài hát</th>
                                    <th className="py-3 px-4">Nghệ sĩ</th>
                                    <th className="py-3 px-4">Thể loại</th>
                                    <th className="py-3 px-4 text-center">Lượt xem</th>
                                    <th className="py-3 px-4 text-center w-28">Trạng thái</th>
                                    <th className="py-3 px-4 text-center w-32">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-sm text-gray-700 dark:text-slate-350">
                                {paginatedSongs.map((chord, idx) => {
                                    const globalIdx = safeSongPage * SONGS_PER_PAGE + idx + 1;
                                    return (
                                        <tr key={chord.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/35 transition-colors duration-150">
                                            <td className="py-3.5 px-4 text-center text-gray-400 font-medium">{globalIdx}</td>
                                            <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                                                {chord.title}
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-600 dark:text-slate-300 font-medium">
                                                {chord.artistName || 'Chưa cập nhật'}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {chord.categoryName ? (
                                                    <Badge variant="outline" className="text-[10px] font-semibold border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                                        {chord.categoryName}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-semibold text-slate-850 dark:text-slate-300">
                                                {formatNumber(chord.views)}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {chord.isPublic ? (
                                                    <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900/30 text-[10px] font-bold py-0.5">
                                                        Công khai
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 border border-amber-200 dark:border-amber-900/30 text-[10px] font-bold py-0.5">
                                                        Riêng tư
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/song/${chord.id}`)}
                                                        className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-1 h-8 w-8 flex items-center justify-center rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenEditSong(chord)}
                                                        className="text-indigo-500 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 p-1 h-8 w-8 flex items-center justify-center rounded-md cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteSong(chord.id, chord.title)}
                                                        className="text-rose-500 hover:text-rose-800 dark:text-rose-450 dark:hover:text-rose-250 p-1 h-8 w-8 flex items-center justify-center rounded-md cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredSongs.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-slate-500">
                                            <Music className="w-12 h-12 mx-auto mb-3 text-gray-250 dark:text-slate-700 animate-pulse" />
                                            Không tìm thấy bài hát nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalSongPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-slate-800/80">
                            <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">
                                Hiển thị {safeSongPage * SONGS_PER_PAGE + 1} - {Math.min((safeSongPage + 1) * SONGS_PER_PAGE, filteredSongs.length)} trên tổng số {filteredSongs.length} bài
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSongPage(prev => Math.max(0, prev - 1))}
                                    disabled={safeSongPage === 0}
                                    className="h-8 px-3 border-gray-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                    Trước
                                </Button>

                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: totalSongPages }, (_, i) => {
                                        if (
                                            totalSongPages <= 5 ||
                                            i === 0 ||
                                            i === totalSongPages - 1 ||
                                            Math.abs(i - safeSongPage) <= 1
                                        ) {
                                            const isSelected = i === safeSongPage;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setSongPage(i)}
                                                    className={`w-8 h-8 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer ${isSelected
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            );
                                        } else if (
                                            (i === 1 && safeSongPage > 2) ||
                                            (i === totalSongPages - 2 && safeSongPage < totalSongPages - 3)
                                        ) {
                                            return <span key={i} className="text-gray-400 px-1 font-semibold text-xs">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSongPage(prev => Math.min(totalSongPages - 1, prev + 1))}
                                    disabled={safeSongPage === totalSongPages - 1}
                                    className="h-8 px-3 border-gray-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1 text-xs font-semibold cursor-pointer"
                                >
                                    Sau
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Song Add/Edit Modal */}
                {showSongModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs transition-opacity duration-300">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                                        <Music className="w-5 h-5 text-indigo-550" />
                                        {editingSong ? "Chỉnh sửa bài hát" : "Thêm bài hát mới"}
                                    </h3>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        {editingSong ? "Cập nhật các thông tin chi tiết của bài hát hệ thống" : "Tạo bài hát mới trực tiếp vào hệ thống hợp âm"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowSongModal(false)}
                                    className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body / Form */}
                            <div className="space-y-4 flex-grow pr-1 text-left">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                            Tên bài hát <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Ví dụ: Diễm Xưa"
                                            value={songForm.title}
                                            onChange={(e) => setSongForm({ ...songForm, title: e.target.value })}
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-indigo-550 focus:ring-indigo-550 text-sm h-10 transition-all"
                                        />
                                    </div>

                                    {/* Artist */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                            Tên nghệ sĩ / Ca sĩ <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Ví dụ: Trịnh Công Sơn"
                                            value={songForm.artistName}
                                            onChange={(e) => setSongForm({ ...songForm, artistName: e.target.value })}
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-indigo-550 focus:ring-indigo-550 text-sm h-10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                            Thể loại nhạc <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={songForm.categoryId}
                                            onChange={(e) => setSongForm({ ...songForm, categoryId: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-750 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-550 focus:border-indigo-550 transition-all cursor-pointer"
                                        >
                                            <option value="">-- Chọn thể loại --</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Youtube URL */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                            Đường dẫn Youtube (Không bắt buộc)
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Ví dụ: https://www.youtube.com/watch?v=..."
                                            value={songForm.youtubeUrl}
                                            onChange={(e) => setSongForm({ ...songForm, youtubeUrl: e.target.value })}
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-indigo-550 focus:ring-indigo-550 text-sm h-10 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                                        Lời bài hát kèm hợp âm <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Nhập lời bài hát và chèn hợp âm dạng [C], [Am], [F], [G] vào trước các từ tương ứng..."
                                        rows={8}
                                        value={songForm.content}
                                        onChange={(e) => setSongForm({ ...songForm, content: e.target.value })}
                                        className="flex w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-750 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-550 focus:border-indigo-550 font-mono transition-all resize-y min-h-[150px]"
                                    />
                                </div>

                                {/* Status (isPublic) */}
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850">
                                    <input
                                        type="checkbox"
                                        id="isPublicToggle"
                                        checked={songForm.isPublic}
                                        onChange={(e) => setSongForm({ ...songForm, isPublic: e.target.checked })}
                                        className="w-4.5 h-4.5 text-indigo-650 bg-white border-slate-350 rounded-sm focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                                    />
                                    <div>
                                        <label htmlFor="isPublicToggle" className="text-sm font-semibold text-slate-750 dark:text-slate-200 cursor-pointer select-none">
                                            Công khai bài hát này
                                        </label>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                            Nếu bật, tất cả người dùng hệ thống sẽ tìm thấy bài hát này. Nếu tắt, bài hát sẽ hiển thị dạng Riêng tư.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    onClick={() => setShowSongModal(false)}
                                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-all font-semibold h-9 px-4 rounded-lg cursor-pointer"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={handleSaveSong}
                                    className="bg-indigo-650 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none transition-all font-semibold h-9 px-4 rounded-lg cursor-pointer"
                                >
                                    {editingSong ? "Cập nhật" : "Lưu bài hát"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};

export default SongManagement;
