import { useNavigate } from "react-router-dom";
import ButtonCustom from "../../../components/common/ButtonCustom";
import { faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import { Heart, MoreHorizontal } from "lucide-react";
import heroImage from "../../../assets/thumbnail.jfif";

export const Hero = () => {
    const navigate = useNavigate();

    const handleGoToAIPage = () => {
        navigate("/ai-composer/text2melody");
    };

    return (
        <section
            className="rounded-xl relative w-full overflow-hidden bg-gray-100 dark:bg-slate-900 min-h-[360px] md:min-h-[40vh] flex items-center p-8 md:p-12 h-full"
            style={{
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "top center",
                backgroundRepeat: "no-repeat"
            }}
        >
            <div className="absolute inset-0 bg-black/30 z-0"></div>

            <div className="relative z-10 max-w-lg flex flex-col items-start text-left">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">
                    DISCOVER
                </span>

                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2 leading-tight">
                    Hot new tracks <br /> this week
                </h1>

                <p className="text-xs text-white/80 mb-6 font-medium">
                    Khám phá bộ công cụ trí tuệ nhân tạo tạo lời và phối vòng hòa âm Guitar.
                </p>

                <div className="flex items-center gap-3">
                    <ButtonCustom
                        onClick={handleGoToAIPage}
                        name="Dùng AI ngay"
                        icon={faMagicWandSparkles}
                        variant="orange"
                    />

                    <button className="p-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition">
                        <Heart size={14} />
                    </button>

                    <button className="p-2 rounded-full border border-white/30 text-white hover:bg-white/10 transition">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 hidden md:flex z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
        </section>
    );
};