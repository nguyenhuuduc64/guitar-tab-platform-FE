import { Search, Bell } from "lucide-react";
import { Input } from "../ui/Input";
import { Avatar } from "../ui/Avatar";
export default function TopHeader() {
    return (
        <header className="flex h-16 items-center justify-between px-8 bg-white border-b border-slate-100">
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                />
                <Input
                    type="text"
                    placeholder="Search or type a command"
                    className="w-full pl-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded-lg text-sm"
                />
            </div>

            {/* Actions: Notification & Profile */}
            <div className="flex items-center gap-6">
                <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                    <Bell size={22} />
                    {/* Notification Badge */}
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
                </button>

                <Avatar
                    className="h-9 w-9 cursor-pointer"
                    src="https://github.com/shadcn.png"
                    fallback="JD"
                />
            </div>
        </header>
    );
}
