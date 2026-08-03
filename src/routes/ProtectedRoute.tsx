import { Navigate } from "react-router-dom";
import { getUserInfo } from "../utils/auth";
import { useEffect, useState } from "react";

interface Props {
    children: React.ReactNode;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserInfo();
                setUserInfo(data);
            } catch (error) {
                setUserInfo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    if (
        allowedRoles &&
        (!userInfo.roles ||
            !allowedRoles
                .map((r) => r.toLowerCase())
                .includes(userInfo.roles.name.toLowerCase()))
    ) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
