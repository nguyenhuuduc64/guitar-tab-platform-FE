import { Bell } from "lucide-react";

const TopBar = () => {
    return (
        <div className="h-16 bg-white flex items-center justify-between px-6 border-b">
            <input
                placeholder="Search or type a command"
                className="w-80 px-4 py-2 rounded-full bg-gray-100 outline-none"
            />

            <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-gray-500" />
                <img
                    src="https://i.pravatar.cc/40"
                    className="w-8 h-8 rounded-full"
                />
            </div>
        </div>
    );
};
