import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";
import instance from "../../../config/axios";
import { useFormStore } from "../../../store/useFormStore";
import { DynamicForm } from "../../../components/common/DynamicForm";
import uploadImageToCloudinary from "../../../services/cloudinary";
import { fetchArtists } from "../../../services/artistService";
import { useLocation, useNavigate } from "react-router-dom";
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
import { artistSchema } from "../../../constants/artist";

export default function ArtistManagement() {
    const [artists, setArtists] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingArtist, setEditingArtist] = useState(null);
    const [prefillArtistName, setPrefillArtistName] = useState("");
    const [pendingRequestId, setPendingRequestId] = useState(null);
    const location = useLocation();
    const requestId = location.state?.requestId;
    const { openForm } = useFormStore();
    const navigate = useNavigate();
    const loadData = async () => {
        try {
            const data = await fetchArtists();
            setArtists(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleEdit = (artist) => {
        setEditingArtist(artist);
        openForm("artist-form");
    };
    useEffect(() => {
        if (location.state?.autoOpenForm) {
            setEditingArtist(null);

            setPrefillArtistName(location.state.artistName || "");

            // QUAN TRỌNG
            setPendingRequestId(location.state.requestId || null);

            openForm("artist-form");

            // clear state trên URL
            navigate(location.pathname, {
                replace: true,
                state: {},
            });
        }
    }, [location.state]);
    const handleSubmit = async (data) => {
        try {
            console.log("📩 RAW FORM DATA:", data);
            console.log("📦 EDITING ARTIST:", editingArtist);

            let imageUrl = editingArtist?.imageUrl || null;
            let backgroundImage = editingArtist?.backgroundImage || null;

            console.log("🖼 CURRENT IMAGE URL (before upload):", imageUrl);

            const file =
                data.image instanceof File ? data.image : data.image?.[0];

            console.log("📁 EXTRACTED FILE:", file);

            if (file instanceof File) {
                console.log("🚀 START UPLOAD TO CLOUDINARY...");
                imageUrl = await uploadImageToCloudinary(file);
                console.log("📡 UPLOAD RESULT IMAGE URL:", imageUrl);
            } else {
                console.log("⚠️ NO NEW FILE UPLOADED → KEEP OLD IMAGE");
            }

            const bgFile =
                data.backgroundImageFile instanceof File ? data.backgroundImageFile : data.backgroundImageFile?.[0];

            console.log("📁 EXTRACTED BG FILE:", bgFile);

            if (bgFile instanceof File) {
                console.log("🚀 START UPLOAD BACKGROUND TO CLOUDINARY...");
                backgroundImage = await uploadImageToCloudinary(bgFile);
                console.log("📡 UPLOAD RESULT BG IMAGE URL:", backgroundImage);
            } else {
                console.log("⚠️ NO NEW BG FILE UPLOADED → KEEP OLD BACKGROUND IMAGE");
            }

            const payload = {
                name: data.name,
                description: data.description,
                imageUrl: imageUrl,
                backgroundImage: backgroundImage,
            };

            console.log("📦 FINAL PAYLOAD BEFORE SEND:", payload);

            let response;

            if (editingArtist) {
                console.log("✏️ MODE: UPDATE (PUT)");
                response = await instance.put(
                    `/artists/${editingArtist.id}`,
                    payload,
                );
            } else {
                console.log("➕ MODE: CREATE (POST)");

                response = await instance.post("/artists", payload);

                console.log("📨 CREATE ARTIST RESPONSE:", response.data);

                const createdArtist = response.data?.result;

                console.log("🎤 CREATED ARTIST:", createdArtist);

                console.log("🧾 PENDING REQUEST:", pendingRequestId);

                // AUTO MAP ARTIST VÀO REQUEST
                if (pendingRequestId && createdArtist?.id) {
                    console.log("🚀 START ASSIGN ARTIST");

                    await instance.put(
                        `/requests/${pendingRequestId}/assign-artist`,
                        {
                            type: "CHORD",
                            data: {
                                artistId: createdArtist.id,
                            },
                        },
                    );

                    console.log("✅ ASSIGN SUCCESS");

                    navigate("/admin/yeu-cau-duyet");
                }
            }

            console.log("📨 SERVER RESPONSE:", response?.data);

            setEditingArtist(null);
            loadData();
        } catch (err) {
            console.error("❌ SUBMIT ERROR:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await instance.delete(`/artists/${id}`);
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredArtists = artists.filter((a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div className="p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs transition-colors duration-200">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Quản lý nghệ sĩ
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Quản lý thông tin nghệ sĩ
                    </p>
                </div>

                <Button
                    onClick={() => {
                        setEditingArtist(null);
                        openForm("artist-form");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm nghệ sĩ
                </Button>
            </div>

            {/* SEARCH */}
            <div className="mb-6">
                <div className="relative w-full max-w-sm">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                    />
                    <Input
                        placeholder="Tìm tên nghệ sĩ..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
                        <TableRow className="border-b border-slate-200 dark:border-slate-800">
                            <TableHead className="dark:text-slate-300">Nghệ sĩ</TableHead>
                            <TableHead className="dark:text-slate-300">Slug</TableHead>
                            <TableHead className="dark:text-slate-300">Mô tả</TableHead>
                            <TableHead className="text-right dark:text-slate-300">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredArtists.map((artist) => (
                            <TableRow key={artist.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                                <TableCell className="flex items-center gap-3 text-slate-800 dark:text-slate-250">
                                    <Avatar className="h-10 w-10 border dark:border-slate-700">
                                        <AvatarImage
                                            src={
                                                artist.imageUrl ||
                                                "https://picsum.photos/150"
                                            }
                                        />
                                        <AvatarFallback className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                            {artist.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {artist.name}
                                </TableCell>

                                <TableCell className="text-slate-650 dark:text-slate-350">{artist.slug}</TableCell>

                                <TableCell className="max-w-[300px] truncate text-slate-600 dark:text-slate-400">
                                    {artist.description}
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(artist)}
                                            className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                        >
                                            <Pencil size={18} />
                                        </Button>

                                        <AlertDialogDemo
                                            buttonName={<Trash2 size={18} />}
                                            message={`Xóa ${artist.name}?`}
                                            variant="destructive"
                                            onSubmit={() => handleDelete(artist.id)}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* FORM - FIX QUAN TRỌNG NHẤT */}
            <DynamicForm
                name="artist-form"
                schema={artistSchema}
                defaultValues={{
                    name: editingArtist?.name || prefillArtistName || "",
                    description: editingArtist?.description || "",
                    image: editingArtist?.imageUrl || null,
                    backgroundImageFile: editingArtist?.backgroundImage || null,
                }}
                key={editingArtist?.id || "create"}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
