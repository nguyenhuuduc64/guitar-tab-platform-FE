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

    // ===== ARTIST SEARCH =====
    const [artistId, setArtistId] = useState("");
    const [artistQuery, setArtistQuery] = useState("");
    const [artistSuggestions, setArtistSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const debouncedQuery = useDebounce(artistQuery, 400);

    // ================= FETCH =================
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
            const data = res.data.result || res.data;
            safeSet(setCategories, data);
        } catch (err) {
            console.error("Fetch categories error:", err);
            setCategories([]);
        }
    };

    const fetchCollections = async () => {
        try {
            const res = await instance.get("/collections");
            const data = res.data.result || res.data;
            safeSet(setCollections, data);
        } catch (err) {
            console.error("Fetch collections error:", err);
            setCollections([]);
        }
    };

    // ================= SEARCH ARTIST =================
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setArtistSuggestions([]);
            return;
        }

        searchArtists(debouncedQuery);
    }, [debouncedQuery]);

    const searchArtists = async (keyword: string) => {
        try {
            const res = await instance.get(`/artists?keyword=${keyword}`);
            const data = res.data.result || res.data;

            setArtistSuggestions(Array.isArray(data) ? data : []);
            setShowDropdown(true);
        } catch (err) {
            console.error("Search artist error:", err);
        }
    };

    // ================= SUBMIT =================
    const handleSubmit = async () => {
        const payload = {
            title: songTitle,
            content: content,
            categoryId: categoryId || null,
            artistId: artistId,
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
                            onFocus={() => setShowDropdown(true)}
                        />

                        {showDropdown && artistSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-auto shadow">
                                {artistSuggestions.map((artist) => (
                                    <div
                                        key={artist.id}
                                        onClick={() => {
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
                            Collection (tuỳ chọn):
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

                        <div className="flex justify-between bg-[#F5F5F5] border border-gray-300 border-b-0 rounded-t p-1">
                            <div className="flex gap-1">
                                <button className="px-2 py-1 bg-white border rounded text-xs flex gap-1 items-center">
                                    <Type size={14} /> Format
                                </button>
                                <button className="px-2 py-1 bg-white border rounded text-xs flex gap-1 items-center">
                                    <CornerDownLeft size={14} /> Enter
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                <SquareAsterisk size={14} />
                                Auto [ ]
                                <input
                                    type="checkbox"
                                    checked={autoBracket}
                                    onChange={() =>
                                        setAutoBracket(!autoBracket)
                                    }
                                />
                            </div>

                            <button className="px-2 py-1 bg-white border rounded text-xs flex gap-1 items-center">
                                <Eye size={14} /> Preview
                            </button>
                        </div>

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
