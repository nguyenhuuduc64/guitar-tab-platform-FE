import { Hero } from "../components/Hero";
import { SongTable } from "../components/SongTable";
import { DiscoverPanel } from "../components/DiscoverPanel";
import { SidebarLeft } from "../components/SidebarLeft";
import { RankingRight } from "../components/RankingRight";
export default function Home() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <div className="flex-1 w-full max-w-[1440px] mx-auto flex gap-0 px-20 py-8">
        {/* Cột 1: Sidebar Trái */}
        <aside className="w-1/5 border-r border-border-subtle  hidden lg:block">
          <SidebarLeft />
        </aside>

        {/* Cột 2: Nội dung chính */}
        <main className="flex-1 px-4 overflow-hidden">
          <div className="w-full max-w-[1440px] mx-auto">
            <Hero />
            <DiscoverPanel />
          </div>
          <div className="border border-border-subtle  rounded-sm overflow-hidden bg-white">
            <div className="p-4 border-b border-border-subtle bg-main-fg/[0.02]">
              <h2 className="text-[11px] font-bold text-main-fg opacity-60 uppercase tracking-[0.2em] ">
                Hợp âm mới cập nhật
              </h2>
            </div>
            <SongTable />
          </div>
        </main>

        {/* Cột 3: Ranking Phải */}
        <aside className="w-1/4 border-l bg-white border-border-subtle hidden xl:block">
          <RankingRight />
        </aside>
      </div>
    </div>
  );
}
