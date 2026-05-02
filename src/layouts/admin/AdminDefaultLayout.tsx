import { useState } from "react";
import AdminSidebar from "../../components/common/AdminSidebar";
import TopHeader from "../../components/common/TopHeader";
const AdminDefaultLayout = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="h-screen flex bg-main-bg overflow-hidden">
            <AdminSidebar open={open} setOpen={setOpen} />

            {/* CONTENT */}
            <div className="flex flex-col flex-1 h-full md:ml-64">
                {/* MOBILE HEADER */}
                <div className="md:hidden h-14 flex items-center px-4 bg-white shadow-sm flex-shrink-0">
                    <button onClick={() => setOpen(true)} className="text-xl">
                        ☰
                    </button>
                    <span className="ml-4 font-semibold text-lg">
                        Dashboard
                    </span>
                </div>
                <TopHeader />

                {/* SCROLL AREA */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminDefaultLayout;
