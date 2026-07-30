import {
    LayoutDashboard,
    CheckCheckIcon,
    FileSpreadsheet,
    Ticket,
    Wallet,
    LayoutGrid,
    History,
    Settings,
    User,
    Music,
} from "lucide-react";

export const sidebarItems = [
    {
        name: "Bảng điều khiển",
        path: "/admin/bang-dieu-khien",
        icon: LayoutDashboard,
    },
    {
        name: "Yêu cầu duyệt",
        path: "/admin/yeu-cau-duyet",
        icon: CheckCheckIcon,
    },

    { name: "Người dùng", path: "/admin/nguoi-dung", icon: User },
    { name: "Nghệ sĩ", path: "/admin/nghe-si", icon: Wallet },
    { name: "Playlist", path: "/admin/playlist", icon: LayoutGrid },
    { name: "Bài hát", path: "/admin/bai-hat", icon: Music },
    { name: "Cài đặt", path: "/admin/cai-dat", icon: Settings },
];
