import { useLocation, useNavigate } from "react-router-dom";
import {
    Music,
    RefreshCw,
    ArrowRight,
    Sparkles,
    GripVertical,
    Info,
    Zap
} from "lucide-react";

export function AiSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="w-48 h-full border-r border-zinc-200 bg-[#FBFBFB] text-zinc-800 flex flex-col justify-between relative shrink-0 antialiased font-sans">
            <div className="flex flex-col h-full overflow-hidden">

                {/* Navigation Menu */}
                <nav className="p-2 space-y-1 border-b border-zinc-200/60">
                    <button
                        onClick={() => navigate("/ai-composer/text2melody")}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${currentPath.includes("text2melody")
                                ? "bg-zinc-900 text-white"
                                : "hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900"
                            }`}
                    >
                        <Music size={14} className="shrink-0" />
                        <ArrowRight size={12} className="shrink-0 opacity-60" />
                        <Sparkles size={14} className="shrink-0" />
                        <span className="truncate ml-0.5">Giai điệu</span>
                    </button>

                    <button
                        onClick={() => navigate("/ai-composer/melody2chord")}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${currentPath.includes("melody2chord")
                                ? "bg-zinc-900 text-white"
                                : "hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900"
                            }`}
                    >
                        <Sparkles size={14} className="shrink-0" />
                        <ArrowRight size={12} className="shrink-0 opacity-60" />
                        <GripVertical size={14} className="shrink-0" />
                        <span className="truncate ml-0.5">Hợp âm</span>
                    </button>

                    <button
                        onClick={() => navigate("/ai-composer/extend")}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${currentPath.includes("extend")
                                ? "bg-zinc-900 text-white"
                                : "hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900"
                            }`}
                    >
                        <RefreshCw size={14} className="shrink-0" />
                        <ArrowRight size={12} className="shrink-0 opacity-60" />
                        <Sparkles size={14} className="shrink-0" />
                        <span className="truncate ml-0.5">Mở rộng</span>
                    </button>
                </nav>

                {/* Bottom Element tự lấp đầy */}
                <div className="flex-1 overflow-y-auto p-3 bg-[#F5F5F3]/50">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Info size={12} className="text-zinc-400 shrink-0" />
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Không gian làm việc</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                        <Zap size={12} className="text-zinc-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">Tạo nhạc tự động theo thời gian thực.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AiSidebar;