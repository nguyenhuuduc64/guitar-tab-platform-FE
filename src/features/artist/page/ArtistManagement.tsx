import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
import { artistSchema } from "../../../constants/artist";

interface Artist {
    id: string;
    name: string;
    slug: string;
    description: string;
}

export default function ArtistManagement() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null);

    const { openForm } = useFormStore();

    const fetchArtists = async () => {
        try {
            const res = await instance.get("/artists");
            setArtists(res.data.result);
        } catch (err) {
            console.error("Fetch artists error:", err);
        }
    };

    useEffect(() => {
        fetchArtists();
    }, []);

    const handleSubmit = async (data: any) => {
        try {
            if (editingArtist) {
                await instance.put(`/artists/${editingArtist.id}`, data);
            } else {
                await instance.post("/artists", data);
            }

            setEditingArtist(null);
            fetchArtists();
        } catch (err) {
            console.error("Submit error:", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await instance.delete(`/artists/${id}`);
            fetchArtists();
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const filteredArtists = artists.filter((artist) =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
            <div className="border rounded-xl overflow-hidden">
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
                                        <AvatarImage src="" />
                                        <AvatarFallback>
                                            {artist.name[0]}
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
                                        {/* EDIT */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingArtist(artist);
                                                openForm("artist-form");
                                            }}
                                        >
                                            <Pencil size={18} />
                                        </Button>

                                        {/* DELETE */}
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

            {/* FORM */}
            <DynamicForm
                name="artist-form"
                schema={artistSchema}
                defaultValues={editingArtist || {}}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
