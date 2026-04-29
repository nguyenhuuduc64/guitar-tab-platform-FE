import { Search, Music2, Sun, Moon, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export const Header = () => {
  const { theme, toggleTheme } = useTheme(); //

  return (
    <header className="h-16 border-b border-border-subtle px-8 flex items-center justify-between bg-main-bg/95 backdrop-blur-md sticky top-0 z-[100]">
      <div className="flex items-center gap-3 font-black text-xl tracking-tighter">
        <div className="bg-primary p-1.5 rounded-sm text-white">
          <Music2 size={20} />
        </div>
        <span>SmartChord AI</span>
      </div>

      <div className="flex-1 max-w-2xl px-12">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40"
            size={14}
          />
          {/* Sửa: Thanh search tự đổi màu nền theo theme */}
          <input
            type="text"
            placeholder="Tìm bài hát..."
            className="w-full bg-card-inner border border-border-subtle rounded-sm py-2 pl-12 pr-4 text-[12px] focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={toggleTheme}
          className="opacity-40 hover:opacity-100 transition-opacity"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};
