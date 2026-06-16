import { useState, useEffect } from "react";
import { User2, Guitar, X, Compass, FileText, Gift, Plus, Activity } from "lucide-react";

import ButtonCustom from "../../../components/ui/ButtonCustom";
import { fetchUser } from "../../../utils/user";

export const SidebarLeft = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [openTuner, setOpenTuner] = useState(false);
    const [openMetronome, setOpenMetronome] = useState(false);

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
            <div className="w-64 bg-white dark:bg-slate-900 flex flex-col font-sans border-r border-gray-200 dark:border-slate-800 fixed"
                style={{
                    top: 'calc(var(--header-height) + 34px)',
                    height: 'calc(100vh - var(--header-height) - 34px)'
                }}>

                <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        {user?.imageUrl ? (
                            <img src={user.imageUrl} alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 text-gray-500">
                                <User2 size={20} />
                            </div>
                        )}
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                {user ? user.fullName : "Khách"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user ? user.roles.description : "Vui lòng đăng nhập"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <ButtonCustom variant="primary" className="w-full py-2 rounded-md font-medium text-sm tracking-wide uppercase bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        Đăng bài hát
                    </ButtonCustom>
                </div>

                <div className="py-2 border-b border-gray-100 dark:border-slate-800">
                    <div
                        onClick={() => setOpenTuner(true)}
                        className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                        <Guitar size={18} className="text-gray-500" />
                        <span>Guitar Tuner</span>
                    </div>

                    <div
                        onClick={() => setOpenMetronome(true)}
                        className="flex items-center gap-4 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                        <Activity size={18} className="text-gray-500" />
                        <span>Máy đếm nhịp</span>
                    </div>
                </div>

                <div className="py-2 border-b border-gray-100 dark:border-slate-800">
                    <div className="px-6 py-2 flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <span>Khám phá thêm</span>
                        <Plus size={14} className="cursor-pointer hover:text-gray-600" />
                    </div>
                    {["Pick gảy đàn", "Dịch vụ hòa âm"].map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-4 px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                            <Compass size={18} className="text-gray-400" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>

                <div className="py-2 flex-1 overflow-y-auto">
                    <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Bài viết nổi bật
                    </div>
                    {[
                        { title: "Cách đệm hát guitar căn bản", slug: "cach-dem-hat-guitar-can-ban" },
                        { title: "Cách chơi guitar cho mới bắt đầu", slug: "cach-choi-guitar-cho-nguoi-moi-bat-dau" },
                        { title: "Top 5 mẫu đàn guitar giá rẻ", slug: "top-5-mau-dan-guitar-gia-re" },
                    ].map((post) => (
                        <div
                            key={post.slug}
                            onClick={() => (window.location.href = `/bai-viet/${post.slug}`)}
                            className="flex items-center gap-4 px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                            <FileText size={18} className="text-gray-400 shrink-0" />
                            <span className="truncate">{post.title}</span>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-slate-800 mt-auto">
                    <div className="flex items-center gap-4 px-2 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 cursor-pointer">
                        <Gift size={18} />
                        <span>Nhận quà tặng</span>
                    </div>
                </div>
            </div>

            {openTuner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-slate-800 w-[360px] animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Guitar Tuner</p>
                            <button onClick={() => setOpenTuner(false)} className="p-1 rounded-md text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                                <X size={16} />
                            </button>
                        </div>
                        <iframe
                            src="https://guitarapp.com/tuner.html?embed=true&theme=light"
                            allow="microphone"
                            title="GuitarApp Online Tuner"
                            className="w-full h-[520px] border-none"
                        />
                    </div>
                </div>
            )}

            {openMetronome && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-slate-800 w-[360px] animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Máy đếm nhịp</p>
                            <button onClick={() => setOpenMetronome(false)} className="p-1 rounded-md text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition">
                                <X size={16} />
                            </button>
                        </div>
                        <iframe
                            title="Metronome"
                            src="https://guitarapp.com/metronome.html?embed=true"
                            className="w-full h-[400px] border-none"
                        />
                    </div>
                </div>
            )}
        </>
    );
};