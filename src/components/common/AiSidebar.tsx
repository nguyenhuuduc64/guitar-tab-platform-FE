import { useLocation, useNavigate } from "react-router-dom";
import { Music, RefreshCw, Settings } from "lucide-react";

export function AiSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Xác định tab active dựa trên path URL hiện tại
    const currentPath = location.pathname;

    return (
        <div className="h-screen w-64 border-r border-border-subtle bg-white text-gray-700 flex flex-col justify-between relative shadow-sm shrink-0">
            <div>
                {/* Header Tiêu đề Sidebar */}
                <div className="p-4 border-b border-border-subtle">
                    <span className="font-extrabold tracking-wider uppercase text-gray-900 text-sm">
                        AI Sáng Tác
                    </span>
                </div>

                {/* Navigation Menu Links */}
                <nav className="p-3 space-y-1">
                    <button
                        onClick={() => navigate("/ai-composer/text2melody")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${currentPath.includes("text2melody")
                                ? "bg-[var(--primary-color)] text-white shadow-md shadow-purple-600/20"
                                : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <Music size={18} className="shrink-0" />
                        <span>Text to Melody</span>
                    </button>

                    <button
                        onClick={() => navigate("/ai-composer/melody2chord")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${currentPath.includes("melody2chord")
                                ? "bg-[var(--primary-color)] text-white shadow-md shadow-purple-600/20"
                                : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <RefreshCw size={18} className="shrink-0" />
                        <span>Melody to Chord</span>
                    </button>
                </nav>
            </div>

            {/* Footer Sidebar */}
            <div className="p-3 border-t border-border-subtle">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition">
                    <Settings size={18} className="shrink-0" />
                    <span>Cấu hình AI</span>
                </button>
            </div>
        </div>
    );
}

export default AiSidebar;