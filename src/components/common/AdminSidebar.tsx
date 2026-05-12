import { useLocation, useNavigate } from "react-router-dom";
import { PanelLeftClose } from "lucide-react";
import { cn } from "../../utils/cn";
import { sidebarItems } from "../../constants/sidebar";

type Props = {
    open: boolean;
    setOpen: (value: boolean) => void;
};

export default function AdminSidebar({ open, setOpen }: Props) {
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
                    "fixed top-0 left-0 h-screen w-64 bg-white z-[1001]",
                    "transform transition-transform duration-300",
                    open ? "translate-x-0" : "-translate-x-full",
                    "md:translate-x-0",
                )}
            >
                <div className="p-6 flex items-center justify-between border-b">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            <div className="w-2 h-6 bg-cyan-400 rounded-full" />
                            <div className="w-2 h-6 bg-purple-500 rounded-full mt-1" />
                            <div className="w-2 h-6 bg-orange-400 rounded-full" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">
                            Design
                        </span>
                    </div>

                    <button
                        onClick={() => setOpen(false)}
                        className="md:hidden text-slate-400"
                    >
                        <PanelLeftClose size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                                    "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition",
                                    isActive
                                        ? "bg-[var(--click-color)] text-white font-medium"
                                        : "text-gray-500 hover:bg-gray-50",
                                )}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>

                                {isActive && (
                                    <div className="ml-auto w-1 h-6 bg-white rounded-full" />
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
