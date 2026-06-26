import React, { useEffect, useState, useRef } from "react";
import { Bell, Check, Trash2, CheckCircle2, XCircle, Info } from "lucide-react";
import { useNotificationStore } from "../../store/useNotificationStore";

interface NotificationDropdownProps {
    textColor?: string;
    hoverBg?: string;
    badgeRingColor?: string;
}

export default function NotificationDropdown({
    textColor = "text-white",
    hoverBg = "hover:bg-white/10",
    badgeRingColor = "ring-[var(--primary-color)]",
}: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        notifications,
        unreadCount,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className={`relative p-2 rounded-full transition-colors cursor-pointer outline-none ${textColor} ${hoverBg}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span
                        className={`absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ${badgeRingColor}`}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3.5 w-80  bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl z-[999] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                            Thông báo
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 cursor-pointer"
                            >
                                <Check size={12} /> Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => {
                                const isApproved =
                                    notif.type === "REQUEST_APPROVED";
                                const isRejected =
                                    notif.type === "REQUEST_REJECTED";

                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() =>
                                            !notif.isRead && markAsRead(notif.id)
                                        }
                                        className={`flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group relative
                                            ${!notif.isRead ? "bg-blue-50/20 dark:bg-blue-950/10" : ""}`}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {isApproved ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : isRejected ? (
                                                <XCircle className="h-5 w-5 text-rose-500" />
                                            ) : (
                                                <Info className="h-5 w-5 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <p
                                                className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed
                                                ${!notif.isRead ? "font-semibold dark:text-white" : "font-normal"}`}
                                            >
                                                {notif.content}
                                            </p>
                                            <span className="text-[10px] text-slate-400 mt-1.5 block">
                                                {new Date(
                                                    notif.createdAt,
                                                ).toLocaleString("vi-VN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                        {/* Delete action */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notif.id);
                                                }}
                                                className="p-1 hover:text-red-500 text-slate-400 rounded-md transition-colors"
                                                title="Xóa thông báo"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
                                Không có thông báo nào.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
