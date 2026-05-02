import { Header } from "./Header";
import { SidebarLeft } from "../../features/home/components/SidebarLeft";
import { RankingRight } from "../../features/home/components/RankingRight";
import { Navigation } from "./Navigation";
import SubNavigation from "./SubNavigation";

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col bg-main-bg">
            <Navigation />
            <SubNavigation />
            <div className="w-full max-w-[1200px] mx-auto p-4">{children}</div>
        </div>
    );
};
