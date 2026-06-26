import React, { useEffect, useState } from "react";
import { Settings, Save, X, Globe, Lock, Loader2 } from "lucide-react";
import instance from "../../config/axios";
import { useDebounce } from "../../hooks/useDebounce";
interface ConfigAudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    chordId: string;
    audioUrl: string;
    initialLyrics: string;
    onSaveSuccess: () => void;
    isEdit?: boolean;
}

export function ConfigAudioModal({ isOpen, onClose, chordId, audioUrl, initialLyrics, onSaveSuccess, isEdit = false }: ConfigAudioModalProps) {
    const [title, setTitle] = useState("");
    const [lyrics, setLyrics] = useState(initialLyrics || "");
    const [isPublic, setIsPublic] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // State phục vụ việc tích hợp Danh mục, Bộ sưu tập, Nghệ sĩ
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryId, setCategoryId] = useState("");

    const [collections, setCollections] = useState<any[]>([]);
    const [collectionId, setCollectionId] = useState("");

    const [artistId, setArtistId] = useState("");
    const [artistQuery, setArtistQuery] = useState("");
    const [artistSuggestions, setArtistSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const debouncedQuery = useDebounce(artistQuery, 400);

    // Tự động tải dữ liệu khi Modal mở ra
    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            fetchCollections();
            setLyrics(initialLyrics || "");

            if (isEdit && chordId) {
                const fetchChordDetails = async () => {
                    try {
                        const res = await instance.get(`/chords/${chordId}`);
                        const chord = res.data?.result || res.data;
                        if (chord) {
                            setTitle(chord.title || "");
                            setLyrics(chord.content || "");
                            setIsPublic(chord.isPublic || false);
                            setArtistQuery(chord.artistName || "");
                            setArtistId(chord.artistId || "");
                            setCategoryId(chord.categoryId || "");
                            setCollectionId(chord.collectionId || "");
                        }
                    } catch (err) {
                        console.error("Lỗi khi tải chi tiết hợp âm:", err);
                    }
                };
                fetchChordDetails();
            } else {
                setTitle("");
                setIsPublic(false);
                setArtistQuery("");
                setArtistId("");
                setCategoryId("");
                setCollectionId("");
            }
        }
    }, [isOpen, initialLyrics, isEdit, chordId]);

    // Tìm kiếm Nghệ sĩ bằng Debounce
    useEffect(() => {
        const fetchArtists = async () => {
            const keyword = debouncedQuery.trim();
            if (!keyword || artistId) return;

            try {
                const res = await instance.get(`/artists?keyword=${encodeURIComponent(keyword)}`);
                setArtistSuggestions(res.data.data || res.data.result || []);
                setShowDropdown(true);
            } catch (err) {
                setArtistSuggestions([]);
            }
        };
        fetchArtists();
    }, [debouncedQuery]);

    const fetchCategories = async () => {
        try {
            const res = await instance.get("/categories");
            const data = res.data?.data || res.data?.result || res.data;
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Tải danh mục thất bại:", err);
            setCategories([]);
        }
    };

    const fetchCollections = async () => {
        try {
            const res = await instance.get("/collections");
            const data = res.data?.data || res.data?.result || res.data;
            setCollections(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Tải bộ sưu tập thất bại:", err);
            setCollections([]);
        }
    };

    if (!isOpen) return null;

    const handleSaveConfig = async () => {
        try {
            setIsSaving(true);
            if (isEdit) {
                // EDIT MODE: Call PUT /chords/:id
                await instance.put(`/chords/${chordId}`, {
                    title: title || "AI Music Track",
                    content: lyrics,
                    isPublic: isPublic,
                    artistName: artistQuery.trim() || "AI",
                    artistId: artistId || null,
                    categoryId: categoryId || null,
                    collectionId: collectionId || null
                });
            } else {
                // CREATE MODE: Call POST /chords and then POST /audios
                const chordResponse = await instance.post("/chords", {
                    title: title || "AI Music Track",
                    content: lyrics,
                    isPublic: isPublic,
                    artistName: artistQuery.trim() || "AI",
                    artistId: artistId || null,
                    categoryId: categoryId || null,
                    collectionId: collectionId || null
                });

                if (chordResponse.data) {
                    console.log("Save chord success", chordResponse.data);
                }

                // BƯỚC 2: Lưu Audio với đúng 2 trường nguyên bản (url, chordId)
                const audioResponse = await instance.post("/audios", {
                    url: audioUrl,
                    chordId: chordResponse.data?.result?.id,
                });

                if (audioResponse.data) {
                    console.log("Save audio success", audioResponse.data);
                }
            }

            onSaveSuccess();
            onClose();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Có lỗi hệ thống xảy ra.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            {/* Tăng kích thước tối đa lên max-w-2xl để modal rộng rãi, dễ nhìn */}
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-zinc-200 overflow-hidden font-sans">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-100">
                    <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                        <Settings size={15} /> {isEdit ? "Chỉnh sửa cấu hình phân loại nhạc" : "Cấu hình lưu trữ và phân loại nhạc"}
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body - Grid Layout chia làm 2 cột trên màn hình lớn */}
                <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cột trái: Các thông tin cơ bản */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Tên bài hát</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên bài hát thành phẩm..." className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-medium text-zinc-800 transition-all" />
                            </div>

                            <div className="relative">
                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Nghệ sĩ / Ca sĩ</label>
                                <input
                                    type="text"
                                    value={artistQuery}
                                    onChange={(e) => {
                                        setArtistQuery(e.target.value);
                                        setArtistId("");
                                    }}
                                    placeholder="Tìm kiếm hoặc nhập nghệ sĩ mới..."
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-medium text-zinc-800 transition-all"
                                    onFocus={() => artistSuggestions.length > 0 && setShowDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                />
                                {showDropdown && artistSuggestions.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border border-zinc-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-auto">
                                        {artistSuggestions.map((artist) => (
                                            <div
                                                key={artist.id}
                                                onMouseDown={() => {
                                                    setArtistId(artist.id);
                                                    setArtistQuery(artist.name);
                                                    setShowDropdown(false);
                                                }}
                                                className="px-3 py-2 hover:bg-zinc-50 cursor-pointer text-sm border-b border-zinc-50 last:border-none text-zinc-700"
                                            >
                                                {artist.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Danh mục</label>
                                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-medium text-zinc-800 transition-all">
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Bộ sưu tập</label>
                                <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-medium text-zinc-800 transition-all">
                                    <option value="">-- Không bắt buộc --</option>
                                    {collections.map((col) => (
                                        <option key={col.id} value={col.id}>{col.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Cột phải: Lời bài hát */}
                        <div className="flex flex-col">
                            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Lyrics bài hát & Hợp âm</label>
                            <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} className="w-full flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-500 text-sm font-medium text-zinc-800 font-mono resize-none min-h-[200px] md:min-h-0" />
                        </div>
                    </div>

                    {/* Trạng thái hiển thị */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
                        <div className="flex items-center gap-2">
                            {isPublic ? <Globe size={16} className="text-emerald-600" /> : <Lock size={16} className="text-zinc-400" />}
                            <span className="text-xs font-bold text-zinc-700">Chế độ hiển thị công khai (Public)</span>
                        </div>
                        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-4 h-4 accent-zinc-900 cursor-pointer" />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer">Hủy</button>
                    <button onClick={handleSaveConfig} disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-zinc-400">
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isEdit ? "Cập nhật thay đổi" : "Lưu vào thư viện"}
                    </button>
                </div>

            </div>
        </div>
    );
}