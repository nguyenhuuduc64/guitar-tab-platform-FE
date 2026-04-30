export const RankingRight = () => (
    <div className="flex flex-col">
        <h3 className="font-bold text-white  text-center bg-[var(--primary-color)] py-5 text-white">
            Mới nổi
        </h3>
        <div className="flex flex-col divide-y divide-border-subtle/30">
            {[1, 2, 3, 4, 5].map((num) => (
                <div
                    key={num}
                    className="py-5 flex gap-5 group cursor-pointer hover:bg-gray-100 px-8"
                >
                    <span className="text-[11px] font-bold text-[#262626] pt-0.5 group-hover:text-primary transition-colors">
                        {num.toString().padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                        <p className="text-[13px] text-main-fg group-hover:text-primary leading-tight transition-colors">
                            Dạo Gần Đây Anh Thấy Anh Không Bằng Ai Hết {num}
                        </p>
                        <p className="text-[9px] text-[#404040] mt-1.5 uppercase font-bold tracking-tighter">
                            Trending Now
                        </p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
