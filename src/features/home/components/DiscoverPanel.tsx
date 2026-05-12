export const DiscoverPanel = () => {
    const items = [
        { title: "Ứng dụng hợp âm", desc: "Hỗ trợ trên mobile" },
        { title: "Dịch vụ thu âm", desc: "Phòng thu chuyên nghiệp" },
        { title: "Điệu bài hát", desc: "Thư viện tiết tấu" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="group relative overflow-hidden rounded-sm border border-border-subtle bg-white p-5 transition-all hover:border-indigo-400 hover:shadow-sm"
                >
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-br from-indigo-50 via-transparent to-transparent" />

                    <div className="relative">
                        <h4 className="text-[13px] font-semibold text-main-fg mb-1 group-hover:text-indigo-600 transition-colors">
                            {item.title}
                        </h4>

                        <p className="text-[10px] text-main-fg opacity-50 uppercase tracking-widest group-hover:opacity-70 transition-opacity">
                            {item.desc}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
