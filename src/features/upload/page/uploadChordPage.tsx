import React, { useEffect, useState } from "react";
import instance from "../../../config/axios";
import { useDebounce } from "../../../hooks/useDebounce";
import { Type, CornerDownLeft, SquareAsterisk, Eye } from "lucide-react";

const UpLoadChordPage = () => {
    const [songTitle, setSongTitle] = useState("");
    const [content, setContent] = useState("");
    const [autoBracket, setAutoBracket] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [categoryId, setCategoryId] = useState("");

    const [collections, setCollections] = useState<any[]>([]);
    const [collectionId, setCollectionId] = useState("");

    // ================= ARTIST SEARCH =================
    const [artistId, setArtistId] = useState("");
    const [artistQuery, setArtistQuery] = useState("");
    const [artistSuggestions, setArtistSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const debouncedQuery = useDebounce(artistQuery, 400);

    // ================= INIT DATA =================
    useEffect(() => {
        fetchCategories();
        fetchCollections();
    }, []);

    const safeSet = (setter: Function, data: any) => {
        setter(Array.isArray(data) ? data : []);
    };

    const fetchCategories = async () => {
        try {
            const res = await instance.get("/categories");
            safeSet(setCategories, res.data.result || res.data);
        } catch {
            setCategories([]);
        }
    };

    const fetchCollections = async () => {
        try {
            const res = await instance.get("/collections");
            safeSet(setCollections, res.data.result || res.data);
        } catch {
            setCollections([]);
        }
    };

    // ================= SEARCH ARTIST (REALTIME) =================
    useEffect(() => {
        const fetchArtists = async () => {
            const keyword = debouncedQuery.trim();

            // ❌ Không gọi API nếu rỗng
            if (!keyword) {
                setArtistSuggestions([]);
                setShowDropdown(false);
                return;
            }

            try {
                const res = await instance.get(
                    `/artists?keyword=${encodeURIComponent(keyword)}`,
                );

                const data = res.data.result || [];

                setArtistSuggestions(Array.isArray(data) ? data : []);
                setShowDropdown(true);
            } catch (err) {
                console.error("Artist search error:", err);
                setArtistSuggestions([]);
            }
        };

        fetchArtists();
    }, [debouncedQuery]);

    // ================= SUBMIT =================
    const handleSubmit = async () => {
        const payload = {
            title: songTitle,
            content,
            categoryId: categoryId || null,
            artistId,
            collectionId: collectionId || null,
        };

        setIsSubmitting(true);

        try {
            await instance.post("/chords", payload);

            alert("Đăng bài hát thành công!");

            setSongTitle("");
            setContent("");
            setCategoryId("");
            setArtistId("");
            setArtistQuery("");
            setCollectionId("");
            setArtistSuggestions([]);
            setShowDropdown(false);
        } catch (error) {
            console.error(error);
            alert("Lỗi khi đăng bài");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8 bg-white min-h-screen">
            <div className="flex-1">
                <h1 className="text-2xl font-light mb-6 text-gray-700">
                    Đăng bài hát mới
                </h1>

                <div className="space-y-4">
                    {/* TITLE */}
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            Tên bài hát:
                        </label>
                        <input
                            value={songTitle}
                            onChange={(e) => setSongTitle(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm"
                        />
                    </div>

                    {/* ARTIST SEARCH */}
                    <div className="relative">
                        <label className="block text-sm font-bold mb-1">
                            Nghệ sĩ:
                        </label>

                        <input
                            value={artistQuery}
                            onChange={(e) => {
                                setArtistQuery(e.target.value);
                                setArtistId("");
                            }}
                            placeholder="Tìm nghệ sĩ..."
                            className="w-full border rounded px-3 py-2 text-sm"
                            onFocus={() => {
                                if (artistSuggestions.length > 0) {
                                    setShowDropdown(true);
                                }
                            }}
                            onBlur={() =>
                                setTimeout(() => setShowDropdown(false), 150)
                            }
                        />

                        {showDropdown && artistSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-auto shadow">
                                {artistSuggestions.map((artist) => (
                                    <div
                                        key={artist.id}
                                        onMouseDown={() => {
                                            setArtistId(artist.id);
                                            setArtistQuery(artist.name);
                                            setShowDropdown(false);
                                        }}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    >
                                        {artist.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CATEGORY */}
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            Thể loại:
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm"
                        >
                            <option value="">-- Chọn thể loại --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* COLLECTION */}
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            Collection:
                        </label>
                        <select
                            value={collectionId}
                            onChange={(e) => setCollectionId(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm"
                        >
                            <option value="">-- Không chọn --</option>
                            {collections.map((col) => (
                                <option key={col.id} value={col.id}>
                                    {col.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* CONTENT */}
                    <div>
                        <label className="block text-sm font-bold mb-1">
                            Lời bài hát:
                        </label>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full border p-4 min-h-[400px] text-sm font-mono"
                        />
                    </div>

                    {/* SUBMIT */}
                    <button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting || !songTitle || !content || !artistId
                        }
                        className="bg-[#4A7298] text-white px-6 py-2 rounded font-bold"
                    >
                        {isSubmitting ? "ĐANG GỬI..." : "ĐĂNG BÀI"}
                    </button>
                </div>
            </div>

            <div className="w-[350px]" />
        </div>
    );
};

export default UpLoadChordPage;
