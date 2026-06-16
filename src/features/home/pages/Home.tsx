import { useEffect, useState } from "react";

import { Hero } from "../components/Hero";
import { SongTable } from "../../../components/common/SongTable";
import { DiscoverPanel } from "../components/DiscoverPanel";
import { SidebarLeft } from "../components/SidebarLeft";
import { RankingRight } from "../components/RankingRight";

import instance from "../../../config/axios";
import { AudioGrid } from "../../../components/common/AudioGrid";

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
        <div className="w-full mx-auto animate-in fade-in duration-500">
            {/* Sử dụng layout grid hoặc flex đồng bộ, thêm gap hợp lý */}
            <div className="w-full flex items-start gap-6">

                {/* 1. SIDEBAR TRÁI: Đảm bảo có chiều rộng cố định */}
                <aside className="w-[240px] shrink-0 hidden lg:block">
                    <SidebarLeft />
                </aside>


                <main className="flex-1 min-w-0 flex flex-col gap-6">
                    <div className="w-full mx-auto flex flex-col gap-6">
                        <Hero />
                        <div>
                            <AudioGrid />
                        </div>
                    </div>

                    <div className="border border-border-subtle/80 overflow-hidden bg-white dark:bg-card shadow-[0_2px_8px_rgba(0,0,0,0.02)]">


                        <div className="p-5">
                            <SongTable
                                songs={trendingSongs}
                                loading={loading}
                                error={error}
                            />
                        </div>
                    </div>
                </main>

                {/* 3. RANKING PHẢI */}
                <aside className="w-[280px] shrink-0 hidden xl:block">
                    <RankingRight />
                </aside>
            </div>
        </div>
    );
}
