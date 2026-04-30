import { useState, useEffect } from "react";
import { User2, Guitar, ChevronRight, ShieldCheck } from "lucide-react";
import ButtonCustom from "../../../components/ui/ButtonCustom";
import { fetchUser } from "../../../utils/user";
export const SidebarLeft = () => {
    // 1. Quản lý state user nội tại
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 2. Gọi hàm fetchUser khi component mount
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

    // 3. Hiển thị skeleton hoặc null khi đang loading (tùy chọn)
    if (loading) return <div className="p-4 opacity-50">Đang tải...</div>;

    return (
        <div className="flex flex-col gap-6">
            {/* Profile Card */}
            <div className="bg-white border border-border-subtle rounded-sm p-4">
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.25em] mb-4">
                    Cá nhân
                </p>

                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="h-12 w-12 bg-card-inner border border-border-subtle rounded flex items-center justify-center bg-gray-50">
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
                                    <ShieldCheck size={10} /> PRO
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <ButtonCustom variant="primary">
                {user?.roles.name === "recruiter"
                    ? "Đăng bài hát"
                    : "Đăng bài hát"}
            </ButtonCustom>

            {/* Tools Card */}
            <div className="bg-white border border-border-subtle rounded-sm p-4">
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.25em] mb-4">
                    Công cụ
                </p>
                <div className="flex items-center gap-3 px-3 py-3 text-[13px] bg-card-inner border border-border-subtle rounded-sm cursor-pointer hover:bg-main-bg transition-colors">
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
                {["Việc làm mới", "Pick gảy đàn", "Dịch vụ hòa âm"].map(
                    (item) => (
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
                    ),
                )}
            </div>
        </div>
    );
};
