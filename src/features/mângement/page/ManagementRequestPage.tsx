import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
    LayoutGrid,
    Music,
    UserRound,
    Mic2,
    Check,
    X,
    Search,
    Loader2,
    AlertCircle,
    UserPlus,
} from "lucide-react";

import instance from "../../../config/axios";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";

const TABS = [
    { id: "ALL", label: "All Requests", icon: <LayoutGrid size={18} /> },
    { id: "CHORD", label: "Chords", icon: <Music size={18} /> },
    { id: "MELODY", label: "Melodies", icon: <Mic2 size={18} /> },
];

export default function ManagementRequestPage() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState({});

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await instance.get("/requests/pending");
            console.log("request", response.data.result);
            setRequests(response.data.result || []);
        } catch (err) {
            console.error("Fetch requests error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleAction = async (id, action) => {
        try {
            setActionLoading((prev) => ({ ...prev, [id]: action }));
            await instance.post(`/requests/${id}/${action}`);
            setRequests((prev) => prev.filter((req) => req.id !== id));
        } catch (err) {
            console.error(`${action} error:`, err);
            toast.error(`Failed to ${action} request.`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [id]: null }));
        }
    };

    const getRequestTitle = (req) => {
        switch (req.type) {
            case "CHORD":
                return req.data?.title;
            case "MELODY":
                return req.data?.title || req.data?.name;
            default:
                return "Unknown";
        }
    };

    const getRequestDescription = (req) => {
        switch (req.type) {
            case "CHORD":
                return req.data?.content?.slice(0, 140);
            case "MELODY":
                return req.data?.description || req.data?.content;
            default:
                return "";
        }
    };

    const filteredRequests = requests.filter((req) => {
        const matchesTab = activeTab === "ALL" || req.type === activeTab;
        const matchesSearch = JSON.stringify(req.data)
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Quản lý yêu cầu tạo
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Xem và duyệt yêu cầu của người dùng
                </p>
            </div>

            <div className="flex border-b border-slate-200 mb-6 gap-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium transition-all border-b-2
                            ${activeTab === tab.id
                                ? "border-[var(--primary-color)] text-[var(--primary-color)]"
                                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300"
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <div className="relative w-full max-w-sm">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <Input
                        placeholder="Search in request data..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                        <TableRow className="border-b border-slate-200 dark:border-slate-800">
                            <TableHead className="w-[100px] dark:text-slate-300">Type</TableHead>
                            <TableHead className="dark:text-slate-300">Content Preview</TableHead>
                            <TableHead className="dark:text-slate-300">Requested At</TableHead>
                            <TableHead className="text-right dark:text-slate-300">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="py-10 text-center text-slate-500"
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        <Loader2 className="animate-spin" />{" "}
                                        Loading...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map((req) => {
                                const isApproving =
                                    actionLoading[req.id] === "approve";
                                const isRejecting =
                                    actionLoading[req.id] === "reject";
                                const isProcessing = isApproving || isRejecting;

                                // Logic check Artist mới
                                const isNewArtist =
                                    req.type === "CHORD" && !req.data?.artistId;

                                return (
                                    <TableRow key={req.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase 
                                                ${req.type === "CHORD"
                                                        ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
                                                        : "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
                                                    }`}
                                            >
                                                {req.type}
                                            </span>
                                        </TableCell>

                                        <TableCell>
                                            <div className="max-w-[500px] flex flex-col gap-1">
                                                <div className="flex items-center gap-2 font-semibold text-sm text-slate-800 dark:text-slate-200">
                                                    {getRequestTitle(req)}
                                                    {isNewArtist && (
                                                        <span className="flex items-center gap-1 text-[10px] bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/35 animate-pulse">
                                                            <AlertCircle
                                                                size={12}
                                                            />{" "}
                                                            New Artist:{" "}
                                                            {
                                                                req.data
                                                                    ?.artistName
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {getRequestDescription(req)}
                                                </div>

                                                {isNewArtist && (
                                                    <div className="mt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-[11px] border-indigo-200 text-indigo-600 hover:bg-indigo-50 gap-1"
                                                            onClick={() =>
                                                                navigate(
                                                                    "/admin/nghe-si",
                                                                    {
                                                                        state: {
                                                                            autoOpenForm: true,
                                                                            artistName:
                                                                                req
                                                                                    .data
                                                                                    ?.artistName,
                                                                            requestId:
                                                                                req.id,
                                                                        },
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            <UserPlus
                                                                size={14}
                                                            />{" "}
                                                            Create Artist Page
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                                            {new Date(
                                                req.createdAt,
                                            ).toLocaleString()}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={
                                                        isProcessing ||
                                                        isNewArtist
                                                    }
                                                    title={
                                                        isNewArtist
                                                            ? "Must create artist first"
                                                            : "Approve"
                                                    }
                                                    className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/25 disabled:opacity-30"
                                                    onClick={() =>
                                                        handleAction(
                                                            req.id,
                                                            "approve",
                                                        )
                                                    }
                                                >
                                                    {isApproving ? (
                                                        <Loader2
                                                            size={18}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Check size={20} />
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={isProcessing}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/25"
                                                    onClick={() =>
                                                        handleAction(
                                                            req.id,
                                                            "reject",
                                                        )
                                                    }
                                                >
                                                    {isRejecting ? (
                                                        <Loader2
                                                            size={18}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <X size={20} />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-center py-10 text-slate-400"
                                >
                                    No pending requests.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
