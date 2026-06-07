import  { useEffect, useMemo, useState } from "react";
import {
    Music2,
    User,
    Loader2,
    ListMusic,
    Heart,
    CalendarDays,
    Edit2,
    ChevronRight,
    Activity
} from "lucide-react";

import instance from "../../../config/axios";
import { SongTable } from "../../../components/common/SongTable";
import { useFormStore } from "../../../store/useFormStore";
import { DynamicForm } from "../../../components/common/DynamicForm";
import { userFieldSchema } from "../../../constants/user";
import { type User as UserType } from "../../../types/user"; 
import type { Chord } from "../../../types/chord";

interface Playlist {
    id: string | number;
    name: string;
    description?: string;
    chords?: Chord[];
    createdAt: string;
}

const TABS = [
    {
        id: "CHORDS",
        label: "Uploaded Songs",
        icon: <Music2 size={16} />,
    },
    {
        id: "PLAYLISTS",
        label: "Playlists",
        icon: <ListMusic size={16} />,
    },
    {
        id: "LIKED",
        label: "Liked Songs",
        icon: <Heart size={16} />,
    },
    {
        id: "AI",
        label: "AI Activity",
        icon: <Activity size={16} />,
    },
];

const FORM_NAME = "UPDATE_USER_PROFILE";

function Profile() {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>("CHORDS");
    const [chords, setChords] = useState<Chord[]>([]);
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [likedSongs, setLikedSongs] = useState<Chord[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const { openForm } = useFormStore();

    const fetchProfile = async (isFirstLoad = false) => {
    try {
        // Chỉ set bằng true nếu không phải là lần load đầu tiên (vì mặc định khởi tạo đã là true)
        if (!isFirstLoad) {
            setLoading(true);
        }
        
        const [userRes, chordRes] = await Promise.all([
            instance.get("/users/my-info"),
            instance.get("/chords"),
        ]);

        const userData = userRes.data.result;
        setUser(userData);
        setChords(chordRes.data.result || []);

        const playlistRes = await instance.get(
            `/playlists/user/${userData.id}`,
        );
        setPlaylists(playlistRes.data.result || []);

        try {
            const likedRes = await instance.get(
                `/likes/user/${userData.id}`,
            );
            setLikedSongs(likedRes.data.result || []);
        } catch (err) {
            console.log(err);
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchProfile(true);
}, []);

    const handleUpdateUser = async (data: UserType) => {
        if (!user?.id) return;
        try {
            const response = await instance.put(`/users/${user.id}`, {
                fullName: data.fullName,
                avatar: data.imageUrl,
            });

            if (response.data?.result) {
                setUser(response.data.result);
            } else {
                fetchProfile();
            }
        } catch (error) {
            console.error("Update user failed:", error);
        }
    };

    const defaultFormValues = useMemo(() => {
        if (!user) return {};
        return {
            fullName: user.fullName || "",
            avatar: user.imageUrl || "",
        };
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            <div className="max-w-7xl mx-auto flex flex-col">
                <div
                    className="sticky z-30"
                    style={{ top: "calc(var(--header-height) + 30px)" }}
                >
                    <div
                        className="overflow-hidden bg-white border-t border-l border-r border-gray-100 rounded-t-sm p-6 relative"
                        style={{
                            backgroundImage:
                                "url('https://static.vecteezy.com/system/resources/previews/007/667/368/non_2x/young-handsome-female-listen-to-music-with-headphones-outdoor-on-the-beach-against-sunny-blue-sky-free-photo.jpg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />

                        <div className="relative z-10 flex flex-col md:flex-row gap-5 md:items-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 bg-gray-100 flex items-center justify-center shrink-0 shadow-xl">
                                {user?.imageUrl ? (
                                    <img
                                        src={user.imageUrl}
                                        alt={user.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-gray-400" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-white">
                                    {user?.fullName}
                                </h1>
                                <p className="text-sm text-gray-200 mt-1">
                                    @{user?.username}
                                </p>
                                

                                <div className="flex flex-wrap gap-5 mt-5 text-sm text-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Music2 size={16} /> {chords.length}{" "}
                                        uploaded
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ListMusic size={16} />{" "}
                                        {playlists.length} playlists
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Heart size={16} /> {likedSongs.length}{" "}
                                        liked
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-3 right-3 hover:text-white/80">
                            <button
                                onClick={() => openForm(FORM_NAME)}
                                className="flex items-center gap-2 text-white cursor-pointer  transition-all duration-300 ease-in-out"
                            >
                                <Edit2 size={14} />
                                Cập nhật thông tin
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border-l border-r border-gray-100 px-3 shadow-sm">
                        <div className="flex items-center gap-2 overflow-x-auto">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setSelectedPlaylist(null);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-t-md text-sm font-medium border-b-2 transition-all whitespace-nowrap
                                    ${
                                        activeTab === tab.id
                                            ? "border-indigo-600 text-indigo-600 bg-gray-100"
                                            : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                    }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border border-gray-100 bg-white relative z-10">
                    {activeTab === "CHORDS" && (
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Uploaded Songs
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Songs shared by user
                                    </p>
                                </div>
                                <div className="text-sm text-gray-400">
                                    {chords.length} songs
                                </div>
                            </div>
                            {chords.length === 0 ? (
                                <div className="border border-dashed border-gray-200 rounded-sm p-10 text-center text-gray-400">
                                    No uploaded songs
                                </div>
                            ) : (
                                <SongTable songs={chords} isHasMenu={false} />
                            )}
                        </div>
                    )}

                    {activeTab === "PLAYLISTS" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5">
                            <div className="lg:col-span-1 bg-white p-5 h-fit sticky top-[calc(var(--header-height)+300px)]">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h2 className="font-bold text-gray-900">
                                            My Playlists
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {playlists.length} playlists
                                        </p>
                                    </div>
                                    <ListMusic className="text-indigo-500" />
                                </div>

                                <div className="space-y-3">
                                    {playlists.length === 0 ? (
                                        <div className="text-center py-10 text-sm text-gray-400">
                                            No playlists found
                                        </div>
                                    ) : (
                                        playlists.map((playlist) => {
                                            const active =
                                                selectedPlaylist?.id ===
                                                playlist.id;
                                            return (
                                                <button
                                                    key={playlist.id}
                                                    onClick={() =>
                                                        setSelectedPlaylist(
                                                            playlist,
                                                        )
                                                    }
                                                    className={`w-full text-left rounded-sm border p-4 transition-all
                                                    ${
                                                        active
                                                            ? "border-indigo-500 bg-indigo-50"
                                                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800">
                                                                {playlist.name}
                                                            </h3>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {playlist.chords
                                                                    ?.length ||
                                                                    0}{" "}
                                                                songs
                                                            </p>
                                                        </div>
                                                        <ChevronRight
                                                            className="text-indigo-500"
                                                            size={18}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                                                        <CalendarDays
                                                            size={14}
                                                        />
                                                        {new Date(
                                                            playlist.createdAt,
                                                        ).toLocaleDateString()}
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                {!selectedPlaylist ? (
                                    <div className="bg-white  p-10 text-center text-gray-400">
                                        Select playlist to view songs
                                    </div>
                                ) : (
                                    <div className="bg-white  p-5 flex flex-col gap-5">
                                        <div className="border-b border-gray-100 pb-4">
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {selectedPlaylist.name}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {selectedPlaylist.description}
                                            </p>
                                            <div className="text-xs text-gray-400 mt-3">
                                                {selectedPlaylist.chords
                                                    ?.length || 0}{" "}
                                                songs
                                            </div>
                                        </div>
                                        {selectedPlaylist.chords?.length ===
                                        0 ? (
                                            <div className="text-center py-10 text-gray-400">
                                                Playlist is empty
                                            </div>
                                        ) : (
                                            <SongTable
                                                songs={selectedPlaylist.chords || []}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "LIKED" && (
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Liked Songs
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Your favorite songs
                                    </p>
                                </div>
                                <div className="text-sm text-gray-400">
                                    {likedSongs.length} songs
                                </div>
                            </div>
                            {likedSongs.length === 0 ? (
                                <div className="border border-dashed border-gray-200 rounded-sm p-10 text-center text-gray-400">
                                    No liked songs
                                </div>
                            ) : (
                                <SongTable songs={likedSongs} />
                            )}
                        </div>
                    )}
                </div>
            </div>
            <DynamicForm
                name={FORM_NAME}
                schema={userFieldSchema}
                defaultValues={defaultFormValues}
                onSubmit={handleUpdateUser}
            />
        </div>
    );
}

export default Profile;