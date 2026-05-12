import React, { useEffect, useState } from "react";
import { Music2, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

import instance from "../../../config/axios";
import { getUserInfo } from "../../../utils/auth";
import { formatTime } from "../../../helper";
const extractChords = (text: string): string[] => {
    if (!text) return [];

    const matches = text.match(/\[(.*?)\]/g) || [];

    const chords = matches.map((c) => c.replace(/[\[\]]/g, ""));

    return [...new Set(chords)];
};

export const PlaylistPage = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [playlists, setPlaylists] = useState([]);

    const [selectedPlaylist, setSelectedPlaylist] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const userData = await getUserInfo();

                setUser(userData);

                const response = await instance.get(
                    `/playlists/user/${userData.id}`,
                );

                setPlaylists(response.data.result || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-10 text-center">Đang tải playlist...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-5">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Playlist của bạn
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Quản lý danh sách bài hát yêu thích
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* PLAYLIST LIST */}
                    <div className="lg:col-span-1 bg-white rounded-sm border border-gray-100 shadow-sm p-4 h-fit">
                        <div className="flex items-center gap-2 mb-4">
                            <Music2 size={20} className="text-purple-500" />

                            <h2 className="font-semibold text-gray-800">
                                Danh sách playlist
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {playlists.length === 0 ? (
                                <div className="text-sm text-gray-400 text-center py-10">
                                    Chưa có playlist nào
                                </div>
                            ) : (
                                playlists.map((playlist) => {
                                    const active =
                                        selectedPlaylist?.id === playlist.id;

                                    return (
                                        <button
                                            key={playlist.id}
                                            onClick={() =>
                                                setSelectedPlaylist(playlist)
                                            }
                                            className={`w-full text-left rounded-sm border p-4 transition-all
                                            ${
                                                active
                                                    ? "border-purple-500 bg-purple-50"
                                                    : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {playlist.name}
                                                    </h3>

                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {
                                                            playlist.chords
                                                                ?.length
                                                        }{" "}
                                                        bài hát
                                                    </p>
                                                </div>

                                                <Music2
                                                    size={18}
                                                    className="text-purple-400"
                                                />
                                            </div>

                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                                                <CalendarDays size={14} />

                                                {formatTime(playlist.createdAt)}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* SONG LIST */}
                    <div className="lg:col-span-2">
                        {!selectedPlaylist ? (
                            <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-10 text-center text-gray-400">
                                Chọn playlist để xem bài hát
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {/* PLAYLIST INFO */}
                                <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-5">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {selectedPlaylist.name}
                                    </h2>

                                    <p className="text-gray-500 mt-2">
                                        {selectedPlaylist.description}
                                    </p>

                                    <div className="text-sm text-gray-400 mt-3">
                                        {selectedPlaylist.chords?.length} bài
                                        hát
                                    </div>
                                </div>

                                {/* SONG TABLE */}
                                {selectedPlaylist.chords?.length === 0 ? (
                                    <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-10 text-center text-gray-400">
                                        Playlist chưa có bài hát
                                    </div>
                                ) : (
                                    selectedPlaylist.chords.map((song) => (
                                        <div
                                            key={song.id}
                                            className="bg-white border border-gray-100 rounded-sm p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                            onClick={() =>
                                                navigate(`/song/${song.id}`)
                                            }
                                        >
                                            {/* HEADER */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-800">
                                                        {song.title}
                                                    </h3>

                                                    <p className="text-[11px] text-gray-400 mt-1">
                                                        Chord song
                                                    </p>
                                                </div>
                                            </div>

                                            {/* TAG */}
                                            <div className="flex gap-2 flex-wrap mt-4">
                                                {extractChords(
                                                    song.content,
                                                ).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-[11px] px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-gray-500"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
