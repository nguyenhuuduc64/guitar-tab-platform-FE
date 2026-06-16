import { Smartphone, Mic, Music } from "lucide-react";

export const DiscoverPanel = () => {
    const items = [
        { 
            title: "Ứng dụng hợp âm", 
            desc: "Hỗ trợ trên mobile",
            icon: Smartphone 
        },
        { 
            title: "Dịch vụ thu âm", 
            desc: "Phòng thu chuyên nghiệp",
            icon: Mic 
        },
        { 
            title: "Điệu bài hát", 
            desc: "Thư viện tiết tấu",
            icon: Music 
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {items.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                    <div
                        key={idx}
                        className="group relative overflow-hidden rounded-xl border border-border-subtle/80 bg-white dark:bg-card p-5 transition-all duration-300 hover:border-[var(--primary-color)]/50 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    >
                        {/* Soft background gradient on hover */}
                        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-[var(--primary-color)]/[0.04] via-transparent to-transparent" />

                        <div className="relative flex items-center gap-4">
                            {/* Icon Wrapper */}
                            <div className="p-2.5 rounded-lg bg-[var(--primary-color)]/[0.06] text-[var(--primary-color)] group-hover:bg-[var(--primary-color)]/[0.12] transition-colors shrink-0">
                                <IconComponent size={20} strokeWidth={1.75} />
                            </div>

                            <div className="min-w-0">
                                <h4 className="text-[13px] font-bold text-main-fg group-hover:text-[var(--primary-color)] transition-colors truncate">
                                    {item.title}
                                </h4>

                                <p className="text-[10px] text-main-fg opacity-50 uppercase tracking-wider group-hover:opacity-75 transition-opacity truncate mt-0.5">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
