import { useEffect, useState, useRef } from "react";
import { Search, Menu, Sun, Moon, X, User as UserIcon, Settings, LogOut, Home, Music, ListMusic, Upload, Users, BookOpen } from "lucide-react";
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
import { useNavigate, Link } from "react-router-dom";
import NotificationDropdown from "../../components/common/NotificationDropdown";

// Helper functions for fuzzy search scoring in frontend console logging
const removeAccents = (str: string): string => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, (char) => (char === "đ" ? "d" : "D"));
};

const normalizeChat = (str: string): string => {
    if (!str) return "";
    let s = str.toLowerCase().trim().replace(/\s+/g, " ");
    s = s.replace(/([a-z])j/g, "$1i").replace(/j([a-z])/g, "i$1");
    if (s === "j") s = "i";
    s = s.replace(/w/g, "u").replace(/f/g, "ph").replace(/z/g, "d").replace(/dz/g, "d");
    s = s.replace(/aa/g, "a").replace(/ee/g, "e").replace(/oo/g, "o").replace(/dd/g, "d").replace(/uw/g, "u").replace(/ow/g, "o");
    return s;
};

const getBigramsList = (str: string): string[] => {
    const bigrams: string[] = [];
    if (!str || str.length < 2) return bigrams;
    for (let i = 0; i < str.length - 1; i++) {
        bigrams.push(str.substring(i, i + 2));
    }
    return bigrams;
};

const getDiceCoef = (s1: string, s2: string): number => {
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 1;
    const b1 = getBigramsList(s1);
    const b2 = getBigramsList(s2);
    if (b1.length === 0 || b2.length === 0) return 0;
    const counts: Record<string, number> = {};
    b1.forEach(bg => counts[bg] = (counts[bg] || 0) + 1);
    let intersection = 0;
    b2.forEach(bg => {
        if (counts[bg] && counts[bg] > 0) {
            intersection++;
            counts[bg]--;
        }
    });
    return (2.0 * intersection) / (b1.length + b2.length);
};

const getBestDiceSub = (query: string, title: string): number => {
    const qLen = query.length;
    const tLen = title.length;
    if (qLen >= tLen) return getDiceCoef(query, title);
    let maxDice = 0;
    const minWin = Math.max(1, qLen - 1);
    const maxWin = Math.min(tLen, qLen + 2);
    for (let len = minWin; len <= maxWin; len++) {
        for (let i = 0; i <= tLen - len; i++) {
            const sub = title.substring(i, i + len);
            const dice = getDiceCoef(query, sub);
            if (dice > maxDice) maxDice = dice;
        }
    }
    return maxDice;
};

const calcMatchScore = (query: string, title: string): number => {
    if (!query) return 0;
    const qNorm = normalizeChat(removeAccents(query));
    const tNorm = normalizeChat(removeAccents(title));
    if (qNorm === tNorm) return 100;
    return Math.round(getBestDiceSub(qNorm, tNorm) * 100);
};

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
        { name: "Trang chủ", href: "/" },
        { name: "Bài hát", href: "/bai-hat" },
        { name: "Hợp âm", href: "/hop-am" },
        { name: "Playlist", href: "/playlist" },
        { name: "Cộng đồng", href: "/community" },
        { name: "Đang theo dõi", href: "/following-feed" },
        { name: "Đăng tải", href: "/dang-tai" },
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
                const res = await instance.get(`/chords/ai-search`, {
                    params: { query: debouncedSearchQuery },
                });
                const results = res.data?.result || [];
                setSearchResults(results);

                // Log độ tương đồng của từng gợi ý ra console frontend
                console.log(`%c[AI Search] Từ khóa: "${debouncedSearchQuery}"`, "color: #ff6b6b; font-weight: bold;");
                results.forEach((chord: any) => {
                    const score = calcMatchScore(debouncedSearchQuery, chord.title);
                    console.log(`  - "${chord.title}": ${score}% (Nghệ sĩ: ${chord.artistName || "Chưa rõ"})`);
                });
                console.log("-----------------------------------------");
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

    const isAiPage = window.location.pathname.startsWith("/ai-composer");

    return (
        <>
            <nav className={`h-[var(--header-height)] fixed top-0 z-40 border-b border-white/10 dark:border-slate-800/60 bg-[var(--primary-color)] dark:bg-slate-950/95 backdrop-blur-md text-white ${
                isAiPage 
                    ? "left-0 w-full px-4 sm:px-6 lg:px-8 xl:px-12" 
                    : "lg:left-64 w-full lg:w-[calc(100%-16rem)] lg:px-8 xl:px-12"
            }`}>
                <div className="container mx-auto flex h-full items-center justify-between px-4 gap-4">
                    {/* LEFT SECTION: Logo & Nav Links */}
                    <div className="flex items-center h-full gap-6">
                        {/* Logo (Hidden on Desktop when Sidebar is visible, except on AI pages) */}
                        <div
                            className={`items-center gap-2.5 cursor-pointer shrink-0 ${
                                isAiPage ? "flex" : "flex lg:hidden"
                            }`}
                            onClick={() => navigate("/")}
                        >
                            <img src={logo} alt="Logo" className="h-8 w-auto filter brightness-200" />
                            <span className="text-sm font-black tracking-widest text-white uppercase hidden md:block">
                                Hatcungtoi
                            </span>
                        </div>

                        {/* Nav Links */}
                        <div className="hidden lg:flex items-center h-full text-sm font-medium">
                            {navLinks.filter(link => link.name !== "Đăng tải").map((link) => {
                                const isActive = window.location.pathname === link.href || 
                                    (link.href !== '/' && window.location.pathname.startsWith(link.href));
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className={`h-[var(--header-height)] flex items-center px-4 transition-all font-semibold border-b-2 border-transparent ${
                                            isActive
                                                ? "text-white border-b-2 border-white dark:border-[var(--primary-color)] bg-white/10 dark:bg-slate-900/50"
                                                : "text-white/80 dark:text-[#ccc] hover:bg-white/10 dark:hover:bg-slate-900/30 hover:text-white"
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* CENTER SECTION: Search Bar */}
                    <div className="flex-1 max-w-sm sm:max-w-md md:max-w-lg xl:max-w-xl mx-2 md:mx-4 relative" ref={searchRef}>
                        <div className="relative w-full">
                            <Input
                                type="search"
                                placeholder="Tìm kiếm bài hát, nghệ sĩ..."
                                value={searchQuery || ""}
                                onFocus={() => setShowSuggestions(true)}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 pl-3 pr-10 bg-white/15 dark:bg-slate-900 border-none text-white placeholder:text-white/70 dark:placeholder:text-slate-450 text-[13px] rounded-sm focus:bg-white/25 dark:focus:bg-slate-800 focus:text-white outline-none focus-visible:ring-1 focus-visible:ring-white/10 [&::-webkit-search-cancel-button]:hidden"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-9 top-1/2 -translate-y-1/2 p-0.5 text-white/50 dark:text-white/40 hover:text-white/85 dark:hover:text-white/75 transition-colors cursor-pointer border-none outline-none bg-transparent"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-0 text-white/60 dark:text-[#888888] hover:text-white cursor-pointer border-none outline-none bg-transparent">
                                <Search className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && searchQuery.trim() !== "" && (
                            <div className="absolute top-full mt-2 w-full bg-white dark:bg-[#1e1e1e] border border-slate-100 dark:border-[#333333] shadow-2xl max-h-60 overflow-y-auto z-50 py-2 rounded-sm text-left">
                                {isSearching ? (
                                    <div className="px-4 py-2 text-xs text-gray-400 text-center">
                                        Đang tìm kiếm...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((chord) => (
                                        <div
                                            key={chord.id}
                                            onClick={() => {
                                                navigate(`/song/${chord.id}`);
                                                setShowSuggestions(false);
                                                setSearchQuery("");
                                            }}
                                            className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-[#2c2c2c] cursor-pointer flex flex-col transition-colors border-b border-slate-100 dark:border-[#2c2c2c]/50 last:border-none"
                                        >
                                            <span className="font-semibold text-sm text-slate-800 dark:text-white">
                                                {chord.title}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                                {chord.artistName || "Chưa rõ nghệ sĩ"}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-2 text-xs text-gray-400 text-center">
                                        Không tìm thấy bài hát nào
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT SECTION: Actions */}
                    <div className="flex items-center gap-4 shrink-0">
                        {/* Upload (Đăng tải) */}
                        <Link
                            to="/dang-tai"
                            className="hidden lg:block text-white/90 dark:text-[#ccc] hover:text-white text-sm font-semibold transition-colors"
                        >
                            Đăng tải
                        </Link>

                        {/* Theme Switcher */}
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 hover:bg-white/10 dark:hover:bg-[#222222] rounded-full transition-colors text-white/90 dark:text-[#ccc] hover:text-white cursor-pointer border-none outline-none bg-transparent"
                        >
                            {theme === "dark" ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>

                        {/* User Notification & Profile Dropdown */}
                        {user ? (
                            <>
                                <NotificationDropdown
                                    textColor="text-white"
                                    hoverBg="hover:bg-white/10 dark:hover:bg-[#222222]"
                                    badgeRingColor="ring-[var(--primary-color)] dark:ring-[#111111]"
                                />

                                <Dropdown
                                    items={menuItems}
                                    trigger={
                                        <Avatar className="h-8 w-8 cursor-pointer border border-white/20 dark:border-[#444444] hover:border-white transition-colors">
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
                            </>
                        ) : (
                            !loading && (
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="text-white/95 dark:text-[#ccc] hover:text-white text-xs font-bold px-2 py-1.5 transition-colors"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/dang-ky"
                                        className="bg-white dark:bg-[var(--primary-color)] hover:bg-white/90 dark:hover:bg-[var(--primary-color)]/90 text-[var(--primary-color)] dark:text-white text-xs font-bold px-3 py-1.5 rounded-sm transition-colors border border-transparent dark:border-white/10"
                                    >
                                        Tạo tài khoản
                                    </Link>
                                </div>
                            )
                        )}

                        {/* Hamburger menu for mobile */}
                        <button
                            className="lg:hidden p-1.5 hover:bg-white/10 dark:hover:bg-[#222222] rounded-full transition-colors text-white/90 dark:text-[#ccc] hover:text-white cursor-pointer border-none outline-none bg-transparent"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Mobile Drawer Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-[280px] bg-white/97 dark:bg-slate-900/97 backdrop-blur-md z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
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
                            let IconComp = Home;
                            if (link.name === "Bài hát") {
                                IconComp = Music;
                            } else if (link.name === "Hợp âm") {
                                IconComp = BookOpen;
                            } else if (link.name === "Playlist") {
                                IconComp = ListMusic;
                            } else if (link.name === "Cộng đồng") {
                                IconComp = Users;
                            } else if (link.name === "Đăng tải") {
                                IconComp = Upload;
                            }
                            return (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className="flex items-center gap-3 px-3 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all font-medium text-sm"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <IconComp className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span>{link.name}</span>
                                </Link>
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
