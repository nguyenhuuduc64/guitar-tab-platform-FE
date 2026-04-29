import Home from "../features/home/pages/Home";
import LoginPage from "../features/login/page/LoginPage";
// Định nghĩa interface để quản lý chặt chẽ
interface RouteConfig {
  path: string;
  component: React.ComponentType;
}

export const publicRoutes: RouteConfig[] = [
  { path: "/", component: Home },
  { path: "/login", component: LoginPage },
];
