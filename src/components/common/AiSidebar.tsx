import { useLocation, useNavigate } from "react-router-dom";
import { Music, RefreshCw, Settings, Layers, SlidersHorizontal } from "lucide-react";

export function AiSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <div className="w-64 h-screen border-r border-zinc-200 bg-[#FBFBFB] text-zinc-800 flex flex-col justify-between relative shrink-0 antialiased font-sans">
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header Brand tinh tế */}
                <div className="p-4 border-b border-zinc-200/60">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <SlidersHorizontal size={14} /> Meloflow AI Studio
                    </h2>
                </div>

                {/* Navigation Menu */}
                <nav className="p-3 space-y-1 border-b border-zinc-200/60">
                    <button
                        onClick={() => navigate("/ai-composer/text2melody")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${currentPath.includes("text2melody")
                                ? "bg-zinc-900 text-white"
                                : "hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900"
                            }`}
                    >
                        <Music size={15} className="shrink-0" />
                        <span>Text to Melody</span>
                    </button>

                    <button
                        onClick={() => navigate("/ai-composer/melody2chord")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${currentPath.includes("melody2chord")
                                ? "bg-zinc-900 text-white"
                                : "hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900"
                            }`}
                    >
                        <RefreshCw size={15} className="shrink-0" />
                        <span>Melody to Chord</span>
                    </button>

                    <button
                        onClick={() => navigate("/ai-composer/chord-generation")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${currentPath.includes("chord-generation")
                                ? "bg-zinc-900 text-white"
                                : "hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900"
                            }`}
                    >
                        <Layers size={15} className="shrink-0" />
                        <span>Chord Generating</span>
                    </button>
                </nav>

                {/* Bottom Element tự lấp đầy */}
                <div className="flex-1 overflow-y-auto p-4 bg-[#F5F5F3]/50">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Workspace Info</p>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">Luồng tạo nhạc tự động đồng bộ theo thời gian thực.</p>
                </div>
            </div>
        </div>
    );
}

export default AiSidebar;