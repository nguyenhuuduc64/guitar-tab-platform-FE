import Home from "../features/home/pages/Home";
import LoginPage from "../features/login/page/LoginPage";
import TestPage from "../features/test/page/TestPage";
import UpLoadChordPage from "../features/upload/page/uploadChordPage";
import ChordPage from "../features/chord/page/ChordPage";
import DashBoard from "../features/dashboard/page/DashBoard";
import ArtistManagement from "../features/artist/page/ArtistManagement";
import RegisterPage from "../features/register/page/RegisterPage";
import ArtistDetailPage from "../features/artist/page/ArtistDetailPage";
import PostDetailPage from "../features/post/page/PostDetailPage";
import Profile from "../features/profile/page/Profile";
import { PlaylistPage } from "../features/playlist/page/PlaylistPage";
import ManagementRequestPage from "../features/mângement/page/ManagementRequestPage";
interface RouteConfig {
    path: string;
    component: React.ComponentType;
}

export const publicRoutes: RouteConfig[] = [
    { path: "/", component: Home },
    { path: "/login", component: LoginPage },
    { path: "/test", component: TestPage },
    { path: "/song/:id", component: ChordPage },
    { path: "/dang-ky", component: RegisterPage },
    { path: "/nghe-sy/:id", component: ArtistDetailPage },
    { path: "/bai-viet/:slug", component: PostDetailPage },
    { path: "/playlist", component: PlaylistPage },
];

export const privateRoutes: RouteConfig[] = [
    { path: "/dang-tai", component: UpLoadChordPage },
    { path: "/trang-ca-nhan", component: Profile },
];

export const adminRoutes: RouteConfig[] = [
    { path: "/admin/bang-dieu-khien", component: DashBoard },
    { path: "/admin/yeu-cau-duyet", component: ManagementRequestPage },
    { path: "/admin/bang-tinh", component: UpLoadChordPage },
    { path: "/admin/ma-giam-gia", component: UpLoadChordPage },
    { path: "/admin/nghe-si", component: ArtistManagement },
    { path: "/admin/bo-suu-tap", component: UpLoadChordPage },
    { path: "/admin/lich-su", component: UpLoadChordPage },
    { path: "/admin/cai-dat", component: UpLoadChordPage },
];
