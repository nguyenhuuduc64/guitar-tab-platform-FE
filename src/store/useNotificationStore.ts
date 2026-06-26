import { create } from "zustand";
import instance from "../config/axios";
import { toast } from "react-toastify";

export interface NotificationItem {
    id: string;
    userId: string;
    username: string;
    content: string;
    isRead: boolean;
    requestId: string;
    type: string;
    createdAt: string;
}

interface NotificationStore {
    notifications: NotificationItem[];
    unreadCount: number;
    socket: WebSocket | null;
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    connectWebSocket: (username: string) => void;
    disconnectWebSocket: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    socket: null,

    fetchNotifications: async () => {
        try {
            const res = await instance.get("/notifications/my-notifications");
            set({ notifications: res.data.result || [] });
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    },

    fetchUnreadCount: async () => {
        try {
            const res = await instance.get("/notifications/unread-count");
            set({ unreadCount: res.data.result || 0 });
        } catch (err) {
            console.error("Failed to fetch unread count:", err);
        }
    },

    markAsRead: async (id: string) => {
        try {
            await instance.put(`/notifications/${id}/read`);
            set((state) => {
                const updated = state.notifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                const unread = updated.filter((n) => !n.isRead).length;
                return { notifications: updated, unreadCount: unread };
            });
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    },

    markAllAsRead: async () => {
        try {
            await instance.put("/notifications/read-all");
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
        } catch (err) {
            console.error("Failed to mark all notifications as read:", err);
        }
    },

    deleteNotification: async (id: string) => {
        try {
            await instance.delete(`/notifications/${id}`);
            set((state) => {
                const updated = state.notifications.filter((n) => n.id !== id);
                const unread = updated.filter((n) => !n.isRead).length;
                return { notifications: updated, unreadCount: unread };
            });
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    },

    connectWebSocket: (username: string) => {
        const currentSocket = get().socket;
        if (currentSocket) return; // Already connected

        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const wsHost = apiBaseUrl.replace(/^https?:\/\//, ""); // remove http:// or https://
        const wsUrl = `${wsProtocol}//${wsHost}/ws/notifications?token=${token}`;

        console.log("Connecting to WebSocket:", wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            try {
                const newNotification: NotificationItem = JSON.parse(event.data);
                console.log("Received notification via WebSocket:", newNotification);

                // Add to notifications list & increment unread count
                set((state) => ({
                    notifications: [newNotification, ...state.notifications],
                    unreadCount: state.unreadCount + 1,
                }));

                // Trigger react-toastify toast
                if (newNotification.type === "REQUEST_APPROVED") {
                    toast.success(newNotification.content, {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else if (newNotification.type === "REQUEST_REJECTED") {
                    toast.error(newNotification.content, {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else {
                    toast.info(newNotification.content, {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            } catch (err) {
                console.error("Error parsing websocket message data:", err);
            }
        };

        socket.onclose = (event) => {
            console.log("WebSocket connection closed:", event);
            set({ socket: null });
            // Reconnect logic: retry after 5 seconds if logged in
            if (localStorage.getItem("accessToken")) {
                setTimeout(() => {
                    if (localStorage.getItem("accessToken")) {
                        get().connectWebSocket(username);
                    }
                }, 5000);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        set({ socket });
    },

    disconnectWebSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.close();
            set({ socket: null });
        }
    },
}));
