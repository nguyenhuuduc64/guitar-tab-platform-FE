import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Search, Mail, Calendar, Shield } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";
import instance from "../../../config/axios";
import { useFormStore } from "../../../store/useFormStore";
import { DynamicForm } from "../../../components/common/DynamicForm";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../../components/ui/Avatar";
import { AlertDialogDemo } from "../../../components/common/AlertDialog";
import { Badge } from "../../../components/ui/Badge";

// Schema đơn giản cho user
const userFieldSchema = [
    { name: "fullName", label: "Full Name", type: "text", required: true },
    { name: "imageUrl", label: "Avatar URL", type: "text" },
];

interface User {
    id: string;
    username: string;
    fullName: string;
    email: string;
    imageUrl?: string;
    roles?: {
        name: string;
    };
    createdAt: string;
    updatedAt?: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>("all");
    const { openForm } = useFormStore();

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await instance.get("/users");
            setUsers(response.data.result || []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách user:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        openForm("user-form");
    };

    const handleSubmit = async (data: any) => {
        try {
            const payload = {
                fullName: data.fullName,
                imageUrl: data.imageUrl || null,
            };

            if (editingUser) {
                await instance.put(`/users/${editingUser.id}`, payload);
            } else {
                const createPayload = {
                    username: data.fullName?.toLowerCase().replace(/\s/g, '') || "user",
                    password: "12345678",
                    email: `${data.fullName?.toLowerCase().replace(/\s/g, '')}@example.com` || "user@example.com",
                    fullName: data.fullName,
                    imageUrl: data.imageUrl || null,
                };
                await instance.post("/users", createPayload);
            }

            setEditingUser(null);
            loadData();
        } catch (err) {
            console.error("Lỗi khi lưu user:", err);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await instance.delete(`/users/${id}`);
            loadData();
        } catch (err) {
            console.error("Lỗi khi xóa user:", err);
            toast.error("Không thể xóa user này.");
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = selectedRole === "all" || user.roles?.name === selectedRole;

        return matchesSearch && matchesRole;
    });

    const getRoleColor = (roleName: string) => {
        switch (roleName?.toLowerCase()) {
            case "admin":
                return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30";
            case "moderator":
                return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30";
            default:
                return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30";
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "--";
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Đang tải danh sách người dùng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Quản lý người dùng
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Quản lý thông tin người dùng
                    </p>
                </div>

                <Button
                    onClick={() => {
                        setEditingUser(null);
                        openForm("user-form");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm người dùng
                </Button>
            </div>

            {/* SEARCH */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative w-full max-w-sm">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <Input
                        placeholder="Tìm kiếm theo tên, username, email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    {["all", "admin", "user"].map((role) => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${selectedRole === role
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-350 hover:bg-gray-200 dark:hover:bg-slate-700"
                                }`}
                        >
                            {role === "all" ? "Tất cả" : role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* TABLE */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                        <TableRow className="border-b border-slate-200 dark:border-slate-800">
                            <TableHead className="dark:text-slate-300">Người dùng</TableHead>
                            <TableHead className="dark:text-slate-300">Email</TableHead>
                            <TableHead className="dark:text-slate-300">Vai trò</TableHead>
                            <TableHead className="dark:text-slate-300">Ngày tạo</TableHead>
                            <TableHead className="text-right dark:text-slate-300">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    {searchTerm ? "Không tìm thấy người dùng nào" : "Chưa có người dùng nào"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border dark:border-slate-700">
                                                <AvatarImage src={user.imageUrl || ""} />
                                                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                                    {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                                    {user.fullName || user.username}
                                                </div>
                                                <div className="text-xs text-slate-400 dark:text-slate-500">
                                                    @{user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                            <span className="text-sm text-slate-800 dark:text-slate-350">{user.email || "--"}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`${getRoleColor(user.roles?.name || "user")} font-normal`}
                                        >
                                            <Shield className="w-3 h-3 mr-1" />
                                            {user.roles?.name || "User"}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-450">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(user)}
                                                className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                            >
                                                <Pencil size={18} />
                                            </Button>

                                            <AlertDialogDemo
                                                buttonName={<Trash2 size={18} />}
                                                title="Xóa người dùng"
                                                message={`Bạn có chắc chắn muốn xóa người dùng "${user.fullName || user.username}"?`}
                                                variant="destructive"
                                                onSubmit={() => handleDelete(user.id)}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* FORM */}
            <DynamicForm
                name="user-form"
                schema={userFieldSchema}
                defaultValues={{
                    fullName: editingUser?.fullName || "",
                    imageUrl: editingUser?.imageUrl || "",
                }}
                key={editingUser?.id || "create"}
                onSubmit={handleSubmit}
            />
        </div>
    );
}