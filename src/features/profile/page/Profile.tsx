import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
    Loader2,
    ListMusic,
    Edit2,
    ChevronRight,
    Play,
    Pause,
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
    Flame, Heart,
    LayoutGrid, List,
    Globe, Lock
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

function Profile({ userId: propUserId }: ProfileProps) {
    const navigate = useNavigate();
    const { userId: routeUserId } = useParams<{ userId: string }>();
    const userId = propUserId || routeUserId;

    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [chords, setChords] = useState<Chord[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
    const [likedPostLikeCounts, setLikedPostLikeCounts] = useState<Record<string, number>>({});
    const [likedPostCommentCounts, setLikedPostCommentCounts] = useState<Record<string, number>>({});
    const [likedPostsLoading, setLikedPostsLoading] = useState<boolean>(false);
    const { openForm } = useFormStore();

    const [audioPage, setAudioPage] = useState<number>(0);
    const [lyricsPage, setLyricsPage] = useState<number>(0);
    const [pageSize] = useState<number>(5);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [selectedChordId, setSelectedChordId] = useState<string | number | null>(null);
    const [chordAudios, setChordAudios] = useState<AudioResponse[]>([]);
    const [loadingAudio, setLoadingAudio] = useState<boolean>(false);

    const [loggedInUser, setLoggedInUser] = useState<UserType | null>(null);

    useEffect(() => {
        getUserInfo().then(setLoggedInUser);
    }, []);

    const isOwnProfile = useMemo(() => {
        if (!userId) return true;
        if (!loggedInUser) return false;
        return loggedInUser.id === userId;
    }, [userId, loggedInUser]);

    const [likedPage, setLikedPage] = useState<number>(0);
    const likedPageSize = 5;

    // Audio Playback states and ref
    const [currentPlayingSong, setCurrentPlayingSong] = useState<Chord | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [volume, setVolume] = useState<number>(0.8);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'audio' | 'lyrics' | 'playlists' | 'likes'>('audio');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Control Playback
    const handlePlayChord = (chord: Chord) => {
        if (!chord.hasAudio && !chord.audio?.url) {
            toast.warn("Bài hát này chưa có file audio để phát.");
            return;
        }

        // Find audio url
        const audioUrl = chord.audio?.url || (chords.find(c => c.id === chord.id)?.audio?.url);
        if (!audioUrl) {
            toast.error("Không tìm thấy đường dẫn audio.");
            return;
        }

        const chordToPlay = {
            ...chord,
            audio: chord.audio || chords.find(c => c.id === chord.id)?.audio
        };

        if (currentPlayingSong?.id === chordToPlay.id) {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                audioRef.current?.play().catch(err => console.error("Error playing audio:", err));
                setIsPlaying(true);
            }
        } else {
            setCurrentPlayingSong(chordToPlay);
            setIsPlaying(true);
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.volume = volume;
                    audioRef.current.muted = isMuted;
                    audioRef.current.play().catch(err => console.error("Error playing audio:", err));
                }
            }, 50);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(err => console.error("Error playing audio:", err));
            setIsPlaying(true);
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

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (audioRef.current) {
            audioRef.current.volume = val;
        }
        if (val > 0 && isMuted) {
            setIsMuted(false);
            if (audioRef.current) audioRef.current.muted = false;
        }
    };

    const toggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        if (audioRef.current) {
            audioRef.current.muted = nextMuted;
        }
    };

    const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (secs: number) => {
        if (isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const handleFollowToggle = async () => {
        if (!user?.id) return;
        try {
            if (isFollowing) {
                await instance.post(`/users/${user.id}/unfollow`);
                setIsFollowing(false);
                setUser(prev => prev ? { ...prev, followersCount: Math.max(0, (prev.followersCount || 0) - 1) } : null);
            } else {
                await instance.post(`/users/${user.id}/follow`);
                setIsFollowing(true);
                setUser(prev => prev ? { ...prev, followersCount: (prev.followersCount || 0) + 1 } : null);
            }
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái theo dõi:", error);
        }
    };

    useEffect(() => {
        setAudioPage(0);
        setLyricsPage(0);
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

                    const myInfo = await getUserInfo();
                    if (myInfo) {
                        const followingRes = await instance.get(`/users/${myInfo.id}/following`, { signal: controller.signal });
                        const followingList = followingRes.data.result || [];
                        setIsFollowing(followingList.some((u: any) => u.id === userId));
                    }
                }

                setUser(userData);

                if (!userData?.id) {
                    setLoading(false);
                    return;
                }

                const chordRes = await instance.get(`/chords/user/${userData.id}?page=0&size=9999`, {
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

                if (userData?.id) {
                    const [playlistRes, likedRes] = await Promise.allSettled([
                        instance.get(`/playlists/user/${userData.id}`, { signal: controller.signal }),
                        instance.get(`/likes/user/${userData.id}`, { signal: controller.signal })
                    ]);

                    if (playlistRes.status === "fulfilled") {
                        setPlaylists(playlistRes.value.data.result || []);
                    }
                    if (likedRes.status === "fulfilled") {
                        const likedLikesData = likedRes.value.data.result || [];

                        if (likedLikesData.length > 0) {
                            setLikedPostsLoading(true);

                            const postsPromises = likedLikesData.map(async (like: any) => {
                                try {
                                    const postRes = await instance.get(`/posts/${like.postId}`);
                                    const postData = postRes.data.result;

                                    const [likeCountRes, commentCountRes] = await Promise.allSettled([
                                        instance.get(`/likes/post/${like.postId}/count`),
                                        instance.get(`/comments/post/${like.postId}/count`)
                                    ]);

                                    const likeCount = likeCountRes.status === 'fulfilled' ? likeCountRes.value.data.result || 0 : 0;
                                    const commentCount = commentCountRes.status === 'fulfilled' ? commentCountRes.value.data.result || 0 : 0;

                                    return {
                                        post: postData,
                                        likeCount,
                                        commentCount
                                    };
                                } catch (err) {
                                    console.error(`Error loading liked post details for postId ${like.postId}:`, err);
                                    return null;
                                }
                            });

                            const postsResults = await Promise.all(postsPromises);
                            const validResults = postsResults.filter((r): r is { post: LikedPost; likeCount: number; commentCount: number } => r !== null);

                            const fullLikedPosts = validResults.map(r => r.post);
                            setLikedPosts(fullLikedPosts);

                            const newLikeCounts: Record<string, number> = {};
                            const newCommentCounts: Record<string, number> = {};
                            validResults.forEach(({ post, likeCount, commentCount }) => {
                                newLikeCounts[post.id] = likeCount;
                                newCommentCounts[post.id] = commentCount;
                            });

                            setLikedPostLikeCounts(newLikeCounts);
                            setLikedPostCommentCounts(newCommentCounts);
                            setLikedPostsLoading(false);
                        } else {
                            setLikedPosts([]);
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
    }, [userId, isOwnProfile]);

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

    const handleAudioPageChange = (pageIndex: number) => {
        const total = Math.ceil(chordsWithAudio.length / pageSize);
        if (pageIndex >= 0 && pageIndex < total) {
            setAudioPage(pageIndex);
        }
    };

    const handleLyricsPageChange = (pageIndex: number) => {
        const total = Math.ceil(chordsWithoutAudio.length / pageSize);
        if (pageIndex >= 0 && pageIndex < total) {
            setLyricsPage(pageIndex);
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

    const paginatedAudioChords = useMemo(() => {
        const start = audioPage * pageSize;
        return chordsWithAudio.slice(start, start + pageSize);
    }, [chordsWithAudio, audioPage, pageSize]);

    const paginatedLyricsChords = useMemo(() => {
        const start = lyricsPage * pageSize;
        return chordsWithoutAudio.slice(start, start + pageSize);
    }, [chordsWithoutAudio, lyricsPage, pageSize]);

    const audioTotalPages = Math.ceil(chordsWithAudio.length / pageSize);
    const lyricsTotalPages = Math.ceil(chordsWithoutAudio.length / pageSize);

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

    const handleToggleSongVisibility = async (chord: Chord) => {
        try {
            const updatedIsPublic = chord.isPublic === false ? true : false;
            
            await instance.put(`/chords/${chord.id}`, {
                title: chord.title,
                artistName: chord.artistName || chord.author || "",
                categoryId: chord.categoryId || (chord.category && typeof chord.category === 'object' && chord.category.id) || "",
                content: chord.content || "",
                youtubeUrl: chord.youtubeUrl || "",
                isPublic: updatedIsPublic
            });

            setChords(prev => prev.map(c => c.id === chord.id ? { ...c, isPublic: updatedIsPublic } : c));
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái bài hát:", err);
            toast.error("Không thể cập nhật trạng thái bài hát. Vui lòng thử lại sau.");
        }
    };
    const tabs = useMemo(() => [
        { id: 'audio' as const, label: 'Bài hát có audio', count: chordsWithAudio.length, icon: <Music className="w-4 h-4" /> },
        { id: 'lyrics' as const, label: 'Lời bài hát đã đăng', count: chordsWithoutAudio.length, icon: <Disc3 className="w-4 h-4" /> },
        { id: 'playlists' as const, label: 'Playlist', count: playlists.length, icon: <Library className="w-4 h-4" /> },
        { id: 'likes' as const, label: 'Bài viết đã thích', count: likedPosts.length, icon: <Heart className="w-4 h-4" /> },
    ], [chordsWithAudio.length, chordsWithoutAudio.length, playlists.length, likedPosts.length]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex text-gray-800 dark:text-slate-100 font-sans pb-24">
            <div className="w-[var(--sidebar-user-width)] fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800/60 hidden md:block mt-[calc(var(--header-height)_+_var(--subnav-height))]">
                <SidebarProfileUser 
                    userId={userId} 
                    chordsCount={chords.length}
                    playlistsCount={playlists.length}
                    likedPostsCount={likedPosts.length}
                />
            </div>

            <main className="flex-grow md:pl-[var(--sidebar-user-width)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
                {/* Mobile User Profile Card */}
                <div className="md:hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 mb-8 flex flex-col items-center text-center shadow-xs">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-100 dark:border-slate-800 shadow-sm mb-3">
                        <img
                            src={user?.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=cover"}
                            alt={user?.fullName || "User Avatar"}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
                        {user?.fullName || "Người dùng"}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
                        {user?.username ? `@${user.username}` : ""}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed max-w-sm mb-4">
                        Sản xuất âm nhạc và chia sẻ đam mê guitar.
                    </p>

                    <div className="w-full max-w-xs flex gap-3 mb-5 justify-center">
                        {!isOwnProfile ? (
                            <>
                                <button
                                    onClick={handleFollowToggle}
                                    className={`flex-1 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all border ${isFollowing
                                        ? "bg-transparent border-gray-300 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800/40"
                                        : "bg-gray-900 dark:bg-slate-200 border-gray-900 text-white dark:text-slate-900 hover:bg-gray-800 dark:hover:bg-slate-100"
                                        }`}
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                                <button className="flex-1 py-1.5 bg-transparent border border-gray-300 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800/30 text-gray-700 dark:text-slate-300 rounded-full text-xs font-semibold tracking-wider transition-colors">
                                    Nhắn tin
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => openForm(FORM_NAME)}
                                className="w-full py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/50 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/50 rounded-full text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5"
                            >
                                <Edit2 size={12} /> Chỉnh sửa hồ sơ
                            </button>
                        )}
                    </div>

                    <div className="w-full border-t border-gray-100 dark:border-slate-800/60 pt-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                            <span className="block text-base font-bold text-gray-900 dark:text-slate-200">
                                {chords.length}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Bài hát</span>
                        </div>
                        <div>
                            <span className="block text-base font-bold text-gray-900 dark:text-slate-200">
                                {playlists.length}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Bộ sưu tập</span>
                        </div>
                        <div>
                            <span className="block text-base font-bold text-gray-900 dark:text-slate-200">
                                {likedPosts.length}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Đã thích</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation Switcher */}
                <div className="flex border-b border-gray-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2 pb-px mb-6">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-xs sm:text-sm font-bold whitespace-nowrap transition-all border-b-2 -mb-px
                                    ${isActive
                                        ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-12">
                    {/* Tab 1: Audio Songs */}
                    {activeTab === 'audio' && (
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start animate-fadeIn">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-gray-100 dark:bg-slate-800 overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm relative group mx-auto lg:mx-0 rounded-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=cover"
                                    alt="Bài hát có audio"
                                    className="w-full h-full object-cover animate-pulse-slow"
                                />
                            </div>

                            <div className="flex-1 w-full text-left">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bài hát có audio</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">Danh sách các bài hát bạn đã đăng có kèm file nhạc</p>
                                    </div>
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => openForm(FORM_NAME)}
                                            className="text-xs flex items-center gap-1.5 text-indigo-600 font-medium hover:underline cursor-pointer"
                                        >
                                            <Edit2 size={12} /> Chỉnh sửa
                                        </button>
                                    )}
                                </div>

                                {chordsWithAudio.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-205 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10">Chưa có bài hát nào có audio.</p>
                                ) : (
                                    <div className="space-y-8">
                                        <div>
                                            {/* Header with Title and Toggle */}
                                            <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-slate-800/80 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <Music className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                                                        Bài hát ({chordsWithAudio.length})
                                                    </h4>
                                                </div>
                                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg border border-gray-200/20">
                                                    <button
                                                        onClick={() => setViewMode('list')}
                                                        className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'list'
                                                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                                                            : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                                                            }`}
                                                        title="Danh sách"
                                                    >
                                                        <List size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setViewMode('grid')}
                                                        className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'grid'
                                                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                                                            : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                                                            }`}
                                                        title="Lưới đĩa than"
                                                    >
                                                        <LayoutGrid size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {viewMode === 'list' ? (
                                                /* Split Layout: Left is Featured Player Deck, Right is Tracklist */
                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                                    {/* Featured Player Deck (5 cols) */}
                                                    <div className="lg:col-span-5 bg-white/60 dark:bg-[#11131c]/60 backdrop-blur-md border border-gray-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xs flex flex-col items-center text-center relative overflow-hidden group">
                                                        <div className="relative w-40 h-40 mb-5 flex items-center justify-center">
                                                            <div
                                                                className={`absolute w-36 h-36 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center shadow-lg transition-transform duration-1000 ${isPlaying && currentPlayingSong ? 'animate-spin' : ''
                                                                    }`}
                                                                style={{ animationDuration: '6s' }}
                                                            >
                                                                <div className="w-14 h-14 rounded-full border border-slate-700 bg-indigo-600 flex items-center justify-center">
                                                                    <div className="w-3 h-3 rounded-full bg-black"></div>
                                                                </div>
                                                            </div>
                                                            <div className="absolute w-32 h-32 rounded-2xl overflow-hidden shadow-xl border border-white/20 dark:border-slate-800 z-10 bg-slate-100 dark:bg-slate-900">
                                                                <img
                                                                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=cover"
                                                                    alt={currentPlayingSong?.title || "No song"}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="w-full min-w-0 mb-4 z-10">
                                                            <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                                                {currentPlayingSong?.title || "Chọn bài hát để phát"}
                                                            </h4>
                                                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 truncate">
                                                                {currentPlayingSong?.artistName || currentPlayingSong?.author || user?.fullName || "Chưa rõ nghệ sĩ"}
                                                            </p>
                                                        </div>

                                                        <div className="h-6 flex items-end justify-center gap-1 mb-5 w-full z-10">
                                                            {isPlaying && currentPlayingSong ? (
                                                                <>
                                                                    <span className="w-1 bg-indigo-500 rounded-full animate-[bounce_0.8s_infinite] h-4" style={{ animationDelay: '0.1s' }} />
                                                                    <span className="w-1 bg-indigo-500 rounded-full animate-[bounce_0.6s_infinite] h-6" style={{ animationDelay: '0.3s' }} />
                                                                    <span className="w-1 bg-indigo-500 rounded-full animate-[bounce_0.9s_infinite] h-3" style={{ animationDelay: '0.5s' }} />
                                                                    <span className="w-1 bg-indigo-500 rounded-full animate-[bounce_0.7s_infinite] h-5" style={{ animationDelay: '0.2s' }} />
                                                                    <span className="w-1 bg-indigo-500 rounded-full animate-[bounce_0.5s_infinite] h-2" style={{ animationDelay: '0.4s' }} />
                                                                </>
                                                            ) : (
                                                                <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">Trình phát nhạc</div>
                                                            )}
                                                        </div>

                                                        {currentPlayingSong ? (
                                                            <div className="w-full flex items-center justify-center gap-4 z-10">
                                                                <button
                                                                    onClick={toggleMute}
                                                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                                                >
                                                                    <Volume2 className={`w-4 h-4 ${isMuted ? "text-red-500" : ""}`} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handlePlayChord(currentPlayingSong)}
                                                                    className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
                                                                >
                                                                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate(`/song/${currentPlayingSong.id}`)}
                                                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                                                                    title="Xem hợp âm"
                                                                >
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <p className="text-[11px] text-gray-400 py-3">Chọn bài hát bên phải để bắt đầu phát nhạc thực tế</p>
                                                        )}
                                                    </div>

                                                    {/* Track List (7 cols) */}
                                                    <div className="lg:col-span-7 space-y-1.5">
                                                        {paginatedAudioChords.map((chord, idx) => {
                                                            const isCurrent = currentPlayingSong?.id === chord.id;
                                                            return (
                                                                <div
                                                                    key={chord.id}
                                                                    onClick={() => navigate(`/song/${chord.id}`)}
                                                                    className={`flex items-center gap-3 p-3 bg-white dark:bg-[#11131c] border ${isCurrent
                                                                        ? 'border-indigo-500/50 dark:border-indigo-500/40 bg-indigo-50/5 dark:bg-indigo-950/5 shadow-xs'
                                                                        : 'border-gray-100 dark:border-slate-800/80 hover:bg-gray-50/50 dark:hover:bg-slate-800/30'
                                                                        } rounded-2xl transition-all duration-200 cursor-pointer group relative`}
                                                                >
                                                                    <div className="w-7 h-7 flex items-center justify-center shrink-0" onClick={(e) => e.stopPropagation()}>
                                                                        {isCurrent && isPlaying ? (
                                                                            <div className="flex gap-0.5 items-end h-3">
                                                                                <span className="w-0.5 bg-indigo-500 animate-bounce h-2" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                                                                                <span className="w-0.5 bg-indigo-500 animate-bounce h-3" style={{ animationDelay: '0.3s', animationDuration: '0.4s' }} />
                                                                                <span className="w-0.5 bg-indigo-500 animate-bounce h-1.5" style={{ animationDelay: '0.5s', animationDuration: '0.7s' }} />
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-xs font-semibold text-gray-400 group-hover:hidden">{audioPage * pageSize + idx + 1}</span>
                                                                        )}
                                                                        <button
                                                                            onClick={() => handlePlayChord(chord)}
                                                                            className="hidden group-hover:flex p-1.5 rounded-full bg-indigo-100/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition"
                                                                        >
                                                                            {isCurrent && isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
                                                                        </button>
                                                                    </div>

                                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-900 shrink-0">
                                                                        <img
                                                                            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=100&auto=format&fit=cover"
                                                                            alt={chord.title}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <h5 className={`text-xs sm:text-sm font-bold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-gray-900 dark:text-slate-100'
                                                                            }`}>
                                                                            {chord.title}
                                                                        </h5>
                                                                        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 truncate mt-0.5">
                                                                            {chord.artistName || chord.author || "Chưa cập nhật nghệ sĩ"}
                                                                        </p>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                                        <div className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                                                                            <Eye className="w-3 h-3" />
                                                                            <span>{chord.views?.toLocaleString() || 0}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => navigate(`/song/${chord.id}`)}
                                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition rounded-lg"
                                                                        >
                                                                            <MoreHorizontal size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Grid View */
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                    {paginatedAudioChords.map((chord) => {
                                                        const isCurrent = currentPlayingSong?.id === chord.id;
                                                        return (
                                                            <div
                                                                key={chord.id}
                                                                onClick={() => navigate(`/song/${chord.id}`)}
                                                                className={`bg-white dark:bg-[#11131c] border ${isCurrent
                                                                    ? 'border-indigo-500/50 dark:border-indigo-500/40 shadow-md ring-1 ring-indigo-500/10'
                                                                    : 'border-gray-100 dark:border-slate-800/80 shadow-2xs'
                                                                    } rounded-2xl p-2.5 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group relative overflow-hidden`}
                                                            >
                                                                <div className="aspect-square w-full relative rounded-xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                                                                    <div
                                                                        className={`absolute w-[80%] h-[80%] rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center shadow-lg transition-all duration-500 ease-out z-0
                                                                            group-hover:translate-x-[40%] group-hover:rotate-180
                                                                            ${isCurrent && isPlaying ? 'animate-spin' : ''}`}
                                                                        style={{ animationDuration: '6s' }}
                                                                    >
                                                                        <div className="w-[35%] h-[35%] rounded-full bg-indigo-600 flex items-center justify-center">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute inset-0 z-10 w-full h-full bg-gray-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-white/10">
                                                                        <img
                                                                            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=cover"
                                                                            alt={chord.title}
                                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                        />
                                                                    </div>
                                                                    <div
                                                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handlePlayChord(chord);
                                                                        }}
                                                                    >
                                                                        <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200 transform translate-y-2 group-hover:translate-y-0">
                                                                            {isCurrent && isPlaying ? (
                                                                                <Pause className="w-4.5 h-4.5 text-white fill-current" />
                                                                            ) : (
                                                                                <Play className="w-4.5 h-4.5 text-white fill-current translate-x-0.5" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute top-1.5 right-1.5 bg-indigo-600 text-white text-[8px] sm:text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 z-30">
                                                                        <Music className="w-2.5 h-2.5" />
                                                                        <span>Audio</span>
                                                                    </div>
                                                                </div>

                                                                <div className="p-2 flex-1 flex flex-col justify-between z-10 bg-white dark:bg-[#11131c]">
                                                                    <div className="min-w-0 mb-1">
                                                                        <div className="flex items-center justify-between gap-1.5">
                                                                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                                {chord.title || "Chưa có tiêu đề"}
                                                                            </h4>
                                                                            {isCurrent && isPlaying && (
                                                                                <Disc3 className="w-3.5 h-3.5 text-indigo-500 animate-spin shrink-0 [animation-duration:3s]" />
                                                                            )}
                                                                        </div>
                                                                        <p className="text-[10px] sm:text-xs text-gray-400 dark:text-slate-500 truncate mt-0.5">
                                                                            {chord.artistName || chord.author || "Chưa cập nhật nghệ sĩ"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-[9px] text-gray-400 flex items-center gap-1 font-medium mt-1">
                                                                        <Eye className="w-3 h-3" />
                                                                        <span>{chord.views?.toLocaleString() || 0} lượt xem</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {audioTotalPages > 1 && (
                                    <div className="mt-8 flex justify-center lg:justify-end">
                                        <Pagination>
                                            <PaginationContent className="flex flex-wrap gap-1">
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        size="default"
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); handleAudioPageChange(audioPage - 1); }}
                                                        className={audioPage === 0 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>
                                                {[...Array(audioTotalPages)].map((_, idx) => (
                                                    <PaginationItem key={idx}>
                                                        <PaginationLink
                                                            size="default"
                                                            href="#"
                                                            isActive={audioPage === idx}
                                                            onClick={(e) => { e.preventDefault(); handleAudioPageChange(idx); }}
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
                                                        onClick={(e) => { e.preventDefault(); handleAudioPageChange(audioPage + 1); }}
                                                        className={audioPage === audioTotalPages - 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Lyrics only Songs */}
                    {activeTab === 'lyrics' && (
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start animate-fadeIn">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-gray-100 dark:bg-slate-800 overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm relative group mx-auto lg:mx-0 rounded-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=300&auto=format&fit=cover"
                                    alt="Lời bài hát"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 w-full text-left">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Lời bài hát đã đăng</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Danh sách các bài viết hợp âm và lời bài hát bạn đã chia sẻ</p>
                                </div>

                                {chordsWithoutAudio.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-205 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10">Chưa có lời bài hát nào.</p>
                                ) : (
                                    <div className="w-full space-y-0.5 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#11131c] p-4 shadow-2xs">
                                        {paginatedLyricsChords.map((chord, index) => {
                                            return (
                                                <div key={chord.id || index} className="border-b border-gray-100/70 dark:border-slate-800/40 last:border-0">
                                                    <div
                                                        onClick={() => navigate(`/song/${chord.id}`)}
                                                        className={`grid grid-cols-[1fr_80px] ${isOwnProfile ? "sm:grid-cols-[2fr_1fr_1fr_120px_80px]" : "sm:grid-cols-[2fr_1fr_1fr_80px]"} items-center py-3.5 px-3 hover:bg-gray-55/70 dark:hover:bg-slate-850/50 group transition-colors text-sm cursor-pointer`}
                                                    >
                                                        <div className="font-semibold text-gray-850 dark:text-slate-200 pr-4 truncate hover:text-indigo-650 hover:underline">
                                                            {chord.title}
                                                            <span className="block sm:hidden text-[10px] text-gray-450 mt-0.5 font-normal">
                                                                {chord.artistName || chord.author || "Unknown"} • {chord.views?.toLocaleString() || 0} lượt xem
                                                                {isOwnProfile && (
                                                                    <span
                                                                        onClick={(e) => { e.stopPropagation(); handleToggleSongVisibility(chord); }}
                                                                        className={`ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold cursor-pointer transition-colors ${
                                                                            chord.isPublic !== false
                                                                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 hover:bg-emerald-100"
                                                                                : "bg-gray-100 text-gray-650 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-200"
                                                                        }`}
                                                                    >
                                                                        {chord.isPublic !== false ? (
                                                                            <Globe className="w-2 h-2" />
                                                                        ) : (
                                                                            <Lock className="w-2 h-2" />
                                                                        )}
                                                                        <span>{chord.isPublic !== false ? "Công khai" : "Riêng tư"}</span>
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 truncate hidden sm:flex font-medium">
                                                            <UserIcon className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-slate-500" />
                                                            {chord.artistName || chord.author || "Unknown"}
                                                        </div>
                                                        <div className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1.5 hidden sm:flex font-medium">
                                                            <Eye className="w-4 h-4" />
                                                            {chord.views?.toLocaleString() || 0}
                                                        </div>
                                                        {isOwnProfile && (
                                                            <div className="hidden sm:flex items-center font-medium">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleToggleSongVisibility(chord); }}
                                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                                                                        chord.isPublic !== false
                                                                            ? "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:bg-emerald-950/10 dark:text-emerald-400"
                                                                            : "bg-gray-50 hover:bg-gray-100 border-gray-200 dark:border-slate-800 text-gray-600 dark:bg-slate-900/40 dark:text-slate-400"
                                                                    }`}
                                                                >
                                                                    {chord.isPublic !== false ? (
                                                                        <Globe className="w-3 h-3 text-emerald-500" />
                                                                    ) : (
                                                                        <Lock className="w-3 h-3 text-gray-400" />
                                                                    )}
                                                                    <span>{chord.isPublic !== false ? "Công khai" : "Riêng tư"}</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-end gap-3 sm:gap-4 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                            <Heart className="w-4 h-4 cursor-pointer hover:text-red-500 hover:fill-red-500 transition-colors" />
                                                            <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-gray-750" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {lyricsTotalPages > 1 && (
                                    <div className="mt-8 flex justify-center lg:justify-end">
                                        <Pagination>
                                            <PaginationContent className="flex flex-wrap gap-1">
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        size="default"
                                                        href="#"
                                                        onClick={(e) => { e.preventDefault(); handleLyricsPageChange(lyricsPage - 1); }}
                                                        className={lyricsPage === 0 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>
                                                {[...Array(lyricsTotalPages)].map((_, idx) => (
                                                    <PaginationItem key={idx}>
                                                        <PaginationLink
                                                            size="default"
                                                            href="#"
                                                            isActive={lyricsPage === idx}
                                                            onClick={(e) => { e.preventDefault(); handleLyricsPageChange(idx); }}
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
                                                        onClick={(e) => { e.preventDefault(); handleLyricsPageChange(lyricsPage + 1); }}
                                                        className={lyricsPage === lyricsTotalPages - 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Playlists */}
                    {activeTab === 'playlists' && (
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start animate-fadeIn">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-gray-100 dark:bg-slate-800 overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm mx-auto lg:mx-0 rounded-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=cover"
                                    alt="Ảnh bìa playlist"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 w-full text-left">
                                <div className="mb-4">
                                    <div className="flex items-center gap-2">
                                        <Library className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Playlist</h3>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{playlists.length} playlist</p>
                                </div>

                                <div className="w-full space-y-2 bg-white dark:bg-[#11131c] border border-gray-100 dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
                                    {playlists.length === 0 ? (
                                        <p className="text-sm text-gray-400 py-6 text-center">Chưa có playlist nào.</p>
                                    ) : (
                                        playlists.map((playlist, index) => {
                                            const isSelected = selectedPlaylist?.id === playlist.id;
                                            return (
                                                <div key={playlist.id || index} className="border-b border-gray-100/70 dark:border-slate-800/40 last:border-0">
                                                    <div
                                                        onClick={() => setSelectedPlaylist(isSelected ? null : playlist)}
                                                        className={`grid grid-cols-[30px_1fr_100px] items-center py-3.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 rounded-lg group transition-colors text-sm cursor-pointer ${isSelected ? "bg-indigo-50/20 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 font-bold" : "text-gray-800 dark:text-slate-200"}`}
                                                    >
                                                        <div className="flex items-center text-gray-450">
                                                            <ListMusic className={`w-4 h-4 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                                                        </div>
                                                        <div className="truncate">
                                                            {playlist.name}
                                                            <span className="text-xs text-gray-400 dark:text-slate-500 font-normal ml-2">({playlist.chords?.length || 0} bài hát)</span>
                                                        </div>
                                                        <div className="flex items-center justify-end text-gray-400">
                                                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSelected ? "rotate-90 text-indigo-600 dark:text-indigo-400" : ""}`} />
                                                        </div>
                                                    </div>

                                                    <div
                                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isSelected ? "max-h-[500px] opacity-100 py-2 bg-slate-50/40 dark:bg-slate-900/20 pl-4 sm:pl-6 pr-2" : "max-h-0 opacity-0"}`}
                                                    >
                                                        <div className="space-y-1 border-l-2 border-indigo-500 dark:border-indigo-400 pl-4 my-1">
                                                            {!playlist.chords || playlist.chords.length === 0 ? (
                                                                <p className="text-xs text-gray-400 dark:text-slate-500 py-1">Chưa có bài hát trong bộ sưu tập này.</p>
                                                            ) : (
                                                                playlist.chords.map((chord, idx) => (
                                                                    <div
                                                                        key={chord.id || idx}
                                                                        onClick={() => navigate(`/song/${chord.id}`)}
                                                                        className="grid grid-cols-[20px_1fr_30px] sm:grid-cols-[20px_2fr_1fr_1fr_30px] items-center py-2 px-2 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/15 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors text-xs cursor-pointer group/track"
                                                                    >
                                                                        <span className="text-gray-400 font-medium group-hover/track:hidden">{idx + 1}</span>
                                                                        <Play
                                                                            className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400 hidden group-hover/track:block"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handlePlayChord(chord);
                                                                            }}
                                                                        />
                                                                        <div className="font-semibold text-gray-700 dark:text-slate-200 truncate pl-1 group-hover/track:text-indigo-600 dark:group-hover/track:text-indigo-400">
                                                                            {chord.title}
                                                                            <span className="block sm:hidden text-[10px] text-gray-400 mt-0.5 font-normal">
                                                                                {chord.artistName || chord.author || "Unknown"} • {chord.views || 0} views
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-[11px] text-gray-400 dark:text-slate-500 truncate pr-2 hidden sm:flex items-center gap-0.5">
                                                                            <UserIcon className="w-2.5 h-2.5 shrink-0" />
                                                                            {chord.artistName || chord.author || "Unknown"}
                                                                        </div>
                                                                        <div className="text-[11px] text-gray-400 dark:text-slate-500 hidden sm:flex items-center gap-0.5">
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
                    )}

                    {/* Tab 4: Liked Posts */}
                    {activeTab === 'likes' && (
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start animate-fadeIn">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-gradient-to-br from-pink-100 to-red-50 dark:from-pink-950/20 dark:to-red-950/10 overflow-hidden border border-red-100 dark:border-red-950/30 shadow-sm flex items-center justify-center rounded-2xl mx-auto lg:mx-0">
                                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-red-400 fill-red-200" />
                            </div>

                            <div className="flex-1 w-full text-left">
                                <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Flame className="w-5 h-5 text-red-505" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bài viết đã thích</h3>
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-900 px-2.5 py-1 rounded-full border border-transparent dark:border-slate-800/80 font-semibold">
                                        {likedPosts.length} bài viết
                                    </span>
                                </div>

                                {likedPostsLoading ? (
                                    <div className="flex items-center gap-2 py-8 text-gray-400 justify-center">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm font-medium">Đang tải...</span>
                                    </div>
                                ) : likedPosts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center bg-white dark:bg-[#11131c] border border-gray-100 dark:border-slate-800 rounded-2xl p-6">
                                        <Heart className="w-10 h-10 text-gray-250 mb-2" />
                                        <p className="text-sm text-gray-450">Bạn chưa thích bài viết nào.</p>
                                        <button
                                            onClick={() => navigate('/community')}
                                            className="mt-3 text-xs text-indigo-500 hover:underline font-medium cursor-pointer"
                                        >
                                            Khám phá cộng đồng →
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {paginatedLikedPosts.map((post) => (
                                                <div
                                                    key={post.id}
                                                    className="bg-white dark:bg-[#11131c] border border-gray-100 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all group"
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
                                                                <p className="text-sm font-bold text-gray-800 dark:text-slate-200 leading-none">
                                                                    {post.fullName || post.username || 'Người dùng'}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 mt-1">
                                                                    {formatTimeAgo(post.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/community`)}
                                                            className="text-[10px] text-indigo-500 hover:underline font-semibold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto cursor-pointer"
                                                        >
                                                            Xem bài viết
                                                        </button>
                                                    </div>

                                                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed break-words whitespace-pre-line pl-2 border-l-2 border-indigo-500 dark:border-indigo-400">
                                                        {post.content}
                                                    </p>

                                                    {post.images && post.images.length > 0 && (
                                                        <div className="mt-3 grid grid-cols-2 gap-2 max-w-md">
                                                            {post.images.slice(0, 4).map((imgUrl, i) => (
                                                                <div key={i} className="aspect-video rounded-xl overflow-hidden bg-gray-50 border border-gray-100/50 dark:border-slate-850">
                                                                    <img src={imgUrl} alt={`Attached ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-850 flex items-center justify-between">
                                                        <div className="flex items-center gap-4 text-gray-400 text-xs font-semibold">
                                                            <span className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer" onClick={() => handleUnlikePost(post.id)}>
                                                                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                                                                <span>{likedPostLikeCounts[post.id] || 0}</span>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageCircle className="w-4 h-4" />
                                                                <span>{likedPostCommentCounts[post.id] || 0}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {likedTotalPages > 1 && (
                                            <div className="mt-6 flex justify-center">
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
                    )}
                </div>
            </main>

            {currentPlayingSong && (
                <>
                    <audio
                        ref={audioRef}
                        src={currentPlayingSong.audio?.url}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                    />
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
                                        {currentPlayingSong.title || "Chưa chọn bài hát"}
                                    </h4>
                                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                                        {currentPlayingSong.artistName || currentPlayingSong.author || user?.fullName || "Nghệ sĩ"}
                                    </p>
                                </div>
                                <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 cursor-pointer hover:text-red-500 shrink-0" />
                            </div>

                            <div className="flex flex-col items-center gap-1 w-2/4 max-w-xl">
                                <div className="flex items-center gap-3 sm:gap-5 text-gray-500 dark:text-slate-400">
                                    <Shuffle className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
                                    <SkipBack className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
                                    <button
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-900 dark:bg-slate-200 text-white dark:text-slate-950 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border-none outline-none"
                                        onClick={togglePlay}
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-white dark:text-slate-950" />
                                        ) : (
                                            <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-current text-white dark:text-slate-950 translate-x-0.5" />
                                        )}
                                    </button>
                                    <SkipForward className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
                                    <Repeat className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" />
                                </div>
                                <div className="w-full flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                                    <span className="whitespace-nowrap">{formatTime(currentTime)}</span>
                                    <div
                                        className="flex-1 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative cursor-pointer group"
                                        onClick={handleProgressChange}
                                    >
                                        <div
                                            className="absolute inset-y-0 left-0 bg-gray-800 dark:bg-slate-300 group-hover:bg-indigo-600"
                                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                        />
                                    </div>
                                    <span className="whitespace-nowrap">{formatTime(duration)}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 sm:gap-4 w-1/4 text-gray-400">
                                <Volume2
                                    className={`w-3 h-3 sm:w-4 sm:h-4 cursor-pointer transition-colors ${isMuted ? "text-red-500" : "text-gray-500 dark:text-slate-400"}`}
                                    onClick={toggleMute}
                                />
                                <div className="flex items-center sm:block">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-12 sm:w-20 h-1 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 hidden sm:block"
                                    />
                                </div>
                                <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-gray-700" />
                            </div>
                        </div>
                    </footer>
                </>
            )}

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