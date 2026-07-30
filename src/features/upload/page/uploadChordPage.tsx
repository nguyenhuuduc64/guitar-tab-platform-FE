import React, { useEffect, useState } from "react";
import instance from "../../../config/axios";
import { useDebounce } from "../../../hooks/useDebounce";
import ButtonCustom from "../../../components/common/ButtonCustom";
import { GoogleGenAI } from "@google/genai";
import { toast } from "react-toastify";

const UpLoadChordPage = () => {
    const [songTitle, setSongTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [categoryId, setCategoryId] = useState("");

    const [artistId, setArtistId] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [artistQuery, setArtistQuery] = useState("");
    const [artistSuggestions, setArtistSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const debouncedQuery = useDebounce(artistQuery, 400);

    useEffect(() => {
        fetchCategories();
    }, []);

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

    useEffect(() => {
        const fetchArtists = async () => {
            const keyword = debouncedQuery.trim();
            if (!keyword || artistId) return;

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
    }, [debouncedQuery, artistId]);

    const handleSubmit = async () => {
        // Kiểm tra các trường bắt buộc
        if (!songTitle.trim()) {
            toast.warn("Vui lòng nhập tên bài hát");
            return;
        }
        if (!content.trim()) {
            toast.warn("Vui lòng nhập lời bài hát và hợp âm");
            return;
        }
        if (!categoryId) {
            toast.warn("Vui lòng chọn danh mục");
            return;
        }
        if (!artistQuery.trim()) {
            toast.warn("Vui lòng nhập tên nghệ sĩ");
            return;
        }

        try {
            // Lấy thông tin user hiện tại
            const userRes = await instance.get("/users/my-info");
            const currentUser = userRes.data.result;

            if (!currentUser?.id) {
                toast.error("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
                return;
            }

            setIsSubmitting(true);

            // Gọi trực tiếp API Gemini từ Frontend
            const apiKey = import.meta.env.VITE_GEMINI_KEY;
            const promptText = `Hãy phân tích nội dung lời bài hát sau đây và kiểm tra xem có chứa bất kỳ từ ngữ, câu văn nào thô tục, bạo lực, khiêu dâm, vi phạm pháp luật hoặc không phù hợp với chuẩn mực thuần phong mỹ tục của Việt Nam hay không.
Nếu lời bài hát HOÀN TOÀN sạch và chuẩn mực, hãy trả về kết quả chính xác là: CLEAN
Nếu lời bài hát có chứa bất kỳ nội dung không chuẩn mực nào, hãy trả về kết quả chính xác là: INAPPROPRIATE

Lưu ý: Chỉ trả về đúng một từ duy nhất là 'CLEAN' hoặc 'INAPPROPRIATE', không viết thêm bất kỳ từ nào khác.

Nội dung lời bài hát cần kiểm tra:
${content}`;

            let isClean = false;
            try {
                const ai = new GoogleGenAI({ apiKey });
                const response = await ai.models.generateContent({
                    model: "gemini-3.5-flash",
                    contents: promptText,
                });
                
                const checkResult = response.text || "";
                if (checkResult.toUpperCase().includes("CLEAN")) {
                    isClean = true;
                }
            } catch (err) {
                console.error("Lỗi khi kết nối trực tiếp với Gemini:", err);
                // Nếu lỗi kết nối, mặc định để admin duyệt để đảm bảo an toàn
            }

            if (isClean) {
                // Lời bài hát sạch -> Tạo chord trực tiếp vào DB, set isPublic = true
                const directChordData = {
                    title: songTitle,
                    content: content,
                    categoryId: categoryId,
                    artistId: artistId || null,
                    artistName: artistQuery.trim(),
                    userId: currentUser.id,
                    youtubeUrl: youtubeUrl || "",
                    isPublic: true,
                };
                const response = await instance.post("/chords", directChordData);
                console.log("Direct Chord Response:", response.data);
                toast.success("🎉 Lời bài hát của bạn đã được kiểm duyệt tự động bởi AI Gemini là HỢP LỆ và đã được ĐĂNG TẢI TRỰC TIẾP thành công!");
            } else {
                // Lời bài hát có chứa nội dung cần xem xét -> Gửi yêu cầu chờ phê duyệt
                const chordData = {
                    title: songTitle,
                    content: content,
                    categoryId: categoryId,
                    artistId: artistId || null,
                    artistName: artistQuery.trim(),
                    userId: currentUser.id,
                    youtubeUrl: youtubeUrl || "",
                };
                const payload = {
                    type: "CHORD",
                    data: chordData,
                };
                const response = await instance.post("/requests", payload);
                console.log("Request Response:", response.data);
                toast.info("⚠️ Lời bài hát có chứa một số từ ngữ cần xem xét thủ công. Yêu cầu của bạn đã được gửi đến quản trị viên để phê duyệt!");
            }

            // Reset form
            setSongTitle("");
            setContent("");
            setCategoryId("");
            setArtistId("");
            setArtistQuery("");
            setYoutubeUrl("");
            setArtistSuggestions([]);
        } catch (error: any) {
            console.error("Error:", error);
            const errorMessage = error.response?.data?.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-grow w-full flex bg-gray-50 dark:bg-[#0a0a0a] text-gray-800 dark:text-slate-100">
            <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 mx-auto w-full pb-32">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 md:gap-8">
                    {/* Form Container */}
                    <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 p-6 md:p-8 shadow-sm rounded-2xl">
                        <div className="border-b border-gray-100 dark:border-slate-800 pb-5 mb-6">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                                Đăng tải bài hát
                            </h1>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                Bài hát sẽ được hiển thị sau khi được quản trị viên phê duyệt.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">
                                    Tên bài hát <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={songTitle}
                                    onChange={(e) => setSongTitle(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600"
                                    placeholder="Ví dụ: In My Feelings"
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">
                                    Nghệ sĩ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={artistQuery}
                                    onChange={(e) => {
                                        setArtistQuery(e.target.value);
                                        setArtistId("");
                                    }}
                                    placeholder="Tìm kiếm hoặc nhập tên nghệ sĩ mới..."
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600"
                                    onFocus={() => artistSuggestions.length > 0 && setShowDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                />
                                {showDropdown && artistSuggestions.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg mt-1 max-h-52 overflow-auto">
                                        {artistSuggestions.map((artist) => (
                                            <div
                                                key={artist.id}
                                                onMouseDown={() => {
                                                    setArtistId(artist.id);
                                                    setArtistQuery(artist.name);
                                                    setShowDropdown(false);
                                                }}
                                                className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer text-sm border-b border-gray-50 dark:border-slate-800 last:border-none text-gray-700 dark:text-slate-200"
                                            >
                                                {artist.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">
                                    Thể loại <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-750 dark:text-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500 transition-all"
                                >
                                    <option value="" className="bg-white dark:bg-slate-950">-- Chọn thể loại --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-950">
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">
                                    Đường dẫn YouTube
                                </label>
                                <input
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-slate-350 uppercase tracking-wider mb-2">
                                    Lời bài hát & Hợp âm <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="[C] Đoạn nhạc mẫu [G] chuẩn hợp âm..."
                                    className="w-full border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-200 rounded-xl p-4 min-h-[350px] text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600 leading-relaxed bg-gray-50/50 dark:bg-slate-900/50"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <ButtonCustom
                                    name={isSubmitting ? "Đang gửi..." : "Gửi để phê duyệt"}
                                    variant={isSubmitting ? "outline" : "primary"}
                                    onClick={handleSubmit}
                                />
                                <ButtonCustom
                                    name="Hủy"
                                    variant="outline"
                                    onClick={() => {
                                        setSongTitle("");
                                        setContent("");
                                        setCategoryId("");
                                        setArtistId("");
                                        setArtistQuery("");
                                        setYoutubeUrl("");
                                        setArtistSuggestions([]);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Guidelines Container */}
                    <div className="w-full lg:w-[300px] shrink-0">
                        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 p-6 shadow-sm rounded-2xl sticky top-[calc(var(--header-height)_+_1.5rem)] text-left">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                Hướng dẫn đăng tải
                            </h3>
                            <ul className="text-[13px] text-gray-500 dark:text-slate-400 space-y-2.5 list-disc pl-4 leading-relaxed">
                                <li>Các trường có dấu <span className="text-red-500">*</span> là bắt buộc</li>
                                <li>Hợp âm nên được đặt trong dấu ngoặc vuông: <span className="font-mono text-xs text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-1 py-0.5 rounded">[C]</span></li>
                                <li>Đảm bảo tên nghệ sĩ trùng khớp với gợi ý từ cơ sở dữ liệu nếu có sẵn.</li>
                                <li>Quản trị viên sẽ xem xét và phê duyệt trong vòng 24 giờ.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpLoadChordPage;