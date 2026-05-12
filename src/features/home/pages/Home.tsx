import { useEffect, useState } from "react";

import { Hero } from "../components/Hero";
import { SongTable } from "../../../components/common/SongTable";
import { DiscoverPanel } from "../components/DiscoverPanel";
import { SidebarLeft } from "../components/SidebarLeft";
import { RankingRight } from "../components/RankingRight";

import instance from "../../../config/axios";

export default function Home() {
    const [trendingSongs, setTrendingSongs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrendingSongs = async () => {
            try {
                setLoading(true);

                setError(null);

                const response = await instance.get("/chords/trending");
                console.log("trend", response.data);
                setTrendingSongs(response.data.result || []);
            } catch (err) {
                console.error(err);

                setError("Không tải được bài hát hot");
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingSongs();
    }, []);

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-500">
            <div className="flex-1 w-full mx-auto flex gap-0">
                {/* LEFT */}
                <aside className="w-1/5 border-r border-border-subtle hidden lg:block">
                    <SidebarLeft />
                </aside>

                {/* MAIN */}
                <main className="flex-1 px-4 overflow-hidden">
                    <div className="w-full max-w-[1440px] mx-auto">
                        <Hero />

                        <DiscoverPanel />
                    </div>

                    {/* HOT SONGS */}
                    <div className="border border-border-subtle rounded-sm overflow-hidden bg-white">
                        <div className="p-4 border-b border-border-subtle bg-main-fg/[0.02]">
                            <h2 className="text-[11px] font-bold text-main-fg opacity-60 uppercase tracking-[0.2em]">
                                Hot trong tuần
                            </h2>
                        </div>

                        <div className="p-4">
                            <SongTable
                                songs={trendingSongs}
                                loading={loading}
                                error={error}
                            />
                        </div>
                    </div>
                </main>

                {/* RIGHT */}
                <aside className="w-1/4 border-l bg-white border-border-subtle hidden xl:block">
                    <RankingRight />
                </aside>
            </div>
        </div>
    );
}
