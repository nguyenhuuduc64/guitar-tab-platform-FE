import { useEffect } from "react";
import { useNotificationStore } from "../../store/useNotificationStore";
import instance from "../../config/axios";

export default function WebSocketInitializer() {
    const { connectWebSocket, disconnectWebSocket } = useNotificationStore();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        // Fetch user info to connect to WebSocket using username
        instance
            .get("/users/my-info")
            .then((res) => {
                const username = res.data?.result?.username;
                if (username) {
                    connectWebSocket(username);
                }
            })
            .catch((err) => {
                console.error("Failed to load user info for WebSocket connection:", err);
            });

        return () => {
            disconnectWebSocket();
        };
    }, [connectWebSocket, disconnectWebSocket]);

    return null;
}
