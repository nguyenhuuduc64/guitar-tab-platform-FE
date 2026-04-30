import { Navigate } from "react-router-dom";
import { getUserInfo } from "../utils/auth";
import { useEffect, useState } from "react";

interface Props {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
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
        return <div>Loading...</div>;
    }

    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
