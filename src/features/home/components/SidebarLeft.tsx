import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    User2,
    Guitar,
    X,
    Activity,
    Plus,
    FileText
} from "lucide-react";
import { fetchUser } from "../../../utils/user";
import { useTheme } from "../../../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../../assets/logo.png";

export const SidebarLeft = () => {
    const { theme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [openTuner, setOpenTuner] = useState(false);
    const [openMetronome, setOpenMetronome] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getUserData = async () => {
            try {
                const data = await fetchUser();
                setUser(data);
            } catch (error) {
                console.error("Failed to load user info");
            } finally {
                setLoading(false);
            }
        };
        getUserData();
    }, []);

    if (loading) {
        return (
            <div className="fixed top-0 left-0 w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-850/60 p-6 text-sm text-slate-400 dark:text-slate-500 z-50">
                Đang tải menu...
            </div>
        );
    }

    return (
        <>
            <div className="fixed top-0 left-0 w-64 h-screen shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 p-5 hidden lg:block overflow-y-auto text-slate-655 dark:text-[#a8b2b2] select-none z-50
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-neutral-300
                dark:[&::-webkit-scrollbar-thumb]:bg-neutral-800
                [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="space-y-6">
                    {/* Header Logo */}
                    <div className="flex items-center gap-2.5 px-3 py-1 cursor-pointer shrink-0" onClick={() => navigate("/")}>
                        <img src={logo} alt="Logo" className="h-8 w-auto filter dark:brightness-200" />
                        <span className="text-sm font-black tracking-widest text-orange-500 uppercase">
                            Hatcungtoi
                        </span>
                    </div>

                    {/* User info card */}
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/50 rounded-2xl shadow-xs">
                        {user?.imageUrl ? (
                            <img src={user.imageUrl} alt="Avatar" className="h-10 w-10 rounded-full object-cover border border-slate-200/50 dark:border-white/10" />
                        ) : (
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[var(--primary-color)]/10 dark:bg-blue-500/10 text-[var(--primary-color)] dark:text-blue-400 border border-[var(--primary-color)]/25 dark:border-blue-500/20 shrink-0">
                                <User2 size={18} />
                            </div>
                        )}
                        <div className="overflow-hidden flex-1 text-left">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                {user ? user.fullName || user.username : "Khách"}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-550 mt-0.5 truncate">
                                {user ? user.roles?.description || "Thành viên" : "Vui lòng đăng nhập"}
                            </p>
                        </div>
                    </div>

                    {/* Add Chord Button */}
                    <button
                        onClick={() => navigate("/dang-tai")}
                        className="w-full py-2.5 bg-[var(--primary-color)] text-white hover:opacity-95 text-xs font-bold rounded-full transition-all text-center border-none flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 tracking-wider"
                    >
                        <Plus size={14} />
                        <span>ĐĂNG BÀI HÁT</span>
                    </button>

                    {/* Tools Section */}
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4">Công cụ</h3>
                        <div className="space-y-1">
                            <div
                                onClick={() => setOpenTuner(true)}
                                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200/60 dark:hover:bg-slate-900/50 text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group cursor-pointer"
                            >
                                <Guitar className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-blue-400 transition-colors" />
                                <span>Guitar Tuner</span>
                            </div>

                            <div
                                onClick={() => setOpenMetronome(true)}
                                className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200/60 dark:hover:bg-slate-900/50 text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group cursor-pointer"
                            >
                                <Activity className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-blue-400 transition-colors" />
                                <span>Máy đếm nhịp</span>
                            </div>
                        </div>
                    </div>

                    {/* Featured Posts Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">Bài viết nổi bật</h3>
                        </div>
                        <div className="space-y-1">
                            {[
                                { title: "Cách đệm hát guitar căn bản", slug: "cach-dem-hat-guitar-can-ban" },
                                { title: "Cách chơi guitar cho mới bắt đầu", slug: "cach-choi-guitar-cho-nguoi-moi-bat-dau" },
                                { title: "Top 5 mẫu đàn guitar giá rẻ", slug: "top-5-mau-dan-guitar-gia-re" },
                            ].map((post) => (
                                <Link
                                    key={post.slug}
                                    to={`/bai-viet/${post.slug}`}
                                    className="flex items-center gap-3.5 px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-200/60 dark:hover:bg-slate-900/50 text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all group"
                                >
                                    <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-blue-400 shrink-0 transition-colors" />
                                    <span className="truncate">{post.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Guitar Tuner Modal */}
            {openTuner && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 w-[400px] animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-950/30">
                            <div className="flex items-center gap-2">
                                <Guitar size={18} className="text-[var(--primary-color)] dark:text-blue-400" />
                                <p className="text-sm font-bold text-gray-800 dark:text-slate-100">Guitar Tuner</p>
                            </div>
                            <button
                                onClick={() => setOpenTuner(false)}
                                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none outline-none bg-transparent"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <iframe
                            src={`https://guitarapp.com/tuner.html?embed=true&theme=${theme === "dark" ? "dark" : "light"}`}
                            allow="microphone"
                            title="GuitarApp Online Tuner"
                            className="w-full h-[520px] border-none"
                        />
                    </div>
                </div>,
                document.body
            )}

            {/* Metronome Modal */}
            {openMetronome && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 w-[400px] animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-950/30">
                            <div className="flex items-center gap-2">
                                <Activity size={18} className="text-[var(--primary-color)] dark:text-blue-400" />
                                <p className="text-sm font-bold text-gray-800 dark:text-slate-100">Máy đếm nhịp</p>
                            </div>
                            <button
                                onClick={() => setOpenMetronome(false)}
                                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none outline-none bg-transparent"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <iframe
                            title="Metronome"
                            src={`https://guitarapp.com/metronome.html?embed=true&theme=${theme === "dark" ? "dark" : "light"}`}
                            className="w-full h-[520px] border-none"
                            scrolling="no"
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
export default SidebarLeft;