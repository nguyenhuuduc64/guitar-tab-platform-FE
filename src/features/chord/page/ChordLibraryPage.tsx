import { useState, useMemo } from "react";
import { getAllChords, searchChords } from "../../../constants/chords";
import GuitarChordDiagram from "../../../components/chords/GuitarChordDiagram";
import { Search, Sparkles, ShieldAlert } from "lucide-react";

export default function ChordLibraryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

    // Lọc danh sách hợp âm theo từ khóa tìm kiếm
    const allChords = useMemo(() => {
        if (searchQuery.trim()) {
            return searchChords(searchQuery);
        }
        return getAllChords();
    }, [searchQuery]);

    // Lọc danh sách hợp âm theo phân cấp độ khó
    const filteredChords = useMemo(() => {
        if (activeTab === 'all') return allChords;
        return allChords.filter(chord => chord.difficulty === activeTab);
    }, [allChords, activeTab]);

    return (
        <div className="w-full mx-auto animate-in fade-in duration-500 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <main className="flex-1 p-4 md:p-6 flex flex-col gap-6 overflow-x-hidden">
                {/* Header Tiêu đề & Ô Tìm Kiếm */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800/80 pb-5">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase flex items-center gap-2">
                            Thư viện Hợp âm Guitar
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Tra cứu thế bấm, âm sắc và cách bấm các hợp âm guitar từ cơ bản đến nâng cao.
                        </p>
                    </div>

                    {/* Ô tìm kiếm hợp âm nhanh */}
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Tìm nhanh hợp âm (ví dụ: C, Am...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-800 dark:text-slate-200"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* Bộ lọc độ khó (Biến thành Dropdown) */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Độ khó:</span>
                    <select
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as any)}
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-gray-700 dark:text-slate-200 cursor-pointer shadow-sm"
                    >
                        <option value="all">Tất cả hợp âm</option>
                        <option value="beginner">Cơ bản (Beginner)</option>
                        <option value="intermediate">Trung cấp (Intermediate)</option>
                        <option value="advanced">Hợp âm màu (Advanced)</option>
                    </select>
                </div>

                {/* Lưới hiển thị các sơ đồ hợp âm */}
                {filteredChords.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredChords.map((chord) => (
                            <div
                                key={chord.name}
                                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition-all flex flex-col items-center justify-between group relative overflow-hidden"
                            >
                                {/* Sơ đồ bấm hợp âm Guitar trực quan */}
                                <div className="mt-4 flex justify-center w-full">
                                    <GuitarChordDiagram initialChordName={chord.name} />
                                </div>

                                {/* Thông tin chi tiết và mô tả nhạc lý phía dưới */}
                                <div className="w-full text-center border-t border-gray-100 dark:border-slate-800/60 pt-3 mt-2">
                                    <p className="text-[12px] font-bold text-gray-800 dark:text-slate-200 line-clamp-1">
                                        {chord.fullName || chord.name}
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
                                        {chord.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl">
                        <ShieldAlert className="w-12 h-12 text-gray-400 dark:text-slate-650 mb-4" />
                        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-350">Không tìm thấy hợp âm nào</h3>
                        <p className="text-xs text-gray-400 mt-1">Hãy thử tìm kiếm với từ khóa khác.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
