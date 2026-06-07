import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { GoogleGenAI } from "@google/genai";
import ButtonCustom from "../../../components/ui/ButtonCustom";
import { faMusic, faSpinner, faArrowRight } from "@fortawesome/free-solid-svg-icons"; // Thêm icon arrow
import ChordViewer from "../../../components/common/ChordViewer";

export function TextToChord() {
    const navigate = useNavigate(); // Khởi tạo hook điều hướng
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<string>("");

    const handleGenerateChords = async () => {
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
                console.log("=== LỜI BÀI HÁT VÀ HỢP ÂM TỪ AI ===");
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
        <div className="w-full bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6">

            {/* PHẦN BÊN TRÁI: Chiếm 2/5 */}
            <div className="w-full md:w-2/5 flex flex-col justify-between">
                <div>
                    <h2 className="text-xl font-bold uppercase text-gray-800 mb-4 flex items-center gap-2">
                        Text to Chord (AI)
                    </h2>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Nhập ý tưởng bài hát tại đây (ví dụ: Ballad buồn về tình yêu đơn phương, tone Am)..."
                        className="min-h-[200px] w-full border border-gray-200 p-3 text-sm rounded-lg outline-none focus:border-purple-500 transition resize-none"
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <ButtonCustom
                        onClick={handleGenerateChords}
                        name={loading ? "AI đang xử lý..." : "Gửi AI tạo hợp âm"}
                        icon={loading ? faSpinner : faMusic}
                        variant="primary"
                        className={loading ? "animate-pulse" : ""}
                    />
                </div>
            </div>

            {/* PHẦN BÊN PHẢI: Chiếm 3/5 */}
            <div className="w-full md:w-3/5 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
                {generatedResult ? (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-800">Kết quả từ AI:</h3>

                            {/* Nút chuyển tiếp qua route melody2chord kèm data */}
                            <ButtonCustom
                                onClick={() => navigate("/ai-composer/melody2chord", { state: { aiLyrics: generatedResult } })}
                                name="Chuyển thành nhạc (Sonauto)"
                                icon={faArrowRight}
                                variant="secondary"
                                className="!py-1.5 !text-xs"
                            />
                        </div>
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg overflow-y-auto max-h-[500px]">
                            <ChordViewer
                                chord={{
                                    id: "ai-generated",
                                    title: "Bài hát từ AI",
                                    content: generatedResult
                                }}
                                onOpenPlaylist={() => { }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[250px] flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                        Nội dung bài hát và chỉ dẫn hợp âm từ AI sẽ hiển thị tại đây...
                    </div>
                )}
            </div>

        </div>
    );
}

export default TextToChord;