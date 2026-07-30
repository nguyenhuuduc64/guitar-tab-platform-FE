import { useLocation } from "react-router-dom";
import { Navigation } from "./Navigation";
import { SidebarLeft } from "../../features/home/components/SidebarLeft";

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const isAiPage = location.pathname.startsWith("/ai-composer");
    const isAdminPage = location.pathname.startsWith("/admin");
    const showSidebar = !isAiPage && !isAdminPage;

    return (
        <div className="flex flex-col min-h-screen">
            <Navigation />
            <div className="w-full mx-auto absolute top-[var(--header-height)] min-h-[calc(100vh-var(--header-height))] flex bg-slate-50 dark:bg-slate-950 font-sans">
                {showSidebar && (
                    <aside className="w-64 shrink-0 hidden lg:block z-30">
                        <SidebarLeft />
                    </aside>
                )}
                <div className="flex-grow min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
};
