import { useState } from "react";

import AdminSidebar from "../../components/common/AdminSidebar";
import TopHeader from "../../components/common/TopHeader";

const AdminDefaultLayout = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="h-screen flex bg-[#f5f7fb] overflow-hidden">
            <AdminSidebar
                open={open}
                setOpen={setOpen}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <div
                className={`
                    flex flex-col flex-1 h-full
                    transition-all duration-300 ease-in-out
                    ${collapsed ? "md:ml-[82px]" : "md:ml-[270px]"}
                `}
            >
                <div className="md:hidden h-14 flex items-center px-4 bg-white border-b border-slate-200 flex-shrink-0">
                    <button
                        onClick={() => setOpen(true)}
                        className="text-slate-700 text-xl"
                    >
                        ☰
                    </button>

                    <span className="ml-4 font-semibold text-slate-800">
                        Dashboard
                    </span>
                </div>

                <TopHeader />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminDefaultLayout;
