import { useEffect, useState } from "react";
import { Search, Menu, Sun, Moon, X } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Profile",
            icon: faUser,
            onClick: () => navigate("/trang-ca-nhan"),
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

    const navLinks = [
        { name: "Khám phá", href: "/discover" },
        { name: "Tạo hợp âm", href: "/create" },
        { name: "Thư viện", href: "/library" },
        { name: "Cộng đồng", href: "/community" },
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
                setUser(res.data.result);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Khóa cuộn trang khi mở menu
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isMenuOpen]);

    return (
        <>
            <nav className="h-[var(--header-height)] lg:px-20 sticky top-0 z-50 w-full border-b border-border-subtle bg-[var(--primary-color)] backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <img src={logo} alt="" className="h-10 w-auto" />
                        <span className="text-xl font-bold text-white">
                            Hatcungtoi
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="hover:text-primary transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <div className="relative hidden lg:flex items-center">
                            <Search className="absolute left-3 h-4 w-4 opacity-40 text-white" />
                            <Input
                                type="search"
                                placeholder="Tìm kiếm..."
                                className="w-48 pl-10 rounded-full bg-white/10 border-none text-white placeholder:text-white/50"
                            />
                        </div>

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
                            <div className="hidden md:block">
                                {user ? (
                                    <Dropdown
                                        items={menuItems}
                                        trigger={
                                            <Avatar className="h-8 w-8 cursor-pointer ring-offset-2 ring-offset-primary hover:ring-2 hover:ring-white transition-all">
                                                <AvatarImage
                                                    src={
                                                        user.avatar ||
                                                        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {user.name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        }
                                    />
                                ) : (
                                    <a
                                        href="/login"
                                        className="text-white text-sm font-medium"
                                    >
                                        Đăng nhập
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Mobile Menu Button (Dấu 3 gạch) */}
                        <ButtonCustom
                            variant="ghost"
                            className="md:hidden p-2"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu className="h-6 w-6 text-white" />
                        </ButtonCustom>
                    </div>
                </div>
            </nav>

            {/* OVERLAY */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* SIDE MENU (Mobile) */}
            <div
                className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-slate-900 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header Side Menu */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                        <span className="font-bold text-lg dark:text-white">
                            Menu
                        </span>
                        <ButtonCustom
                            variant="ghost"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <X className="h-6 w-6 dark:text-white" />
                        </ButtonCustom>
                    </div>

                    {/* User Info in Mobile Menu */}
                    {user && (
                        <div className="p-5 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>
                                    {user.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm dark:text-white">
                                    {user.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                    Thành viên
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Nav Links */}
                    <div className="flex flex-col p-4 gap-2">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <hr className="my-2 border-gray-100 dark:border-gray-800" />
                        {user ? (
                            menuItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => {
                                        item.onClick();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 p-3 text-red-500 font-medium"
                                >
                                    {item.name}
                                </button>
                            ))
                        ) : (
                            <a
                                href="/login"
                                className="p-3 text-primary font-bold"
                            >
                                Đăng nhập
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
