import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Loader2,
    ListMusic,
    Heart,
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
    Music
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
    [key: string]: any;
}

interface Playlist {
    id: string | number;
    name: string;
    description?: string;
    chords?: Chord[];
    createdAt: string;
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
    const [likedSongs, setLikedSongs] = useState<Chord[]>([]);
    const { openForm } = useFormStore();

    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [pageSize] = useState<number>(5);

    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [selectedChordId, setSelectedChordId] = useState<string | number | null>(null);
    const [chordAudios, setChordAudios] = useState<AudioResponse[]>([]);
    const [loadingAudio, setLoadingAudio] = useState<boolean>(false);

    const isOwnProfile = !userId;

    useEffect(() => {
        setCurrentPage(0);
        setSelectedPlaylist(null);
        setSelectedChordId(null);
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
                console.log("api call", `/chords/user/${userData.id}?page=${currentPage}&size=${pageSize}`)
                const chordData = chordRes.data.result?.data || [];

                const audioPromises = chordData.map((chord: Chord) =>
                    instance.get(`/audios/chord/${chord.id}`).catch(() => ({ data: { result: null } }))
                );

                const audioResults = await Promise.all(audioPromises);

                const chordsWithAudio = chordData.map((chord: Chord, index: number) => {
                    const audioData = audioResults[index]?.data?.result;
                    return {
                        ...chord,
                        hasAudio: !!audioData
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
                        setLikedSongs(likedRes.value.data.result || []);
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
            setChordAudios(audioData ? [audioData] : []);
        } catch (error) {
            console.error("Error fetching chord audios:", error);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex text-gray-800 font-sans pb-24">
            <div className="w-[var(--sidebar-user-width)] fixed inset-y-0 left-0 bg-white border-r border-gray-100 hidden md:block mt-[calc(var(--header-height)_+_36px)]">
                <SidebarProfileUser userId={userId} />
            </div>

            <div className="flex-1 md:pl-[var(--sidebar-user-width)] flex flex-col">
                <main className="p-8 flex-1">
                    <h2 className="text-xl font-bold tracking-wide mb-6 text-gray-900">Albums</h2>

                    <div className="space-y-12">
                        <div className="flex gap-8 items-start">
                            <div className="w-40 h-40 shrink-0 bg-gray-100 rounded-sm overflow-hidden border border-gray-200 shadow-sm relative group">
                                <img
                                    src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=cover"
                                    alt="Sense Cover"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Uploaded Songs</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">2026</p>
                                    </div>
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => openForm(FORM_NAME)}
                                            className="text-xs flex items-center gap-1.5 text-indigo-600 font-medium hover:underline"
                                        >
                                            <Edit2 size={12} /> Edit Info
                                        </button>
                                    )}
                                </div>

                                {chords.length === 0 ? (
                                    <p className="text-sm text-gray-400 py-2">No tracks uploaded.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {chordsWithAudio.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {chordsWithAudio.map((chord) => (
                                                    <div
                                                        key={chord.id}
                                                        onClick={() => navigate(`/song/${chord.id}`)}
                                                        className="bg-white border border-gray-100 rounded-lg p-3 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
                                                    >
                                                        <div className="aspect-square w-full bg-gray-100 rounded-md overflow-hidden relative mb-3">
                                                            <img
                                                                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=cover"
                                                                alt={chord.title}
                                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                                                                    <Play className="w-5 h-5 text-black fill-current translate-x-0.5" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <h4 className="text-sm font-bold text-blue-600 truncate mb-1 hover:underline">
                                                            {chord.title || "Chưa có tiêu đề"}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 truncate">
                                                            {chord.author || "Chưa cập nhật nghệ sĩ"}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {chordsWithoutAudio.length > 0 && (
                                            <div className="w-full space-y-0.5">
                                                {chordsWithoutAudio.map((chord, index) => {
                                                    const isChordSelected = selectedChordId === chord.id;
                                                    return (
                                                        <div key={chord.id || index} className="border-b border-gray-100/70">
                                                            <div
                                                                onClick={() => handleToggleChordAudio(chord.id)}
                                                                className={`grid grid-cols-[30px_2fr_1fr_1fr_80px] items-center py-3 px-2 hover:bg-gray-100/40 group transition-colors text-sm cursor-pointer ${isChordSelected ? "bg-indigo-50/30 text-indigo-600" : ""}`}
                                                            >
                                                                <div className="flex items-center justify-start text-gray-400">
                                                                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isChordSelected ? "rotate-90 text-indigo-600" : ""}`} />
                                                                </div>
                                                                <div
                                                                    onClick={(e) => { e.stopPropagation(); navigate(`/song/${chord.id}`); }}
                                                                    className="font-medium text-gray-800 pr-4 truncate hover:text-indigo-600 hover:underline cursor-pointer"
                                                                >
                                                                    {chord.title}
                                                                </div>
                                                                <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                                                    <UserIcon className="w-3 h-3 shrink-0 text-gray-400" />
                                                                    {chord.author || "Unknown"}
                                                                </div>
                                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    {chord.views?.toLocaleString() || 0}
                                                                </div>
                                                                <div className="flex items-center justify-end gap-4 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                                    <Heart className="w-4 h-4 cursor-pointer hover:text-red-500 hover:fill-red-500 transition-colors" />
                                                                    <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-gray-700" />
                                                                </div>
                                                            </div>

                                                            <div
                                                                className={`overflow-hidden transition-all duration-300 ease-in-out ${isChordSelected ? "max-h-[300px] opacity-100 py-2 bg-gray-50/50 pl-8 pr-2" : "max-h-0 opacity-0"}`}
                                                            >
                                                                <div className="border-l-2 border-dashed border-indigo-200 pl-4 space-y-1">
                                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-500/80 mb-1">Generated Audios</p>
                                                                    {loadingAudio ? (
                                                                        <div className="flex items-center gap-1 py-1 text-xs text-gray-400">
                                                                            <Loader2 className="w-3 h-3 animate-spin" /> Loading Audios...
                                                                        </div>
                                                                    ) : chordAudios.length === 0 ? (
                                                                        <p className="text-xs text-gray-400 py-1">No generated audio files found for this chord.</p>
                                                                    ) : (
                                                                        chordAudios.map((audio, aIdx) => (
                                                                            <div key={audio.id || aIdx} className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-gray-100 shadow-2xs hover:border-indigo-100 group/audio transition-colors text-xs">
                                                                                <div className="flex items-center gap-2 truncate">
                                                                                    <Music className="w-3 h-3 text-indigo-400" />
                                                                                    <span className="font-medium text-gray-700 truncate">{audio.title || `Audio Record #${aIdx + 1}`}</span>
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
                                        )}
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="mt-4 flex justify-end">
                                        <Pagination>
                                            <PaginationContent>
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

                        <div className="flex gap-8 items-start">
                            <div className="w-40 h-40 shrink-0 bg-gray-100 rounded-sm overflow-hidden border border-gray-200 shadow-sm">
                                <img
                                    src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=cover"
                                    alt="Collection Cover"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Playlists & Liked</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Collection</p>
                                </div>

                                <div className="w-full space-y-0.5">
                                    {playlists.map((playlist, index) => {
                                        const isSelected = selectedPlaylist?.id === playlist.id;
                                        return (
                                            <div key={playlist.id || index} className="border-b border-gray-100/70">
                                                <div
                                                    onClick={() => setSelectedPlaylist(isSelected ? null : playlist)}
                                                    className={`grid grid-cols-[30px_1fr_100px] items-center py-3 px-2 hover:bg-gray-100/40 group transition-colors text-sm cursor-pointer ${isSelected ? "bg-indigo-50/40 text-indigo-600" : "text-gray-800"}`}
                                                >
                                                    <div className="flex items-center text-gray-400">
                                                        <ListMusic className={`w-4 h-4 ${isSelected ? "text-indigo-600" : ""}`} />
                                                    </div>
                                                    <div className="font-medium truncate">
                                                        {playlist.name}
                                                        <span className="text-xs text-gray-400 font-normal ml-2">({playlist.chords?.length || 0} songs)</span>
                                                    </div>
                                                    <div className="flex items-center justify-end text-gray-400">
                                                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSelected ? "rotate-90 text-indigo-600" : ""}`} />
                                                    </div>
                                                </div>

                                                <div
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isSelected ? "max-h-[500px] opacity-100 py-2 bg-gray-50/50 pl-6 pr-2" : "max-h-0 opacity-0"}`}
                                                >
                                                    <div className="space-y-0.5 border-l-2 border-indigo-100 pl-4 my-1">
                                                        {!playlist.chords || playlist.chords.length === 0 ? (
                                                            <p className="text-xs text-gray-400 py-1">No tracks in this playlist.</p>
                                                        ) : (
                                                            playlist.chords.map((chord, idx) => (
                                                                <div
                                                                    key={chord.id || idx}
                                                                    onClick={() => navigate(`/song/${chord.id}`)}
                                                                    className="grid grid-cols-[20px_2fr_1fr_1fr_30px] items-center py-2 px-2 hover:bg-white rounded transition-colors text-xs cursor-pointer group/track"
                                                                >
                                                                    <span className="text-gray-400 font-medium group-hover/track:hidden">{idx + 1}</span>
                                                                    <Play className="w-2.5 h-2.5 text-indigo-600 hidden group-hover/track:block" />
                                                                    <div className="font-medium text-gray-700 truncate pl-1 group-hover/track:text-indigo-600">{chord.title}</div>
                                                                    <div className="text-[11px] text-gray-400 truncate pr-2 flex items-center gap-0.5">
                                                                        <UserIcon className="w-2.5 h-2.5 shrink-0" />
                                                                        {chord.author || "Unknown"}
                                                                    </div>
                                                                    <div className="text-[11px] text-gray-400 flex items-center gap-0.5">
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
                                    })}

                                    {likedSongs.map((song, index) => (
                                        <div
                                            key={`liked-${song.id || index}`}
                                            onClick={() => navigate(`/song/${song.id}`)}
                                            className="grid grid-cols-[30px_2fr_1fr_1fr_80px] items-center py-3 px-2 border-b border-gray-100/70 hover:bg-gray-100/40 group transition-colors text-sm cursor-pointer"
                                        >
                                            <div className="flex items-center text-red-500">
                                                <Heart className="w-4 h-4 fill-red-500" />
                                            </div>
                                            <div className="font-medium text-gray-800 truncate">
                                                {song.title}
                                            </div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                                <UserIcon className="w-3 h-3 shrink-0 text-gray-400" />
                                                {song.author || "Unknown"}
                                            </div>
                                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                                <Eye className="w-3.5 h-3.5" />
                                                {song.views || 0}
                                            </div>
                                            <div className="flex items-center justify-end text-gray-400" onClick={(e) => e.stopPropagation()}>
                                                <MoreHorizontal className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="fixed bottom-0 left-[var(--sidebar-user-width)] right-0 h-20 bg-white border-t border-gray-100 z-50 px-8 flex items-center justify-between shadow-lg md:pl-72">
                        <div className="flex items-center gap-3 w-1/4">
                            <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 overflow-hidden shrink-0">
                                <img
                                    src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=100&auto=format&fit=cover"
                                    alt="Current Track"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                    {chords[0]?.title || "No track selected"}
                                </h4>
                                <p className="text-xs text-gray-400 truncate">
                                    {user?.fullName || "Artist"}
                                </p>
                            </div>
                            <Heart className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500 shrink-0 ml-2" />
                        </div>

                        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
                            <div className="flex items-center gap-5 text-gray-500">
                                <Shuffle className="w-4 h-4 cursor-pointer hover:text-gray-900" />
                                <SkipBack className="w-4 h-4 cursor-pointer hover:text-gray-900" />
                                <button className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center hover:scale-105 transition-transform">
                                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                                </button>
                                <SkipForward className="w-4 h-4 cursor-pointer hover:text-gray-900" />
                                <Repeat className="w-4 h-4 cursor-pointer hover:text-gray-900" />
                            </div>
                            <div className="w-full flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                                <span>0:11</span>
                                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden relative cursor-pointer group">
                                    <div className="absolute inset-y-0 left-0 w-1/4 bg-gray-800 group-hover:bg-indigo-600" />
                                </div>
                                <span>3:45</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 w-1/4 text-gray-400">
                            <Volume2 className="w-4 h-4 text-gray-500" />
                            <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden relative cursor-pointer">
                                <div className="absolute inset-y-0 left-0 w-3/4 bg-gray-700" />
                            </div>
                            <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-gray-700 ml-2" />
                        </div>
                    </footer>
                </main>
            </div>

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