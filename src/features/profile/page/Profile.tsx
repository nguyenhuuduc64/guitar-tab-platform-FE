import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Loader2,
    ListMusic,
    Edit2,
    ChevronRight,
    Play,
    MoreHorizontal,
    Shuffle,
    SkipBack,
    SkipForward,
    Repeat,
    Volume2,
    Eye,
    User as UserIcon,
    Music,
    Disc3,
    Library,
    MessageCircle,
    Flame, Heart
} from "lucide-react";
import instance from "../../../config/axios";
import { useFormStore } from "../../../store/useFormStore";
import { DynamicForm } from "../../../components/common/DynamicForm";
import { userFieldSchema } from "../../../constants/user";
import { type User as UserType } from "../../../types/user";
import { SidebarProfileUser } from "../../../components/common/SidebarProfileUser";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../../components/ui/pagination";
import { getUserInfo } from "../../../utils/auth";

interface AudioResponse {
    id: string;
    url: string;
    title?: string;
    createdAt?: string;
}

interface Chord {
    id: string | number;
    title: string;
    views?: number;
    author?: string;
    hasAudio?: boolean;
    audio?: AudioResponse | null;
    [key: string]: any;
}

interface Playlist {
    id: string | number;
    name: string;
    description?: string;
    chords?: Chord[];
    createdAt: string;
}

interface LikedPost {
    id: string;
    content: string;
    userId: string;
    username?: string;
    fullName?: string;
    userImage?: string;
    createdAt: string;
    updatedAt?: string;
    images?: string[];
    [key: string]: any;
}

interface ProfileProps {
    userId?: string | number;
}

const FORM_NAME = "UPDATE_USER_PROFILE";

function Profile({ userId }: ProfileProps) {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [chords, setChords] = useState<Chord[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
    const [likedPostLikeCounts, setLikedPostLikeCounts] = useState<Record<string, number>>({});
    const [likedPostCommentCounts, setLikedPostCommentCounts] = useState<Record<string, number>>({});
    const [likedPostsLoading, setLikedPostsLoading] = useState<boolean>(false);
    const { openForm } = useFormStore();

    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [pageSize] = useState<number>(5);

    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [selectedChordId, setSelectedChordId] = useState<string | number | null>(null);
    const [chordAudios, setChordAudios] = useState<AudioResponse[]>([]);
    const [loadingAudio, setLoadingAudio] = useState<boolean>(false);

    const isOwnProfile = !userId;

    const [likedPage, setLikedPage] = useState<number>(0);
    const likedPageSize = 5;

    useEffect(() => {
        setCurrentPage(0);
        setSelectedPlaylist(null);
        setSelectedChordId(null);
        setLikedPage(0);
    }, [userId]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProfile = async () => {
            try {
                setLoading(true);

                let userData;
                if (isOwnProfile) {
                    userData = await getUserInfo();
                } else {
                    const userRes = await instance.get(`/users/${userId}`, { signal: controller.signal });
                    userData = userRes.data.result;
                }

                setUser(userData);

                if (!userData?.id) {
                    setLoading(false);
                    return;
                }

                const chordRes = await instance.get(`/chords/user/${userData.id}?page=${currentPage}&size=${pageSize}`, {
                    signal: controller.signal
                });

                const chordData = chordRes.data.result?.data || [];

                const audioPromises = chordData.map((chord: Chord) =>
                    instance.get(`/audios/chord/${chord.id}`)
                        .then(res => res.data?.result)
                        .catch(() => null)
                );

                const audioResults = await Promise.all(audioPromises);

                const chordsWithAudio = chordData.map((chord: Chord, index: number) => {
                    const audioData = audioResults[index];

                    let isValidAudio = false;

                    if (audioData !== null && audioData !== undefined && typeof audioData === 'object') {
                        const hasValidId = audioData.id !== null && audioData.id !== undefined;
                        const hasValidUrl = audioData.url !== null && audioData.url !== undefined;
                        isValidAudio = hasValidId || hasValidUrl;
                    }

                    return {
                        ...chord,
                        hasAudio: isValidAudio,
                        audio: isValidAudio ? audioData : null
                    };
                });

                setChords(chordsWithAudio);
                setTotalPages(chordRes.data.result?.totalPages || 0);

                if (userData?.id) {
                    const [playlistRes, likedRes] = await Promise.allSettled([
                        instance.get(`/playlists/user/${userData.id}`, { signal: controller.signal }),
                        instance.get(`/likes/user/${userData.id}`, { signal: controller.signal })
                    ]);

                    if (playlistRes.status === "fulfilled") {
                        setPlaylists(playlistRes.value.data.result || []);
                    }
                    if (likedRes.status === "fulfilled") {
                        const likedPostsData: LikedPost[] = likedRes.value.data.result || [];
                        setLikedPosts(likedPostsData);

                        if (likedPostsData.length > 0) {
                            setLikedPostsLoading(true);
                            const countsPromises = likedPostsData.map(async (post) => {
                                try {
                                    const [likeCountRes, commentCountRes] = await Promise.allSettled([
                                        instance.get(`/likes/post/${post.id}/count`),
                                        instance.get(`/comments/post/${post.id}/count`)
                                    ]);
                                    return {
                                        postId: post.id,
                                        likeCount: likeCountRes.status === 'fulfilled' ? likeCountRes.value.data.result || 0 : 0,
                                        commentCount: commentCountRes.status === 'fulfilled' ? commentCountRes.value.data.result || 0 : 0,
                                    };
                                } catch {
                                    return { postId: post.id, likeCount: 0, commentCount: 0 };
                                }
                            });
                            const countsResults = await Promise.all(countsPromises);
                            const newLikeCounts: Record<string, number> = {};
                            const newCommentCounts: Record<string, number> = {};
                            countsResults.forEach(({ postId, likeCount, commentCount }) => {
                                newLikeCounts[postId] = likeCount;
                                newCommentCounts[postId] = commentCount;
                            });
                            setLikedPostLikeCounts(newLikeCounts);
                            setLikedPostCommentCounts(newCommentCounts);
                            setLikedPostsLoading(false);
                        }
                    }
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError') {
                    console.error(error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        return () => {
            controller.abort();
        };
    }, [userId, currentPage, pageSize, isOwnProfile]);

    const handleToggleChordAudio = async (chordId: string | number) => {
        if (selectedChordId === chordId) {
            setSelectedChordId(null);
            setChordAudios([]);
            return;
        }

        setSelectedChordId(chordId);
        setChordAudios([]);
        setLoadingAudio(true);

        try {
            const res = await instance.get(`/audios/chord/${chordId}`);
            const audioData = res.data?.result;

            let isValidAudio = false;
            if (audioData !== null && audioData !== undefined && typeof audioData === 'object') {
                const hasValidId = audioData.id !== null && audioData.id !== undefined;
                const hasValidUrl = audioData.url !== null && audioData.url !== undefined;
                isValidAudio = hasValidId || hasValidUrl;
            }

            setChordAudios(isValidAudio ? [audioData] : []);
        } catch (error) {
            console.error("Lỗi tải audio:", error);
            setChordAudios([]);
        } finally {
            setLoadingAudio(false);
        }
    };

    const handlePageChange = (pageIndex: number) => {
        if (pageIndex >= 0 && pageIndex < totalPages) {
            setCurrentPage(pageIndex);
        }
    };

    const handleLikedPageChange = (pageIndex: number) => {
        setLikedPage(pageIndex);
    };

    const handleUpdateUser = async (data: UserType) => {
        const targetId = data.id || user?.id;
        if (!targetId) return;
        try {
            const response = await instance.put(`/users/${targetId}`, {
                fullName: data.fullName,
                imageUrl: data.imageUrl,
            });
            if (response?.data?.result) {
                setUser(response.data.result);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const defaultFormValues = useMemo(() => {
        if (!user) return {};
        return {
            fullName: user.fullName || "",
            avatar: user.imageUrl || "",
        };
    }, [user]);

    const { chordsWithAudio, chordsWithoutAudio } = useMemo(() => {
        return chords.reduce(
            (acc, chord) => {
                if (chord.hasAudio) {
                    acc.chordsWithAudio.push(chord);
                } else {
                    acc.chordsWithoutAudio.push(chord);
                }
                return acc;
            },
            { chordsWithAudio: [] as Chord[], chordsWithoutAudio: [] as Chord[] }
        );
    }, [chords]);

    const paginatedLikedPosts = useMemo(() => {
        const start = likedPage * likedPageSize;
        const end = start + likedPageSize;
        return likedPosts.slice(start, end);
    }, [likedPosts, likedPage]);

    const likedTotalPages = Math.ceil(likedPosts.length / likedPageSize);

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

    const handleUnlikePost = async (postId: string) => {
        if (!user?.id) return;
        try {
            await instance.delete(`/likes/post/${postId}/user/${user.id}`);
            setLikedPosts(prev => prev.filter(p => p.id !== postId));
            setLikedPostLikeCounts(prev => ({
                ...prev,
                [postId]: Math.max((prev[postId] || 1) - 1, 0)
            }));
        } catch (err) {
            console.error('Lỗi bỏ like:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex text-gray-800 dark:text-slate-100 font-sans pb-24">
            <div className="w-[var(--sidebar-user-width)] fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800/60 hidden md:block mt-[calc(var(--header-height)_+_36px)]">
                <SidebarProfileUser userId={userId} />
            </div>

            <div className="flex-1 md:pl-[var(--sidebar-user-width)] flex flex-col">
                <main className="p-4 sm:p-6 md:p-8 flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold tracking-wide text-gray-900 dark:text-white">Album</h2>
                        {isOwnProfile && (
                            <button
                                onClick={() => openForm(FORM_NAME)}
                                className="text-xs flex items-center gap-1.5 text-indigo-600 font-medium hover:underline"
                            >
                                <Edit2 size={12} /> Chỉnh sửa
                            </button>
                        )}
                    </div>

                    <div className="space-y-12">
                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-gray-100 dark:bg-slate-800 overflow-hidden border border-gray-200 dark:border-slate-850 shadow-sm relative group mx-auto sm:mx-0">
                                <img
                                    src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=cover"
                                    alt="Ảnh bìa"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 w-full">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bài hát đã tải lên</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">2026</p>
                                </div>

                                {chords.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-2">Chưa có bài hát nào.</p>
                                ) : (
                                    <div className="space-y-8">
                                        {chordsWithAudio.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Music className="w-5 h-5 text-indigo-600" />
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                                                        Có audio ({chordsWithAudio.length})
                                                    </h4>
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                                                    {chordsWithAudio.map((chord) => (
                                                        <div
                                                            key={chord.id}
                                                            onClick={() => navigate(`/song/${chord.id}`)}
                                                            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
                                                        >
                                                            <div className="aspect-square w-full bg-gray-100 dark:bg-slate-800 overflow-hidden relative">
                                                                <img
                                                                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=cover"
                                                                    alt={chord.title}
                                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                                                                        <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-black fill-current translate-x-0.5" />
                                                                    </div>
                                                                </div>
                                                                <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-indigo-600 text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                    <Music className="w-2 h-2 sm:w-3 sm:h-3" />
                                                                    <span className="hidden xs:inline">Audio</span>
                                                                </div>
                                                            </div>
                                                            <div className="p-1.5 sm:p-2 md:p-3">
                                                                <h4 className="text-[10px] sm:text-xs md:text-sm font-bold text-blue-600 truncate mb-0.5 sm:mb-1 hover:underline">
                                                                    {chord.title || "Chưa có tiêu đề"}
                                                                </h4>
                                                                <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 dark:text-slate-400 truncate">
                                                                    {chord.artistName || chord.author || "Chưa cập nhật nghệ sĩ"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {chordsWithoutAudio.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Disc3 className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                                                        Lời bài hát ({chordsWithoutAudio.length})
                                                    </h4>
                                                </div>
                                                <div className="w-full space-y-0.5 overflow-x-auto">
                                                    {chordsWithoutAudio.map((chord, index) => {
                                                        const isChordSelected = selectedChordId === chord.id;
                                                        return (
                                                            <div key={chord.id || index} className="border-b border-gray-100/70 dark:border-slate-800/40 min-w-[600px] sm:min-w-0">
                                                                <div
                                                                    onClick={() => handleToggleChordAudio(chord.id)}
                                                                    className={`grid grid-cols-[30px_2fr_1fr_1fr_80px] items-center py-3 px-2 hover:bg-gray-100/40 dark:hover:bg-slate-800/30 group transition-colors text-sm cursor-pointer ${isChordSelected ? "bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" : ""}`}
                                                                >
                                                                    <div className="flex items-center justify-start text-gray-400">
                                                                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isChordSelected ? "rotate-90 text-indigo-600 dark:text-indigo-400" : ""}`} />
                                                                    </div>
                                                                    <div
                                                                        onClick={(e) => { e.stopPropagation(); navigate(`/song/${chord.id}`); }}
                                                                        className="font-medium text-gray-800 dark:text-slate-200 pr-4 truncate hover:text-indigo-600 hover:underline cursor-pointer"
                                                                    >
                                                                        {chord.title}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-slate-450 flex items-center gap-1 truncate">
                                                                        <UserIcon className="w-3 h-3 shrink-0 text-gray-400 dark:text-slate-500" />
                                                                        {chord.artistName || chord.author || "Unknown"}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                        {chord.views?.toLocaleString() || 0}
                                                                    </div>
                                                                    <div className="flex items-center justify-end gap-4 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                                        <Heart className="w-4 h-4 cursor-pointer hover:text-red-500 hover:fill-red-500 transition-colors" />
                                                                        <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-gray-700" />
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isChordSelected ? "max-h-[300px] opacity-100 py-2 bg-gray-50/50 dark:bg-slate-900/50 pl-8 pr-2" : "max-h-0 opacity-0"}`}
                                                                >
                                                                    <div className="border-l-2 border-dashed border-indigo-200 dark:border-indigo-900/40 pl-4 space-y-1">
                                                                        <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500/80 dark:text-indigo-400/80 mb-1">Audio đã tạo</p>
                                                                        {loadingAudio ? (
                                                                            <div className="flex items-center gap-1 py-1 text-xs text-gray-400 dark:text-slate-500">
                                                                                <Loader2 className="w-3 h-3 animate-spin" /> Đang tải audio...
                                                                            </div>
                                                                        ) : chordAudios.length === 0 ? (
                                                                            <p className="text-xs text-gray-400 py-1">Chưa có file audio nào cho bài hát này.</p>
                                                                        ) : (
                                                                            chordAudios.map((audio, aIdx) => (
                                                                                <div key={audio.id || aIdx} className="flex items-center justify-between py-1.5 px-2 bg-white dark:bg-slate-850 rounded border border-gray-100 dark:border-slate-800 shadow-2xs hover:border-indigo-100 dark:hover:border-indigo-900 group/audio transition-colors text-xs">
                                                                                    <div className="flex items-center gap-2 truncate">
                                                                                        <Music className="w-3 h-3 text-indigo-400" />
                                                                                        <span className="font-medium text-gray-700 dark:text-slate-200 truncate">{audio.title || `Audio #${aIdx + 1}`}</span>
                                                                                    </div>
                                                                                    <button className="p-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                                                                                        <Play className="w-2.5 h-2.5 fill-current" />
                                                                                    </button>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="mt-4 flex justify-center sm:justify-end">
                                        <Pagination>
                                            <PaginationContent className="flex flex-wrap gap-1">
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        size="default"
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                                                        className={currentPage === 0 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>
                                                {[...Array(totalPages)].map((_, idx) => (
                                                    <PaginationItem key={idx}>
                                                        <PaginationLink
                                                            size="default"
                                                            href="#"
                                                            isActive={currentPage === idx}
                                                            onClick={(e) => { e.preventDefault(); handlePageChange(idx); }}
                                                            className="cursor-pointer"
                                                        >
                                                            {idx + 1}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        size="default"
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                                                        className={currentPage === totalPages - 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-gray-100 dark:bg-slate-800 overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm mx-auto sm:mx-0">
                                <img
                                    src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=cover"
                                    alt="Ảnh bìa bộ sưu tập"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 w-full">
                                <div className="mb-4">
                                    <div className="flex items-center gap-2">
                                        <Library className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bộ sưu tập</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{playlists.length} bộ sưu tập</p>
                                </div>

                                <div className="w-full space-y-0.5 overflow-x-auto">
                                    {playlists.length === 0 ? (
                                        <p className="text-sm text-gray-400 py-2">Chưa có bộ sưu tập nào.</p>
                                    ) : (
                                        playlists.map((playlist, index) => {
                                            const isSelected = selectedPlaylist?.id === playlist.id;
                                            return (
                                                <div key={playlist.id || index} className="border-b border-gray-100/70 dark:border-slate-800/40 min-w-[300px] sm:min-w-0">
                                                    <div
                                                        onClick={() => setSelectedPlaylist(isSelected ? null : playlist)}
                                                        className={`grid grid-cols-[30px_1fr_100px] items-center py-3 px-2 hover:bg-gray-100/40 dark:hover:bg-slate-800/30 group transition-colors text-sm cursor-pointer ${isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400" : "text-gray-800 dark:text-slate-200"}`}
                                                    >
                                                        <div className="flex items-center text-gray-400">
                                                            <ListMusic className={`w-4 h-4 ${isSelected ? "text-indigo-600" : ""}`} />
                                                        </div>
                                                        <div className="font-medium truncate">
                                                            {playlist.name}
                                                            <span className="text-xs text-gray-400 font-normal ml-2">({playlist.chords?.length || 0} bài hát)</span>
                                                        </div>
                                                        <div className="flex items-center justify-end text-gray-400">
                                                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSelected ? "rotate-90 text-indigo-600" : ""}`} />
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isSelected ? "max-h-[500px] opacity-100 py-2 bg-gray-50/50 dark:bg-slate-900/50 pl-6 pr-2" : "max-h-0 opacity-0"}`}
                                                    >
                                                        <div className="space-y-0.5 border-l-2 border-indigo-100 dark:border-indigo-900/40 pl-4 my-1">
                                                            {!playlist.chords || playlist.chords.length === 0 ? (
                                                                <p className="text-xs text-gray-400 dark:text-slate-500 py-1">Chưa có bài hát trong bộ sưu tập này.</p>
                                                            ) : (
                                                                playlist.chords.map((chord, idx) => (
                                                                    <div
                                                                        key={chord.id || idx}
                                                                        onClick={() => navigate(`/song/${chord.id}`)}
                                                                        className="grid grid-cols-[20px_2fr_1fr_1fr_30px] items-center py-2 px-2 hover:bg-white dark:hover:bg-slate-850 rounded transition-colors text-xs cursor-pointer group/track"
                                                                    >
                                                                        <span className="text-gray-400 font-medium group-hover/track:hidden">{idx + 1}</span>
                                                                        <Play className="w-2.5 h-2.5 text-indigo-600 hidden group-hover/track:block" />
                                                                        <div className="font-medium text-gray-700 dark:text-slate-200 truncate pl-1 group-hover/track:text-indigo-600 dark:group-hover/track:text-indigo-400">{chord.title}</div>
                                                                        <div className="text-[11px] text-gray-400 dark:text-slate-500 truncate pr-2 flex items-center gap-0.5">
                                                                            <UserIcon className="w-2.5 h-2.5 shrink-0" />
                                                                            {chord.artistName || chord.author || "Unknown"}
                                                                        </div>
                                                                        <div className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-0.5">
                                                                            <Eye className="w-3 h-3" />
                                                                            {chord.views || 0}
                                                                        </div>
                                                                        <div className="flex justify-end text-gray-400">
                                                                            <ChevronRight className="w-3 h-3 opacity-0 group-hover/track:opacity-100 transition-opacity" />
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-gradient-to-br from-pink-100 to-red-50 dark:from-pink-950/20 dark:to-red-950/10 overflow-hidden border border-red-100 dark:border-red-950/30 shadow-sm flex items-center justify-center rounded mx-auto sm:mx-0">
                                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 fill-red-200" />
                            </div>

                            <div className="flex-1 w-full">
                                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Flame className="w-5 h-5 text-red-500" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bài viết đã thích</h3>
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded-full border border-transparent dark:border-slate-800/80">
                                        {likedPosts.length} bài viết
                                    </span>
                                </div>

                                {likedPostsLoading ? (
                                    <div className="flex items-center gap-2 py-4 text-gray-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Đang tải...</span>
                                    </div>
                                ) : likedPosts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <Heart className="w-10 h-10 text-gray-200 mb-2" />
                                        <p className="text-sm text-gray-400">Bạn chưa thích bài viết nào.</p>
                                        <button
                                            onClick={() => navigate('/community')}
                                            className="mt-3 text-xs text-indigo-500 hover:underline font-medium"
                                        >
                                            Khám phá cộng đồng →
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            {paginatedLikedPosts.map((post) => (
                                                <div
                                                    key={post.id}
                                                    className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-lg p-3 sm:p-4 shadow-xs hover:shadow-sm transition-all group"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                                {post.userImage ? (
                                                                    <img src={post.userImage} alt={post.fullName || post.username} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <UserIcon className="w-4 h-4 text-indigo-400" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 leading-none">
                                                                    {post.fullName || post.username || 'Người dùng'}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 mt-0.5">
                                                                    {formatTimeAgo(post.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => navigate('/community')}
                                                            className="text-[10px] text-indigo-500 hover:underline font-medium shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto"
                                                        >
                                                            Xem bài viết
                                                        </button>
                                                    </div>

                                                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed line-clamp-3 mb-3">
                                                        {post.content}
                                                    </p>

                                                    {post.images && post.images.length > 0 && (
                                                        <div className={`grid gap-1 mb-3 rounded-lg overflow-hidden ${post.images.length === 1 ? 'grid-cols-1' :
                                                            post.images.length === 2 ? 'grid-cols-2' :
                                                                'grid-cols-2'
                                                            }`}>
                                                            {post.images.slice(0, 4).map((img: string, idx: number) => (
                                                                <div key={idx} className="aspect-video relative overflow-hidden bg-gray-100">
                                                                    <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                                                                    {idx === 3 && post.images.length > 4 && (
                                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                            <span className="text-white font-bold text-sm">+{post.images.length - 4}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-gray-50 dark:border-slate-800/60 gap-2 sm:gap-0">
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                onClick={() => handleUnlikePost(post.id)}
                                                                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                                                                title="Bỏ thích bài viết này"
                                                            >
                                                                <Heart className="w-4 h-4 fill-red-500" />
                                                                <span>{likedPostLikeCounts[post.id] ?? '—'}</span>
                                                            </button>
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                                                <MessageCircle className="w-4 h-4" />
                                                                <span>{likedPostCommentCounts[post.id] ?? '—'}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400">
                                                            {formatTimeAgo(post.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {likedTotalPages > 1 && (
                                            <div className="mt-4 flex justify-center sm:justify-end">
                                                <Pagination>
                                                    <PaginationContent className="flex flex-wrap gap-1">
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                size="default"
                                                                href="#"
                                                                onClick={(e) => { e.preventDefault(); handleLikedPageChange(likedPage - 1); }}
                                                                className={likedPage === 0 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                                            />
                                                        </PaginationItem>
                                                        {[...Array(likedTotalPages)].map((_, idx) => (
                                                            <PaginationItem key={idx}>
                                                                <PaginationLink
                                                                    size="default"
                                                                    href="#"
                                                                    isActive={likedPage === idx}
                                                                    onClick={(e) => { e.preventDefault(); handleLikedPageChange(idx); }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    {idx + 1}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        ))}
                                                        <PaginationItem>
                                                            <PaginationNext
                                                                size="default"
                                                                href="#"
                                                                onClick={(e) => { e.preventDefault(); handleLikedPageChange(likedPage + 1); }}
                                                                className={likedPage === likedTotalPages - 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
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
                    </div>
                </main>
            </div>

            <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-900 px-3 sm:px-6 py-3 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 w-1/4 min-w-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded shrink-0 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=cover"
                                alt="Album cover"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="min-w-0 hidden xs:block">
                            <h4 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">
                                {chords[0]?.title || "Chưa chọn bài hát"}
                            </h4>
                            <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                                {user?.fullName || "Nghệ sĩ"}
                            </p>
                        </div>
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 cursor-pointer hover:text-red-500 shrink-0" />
                    </div>

                    <div className="flex flex-col items-center gap-1 w-2/4 max-w-xl">
                        <div className="flex items-center gap-3 sm:gap-5 text-gray-500 dark:text-slate-400">
                            <Shuffle className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
                            <SkipBack className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
                            <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-900 dark:bg-slate-200 text-white dark:text-slate-950 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border-none outline-none">
                                <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-white dark:fill-slate-950 translate-x-0.5" />
                            </button>
                            <SkipForward className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
                            <Repeat className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
                        </div>
                        <div className="w-full flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                            <span className="whitespace-nowrap">0:11</span>
                            <div className="flex-1 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative cursor-pointer group">
                                <div className="absolute inset-y-0 left-0 w-1/4 bg-gray-800 dark:bg-slate-350 group-hover:bg-indigo-600" />
                            </div>
                            <span className="whitespace-nowrap">3:45</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 sm:gap-4 w-1/4 text-gray-400">
                        <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-slate-450" />
                        <div className="w-12 sm:w-20 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative cursor-pointer hidden sm:block">
                            <div className="absolute inset-y-0 left-0 w-3/4 bg-gray-700 dark:bg-slate-400" />
                        </div>
                        <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-700" />
                    </div>
                </div>
            </footer>

            {isOwnProfile && (
                <DynamicForm
                    name={FORM_NAME}
                    schema={userFieldSchema}
                    defaultValues={defaultFormValues}
                    onSubmit={handleUpdateUser}
                />
            )}
        </div>
    );
}

export default Profile;