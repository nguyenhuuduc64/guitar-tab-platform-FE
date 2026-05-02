import {
    LayoutDashboard,
    TrendingUp,
    FileSpreadsheet,
    Ticket,
    Wallet,
    LayoutGrid,
    History,
    Settings,
} from "lucide-react";

export const sidebarItems = [
    {
        name: "Bảng điều khiển",
        path: "/admin/bang-dieu-khien",
        icon: LayoutDashboard,
    },
    { name: "Thị trường", path: "/admin/thi-truong", icon: TrendingUp },
    {
        name: "Bảng tính",
        path: "/admin/bang-tinh",
        icon: FileSpreadsheet,
    },
    { name: "Mã giảm giá", path: "/admin/ma-giam-gia", icon: Ticket },
    { name: "Nghệ sĩ", path: "/admin/nghe-si", icon: Wallet },
    { name: "Bộ sưu tập", path: "/admin/bo-suu-tap", icon: LayoutGrid },
    { name: "Lịch sử", path: "/admin/lich-su", icon: History },
    { name: "Cài đặt", path: "/admin/cai-dat", icon: Settings },
];
