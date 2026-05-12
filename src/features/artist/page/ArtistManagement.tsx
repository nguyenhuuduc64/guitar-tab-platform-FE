import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/Input";
import instance from "../../../config/axios";
import { useFormStore } from "../../../store/useFormStore";
import { DynamicForm } from "../../../components/common/DynamicForm";
import uploadImageToCloudinary from "../../../services/cloudinary";
import { fetchArtists } from "../../../services/artistService";

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

    const { openForm } = useFormStore();

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

    const handleSubmit = async (data) => {
        try {
            console.log("📩 RAW FORM DATA:", data);
            console.log("📦 EDITING ARTIST:", editingArtist);

            let imageUrl = editingArtist?.imageUrl || null;

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

            const payload = {
                name: data.name,
                description: data.description,
                imageUrl: imageUrl,
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
        <div className="p-8 bg-white h-full">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Quản lý nghệ sĩ
                    </h1>
                    <p className="text-sm text-slate-500">
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
            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Nghệ sĩ</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="text-right">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredArtists.map((artist) => (
                            <TableRow key={artist.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={
                                                artist.imageUrl ||
                                                "https://picsum.photos/150"
                                            }
                                        />
                                        <AvatarFallback>
                                            {artist.name?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    {artist.name}
                                </TableCell>

                                <TableCell>{artist.slug}</TableCell>

                                <TableCell className="max-w-[300px] truncate">
                                    {artist.description}
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(artist)}
                                        >
                                            <Pencil size={18} />
                                        </Button>

                                        <AlertDialogDemo
                                            buttonName={<Trash2 size={18} />}
                                            message={`Xóa ${artist.name}?`}
                                            onSubmit={() =>
                                                handleDelete(artist.id)
                                            }
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
                    name: editingArtist?.name || "",
                    description: editingArtist?.description || "",
                    image: editingArtist?.imageUrl || null,
                }}
                key={editingArtist?.id || "create"}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
