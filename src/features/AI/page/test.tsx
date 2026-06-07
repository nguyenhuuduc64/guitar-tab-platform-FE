import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import ButtonCustom from "../../../components/ui/ButtonCustom";
import GuitarChordDiagram from "../../../components/chords/GuitarChordDiagram";
import { getChordData } from "../../../constants/chords";
import {
    faMagicWandSparkles,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";

export default function AIPage() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<string>("");

    const [hoveredChord, setHoveredChord] = useState<string | null>(null);
    const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setHoveredChord(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleGenerateLyricsAndChords = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_KEY;
        if (!apiKey || !prompt.trim() || loading) return;

        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: `Hãy sáng tác một bài hát kèm hợp âm guitar theo mô tả sau: ${prompt}`,
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
                setHoveredChord(null);
            }
        } catch (error: any) {
            console.error("Lỗi sinh lời và hợp âm:", error);
            alert(error.message || "Đã xảy ra lỗi khi gọi API Gemini");
        } finally {
            setLoading(false);
        }
    };

    const renderContent = (content: string) => {
        return content.split("\n").map((line, idx) => (
            <p key={idx} className="min-h-[1.5rem]">
                {line.split(/(\[.*?\])/g).map((part, i) => {
                    if (part.startsWith("[")) {
                        const chordName = part.replace(/[\[\]]/g, "");
                        return (
                            <span
                                key={i}
                                className="text-red-500 font-bold cursor-pointer hover:text-red-600 transition mx-0.5 relative inline-block"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredChord(chordName);
                                    setPopupPos({
                                        x: rect.left + rect.width / 2,
                                        y: rect.top, // Bỏ window.scrollY để đi kèm với fixed định vị
                                    });
                                }}
                            >
                                {part}
                            </span>
                        );
                    }
                    return part;
                })}
            </p>
        ));
    };

    const currentChordData = hoveredChord ? getChordData(hoveredChord) : null;

    return (
        <div className="mx-auto max-w-5xl p-6 relative">
            <div className="mb-6 border-b pb-4">
                <h1 className="text-3xl font-extrabold uppercase tracking-tight text-gray-900">
                    Trợ lý Sáng tác AI
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Nhập ý tưởng hoặc mô tả nội dung, trợ lý trí tuệ nhân tạo sẽ tự động biên soạn lời bài hát và tối ưu hóa vòng hòa âm Guitar trực quan cho bạn.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <section className="relative border border-border-subtle bg-white p-6 mb-5">
                    <div className="absolute top-0 left-0 h-[2px] w-16 bg-primary" />
                    <h2 className="mb-4 text-xl font-bold uppercase text-gray-800">
                        Ý tưởng bài hát của bạn
                    </h2>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ví dụ: Viết một bài hát ballad buồn về cơn mưa mùa hạ, tone Am, có từ khóa ký ức..."
                        className="min-h-[140px] w-full border p-3 text-sm outline-none focus:border-primary"
                    />

                    <div className="mt-4 flex justify-end gap-2">
                        <ButtonCustom
                            onClick={handleGenerateLyricsAndChords}
                            name={loading ? "Đang xử lý..." : "Tạo Lời & Hợp Âm"}
                            icon={loading ? faSpinner : faMagicWandSparkles}
                            variant="primary"
                            className={loading ? "animate-pulse" : ""}
                        />
                    </div>

                    {generatedResult && (
                        <div className="mt-6 border-t border-dashed pt-4">
                            <h2 className="mb-2 text-sm font-bold text-gray-500 uppercase">
                                Kết quả gợi ý từ AI:
                            </h2>
                            <div className="rounded bg-gray-50 p-5 text-[15px] leading-[2.2] text-gray-800 border select-text">
                                {renderContent(generatedResult)}
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Chuyển thành fixed và dùng origin-bottom để khớp vị trí phía trên chữ */}
            {hoveredChord && currentChordData && (
                <div
                    ref={popupRef}
                    className="fixed z-50 transition-all duration-200"
                    style={{
                        top: popupPos.y - 145, 
                        left: popupPos.x,
                        transform: "translateX(-50%)",
                    }}
                >
                    <div className="bg-white shadow-2xl rounded-xl p-2 border border-gray-100 scale-50 origin-top">
                        <GuitarChordDiagram initialChordName={hoveredChord} />
                    </div>
                </div>
            )}

            <div className="mt-4 rounded-lg bg-blue-50 p-4 border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-800 uppercase mb-2">
                    Mẹo nhập Prompt hiệu quả:
                </h3>
                <ul className="list-disc pl-5 text-xs text-blue-700 space-y-1">
                    <li>Nên chỉ định rõ thể loại nhạc mong muốn (Ví dụ: Ballad, Pop, Rock, Acoustic...).</li>
                    <li>Nên định hướng tone chủ đề hoặc giọng hát mong muốn (Ví dụ: Tone nam cao C Trưởng, Tone nữ buồn A Thứ...).</li>
                    <li>Đưa ra ngữ cảnh hoặc các từ khóa cảm xúc cụ thể (Ví dụ: hoài niệm về kỷ niệm trường xưa, nỗi buồn dưới màn mưa đêm...).</li>
                </ul>
            </div>
        </div>
    );
}