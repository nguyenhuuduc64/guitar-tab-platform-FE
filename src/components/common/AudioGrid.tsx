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
        return <div className="p-6 text-sm text-gray-500 bg-white">Đang tải danh sách bài hát...</div>;
    }

    return (
        <div className="w-full p-2 bg-transparent text-black mt-[-150px] z-10">


            <div className="grid grid-cols-5 gap-5">
                {audios.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => item.chordId && handleChordClick(item.chordId)}
                        className="group cursor-pointer flex flex-col w-full bg-white border border-gray-100 shadow-xs"
                    >
                        <div className="relative w-full aspect-square overflow-hidden ">
                            <img
                                src={"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=500"}
                                alt={"Song cover"}
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 overflow-hidden bg-white">
                            <h3 className="text-[13px] font-semibold text-gray-800 tracking-tight leading-tight truncate group-hover:text-blue-600 transition-colors">
                                Chưa có tiêu đề
                            </h3>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                Chưa cập nhật nghệ sĩ
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};