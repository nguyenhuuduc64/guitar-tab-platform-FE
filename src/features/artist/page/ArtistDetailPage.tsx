import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtistById } from "../../../services/artistService";
import instance from "../../../config/axios";

function ArtistDetailPage() {
    const { id } = useParams();

    const [artist, setArtist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const artistData = await getArtistById(id);

                setArtist(artistData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto grid grid-cols-12 gap-4">
                <div className="col-span-4 bg-white rounded-sm shadow-sm p-5">
                    <div className="flex flex-col items-center text-center">
                        <img
                            src={
                                artist?.avatar ||
                                "https://via.placeholder.com/150"
                            }
                            className="w-28 h-28 rounded-full object-cover mb-3"
                        />

                        <h2 className="text-xl font-semibold text-gray-800">
                            {artist?.name}
                        </h2>

                        <p className="text-gray-500 text-xs mt-2 leading-relaxed whitespace-pre-line">
                            {artist?.description}
                        </p>
                    </div>
                </div>

                <div className="col-span-8 bg-white rounded-sm shadow-sm p-5">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">
                        Danh sách bài hát
                    </h3>

                    <div className="space-y-2">
                        {songs.length === 0 && (
                            <p className="text-gray-400 text-sm">
                                Chưa có bài hát
                            </p>
                        )}

                        {songs?.map((song, index) => (
                            <div
                                key={song.id}
                                className="flex items-center justify-between p-2 rounded-sm hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-sm w-5">
                                        {index + 1}
                                    </span>

                                    <div>
                                        <p className="font-medium text-gray-800 text-sm">
                                            {song.title}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {artist?.name}
                                        </p>
                                    </div>
                                </div>

                                <button className="text-blue-500 text-xs hover:underline">
                                    Xem hợp âm
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ArtistDetailPage;
