import { Search, Sun, Moon } from "lucide-react";
import { Input } from "../ui/Input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/Avatar";
import NotificationDropdown from "./NotificationDropdown";
import { useTheme } from "../../context/ThemeContext";
import { useState, useEffect } from "react";
import { getUserInfo } from "../../utils/auth";

export default function TopHeader() {
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserInfo();
                setUser(data);
            } catch (err) {
                console.error("Lỗi khi lấy thông tin admin ở TopHeader:", err);
            }
        };
        fetchUser();
    }, []);

    return (
        <header className="flex h-16 items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 text-slate-800 dark:text-slate-150">
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={18}
                />
                <Input
                    type="text"
                    placeholder="Search or type a command"
                    className="w-full pl-10 bg-slate-50 dark:bg-slate-800/80 border-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-lg text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
            </div>

            {/* Actions: Notification & Profile */}
            <div className="flex items-center gap-6">
                <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-full transition-all text-slate-500 dark:text-slate-400 cursor-pointer border-none outline-none bg-transparent"
                >
                    {theme === "dark" ? (
                        <Sun size={18} className="text-amber-500" />
                    ) : (
                        <Moon size={18} />
                    )}
                </button>

                <NotificationDropdown
                    textColor="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-250"
                    hoverBg="hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    badgeRingColor="ring-white dark:ring-slate-900"
                />

                <Avatar className="h-9 w-9 cursor-pointer border dark:border-slate-800">
                    <AvatarImage src={user?.imageUrl || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} alt={user?.username || "Admin"} />
                    <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "AD"}</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
