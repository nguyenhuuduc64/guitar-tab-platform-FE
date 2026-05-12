import { useState, useEffect } from "react";
import { User2, Guitar, ChevronRight, ShieldCheck, X } from "lucide-react";

import ButtonCustom from "../../../components/ui/ButtonCustom";
import { fetchUser } from "../../../utils/user";

export const SidebarLeft = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Popup tuner
    const [openTuner, setOpenTuner] = useState(false);

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
        return <div className="p-4 opacity-50">Đang tải...</div>;
    }

    return (
        <>
            <div className="flex flex-col gap-6">
                {/* Profile Card */}
                <div className="bg-white border border-border-subtle rounded-sm p-4">
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.25em] mb-4">
                        Cá nhân
                    </p>

                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="h-12 w-12 border border-border-subtle rounded flex items-center justify-center bg-gray-50">
                            <User2
                                size={24}
                                strokeWidth={1.5}
                                className="opacity-40"
                            />
                        </div>

                        <div className="overflow-hidden">
                            <p className="text-sm font-bold tracking-tight truncate">
                                {user ? user.fullName : "Khách"}
                            </p>

                            <p className="text-[11px] opacity-60 truncate">
                                {user
                                    ? user.roles.description
                                    : "Vui lòng đăng nhập"}
                            </p>

                            <div className="flex gap-1.5 mt-1.5">
                                {user?.roles.name === "recruiter" && (
                                    <span className="flex items-center gap-1 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold uppercase">
                                        <ShieldCheck size={10} />
                                        PRO
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <ButtonCustom variant="primary">Đăng bài hát</ButtonCustom>

                {/* Tools Card */}
                <div className="bg-white border border-border-subtle rounded-sm p-4">
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.25em] mb-4">
                        Công cụ
                    </p>

                    {/* Guitar Tuner Button */}
                    <div
                        onClick={() => setOpenTuner(true)}
                        className="flex items-center gap-3 px-3 py-3 text-[13px] bg-card-inner border border-border-subtle rounded-sm cursor-pointer hover:bg-main-bg transition-colors"
                    >
                        <Guitar
                            size={16}
                            strokeWidth={1.5}
                            className="text-primary"
                        />
                        Guitar Tuner
                    </div>
                </div>

                {/* Discover Card */}
                <div className="bg-white border border-border-subtle rounded-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-subtle">
                        <p className="text-sm font-semibold">Khám phá thêm</p>
                    </div>

                    {["Pick gảy đàn", "Dịch vụ hòa âm"].map((item) => (
                        <div
                            key={item}
                            className="flex items-center justify-between px-4 py-3 text-sm cursor-pointer hover:bg-card-inner transition-colors group"
                        >
                            <span>{item}</span>

                            <ChevronRight
                                size={16}
                                className="opacity-40 group-hover:opacity-100"
                            />
                        </div>
                    ))}
                </div>

                {/* Related Posts */}
                <div className="bg-white border border-border-subtle rounded-sm overflow-hidden mt-4">
                    <div className="px-4 py-3 border-b border-border-subtle">
                        <p className="text-sm font-semibold">
                            Bài viết liên quan
                        </p>
                    </div>

                    {[
                        {
                            title: "Cách đệm hát guitar căn bản",
                            slug: "cach-dem-hat-guitar-can-ban",
                        },
                        {
                            title: "Cách chơi guitar cho người mới bắt đầu",
                            slug: "cach-choi-guitar-cho-nguoi-moi-bat-dau",
                        },
                        {
                            title: "Top 5 mẫu đàn guitar giá rẻ",
                            slug: "top-5-mau-dan-guitar-gia-re",
                        },
                    ].map((post) => (
                        <div
                            key={post.slug}
                            onClick={() =>
                                (window.location.href = `/bai-viet/${post.slug}`)
                            }
                            className="flex items-center justify-between px-4 py-3 text-sm cursor-pointer hover:bg-card-inner transition-colors group"
                        >
                            <span className="line-clamp-1">{post.title}</span>

                            <ChevronRight
                                size={16}
                                className="opacity-40 group-hover:opacity-100 flex-shrink-0 ml-2"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Guitar Tuner Popup */}
            {openTuner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="relative bg-white rounded-sm shadow-2xl overflow-hidden border border-gray-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                            <p className="text-sm font-semibold">
                                Guitar Tuner
                            </p>

                            <button
                                onClick={() => setOpenTuner(false)}
                                className="p-1 rounded-sm hover:bg-gray-100 transition"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Iframe */}
                        <iframe
                            src="https://guitarapp.com/tuner.html?embed=true&theme=light"
                            allow="microphone"
                            title="GuitarApp Online Tuner"
                            className="w-[360px] h-[520px]"
                            style={{
                                border: "none",
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
};
