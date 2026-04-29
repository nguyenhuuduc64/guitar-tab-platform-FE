export const DiscoverPanel = () => {
  const items = [
    { title: "Ứng dụng hợp âm", desc: "Hỗ trợ trên mobile" },
    { title: "Dịch vụ thu âm", desc: "Phòng thu chuyên nghiệp" },
    { title: "Điệu bài hát", desc: "Thư viện tiết tấu" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="group border bg-white border-border-subtle bg-card-inner p-5 rounded-sm hover:border-primary/50 cursor-pointer transition-all"
        >
          <h4 className="text-[13px] font-black text-main-fg mb-1">
            {item.title}
          </h4>
          <p className="text-[10px] text-main-fg opacity-40 uppercase tracking-widest">
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  );
};
