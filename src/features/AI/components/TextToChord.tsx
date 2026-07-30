import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import { Send, Loader2, ArrowRight, Music, Sparkles, GripVertical, Type, ChevronLeft, ChevronRight } from "lucide-react";
import { DotLoader } from "react-spinners";

export function TextToChord() {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<string>("");
    const [historyPrompt, setHistoryPrompt] = useState("");
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

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
                contents: `Hãy sáng tác lời bài hát theo mô tả sau: ${currentPrompt}`,
                config: {
                    systemInstruction: `Bạn là một nhà soạn nhạc và viết lời bài hát chuyên nghiệp.
Mục tiêu là viết lời bài hát chi tiết, truyền cảm hứng dựa trên mô tả của người dùng.
Quy tắc ép buộc đầu ra:
1. Chỉ trả về lời bài hát thuần túy, tuyệt đối KHÔNG chứa hợp âm guitar, không chèn các thẻ hợp âm trong ngoặc vuông như [C], [G]...
2. Phải chia rõ cấu trúc bài hát bằng các tiêu đề phần: [Intro], [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], [Outro].
3. Không giải thích dông dài, không viết mã code Markdown bọc ngoài text (không dùng \`\`\`), trả về chuỗi văn bản trực tiếp.`
                }
            });

            if (response.text) {
                setGeneratedResult(response.text);
            }
        } catch (error) {
            console.error("Lỗi sinh lời bài hát:", error);
            const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi khi gọi API Gemini";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Tách hợp âm và lời bài hát (Chỉ giữ lại lời, hợp âm để trống)
    const extractChordsAndLyrics = (text: string) => {
        let lyricsOnly = text.replace(/\[([A-Za-z0-9#♭♯]+(\/[A-Za-z0-9#♭♯]+)?)\]\s*/g, '');
        lyricsOnly = lyricsOnly.replace(/\n{3,}/g, '\n\n');

        return {
            chords: "",
            lyrics: lyricsOnly
        };
    };

    const handleNavigate = () => {
        const { chords, lyrics } = extractChordsAndLyrics(generatedResult);
        navigate("/ai-composer/melody2chord", {
            state: {
                aiChords: chords,
                aiLyrics: lyrics,
                aiChordLyrics: lyrics
            }
        });
    };

    return (
        <div className="w-full h-full bg-[#F5F5F3] dark:bg-zinc-950 text-[#222222] dark:text-zinc-150 font-sans antialiased overflow-hidden relative">
            {loading && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fadeIn gap-6 text-center">
                    {/* Glowing AI Orb with DotLoader */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        {/* Innermost DotLoader */}
                        <div className="z-10">
                            <DotLoader color="#8b5cf6" size={60} speedMultiplier={1.2} />
                        </div>
                    </div>


                </div>
            )}
            <div className="flex flex-col lg:flex-row h-full w-full overflow-hidden relative bg-[#EFEFEF] dark:bg-zinc-900">
                {/* Left Panel - Input (3 cột) */}
                <div className={`bg-[#FBFBFB] dark:bg-zinc-900 flex flex-col justify-between overflow-y-auto transition-all duration-300 ease-in-out shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 ${sidebarCollapsed ? "w-0 p-0 border-r-0 border-b-0 h-0" : "w-full lg:w-80 h-[380px] lg:h-full p-6"}`}>
                    <div className="space-y-4">
                        {/* Navigation buttons - giống sidebar */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800/60 p-1 rounded-lg w-fit border border-zinc-300/50 dark:border-zinc-700/50">
                                <button
                                    type="button"
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-white dark:bg-zinc-850 text-zinc-900 dark:text-black shadow-sm border border-zinc-200 dark:border-zinc-750 cursor-default"
                                >
                                    <Music size={13} />
                                    <ArrowRight size={10} className="opacity-60" />
                                    <Sparkles size={13} />
                                    <span className="ml-0.5">Lời bài hát</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/ai-composer/melody2chord")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-200 cursor-pointer text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-250"
                                >
                                    <Sparkles size={13} />
                                    <ArrowRight size={10} className="opacity-60" />
                                    <GripVertical size={13} />
                                    <span className="ml-0.5">Giai điệu</span>
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSidebarCollapsed(true)}
                                className="lg:hidden px-2.5 py-1.5 border border-zinc-300/50 dark:border-zinc-700/50 text-[10px] font-bold text-zinc-550 dark:text-zinc-400 rounded-md cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors uppercase tracking-wider"
                            >
                                Ẩn bảng
                            </button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Ý tưởng sáng tác</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={loading}
                                placeholder="Nhập chủ đề hoặc ý tưởng bài hát..."
                                rows={6}
                                className="w-full p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-650 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 transition-all duration-200 text-sm text-zinc-800 dark:text-zinc-200 resize-none disabled:bg-zinc-100 dark:disabled:bg-zinc-900"
                            />
                        </div>

                        <button
                            onClick={handleGenerateChords}
                            disabled={loading || !prompt.trim()}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Sáng tác
                                </>
                            )}
                        </button>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        {historyPrompt && (
                            <div className="bg-purple-50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300 border border-purple-100 dark:border-purple-900/30 rounded-xl px-4 py-3 text-sm">
                                <p className="text-[10px] font-bold text-purple-400 dark:text-purple-500 uppercase tracking-wider mb-1">Yêu cầu của bạn</p>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">{historyPrompt}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Collapse Sidebar Button */}
                <button
                    type="button"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 z-50 w-6 h-12 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-r-md items-center justify-center cursor-pointer shadow-md transition-all duration-300 ${sidebarCollapsed ? "left-0" : "left-80"
                        }`}
                >
                    {sidebarCollapsed ? (
                        <ChevronRight size={14} className="text-zinc-500 dark:text-zinc-400" />
                    ) : (
                        <ChevronLeft size={14} className="text-zinc-500 dark:text-zinc-400" />
                    )}
                </button>

                {/* Right Panel - Result (9 cột) */}
                <div className="flex-1 min-w-0 flex flex-col bg-[#F5F5F3] dark:bg-zinc-950 overflow-hidden p-4 sm:p-6 lg:p-8">
                    {generatedResult ? (
                        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
                            <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Kết quả hiển thị</h3>
                                    {sidebarCollapsed && (
                                        <button
                                            type="button"
                                            onClick={() => setSidebarCollapsed(false)}
                                            className="lg:hidden text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 px-2 py-0.5 rounded-md cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors uppercase tracking-wider animate-pulse"
                                        >
                                            Soạn lời
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={handleNavigate}
                                    className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
                                >
                                    Tạo nhạc với Sonauto <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <pre className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed">
                                    {generatedResult}
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-dashed border-zinc-200 dark:border-zinc-800 p-8 animate-fadeIn">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-500 dark:text-purple-400 text-2xl font-bold mx-auto mb-4">AI</div>
                                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Trợ lý Sáng tác Nhạc</h3>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm mb-4">
                                    Nhập chủ đề hoặc ý tưởng bài hát ở bên trái, AI sẽ tự động sáng tác lời bài hát kèm hợp âm Guitar chi tiết.
                                </p>
                                {sidebarCollapsed && (
                                    <button
                                        type="button"
                                        onClick={() => setSidebarCollapsed(false)}
                                        className="lg:hidden mx-auto text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 px-3 py-1.5 rounded-md cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors uppercase tracking-wider animate-pulse"
                                    >
                                        Mở bảng soạn lời
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out both;
                }
            `}</style>
        </div>
    );
}

export default TextToChord;