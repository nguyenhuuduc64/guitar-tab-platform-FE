import { Header } from "./Header";
import { SidebarLeft } from "../../features/home/components/SidebarLeft";
import { RankingRight } from "../../features/home/components/RankingRight";
import { Navigation } from "./Navigation";
import SubNavigation from "./SubNavigation";

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className=" flex flex-col min-h-screen">
            <Navigation />
            <SubNavigation />
            <div className="w-full mx-auto absolute top-[calc(var(--header-height)+32px)] ">{children}</div>
        </div>
    );
};
