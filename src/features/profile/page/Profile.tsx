import React, { useEffect, useState } from "react";
import axios from "axios";
import { Music2, User, Loader2, Calendar } from "lucide-react";
import instance from "../../../config/axios";

function Profile() {
    const [user, setUser] = useState(null);
    const [chords, setChords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);

            const [userRes, chordRes] = await Promise.all([
                instance.get("/users/my-info"),
                instance.get("/chords", {}),
            ]);

            setUser(userRes.data.result);
            setChords(chordRes.data.result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white px-4 py-6">
            <div className="max-w-5xl mx-auto flex flex-col gap-5">
                {/* Profile Card */}
                <div className="border border-gray-200 rounded-sm bg-white p-5">
                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-8 h-8 text-gray-400" />
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col gap-1">
                            <h1 className="text-xl font-semibold text-gray-900">
                                {user?.fullName || "Unknown User"}
                            </h1>

                            <p className="text-sm text-gray-500">
                                @{user?.username}
                            </p>

                            {user?.bio && (
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    {user.bio}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Music2 className="w-3.5 h-3.5" />
                                    <span>{chords.length} chords</span>
                                </div>

                                {user?.createdAt && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>
                                            Joined{" "}
                                            {new Date(
                                                user.createdAt,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chord List */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-base font-semibold text-gray-900">
                        My Chords
                    </h2>

                    {chords.length === 0 ? (
                        <div className="border border-gray-200 rounded-sm p-8 text-center text-sm text-gray-500 bg-white">
                            No chords found
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {chords.map((chord) => (
                                <div
                                    key={chord.id}
                                    className="border border-gray-200 rounded-sm overflow-hidden bg-white hover:border-gray-300 transition"
                                >
                                    {/* Thumbnail */}
                                    <div className="h-36 bg-gray-100 overflow-hidden">
                                        {chord.thumbnail ? (
                                            <img
                                                src={chord.thumbnail}
                                                alt={chord.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Music2 className="w-8 h-8 text-gray-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex flex-col gap-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                                {chord.title}
                                            </h3>

                                            {chord.artistName && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {chord.artistName}
                                                </p>
                                            )}
                                        </div>

                                        {chord.description && (
                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                {chord.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
                                            <span>
                                                Tone: {chord.tone || "N/A"}
                                            </span>

                                            <span>
                                                {chord.views || 0} views
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
