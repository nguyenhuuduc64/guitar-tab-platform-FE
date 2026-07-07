import { useEffect, useState, useRef } from "react";
import { Search, Menu, Sun, Moon, X, User as UserIcon, Settings, LogOut, Compass, PlusCircle, Library, Users } from "lucide-react";
import ButtonCustom from "../../components/common/ButtonCustom";
import { Input } from "../../components/ui/Input";
import { useDebounce } from "../../hooks/useDebounce";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "../../components/ui/Avatar";
import { useTheme } from "../../context/ThemeContext";
import instance from "../../config/axios";
import Dropdown from "../../components/common/Dropdown";
import { faUser, faSignOutAlt, faCog } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "../../components/common/NotificationDropdown";

export const Navigation = () => {
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 400);
    const searchRef = useRef<HTMLDivElement>(null);

    const menuItems = [
        {
            name: "Trang cá nhân",
            icon: faUser,
            onClick: () => navigate("/trang-ca-nhan"),
        },
        {
            name: "Cài đặt",
            icon: faCog,
            onClick: () => console.log("Settings"),
        },
        {
            name: "Đăng xuất",
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

    useEffect(() => {
        const searchChords = async () => {
            if (!debouncedSearchQuery.trim()) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await instance.get(`/chords`, {
                    params: { search: debouncedSearchQuery },
                });
                setSearchResults(res.data?.result?.data || res.data?.result || []);
            } catch (err) {
                console.error("Lỗi tìm kiếm:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        searchChords();
    }, [debouncedSearchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isMenuOpen]);

    return (
        <>
            <nav className="h-[var(--header-height)] lg:px-20 fixed top-0 z-50 w-full border-b border-border-subtle dark:border-slate-800/60 bg-[var(--primary-color)] dark:bg-slate-950/95 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate("/")}
                    >
                        <img src={logo} alt="" className="h-10 w-auto" />
                        <span className="text-xl font-bold text-white">
                            Hatcungtoi
                        </span>
                    </div>

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

                    <div className="flex items-center gap-3">
                        <div
                            ref={searchRef}
                            className="relative hidden lg:flex items-center"
                        >
                            <Search className="absolute left-3 h-4 w-4 opacity-40 text-white z-10" />
                            <Input
                                type="search"
                                placeholder="Tìm kiếm..."
                                value={searchQuery || ""}
                                onFocus={() => setShowSuggestions(true)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 pl-10 pr-8 bg-white dark:bg-slate-900 border-none text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-white/20 [&::-webkit-search-cancel-button]:hidden"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 p-0.5 text-black/40 dark:text-white/40 hover:text-black/70 dark:hover:text-white/70 transition-colors cursor-pointer border-none outline-none bg-transparent"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}

                            {showSuggestions && searchQuery.trim() !== "" && (
                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 shadow-xl border border-gray-100 dark:border-slate-800/80 max-h-60 overflow-y-auto z-50 py-2 rounded-lg">
                                    {isSearching ? (
                                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                            Đang tìm kiếm...
                                        </div>
                                    ) : searchResults.length > 0 ? (
                                        searchResults.map((chord) => (
                                            <div
                                                key={chord.id}
                                                onClick={() => {
                                                    navigate(
                                                        `/song/${chord.id}`,
                                                    );
                                                    setShowSuggestions(false);
                                                    setSearchQuery("");
                                                }}
                                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex flex-col transition-colors"
                                            >
                                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                                    {chord.title}
                                                </span>
                                                <span className="text-xs text-gray-400 line-clamp-1">
                                                    {chord.artistName ||
                                                        "Chưa rõ nghệ sĩ"}{" "}
                                                    •{" "}
                                                    {chord.content
                                                        ?.replace(
                                                            /\[.*?\]/g,
                                                            "",
                                                        )
                                                        .substring(0, 35)}
                                                    ...
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                            Không tìm thấy bài hát nào
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-white/10 dark:hover:bg-slate-800/40 rounded-full transition-all text-white cursor-pointer border-none outline-none"
                        >
                            {theme === "dark" ? (
                                <Sun className="h-5 w-5 text-white" />
                            ) : (
                                <Moon className="h-5 w-5 text-white" />
                            )}
                        </button>

                        {user && (
                            <NotificationDropdown
                                textColor="text-white"
                                hoverBg="hover:bg-white/10"
                                badgeRingColor="ring-[var(--primary-color)]"
                            />
                        )}

                        {!loading && (
                            <div className="hidden md:block">
                                {user ? (
                                    <Dropdown
                                        items={menuItems}
                                        trigger={
                                            <Avatar className="h-8 w-8 cursor-pointer ring-offset-2 ring-offset-[var(--primary-color)] hover:ring-2 hover:ring-white transition-all">
                                                <AvatarImage
                                                    src={
                                                        user.imageUrl ||
                                                        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
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

                        <button
                            className="md:hidden p-2 hover:bg-white/10 dark:hover:bg-slate-800/40 rounded-full transition-all text-white cursor-pointer border-none outline-none"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu className="h-6 w-6 text-white" />
                        </button>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-[280px] bg-white/97 dark:bg-slate-900/97 backdrop-blur-md z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-5 border-b border-gray-100/80 dark:border-slate-800/80">
                        <span className="font-bold text-lg text-slate-800 dark:text-white">
                            Hatcungtoi
                        </span>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border-none outline-none bg-transparent"
                        >
                            <X className="h-6 w-6 dark:text-white" />
                        </button>
                    </div>

                    {user ? (
                        <div className="p-4 mx-4 my-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl shadow-xs">
                            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm shrink-0">
                                <AvatarImage src={user.imageUrl || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"} />
                                <AvatarFallback>
                                    {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                                    {user.fullName || user.username}
                                </span>
                                <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full w-fit mt-1">
                                    Thành viên
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 mx-4 my-3 flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 rounded-2xl">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Vui lòng đăng nhập để sử dụng đầy đủ tính năng</p>
                            <a
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full text-center py-2 bg-[var(--primary-color)] text-white font-medium text-sm rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Đăng nhập
                              </a>
                        </div>
                    )}

                    <div className="flex flex-col px-4 gap-1 overflow-y-auto flex-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mt-2 mb-1">Menu</span>
                        {navLinks.map((link) => {
                            let IconComp = Compass;
                            if (link.name === "Tạo hợp âm") {
                                IconComp = PlusCircle;
                            } else if (link.name === "Thư viện") {
                                IconComp = Library;
                            } else if (link.name === "Cộng đồng") {
                                IconComp = Users;
                            }
                            return (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="flex items-center gap-3 px-3 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all font-medium text-sm"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <IconComp className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span>{link.name}</span>
                                </a>
                            );
                        })}
                        
                        {user && (
                            <>
                                <hr className="my-2 border-slate-100 dark:border-slate-800" />
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-1">Tài khoản</span>
                                {menuItems.map((item) => {
                                    let IconComp = UserIcon;
                                    let colorClass = "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50";
                                    if (item.name === "Cài đặt") {
                                        IconComp = Settings;
                                    } else if (item.name === "Đăng xuất") {
                                        IconComp = LogOut;
                                        colorClass = "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20";
                                    }
                                    
                                    return (
                                        <button
                                            key={item.name}
                                            onClick={() => {
                                                item.onClick();
                                                setIsMenuOpen(false);
                                            }}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm w-full text-left cursor-pointer ${colorClass}`}
                                        >
                                            <IconComp className="h-5 w-5 shrink-0" />
                                            <span>{item.name}</span>
                                        </button>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
