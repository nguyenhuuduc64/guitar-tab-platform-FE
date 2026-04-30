import React, { useEffect, useState } from "react";
import instance from "../../../config/axios";
import {
    Type,
    CornerDownLeft,
    ArrowUp,
    ArrowDown,
    SquareAsterisk,
    Eye,
} from "lucide-react";

const UpLoadChordPage = () => {
    const [songTitle, setSongTitle] = useState("");
    const [content, setContent] = useState("");
    const [autoBracket, setAutoBracket] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState("");

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await instance.get("/categories");
                setCategories(res.data.result || res.data);
            } catch (err) {}
        };

        fetchCategories();
    }, []);

    const handleSubmit = async () => {
        const payload = {
            title: songTitle,
            content: content,
            categoryId: categoryId || null,
        };

        setIsSubmitting(true);

        try {
            await instance.post("/chords", payload);
            alert("Đăng bài hát thành công!");
            setSongTitle("");
            setContent("");
            setCategoryId("");
        } catch (error) {
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
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Tên bài hát:
                        </label>
                        <input
                            type="text"
                            value={songTitle}
                            onChange={(e) => setSongTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Thể loại:
                        </label>

                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        >
                            <option value="">-- Chọn thể loại --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Lời bài hát và hợp âm:
                        </label>

                        <div className="flex flex-wrap items-center justify-between bg-[#F5F5F5] border border-gray-300 border-b-0 rounded-t p-1 gap-2">
                            <div className="flex items-center gap-1">
                                <button className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded text-[12px]">
                                    <Type size={14} /> Định dạng
                                </button>
                                <button className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded text-[12px]">
                                    <CornerDownLeft size={14} /> Nhập dòng
                                </button>
                                <div className="flex border border-gray-300 rounded overflow-hidden">
                                    <button className="p-1 bg-white">
                                        <ArrowUp size={14} />
                                    </button>
                                    <button className="p-1 bg-white">
                                        <ArrowDown size={14} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 ml-2 text-[12px]">
                                    <SquareAsterisk size={14} />
                                    <span>Tự động [ ]</span>
                                    <input
                                        type="checkbox"
                                        checked={autoBracket}
                                        onChange={() =>
                                            setAutoBracket(!autoBracket)
                                        }
                                    />
                                </div>
                            </div>

                            <button className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded text-[12px]">
                                <Eye size={14} /> Xem trước
                            </button>
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full border border-gray-300 rounded-b p-4 min-h-[400px] text-sm font-mono"
                            placeholder="Nhập lời bài hát..."
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !songTitle || !content}
                        className="bg-[#4A7298] text-white px-8 py-2 rounded text-sm font-bold"
                    >
                        {isSubmitting ? "ĐANG GỬI..." : "ĐĂNG BÀI HÁT"}
                    </button>
                </div>
            </div>

            <div className="w-full md:w-[350px]"></div>
        </div>
    );
};

export default UpLoadChordPage;
