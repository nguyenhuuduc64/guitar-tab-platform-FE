import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import instance from "../../config/axios";

interface AudioItem {
    id: string;
    url: string;
    chordId: string;
}

export const AudioGrid = () => {
    const [audios, setAudios] = useState<AudioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAudios = async () => {
            try {
                const response = await instance.get("/audios");
                setAudios(response.data.result || []);
            } catch (error) {
                console.error("Failed to fetch audios", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAudios();
    }, []);

    const handleChordClick = async (chordId: string) => {
        console.log(chordId);
        try {
            await instance.get(`/audios/chord/${chordId}`);
            navigate(`/song/${chordId}`);
        } catch (error) {
            console.error("Failed to verify chord API", error);
        }
    };

    if (loading) {
        return <div className="p-6 text-sm text-gray-500 bg-white dark:bg-slate-900 dark:text-slate-400">Đang tải danh sách bài hát...</div>;
    }

    return (
        <div className="w-full bg-transparent text-black dark:text-white z-10 h-full mt-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                {audios.slice(0, 5).map((item) => (
                    <div
                        key={item.id}
                        onClick={() => item.chordId && handleChordClick(item.chordId)}
                        className="rounded-xl overflow-hidden group cursor-pointer flex flex-col w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow"
                    >
                        <div className="relative w-full aspect-square overflow-hidden">
                            <img
                                src={"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500"}
                                alt={"Song cover"}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="p-2 md:p-3 overflow-hidden bg-white dark:bg-slate-900">
                            <h3 className="text-xs md:text-[13px] font-semibold text-gray-800 dark:text-slate-200 tracking-tight leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Chưa có tiêu đề
                            </h3>
                            <p className="text-[10px] md:text-[11px] text-gray-400 dark:text-slate-500 truncate mt-0.5">
                                Chưa cập nhật nghệ sĩ
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};