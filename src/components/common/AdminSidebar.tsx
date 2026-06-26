import { useLocation, useNavigate } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, Music2 } from "lucide-react";

import { cn } from "../../utils/cn";
import { sidebarItems } from "../../constants/sidebar";

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
                <div className="h-[72px] bg-[var(--primary-color)] px-5 flex items-center justify-between">
                    <div
                        className={cn(
                            "flex items-center",
                            collapsed ? "justify-center w-full" : "gap-3",
                        )}
                    >
                        {!collapsed && (
                            <div>
                                <h1 className="text-white font-semibold text-[20px] leading-none">
                                    Hatcungtoi
                                </h1>

                                <p className="text-violet-100 text-[11px] mt-1">
                                    Admin Dashboard
                                </p>
                            </div>
                        )}
                    </div>

                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="hidden md:flex text-white/90 hover:text-white transition cursor-pointer"
                        >
                            <PanelLeftClose size={18} />
                        </button>
                    )}

                    {collapsed && (
                        <button
                            onClick={() => setCollapsed(false)}
                            className="hidden md:flex absolute top-6 right-3 text-white/90 hover:text-white transition cursor-pointer"
                        >
                            <PanelLeftOpen size={18} />
                        </button>
                    )}

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
            </aside>
        </>
    );
}
