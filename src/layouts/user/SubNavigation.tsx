import React from "react";

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

    // Hàm chuyển đổi tiếng Việt có dấu thành không dấu để làm URL
    const convertToSlug = (text: string) => {
        return text
            .toLowerCase()
            .normalize("NFD") // Chuẩn hóa tổ hợp phím
            .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các ký tự dấu
            .replace(/[đĐ]/g, "d") // Xử lý riêng chữ đ
            .replace(/([^0-9a-z-\s])/g, "") // Loại bỏ ký tự đặc biệt (như dấu ?)
            .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
            .replace(/-+/g, "-") // Tránh nhiều dấu gạch ngang liên tiếp
            .replace(/^-+|-+$/g, ""); // Cắt bỏ gạch ngang ở đầu/cuối
    };

    return (
        <div className="w-full bg-gray-200 text-black text-[13px] py-1.5 px-4 shadow-sm sticky top-[var(--header-height)] z-5 w-full">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left Side: Navigation Links */}
                <nav className="flex flex-wrap items-center gap-x-5">
                    {menuItems.map((item, index) => (
                        <a
                            key={index}
                            href={`/${convertToSlug(item)}`}
                            className="hover:underline transition-colors whitespace-nowrap opacity-90 hover:opacity-100"
                        >
                            {item}
                        </a>
                    ))}
                </nav>

                {/* Right Side: Management with Badge */}
                <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity ml-4">
                    <span className="whitespace-nowrap">Quản lý</span>
                    <span className="bg-[#5A82A8] text-white text-[11px] px-1.5 py-0.5 rounded shadow-inner min-w-[24px] text-center border border-white/20">
                        62
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SubNavigation;
