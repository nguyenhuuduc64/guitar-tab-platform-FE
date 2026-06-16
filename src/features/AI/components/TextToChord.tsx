import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, ArrowRight } from "lucide-react";
import ChordViewer from "../../../components/common/ChordViewer";

export function TextToChord() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<string>("");
    const [historyPrompt, setHistoryPrompt] = useState("");

    const handleGenerateChords = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_KEY;
        if (!apiKey || !prompt.trim() || loading) return;

        const currentPrompt = prompt;
        setHistoryPrompt(currentPrompt);
        setPrompt("");
        setLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: `Hãy sáng tác một bài hát kèm hợp âm guitar theo mô tả sau: ${currentPrompt}`,
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
        <div className="w-full bg-gray-50 border border-gray-100  flex flex-col md:flex-row h-[600px] overflow-hidden">

            <div className="w-full md:w-2/5 flex flex-col justify-between bg-white border-b md:border-b-0 md:border-r border-gray-100 p-4">
                <div className="flex-1 flex flex-col justify-center items-center p-4 text-center">
                    {historyPrompt ? (
                        <div className="max-w-xs bg-purple-50 text-purple-900 border border-purple-100 rounded-2xl px-4 py-2.5 text-sm shadow-sm self-end text-right">
                            <p className="font-semibold text-[11px] text-purple-400 uppercase tracking-wider mb-0.5">Yêu cầu của bạn</p>
                            {historyPrompt}
                        </div>
                    ) : (
                        <div className="text-gray-400">
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 text-xl font-bold mx-auto mb-3">AI</div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Trợ lý Sáng tác Nhạc</h3>
                            <p className="text-xs max-w-[200px]">Nhập chủ đề hoặc ý tưởng bài hát bạn mong muốn ở thanh chat bên dưới.</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 bg-gray-50 focus-within:border-purple-500 focus-within:bg-white transition-all shadow-inner">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGenerateChords()}
                        placeholder="Nhập yêu cầu sáng tác..."
                        disabled={loading}
                        className="flex-1 bg-transparent text-sm outline-none text-gray-700 disabled:cursor-not-allowed placeholder:text-gray-400"
                    />
                    <button
                        onClick={handleGenerateChords}
                        disabled={loading || !prompt.trim()}
                        className="text-purple-600 hover:text-purple-700 disabled:text-gray-300 transition flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="w-full md:w-3/5 flex flex-col h-full bg-white p-4">
                {generatedResult ? (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-50 mb-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kết quả hiển thị</h3>
                            <button
                                onClick={() => navigate("/ai-composer/melody2chord", { state: { aiLyrics: generatedResult } })}
                                className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 transition"
                            >
                                Tạo nhạc với Sonauto <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1">
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
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-6 text-center">
                        {loading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                                <p className="text-sm text-gray-500 font-medium animate-pulse">AI đang soạn lời và hợp âm...</p>
                            </div>
                        ) : (
                            <p className="text-xs max-w-xs">Lời bài hát kèm sơ đồ hợp âm Guitar chi tiết sẽ tự động hiển thị tại đây sau khi AI xử lý xong.</p>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}

export default TextToChord;