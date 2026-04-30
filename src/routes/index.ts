import Home from "../features/home/pages/Home";
import LoginPage from "../features/login/page/LoginPage";
import TestPage from "../features/test/page/TestPage";
import UpLoadChordPage from "../features/upload/page/uploadChordPage";
import ChordPage from "../features/chord/page/ChordPage";
interface RouteConfig {
    path: string;
    component: React.ComponentType;
}

export const publicRoutes: RouteConfig[] = [
    { path: "/", component: Home },
    { path: "/login", component: LoginPage },
    { path: "/test", component: TestPage },
    { path: "/song/:id", component: ChordPage },
];

export const privateRoutes: RouteConfig[] = [
    { path: "/dang-tai", component: UpLoadChordPage },
];
