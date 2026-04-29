import React, { useEffect, useState } from "react";
import { Music, Search, Bell, Menu, Sun, Moon } from "lucide-react";
import ButtonCustom from "../components/ui/ButtonCustom";
import { Input } from "../components/ui/Input";
import { Avatar } from "../components/ui/Avatar";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

export const Navigation = () => {
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/user/login", {
          withCredentials: true, // nếu dùng cookie
        });

        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <nav className="px-35 sticky top-0 z-50 w-full border-b border-border-subtle bg-[var(--primary-color)] backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Music className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SmartChord AI
          </span>
        </div>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
          <a href="#" className="hover:text-primary transition-colors">
            Khám phá
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Tạo hợp âm
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Thư viện
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Cộng đồng
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:flex items-center">
            <Search className="absolute left-3 h-4 w-4 opacity-40" />
            <Input
              type="search"
              placeholder="Tìm bài hát, nghệ sĩ..."
              className="w-64 pl-10 rounded-full bg-card-inner border border-border-subtle"
            />
          </div>

          {/* Notification */}
          <ButtonCustom variant="ghost" className="p-2">
            <Bell className="h-5 w-5 text-white" />
          </ButtonCustom>

          {/* Theme */}
          <ButtonCustom variant="ghost" className="p-2" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-white" />
            ) : (
              <Moon className="h-5 w-5 text-white" />
            )}
          </ButtonCustom>

          {/* 🔥 AUTH AREA */}
          {!loading && (
            <>
              {user ? (
                <Avatar
                  src={user.avatar || ""}
                  fallback={user.name?.charAt(0) || "U"}
                  className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                />
              ) : (
                <ButtonCustom
                  name="Đăng nhập"
                  variant="primary"
                  className="text-sm px-4 py-2"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                />
              )}
            </>
          )}

          {/* Mobile menu */}
          <ButtonCustom variant="ghost" className="md:hidden p-2">
            <Menu className="h-5 w-5 text-white" />
          </ButtonCustom>
        </div>
      </div>
    </nav>
  );
};
