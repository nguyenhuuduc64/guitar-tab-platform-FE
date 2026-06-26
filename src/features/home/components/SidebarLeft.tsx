import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    User2,
    Guitar,
    X,
    Compass,
    FileText,
    Gift,
    Plus,
    Activity,
    Music,
    Zap,
    TrendingUp,
    Clock,
    Radio,
    Library,
    Mic2,
    ListMusic,
    Album,
    Headphones
} from "lucide-react";
import ButtonCustom from "../../../components/common/ButtonCustom";
import { fetchUser } from "../../../utils/user";
import { useTheme } from "../../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export const SidebarLeft = () => {
    const { theme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [openTuner, setOpenTuner] = useState(false);
    const [openMetronome, setOpenMetronome] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("trending");
    const navigate = useNavigate()
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
        return <div className="p-6 text-sm text-gray-500">Đang tải...</div>;
    }

    return (
        <>
            <div className="fixed top-[calc(var(--header-height)_+_36px)] w-64 h-[calc(100vh-var(--header-height)-36px)] shrink-0 bg-[var(--bg-gray)] border-r border-gray-100 dark:border-slate-800/60 p-4 hidden lg:block overflow-y-auto">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-800/30 border border-gray-100/80 dark:border-slate-800/50 rounded-xl shadow-xs">
                        {user?.imageUrl ? (
                            <img src={user.imageUrl} alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#A155FF]/10 text-[#A155FF]">
                                <User2 size={20} />
                            </div>
                        )}
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                                {user ? user.fullName : "Khách"}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
                                {user ? user.roles?.description || "Thành viên" : "Vui lòng đăng nhập"}
                            </p>
                        </div>
                    </div>

                    <ButtonCustom variant="primary" className="w-full" onClick={
                        () => navigate("/dang-tai")
                    }>
                        <Plus className="w-4 h-4 mr-2 inline" />
                        Đăng bài hát
                    </ButtonCustom>



                    {/* Tools */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">Công cụ</h3>
                        <div className="space-y-1">
                            <div
                                onClick={() => setOpenTuner(true)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all"
                            >
                                <Guitar size={18} className="text-gray-400 dark:text-slate-500" />
                                <span>Guitar Tuner</span>
                            </div>
                            <div
                                onClick={() => setOpenMetronome(true)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all"
                            >
                                <Activity size={18} className="text-gray-400 dark:text-slate-500" />
                                <span>Máy đếm nhịp</span>
                            </div>
                        </div>
                    </div>

                    {/* Featured Posts */}
                    <div>
                        <div className="flex items-center justify-between px-2 mb-3">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Bài viết nổi bật</h3>
                            <Plus size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                        <div className="space-y-1">
                            {[
                                { title: "Cách đệm hát guitar căn bản", slug: "cach-dem-hat-guitar-can-ban" },
                                { title: "Cách chơi guitar cho mới bắt đầu", slug: "cach-choi-guitar-cho-nguoi-moi-bat-dau" },
                                { title: "Top 5 mẫu đàn guitar giá rẻ", slug: "top-5-mau-dan-guitar-gia-re" },
                            ].map((post) => (
                                <div
                                    key={post.slug}
                                    onClick={() => (window.location.href = `/bai-viet/${post.slug}`)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-slate-350 hover:bg-gray-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all"
                                >
                                    <FileText size={18} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                    <span className="truncate">{post.title}</span>
                                </div>
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
                                <Guitar size={18} className="text-[#A155FF]" />
                                <p className="text-sm font-bold text-gray-800 dark:text-slate-100">Guitar Tuner</p>
                            </div>
                            <button
                                onClick={() => setOpenTuner(false)}
                                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none outline-none"
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
                                <Activity size={18} className="text-[#A155FF]" />
                                <p className="text-sm font-bold text-gray-800 dark:text-slate-100">Máy đếm nhịp</p>
                            </div>
                            <button
                                onClick={() => setOpenMetronome(false)}
                                className="p-1.5 rounded-lg text-gray-400 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none outline-none"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <iframe
                            title="Metronome"
                            src="https://guitarapp.com/metronome.html?embed=true"
                            className="w-full h-[400px] border-none"
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};