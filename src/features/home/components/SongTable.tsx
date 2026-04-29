export const SongTable = () => {
  const songs = [
    {
      title: "Phép Màu (OST Đàn Cá Gỗ)",
      artist: "MAYDAYs, Minh Tốc",
      user: "Nguyễn Đức Kiên",
      time: "14 tháng 06, 2025 lúc 03:35pm",
      views: "2,398",
      preview: [
        "[G] Ngày thay [C/G] đêm, vội [G] trôi giấc [D/F#] mơ êm",
        "[C] Tôi lênh đênh trên [G] biển vắng",
      ],
      tags: ["A", "Am7", "Bm7", "C"],
      genre: "Ballad",
    },
    {
      title: "Gội Đầu",
      artist: "Thắng, Hà Lê",
      user: "hyon277",
      time: "22 tháng 03, 2026 lúc 10:59pm",
      views: "1,824",
      preview: ["[Am] Ngồi tới ba giờ thấy", "[F#m7b5] Lời rót ra tờ giấy"],
      tags: ["Am", "F", "E7"],
      genre: "",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {songs.map((song, i) => (
        <div
          key={i}
          className="bg-card-bg border border-border-subtle rounded-sm p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-sm font-bold text-main-fg">{song.title}</h3>
              <p className="text-[11px] text-main-fg/40 mt-1">{song.artist}</p>
              <p className="text-[11px] text-main-fg/40 mt-1">
                {song.user}, {song.time}
              </p>
            </div>

            <div className="text-[11px] text-main-fg/40 ">{song.views} 👁</div>
          </div>

          {/* Preview lyrics */}
          <div className=" text-[13px] leading-7 text-main-fg/80 mt-3 space-y-1">
            {song.preview.map((line, idx) => (
              <p key={idx}>
                {line.split(/(\[.*?\])/g).map((part, i) =>
                  part.startsWith("[") ? (
                    <span key={i} className="text-primary font-bold">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2 flex-wrap">
              {song.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-1 bg-card-inner border border-border-subtle rounded-sm text-main-fg/60"
                >
                  {tag}
                </span>
              ))}
            </div>

            {song.genre && (
              <span className="text-[11px] px-2 py-1 bg-primary/10 text-primary rounded-sm">
                Điệu {song.genre}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
