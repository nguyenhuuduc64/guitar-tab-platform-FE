import React from "react";
import {
  User2,
  Plus,
  Settings,
  LogOut,
  Activity,
  Metronome,
  Sparkles,
  Library,
  ChevronRight,
} from "lucide-react";

export const Sidebar = () => {
  return (
    <aside className="w-60 border-r border-[#1f1f1f] h-[calc(100vh-3.5rem)] sticky top-14 bg-[#0a0a0a] hidden md:flex flex-col py-5">
      {/* 1. Profile Section - Thiết kế phẳng, không đổ bóng */}
      <div className="px-4 mb-8">
        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-[#121212] transition-colors cursor-pointer group">
          <div className="h-9 w-9 bg-[#1a1a1a] border border-[#262626] flex items-center justify-center text-[#737373] group-hover:border-[#3b82f6]/50">
            <User2 size={20} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Lyduc64</p>
            <div className="flex gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full bg-yellow-600/80"></div>
              <div className="w-2 h-2 rounded-full bg-blue-600/80"></div>
              <div className="w-2 h-2 rounded-full bg-red-600/80"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Action - Nút đơn sắc, không Gradient */}
      <div className="px-4 mb-6">
        <button className="w-full bg-white text-black hover:bg-[#e5e5e5] py-2 rounded-sm text-[13px] font-bold flex items-center justify-center gap-2 transition-all">
          <Plus size={16} strokeWidth={3} />
          ĐĂNG BÀI HÁT
        </button>
      </div>

      {/* 3. Navigation - Danh sách công cụ dạng list chuyên nghiệp */}
      <div className="flex-1 px-2">
        <div className="px-3 mb-2">
          <p className="text-[10px] font-bold text-[#404040] uppercase tracking-[0.15em]">
            Không gian làm việc
          </p>
        </div>
        <nav className="space-y-0.5">
          <SidebarItem
            icon={<Activity size={16} />}
            label="Chỉnh dây Guitar"
            active
          />
          <SidebarItem icon={<Metronome size={16} />} label="Máy đếm nhịp" />
          <SidebarItem icon={<Sparkles size={16} />} label="Gợi ý AI" />
          <SidebarItem icon={<Library size={16} />} label="Thư viện" />
        </nav>
      </div>

      {/* 4. Footer - Tối giản tuyệt đối */}
      <div className="px-2 mt-auto border-t border-[#141414] pt-4">
        <nav className="space-y-0.5">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-xs text-[#737373] hover:text-white transition-colors"
          >
            <Settings size={14} />
            Cài đặt hệ thống
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-xs text-[#737373] hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Đăng xuất
          </a>
        </nav>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, active = false }) => (
  <a
    href="#"
    className={`flex items-center justify-between px-3 py-2 text-[13px] transition-all group ${
      active
        ? "text-white bg-[#141414] border-l-2 border-white"
        : "text-[#a3a3a3] hover:text-white hover:bg-[#121212]"
    }`}
  >
    <div className="flex items-center gap-3">
      <span
        className={
          active ? "text-white" : "text-[#525252] group-hover:text-[#a3a3a3]"
        }
      >
        {React.cloneElement(icon, { strokeWidth: 1.5 })}
      </span>
      {label}
    </div>
    {active && <div className="w-1 h-1 bg-white rounded-full"></div>}
  </a>
);
