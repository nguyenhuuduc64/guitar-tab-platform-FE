import React, { useEffect, useState } from "react";
import instance from "../../../config/axios";
import { useDebounce } from "../../../hooks/useDebounce";

const UpLoadChordPage = () => {
    const [songTitle, setSongTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [categoryId, setCategoryId] = useState("");

    const [collections, setCollections] = useState<any[]>([]);
    const [collectionId, setCollectionId] = useState("");

    const [artistId, setArtistId] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [artistQuery, setArtistQuery] = useState("");
    const [artistSuggestions, setArtistSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const debouncedQuery = useDebounce(artistQuery, 400);

    useEffect(() => {
        fetchCategories();
        fetchCollections();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await instance.get("/categories");
            // Kiểm tra đa tầng để lấy mảng dữ liệu
            const data = res.data?.data || res.data?.result || res.data;
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch categories failed:", err);
            setCategories([]); // Reset về mảng rỗng nếu lỗi
        }
    };

    const fetchCollections = async () => {
        try {
            const res = await instance.get("/collections");
            // Kiểm tra đa tầng tương tự
            const data = res.data?.data || res.data?.result || res.data;
            setCollections(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Fetch collections failed:", err);
            setCollections([]);
        }
    };

    useEffect(() => {
        const fetchArtists = async () => {
            const keyword = debouncedQuery.trim();
            if (!keyword || artistId) return; // Không search nếu đã chọn artist

            try {
                const res = await instance.get(
                    `/artists?keyword=${encodeURIComponent(keyword)}`,
                );
                setArtistSuggestions(res.data.data || res.data.result || []);
                setShowDropdown(true);
            } catch (err) {
                setArtistSuggestions([]);
            }
        };
        fetchArtists();
    }, [debouncedQuery]);

    // ================= SUBMIT REQUEST =================
    const handleSubmit = async () => {
        const chordData = {
            title: songTitle,
            content: content,

            categoryId: categoryId || null,

            artistId: artistId || null,

            artistName: artistQuery.trim(),

            collectionId: collectionId || null,

            youtubeUrl: youtubeUrl || "",
        };

        const payload = {
            type: "CHORD",
            data: chordData,
        };

        setIsSubmitting(true);

        try {
            // Chuyển sang endpoint quản lý request
            await instance.post("/requests", payload);

            alert("Your request has been sent to admin for approval!");

            // Reset form
            setSongTitle("");
            setContent("");
            setCategoryId("");
            setArtistId("");
            setArtistQuery("");
            setCollectionId("");
            setArtistSuggestions([]);
        } catch (error) {
            console.error(error);
            alert("Failed to send request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-8 bg-white min-h-screen">
            <div className="flex-1">
                <h1 className="text-2xl font-light mb-2 text-gray-700 font-bold">
                    Submit New Chord
                </h1>
                <p className="text-sm text-slate-500 mb-6 italic">
                    * Your submission will be visible after admin approval.
                </p>

                <div className="space-y-4">
                    {/* TITLE */}
                    <div>
                        <label className="block text-sm font-bold mb-1 text-slate-700">
                            Song Title:
                        </label>
                        <input
                            value={songTitle}
                            onChange={(e) => setSongTitle(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Enter song title..."
                        />
                    </div>

                    {/* ARTIST SEARCH */}
                    <div className="relative">
                        <label className="block text-sm font-bold mb-1 text-slate-700">
                            Artist:
                        </label>
                        <input
                            value={artistQuery}
                            onChange={(e) => {
                                setArtistQuery(e.target.value);
                                setArtistId("");
                            }}
                            placeholder="Search artist..."
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                            onFocus={() =>
                                artistSuggestions.length > 0 &&
                                setShowDropdown(true)
                            }
                            onBlur={() =>
                                setTimeout(() => setShowDropdown(false), 200)
                            }
                        />
                        {showDropdown && artistSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-white border border-slate-200 rounded mt-1 max-h-60 overflow-auto shadow-lg">
                                {artistSuggestions.map((artist) => (
                                    <div
                                        key={artist.id}
                                        onMouseDown={() => {
                                            setArtistId(artist.id);
                                            setArtistQuery(artist.name);
                                            setShowDropdown(false);
                                        }}
                                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm border-b last:border-none"
                                    >
                                        {artist.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CATEGORY */}
                        <div>
                            <label className="block text-sm font-bold mb-1 text-slate-700">
                                Category:
                            </label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none"
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* COLLECTION */}
                        <div>
                            <label className="block text-sm font-bold mb-1 text-slate-700">
                                Collection:
                            </label>
                            <select
                                value={collectionId}
                                onChange={(e) =>
                                    setCollectionId(e.target.value)
                                }
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none"
                            >
                                <option value="">-- Optional --</option>
                                {collections.map((col) => (
                                    <option key={col.id} value={col.id}>
                                        {col.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-slate-700">
                            Link Youtube
                        </label>
                        <input
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none"
                            placeholder="Enter youtube link..."
                        />
                    </div>

                    {/* CONTENT */}
                    <div>
                        <label className="block text-sm font-bold mb-1 text-slate-700">
                            Lyrics & Chords:
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your chords and lyrics here..."
                            className="w-full border border-slate-300 rounded p-4 min-h-[400px] text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting ||
                            !songTitle.trim() ||
                            !content.trim() ||
                            (!artistId && !artistQuery.trim()) // Cho phép nếu có ID HOẶC có tên tự nhập
                        }
                        className={`w-full md:w-auto px-10 py-3 rounded font-bold text-white transition-all ${
                            isSubmitting ||
                            !songTitle.trim() ||
                            !content.trim() ||
                            (!artistId && !artistQuery.trim())
                                ? "bg-slate-300 cursor-not-allowed"
                                : "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                        }`}
                    >
                        {isSubmitting
                            ? "SENDING REQUEST..."
                            : "SUBMIT FOR REVIEW"}
                    </button>
                </div>
            </div>

            <div className="hidden lg:block w-[300px] bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300 h-fit">
                <h3 className="font-bold text-slate-700 mb-2 text-sm">
                    Submission Guide
                </h3>
                <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                    <li>Chords should be placed in brackets: [C]</li>
                    <li>Ensure the artist name is correct.</li>
                    <li>Admin will review within 24 hours.</li>
                </ul>
            </div>
        </div>
    );
};

export default UpLoadChordPage;
