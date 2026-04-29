import { Header } from "./Header";
import { SidebarLeft } from "../features/home/components/SidebarLeft";
import { RankingRight } from "../features/home/components/RankingRight";
import { Navigation } from "./Navigation";

export const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-main-bg">
      <Navigation />
      {children}
    </div>
  );
};
