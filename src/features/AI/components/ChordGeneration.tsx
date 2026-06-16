import React, { useState } from "react";
import { Music, Sliders, Play, FileText, Activity } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ChordViewer from "../../../components/common/ChordViewer";

interface ChordPayload {
    melodyType: string;
    tempo: number;
    timeSignature: string;
    chordProgression: string;
    key: string;
    style: string;
    prompt: string;
}

export default function ChordGeneration() {
    const [formData, setFormData] = useState<ChordPayload>({
        melodyType: "pop",
        tempo: 120,
        timeSignature: "4/4",
        chordProgression: "I-V-vi-IV",
        key: "C",
        style: "acoustic",
        prompt: "",
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [generatedResult, setGeneratedResult] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "tempo" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const apiKey = import.meta.env.VITE_GEMINI_KEY;
        if (!apiKey || loading) return;

        console.log(">>> Gửi Payload đi:", formData);

        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey });

            const apiPrompt = `Hãy sáng tác một bài hát kèm hợp âm guitar theo các thông số cấu hình sau:
            - Thể loại/Giai điệu: ${formData.melodyType}
            - Tốc độ (Tempo): ${formData.tempo} BPM
            - Nhịp (Time Signature): ${formData.timeSignature}
            - Tone chủ (Key): ${formData.key}
            - Vòng hợp âm mẫu: ${formData.chordProgression}
            - Phong cách: ${formData.style}
            - Mô tả chi tiết ý tưởng từ người dùng: ${formData.prompt || "Tự do sáng tác tùy chọn câu từ phù hợp"}`;

            const response = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: apiPrompt,
                config: {
                    systemInstruction: `Bạn là một chuyên gia nhạc lý Guitar và sáng tác nhạc. 
Mục tiêu là viết lời bài hát kèm chèn hợp âm Guitar trực quan (Chord sheet) dựa trên mô tả của người dùng.
Quy tắc ép buộc đầu ra:
1. Chỉ sử dụng định dạng Inline Chords: Hợp âm nằm trong cặp ngoặc vuông và đặt ngay TRƯỚC chữ cái bắt đầu của phách mạnh/từ ngữ thay đổi hòa âm (Ví dụ: [C]Ngày nắng [G]xanh ngời).
2. Phải chia rõ cấu trúc bài hát bằng các thẻ: [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], [Outro].
3. Không giải thích dông dài, không viết mã code Markdown bọc ngoài text (không dùng \`\`\`), trả về chuỗi văn bản trực tiếp.`
                }
            });

            if (response.text) {
                setGeneratedResult(response.text);
                console.log("=== KẾT QUẢ TỪ AI ===");
                console.log(response.text);
            }
        } catch (error) {
            console.error("Lỗi sinh lời và hợp âm:", error);
            const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi gọi API Gemini";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 text-gray-800 overflow-hidden">

            <aside className="w-2/5 border-r border-gray-200 bg-white flex flex-col h-full shadow-sm">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                    <Sliders className="text-purple-600" size={20} />
                    <h2 className="font-bold text-gray-900 text-base uppercase tracking-wide">Cấu hình AI</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase">Loại giai điệu</label>
                        <select
                            name="melodyType"
                            value={formData.melodyType}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition outline-none"
                        >
                            <option value="pop">Pop Ballad</option>
                            <option value="jazz">Jazz / Blues</option>
                            <option value="lofi">Lofi Chill</option>
                            <option value="rock">Classic Rock</option>
                            <option value="rnb">R&B</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 uppercase">Tone chủ (Key)</label>
                            <select
                                name="key"
                                value={formData.key}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-purple-500 transition outline-none"
                            >
                                <option value="C">C Major (Đô Trưởng)</option>
                                <option value="Am">A Minor (La Thứ)</option>
                                <option value="G">G Major (Sol Trưởng)</option>
                                <option value="F">F Major (Fa Trưởng)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-600 uppercase">Nhịp (Time)</label>
                            <select
                                name="timeSignature"
                                value={formData.timeSignature}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-purple-500 transition outline-none"
                            >
                                <option value="4/4">4/4</option>
                                <option value="3/4">3/4</option>
                                <option value="6/8">6/8</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase">Tốc độ (Tempo: {formData.tempo} BPM)</label>
                        <input
                            type="range"
                            name="tempo"
                            min="60"
                            max="200"
                            value={formData.tempo}
                            onChange={handleChange}
                            className="w-full accent-purple-600 cursor-pointer"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase">Vòng hợp âm mong muốn</label>
                        <select
                            name="chordProgression"
                            value={formData.chordProgression}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-purple-500 transition outline-none"
                        >
                            <option value="I-V-vi-IV">I - V - vi - IV (C - G - Am - F)</option>
                            <option value="ii-V-I-IV">ii - V - I - IV (Dm - G - C - F)</option>
                            <option value="vi-IV-I-V">vi - IV - I - V (Am - F - C - G)</option>
                            <option value="custom">Tự do sinh bằng AI</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase">Phong cách phối</label>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {["acoustic", "piano", "synth", "ambient"].map((style) => (
                                <label
                                    key={style}
                                    className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer capitalize transition-all ${formData.style === style
                                        ? "border-purple-500 bg-purple-50 text-purple-700 font-medium"
                                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="style"
                                        value={style}
                                        checked={formData.style === style}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                    {style}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-600 uppercase">Mô tả ý tưởng (Prompt)</label>
                        <textarea
                            name="prompt"
                            value={formData.prompt}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Ví dụ: Tạo đoạn nhạc buồn, tiết tấu rải piano chậm rãi..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-purple-500 transition outline-none resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 text-white font-semibold rounded-lg text-sm shadow-md active:scale-[0.99] transition flex items-center justify-center gap-2 ${loading
                            ? "bg-purple-400 cursor-not-allowed animate-pulse"
                            : "bg-[var(--primary-color,theme(colors.purple.600))] hover:bg-purple-700"
                            }`}
                    >
                        <Play size={16} fill="white" />
                        {loading ? "AI đang tạo lời & hợp âm..." : "Sinh hợp âm & Giai điệu"}
                    </button>
                </form>
            </aside>

            <aside className="w-3/5 bg-gray-50 flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-2">
                    <Music className="text-purple-600" size={20} />
                    <h2 className="font-bold text-gray-900 text-base uppercase tracking-wide">Kết quả từ AI</h2>
                </div>

                <div className="flex-1 p-6 overflow-y-auto flex flex-col">
                    {generatedResult ? (
                        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm overflow-y-auto">
                            <ChordViewer
                                chord={{
                                    id: "ai-generated-chord",
                                    title: `Bản Sáng Tác (${formData.melodyType.toUpperCase()})`,
                                    content: generatedResult
                                }}
                                onOpenPlaylist={() => { }}
                            />
                        </div>
                    ) : (
                        <div className="my-auto flex flex-col items-center justify-center text-center">
                            <div className="max-w-md space-y-4">
                                <div className={`w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 ${loading ? 'animate-spin' : 'animate-pulse'}`}>
                                    <Activity size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-gray-800 text-lg">
                                        {loading ? "AI đang xử lý yêu cầu..." : "Chưa có đoạn nhạc nào được tạo"}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {loading
                                            ? "Hệ thống đang sinh lời nhạc và tính toán vòng hợp âm phù hợp, vui lòng đợi trong giây lát."
                                            : 'Tùy chỉnh các thông số cấu hình bên cạnh và nhấn "Sinh hợp âm & Giai điệu" để nhận bài hát từ Gemini.'
                                        }
                                    </p>
                                </div>

                                {!loading && (
                                    <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-white/50 text-left space-y-2 opacity-55">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                            <FileText size={14} />
                                            PREVIEW STRUCTURE
                                        </div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

        </div>
    );
}