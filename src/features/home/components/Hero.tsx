import { useNavigate } from "react-router-dom";
import ButtonCustom from "../../../components/ui/ButtonCustom";
import { faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import { Heart, MoreHorizontal } from "lucide-react";
import heroImage from "../../../assets/thumbnail1.jfif";

export const Hero = () => {
    const navigate = useNavigate();

    const handleGoToAIPage = () => {
        navigate("/ai-composer/text2melody");
    };

    return (
        <section
            className="relative w-full overflow-hidden bg-gray-100 dark:bg-slate-900 min-h-[360px] md:min-h-[60vh] flex items-center p-8 md:p-12 mb-6"
            style={{
                backgroundImage: `url(${heroImage})`,
            }}
        >
            <div className="relative z-10 max-w-lg flex flex-col items-start text-left -translate-y-[70px]">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                    DISCOVER
                </span>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2 leading-tight">
                    Hot new tracks <br /> this week
                </h1>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
                    Khám phá bộ công cụ trí tuệ nhân tạo tạo lời và phối vòng hòa âm Guitar.
                </p>

                <div className="flex items-center gap-3">
                    <ButtonCustom
                        onClick={handleGoToAIPage}
                        name="Dùng AI ngay"
                        icon={faMagicWandSparkles}
                        variant="orange"
                    />

                    <button className="p-2 rounded-full border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                        <Heart size={14} />
                    </button>

                    <button className="p-2 rounded-full border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 hidden md:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
        </section>
    );
};