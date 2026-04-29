import { User2, Plus, Guitar, Timer, ChevronRight } from "lucide-react";
import ButtonCustom from "../../../components/ui/ButtonCustom";

export const SidebarLeft = () => (
  <div className="flex flex-col gap-6">
    {/* Profile Card */}
    <div className="bg-card-bg bg-white border border-border-subtle rounded-sm p-4 bg-white">
      <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.25em] mb-4">
        Cá nhân
      </p>

      <div className="flex items-center gap-4 group cursor-pointer">
        <div className="h-12 w-12 bg-card-inner border border-border-subtle rounded flex items-center justify-center">
          <User2 size={24} strokeWidth={1.5} className="opacity-40" />
        </div>

        <div>
          <p className="text-sm font-bold tracking-tight">Lyduc64</p>
          <div className="flex gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500/30" />
            <span className="w-2 h-2 rounded-full bg-blue-500/30" />
            <span className="w-2 h-2 rounded-full bg-red-500/30" />
          </div>
        </div>
      </div>
    </div>

    {/* Action Button */}
    <ButtonCustom variant="primary">ĐĂNG BÀI HÁT</ButtonCustom>

    {/* Tools Card */}
    <div className="bg-card-bg bg-white border border-border-subtle rounded-sm p-4">
      <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.25em] mb-4">
        Công cụ
      </p>

      <div className="flex items-center gap-3 px-3 py-3 text-[13px] bg-card-inner border border-border-subtle rounded-sm cursor-pointer hover:bg-main-bg transition-colors">
        <Guitar size={16} strokeWidth={1.5} className="text-primary" />
        Guitar Tuner
      </div>
    </div>

    {/* Discover Card (GIỐNG ẢNH ÔNG GỬI) */}
    <div className="bg-card-bg bg-white border border-border-subtle rounded-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle">
        <p className="text-sm font-semibold">Khám phá thêm</p>
      </div>

      {["Pick gảy đàn", "Đăng bài hát", "Dịch vụ hòa âm phối khí"].map(
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
