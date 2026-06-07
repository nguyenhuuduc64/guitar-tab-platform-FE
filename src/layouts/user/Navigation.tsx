import { useEffect, useState, useRef } from "react";
import { Search, Menu, Sun, Moon, X } from "lucide-react";
import ButtonCustom from "../../components/ui/ButtonCustom";
import { Input } from "../../components/ui/Input";
import { useDebounce } from "../../hooks/useDebounce";
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

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 400);
    const searchRef = useRef<HTMLDivElement>(null);

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
                setSearchResults(res.data.result || []);
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
            <nav className="h-[var(--header-height)] lg:px-20 sticky top-0 z-50 w-full border-b border-border-subtle bg-[var(--primary-color)] backdrop-blur-md">
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
                                className="w-64 pl-10 rounded-full bg-white border-none text-black placeholder:text-black/50"
                            />

                            {showSuggestions && searchQuery.trim() !== "" && (
                                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto z-50 py-2">
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

                        <ButtonCustom
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

            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-slate-900 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex flex-col h-full">
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
