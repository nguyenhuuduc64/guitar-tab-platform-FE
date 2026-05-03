import React, { useEffect, useState } from "react";
import { Music, Search, Bell, Menu, Sun, Moon } from "lucide-react";
import ButtonCustom from "../../components/ui/ButtonCustom";
import { Input } from "../../components/ui/Input";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "../../components/ui/Avatar";
import { useTheme } from "../../context/ThemeContext";
import instance from "../../config/axios";
import Dropdown from "../../components/ui/Dropdown";
import { faUser, faSignOutAlt, faCog } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/logo.png";
export const Navigation = () => {
    const { theme, toggleTheme } = useTheme();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const menuItems = [
        {
            name: "Profile",
            icon: faUser,
            onClick: () => console.log("Profile"),
        },
        {
            name: "Settings",
            icon: faCog,
            onClick: () => console.log("Settings"),
        },
        {
            name: "Logout",
            icon: faSignOutAlt,
            onClick: () => {
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
            },
        },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("accessToken");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await instance.get("/users/my-info");
                console.log(res.data.result);
                setUser(res.data.result); // Thường dữ liệu nằm trong field result
            } catch (err) {
                console.error("Token hết hạn hoặc không hợp lệ");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <nav className="h-[var(--header-height)] px-35 sticky top-0 z-50 w-full border-b border-border-subtle bg-[var(--primary-color)] backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => (window.location.href = "/")}
                >
                    <img src={logo} alt="" className="h-10 w-auto" />
                    <span className="text-xl font-bold text-white">
                        SmartChord AI
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
                    <a
                        href="#"
                        className="hover:text-primary transition-colors"
                    >
                        Khám phá
                    </a>
                    <a
                        href="#"
                        className="hover:text-primary transition-colors"
                    >
                        Tạo hợp âm
                    </a>
                    <a
                        href="#"
                        className="hover:text-primary transition-colors"
                    >
                        Thư viện
                    </a>
                    <a
                        href="#"
                        className="hover:text-primary transition-colors"
                    >
                        Cộng đồng
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative hidden md:flex items-center">
                        <Search className="absolute left-3 h-4 w-4 opacity-40" />
                        <Input
                            type="search"
                            placeholder="Tìm bài hát, nghệ sĩ..."
                            className="w-64 pl-10 rounded-full bg-card-inner border border-border-subtle"
                        />
                    </div>

                    <ButtonCustom variant="ghost" className="p-2">
                        <Bell className="h-5 w-5 text-white" />
                    </ButtonCustom>

                    <ButtonCustom
                        variant="ghost"
                        className="p-2"
                        onClick={toggleTheme}
                    >
                        {theme === "dark" ? (
                            <Sun className="h-5 w-5 text-white" />
                        ) : (
                            <Moon className="h-5 w-5 text-white" />
                        )}
                    </ButtonCustom>

                    {!loading && (
                        <>
                            {user ? (
                                <Dropdown
                                    items={menuItems}
                                    trigger={
                                        <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                                            <AvatarImage
                                                src={
                                                    user.avatar ||
                                                    "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                                                }
                                            />
                                            <AvatarFallback>
                                                {user.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    }
                                />
                            ) : (
                                <a
                                    href="/login"
                                    className="text-white hover:text-gray-200 transition-colors px-2 py-2"
                                >
                                    Đăng nhập
                                </a>
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
