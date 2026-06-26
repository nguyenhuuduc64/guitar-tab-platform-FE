import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const SubNavigation = () => {
    const menuItems = [
        "Bài hát",
        "Hợp âm",
        "Playlist",
        "Điệu bài hát",
        "Thể loại",
        "Tìm theo hợp âm",
        "Đăng tải",
        "Yêu cầu hợp âm",
        "Thành Viên",
        "Khóa học",
        "Tắt quảng cáo ?",
    ];

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const convertToSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/([^0-9a-z-\s])/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    return (
        <div className="w-full bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[13px] py-1.5 h-[var(--subnav-height)] shadow-xs fixed top-[var(--header-height)] z-20 border-b border-slate-200/50 dark:border-slate-900/50">
            <div className="mx-auto flex items-center justify-between md:px-[var(--sidebar-user-width)]">
                <nav className="flex items-center gap-x-5 overflow-x-auto hide-scrollbar">
                    {menuItems.map((item, index) => (
                        <a
                            key={index}
                            href={`/${convertToSlug(item)}`}
                            className="hover:underline transition-colors whitespace-nowrap opacity-90 hover:opacity-100 hidden sm:block"
                        >
                            {item}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity sm:hidden" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <span className="whitespace-nowrap font-medium">Danh mục</span>
                    {isDropdownOpen ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </div>

                <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity ml-4">
                    <span className="whitespace-nowrap">Quản lý</span>
                    <span className="bg-[#5A82A8] text-white text-[11px] px-1.5 py-0.5 rounded shadow-inner min-w-[24px] text-center border border-white/20">
                        62
                    </span>
                </div>
            </div>

            {isDropdownOpen && (
                <div className="sm:hidden absolute top-full left-0 right-0 bg-slate-100 dark:bg-slate-950 shadow-lg border-t border-slate-200 dark:border-slate-900 max-h-[60vh] overflow-y-auto z-30">
                    <div className="flex flex-col p-3 gap-1">
                        {menuItems.map((item, index) => (
                            <a
                                key={index}
                                href={`/${convertToSlug(item)}`}
                                className="px-3 py-2 hover:bg-white/50 dark:hover:bg-slate-800/40 rounded transition-colors text-sm dark:text-slate-200"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubNavigation;