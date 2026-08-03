import { useLocation, useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, Music2, LogOut } from "lucide-react";

import { cn } from "../../utils/cn";
import logo from "../../assets/logo.png";
import { sidebarItems } from "../../constants/sidebar";
import { handleLogout } from "../../utils/auth";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;

    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
};

export default function AdminSidebar({
    open,
    setOpen,
    collapsed,
    setCollapsed,
}: Props) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    return (
        <>
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 bg-black/30 z-[1000] md:hidden"
                />
            )}

            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen bg-white dark:bg-slate-900 z-[1001]",
                    "transition-all duration-300 ease-in-out",
                    "border-r border-slate-200 dark:border-slate-800 shadow-sm",
                    collapsed ? "w-[82px]" : "w-[270px]",
                    open ? "translate-x-0" : "-translate-x-full",
                    "md:translate-x-0",
                )}
            >
                <div className="h-[72px] bg-[var(--primary-color)] px-4 flex items-center justify-between">
                    <div
                        className={cn(
                            "flex items-center cursor-pointer select-none",
                            collapsed ? "justify-center w-full" : "gap-2.5",
                        )}
                        onClick={() => navigate("/")}
                    >
                        <img src={logo} alt="Logo" className="h-8 w-auto filter brightness-200 shrink-0" />
                        {!collapsed && (
                            <div className="flex flex-col text-left">
                                <span className="text-white font-black tracking-widest text-[16px] uppercase leading-tight">
                                    Hatcungtoi
                                </span>
                                <span className="text-violet-150 text-[10px] tracking-wider uppercase font-bold leading-none mt-0.5">
                                    Admin Dashboard
                                </span>
                            </div>
                        )}
                    </div>



                    <button
                        onClick={() => setOpen(false)}
                        className="md:hidden text-white cursor-pointer"
                    >
                        <PanelLeftClose size={18} />
                    </button>
                </div>

                <div className="px-5 pt-6 pb-3">
                    {!collapsed && (
                        <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-slate-400 dark:text-slate-500">
                            Navigation
                        </p>
                    )}
                </div>

                <nav className="space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.path;

                        const Icon = item.icon;

                        return (
                            <div
                                key={item.path}
                                onClick={() => {
                                    setOpen(false);

                                    setTimeout(() => navigate(item.path), 0);
                                }}
                                className={cn(
                                    "relative flex items-center cursor-pointer transition-all duration-200",
                                    collapsed
                                        ? "justify-center h-12"
                                        : "gap-3 px-4 py-3",
                                    isActive
                                        ? "bg-[var(--secondary-color)] text-[var(--primary-color)]"
                                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200",
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full bg-[var(--primary-color)]" />
                                )}

                                <Icon
                                    size={16}
                                    className={cn(
                                        isActive
                                            ? "text-[var(--primary-color)]"
                                            : "text-slate-500 dark:text-slate-400",
                                        collapsed
                                            ? "text-[var(--primary-color)]"
                                            : "",
                                    )}
                                />

                                {!collapsed && (
                                    <span className="text-[14px] font-medium">
                                        {item.name}
                                    </span>
                                )}

                                {collapsed && (
                                    <div
                                        className="
                                            absolute left-full ml-3
                                            px-3 py-1.5 rounded-lg
                                            bg-slate-900
                                            text-xs text-white
                                            opacity-0 invisible
                                            group-hover:opacity-100
                                            group-hover:visible
                                            whitespace-nowrap
                                            transition-all
                                            z-50
                                        "
                                    >
                                        {item.name}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="absolute bottom-5 left-0 right-0 px-3">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200",
                            "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20",
                            collapsed ? "justify-center" : ""
                        )}
                    >
                        <LogOut size={16} />
                        {!collapsed && <span className="text-[14px] font-medium">Đăng xuất</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
