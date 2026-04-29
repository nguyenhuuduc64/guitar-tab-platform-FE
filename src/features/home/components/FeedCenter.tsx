export const FeedCenter = () => (
  <div className="flex flex-col gap-6">
    {/* Hero Section */}
    <section className="border border-border-subtle bg-card-bg rounded-sm p-6">
      <h2 className="text-xl font-bold mb-4">Phép Màu (OST Đàn Cá Gỗ)</h2>
      <div className="p-4 bg-main-bg border border-border-subtle rounded-sm  text-[14px] leading-8 whitespace-pre-wrap selection:bg-primary/30">
        <p>Ver 1:</p>
        <p>
          <span className="text-primary font-bold">[G]</span> Ngày thay{" "}
          <span className="text-primary font-bold">[C/G]</span> đêm...
        </p>
      </div>
    </section>

    {/* Discover List */}
    <section className="border border-border-subtle bg-card-bg rounded-sm divide-y divide-border-subtle">
      {["Dịch vụ thu âm", "Điệu bài hát", "Luyện tai nghe"].map((item) => (
        <div
          key={item}
          className="p-4 flex justify-between items-center hover:bg-main-bg/50 cursor-pointer transition-colors group"
        >
          <span className="text-sm font-medium">{item}</span>
          <span className="text-muted group-hover:text-main-fg">→</span>
        </div>
      ))}
    </section>
  </div>
);
