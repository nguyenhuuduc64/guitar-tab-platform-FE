import { useEffect, useState } from "react";
import { Hero } from "../components/Hero";
import { SongTable } from "../../../components/common/SongTable";
import { SidebarLeft } from "../components/SidebarLeft";
import { RankingRight } from "../components/RankingRight";
import instance from "../../../config/axios";
import { AudioGrid } from "../../../components/common/AudioGrid";
import { AlbumList } from "../components/AlbumList";
import { ArtistSlider } from "../../../components/common/ArtistSlider";
import { fetchArtists } from "../../../services/artistService";
import { type Artist } from "../../../types/artist";

export default function Home() {
    const [trendingSongs, setTrendingSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [artists, setArtists] = useState<Artist[]>([]);

    useEffect(() => {
        const fetchTrendingSongs = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await instance.get("/chords/trending");
                setTrendingSongs(response.data.result || []);
            } catch (err) {
                console.error(err);
                setError("Không tải được bài hát hot");
            } finally {
                setLoading(false);
            }
        };

        const loadArtists = async () => {
            try {
                const artistsList = await fetchArtists();
                setArtists(artistsList || []);
            } catch (err) {
                console.error("Lỗi tải danh sách nghệ sĩ:", err);
            }
        };

        fetchTrendingSongs();
        loadArtists();
    }, []);

    return (
        <div className="w-full mx-auto animate-in fade-in duration-500 min-h-screen flex">
            <aside className="w-64 shrink-0 hidden lg:block z-30">
                <SidebarLeft />
            </aside>

            <main className="flex-1 p-2 md:p-6 flex flex-col gap-2 md:gap-6 overflow-x-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[2fr_1fr] gap-2 md:gap-2">
                    <div className="lg:col-span-2 lg:row-span-1">
                        <Hero />
                    </div>

                    <div className="lg:col-span-1 lg:row-span-2 rounded-lg flex flex-col h-full">
                        <h3 className="font-semibold mb-3 text-sm md:text-base flex-shrink-0 hidden lg:block">Hot trong tuần</h3>
                        <div className="flex-1 overflow-y-auto min-h-0
                            [&::-webkit-scrollbar]:w-1.5
                            [&::-webkit-scrollbar-track]:bg-transparent
                            [&::-webkit-scrollbar-thumb]:bg-neutral-300
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            hover:[&::-webkit-scrollbar-thumb]:bg-neutral-400
                            dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700
                            dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600">
                            <RankingRight />
                        </div>
                    </div>

                    <div className="lg:col-span-2 lg:row-span-1">
                        <AudioGrid />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-6">
                    <div className="p-2 md:p-4 rounded-lg flex flex-col gap-6">
                        <AlbumList />
                        <ArtistSlider
                            title="Nghệ sĩ nổi bật"
                            artists={artists}
                            emptyText="Không tìm thấy nghệ sĩ nào"
                            hasBorder={true}
                        />
                    </div>

                    <div className="overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <div className="p-2 ">
                            <SongTable
                                songs={trendingSongs}
                                loading={loading}
                                error={error}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}