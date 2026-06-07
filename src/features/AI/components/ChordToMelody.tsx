import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation để bắt dữ liệu state
import { Play, Loader2, Music, Sliders, Volume2, Type } from "lucide-react";

export default function ChordToMelody() {
    const location = useLocation(); // Hook nhận thông tin router state
    const [chords, setChords] = useState<string>("");
    const [lyrics, setLyrics] = useState<string>("");
    const [style, setStyle] = useState<string>("pop, acoustic guitar, happy");
    const [loading, setLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Tự động kiểm tra dữ liệu truyền từ route khác sang và điền vào ô Lyrics
    useEffect(() => {
        if (location.state && (location.state as { aiLyrics?: string }).aiLyrics) {
            setLyrics((location.state as { aiLyrics: string }).aiLyrics);
        }
    }, [location.state]);

    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, []);

    const startPolling = (taskId: string) => {
        setStatusMessage("Bài hát đang được khởi tạo...");

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const statusResponse = await fetch(`/api-sonauto/v1/generations/status/${taskId}`, { method: "GET" });
                if (!statusResponse.ok) throw new Error("Không thể kiểm tra trạng thái bài hát.");

                const statusData = await statusResponse.json();
                const status = typeof statusData === "string" ? statusData : statusData.status;

                if (status === "SUCCESS") {
                    setStatusMessage("Đang nạp file âm thanh thành phẩm...");

                    const resultResponse = await fetch(`/api-sonauto/v1/generations/${taskId}`, { method: "GET" });
                    if (!resultResponse.ok) throw new Error("Không thể tải thông tin bài hát.");

                    const resultData = await resultResponse.json();
                    if (resultData.song_paths && resultData.song_paths.length > 0) {
                        setAudioUrl(resultData.song_paths[0]);
                        setLoading(false);
                        setStatusMessage("");
                        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    } else {
                        throw new Error("Không tìm thấy đường dẫn âm thanh.");
                    }
                } else if (status === "FAILURE") {
                    throw new Error("Quá trình xử lý bài hát từ phía Sonauto AI bị lỗi.");
                } else {
                    setStatusMessage(`AI đang xử lý (Trạng thái: ${status})...`);
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Có lỗi xảy ra trong quá trình Polling.";
                setError(msg);
                setLoading(false);
                setStatusMessage("");
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            }
        }, 5000);
    };

    const handleGenerateMusic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chords.trim()) {
            setError("Vui lòng nhập chuỗi hợp âm hoặc prompt mô tả giai điệu.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setAudioUrl(null);
            setStatusMessage("Đang gửi yêu cầu tạo bài hát đến Sonauto V3...");

            const fullPrompt = `Chord Progression: ${chords.trim()}. Style: ${style}`;

            const response = await fetch("/api-sonauto/v1/generations/v3", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    ...(lyrics.trim() && { lyrics: lyrics.trim() })
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.message || "Gửi yêu cầu tạo nhạc thất bại.");
            }

            const data = await response.json();
            if (data.task_id) {
                startPolling(data.task_id);
            } else {
                throw new Error("Hệ thống không trả về task_id hợp lệ.");
            }
        } catch (err: unknown) {
            console.error("Sonauto Generate Error:", err);
            const msg = err instanceof Error ? err.message : "Có lỗi kết nối xảy ra khi gọi Sonauto API.";
            setError(msg);
            setLoading(false);
            setStatusMessage("");
        }
    };

    return (
        <div className="w-full bg-white p-6 border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Music size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold uppercase text-gray-800">Sonauto AI Music Generator (V3)</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Sinh nhạc đầy đủ thông qua hệ thống API Proxy</p>
                </div>
            </div>

            <form onSubmit={handleGenerateMusic} className="space-y-5 mt-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chuỗi hợp âm hoặc Ý tưởng nhạc (Prompt)
                    </label>
                    <input
                        type="text"
                        value={chords}
                        onChange={(e) => setChords(e.target.value)}
                        placeholder="Ví dụ: C - G - Am - F, epic cinematic guitar solo"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 text-sm"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                        <Type size={14} /> Lời bài hát (Lyrics - Tùy chọn)
                    </label>
                    <textarea
                        value={lyrics}
                        onChange={(e) => setLyrics(e.target.value)}
                        placeholder="Nhập lời bài hát..."
                        rows={6}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 text-sm font-mono"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                        <Sliders size={14} /> Phong cách & Nhạc cụ (Tags)
                    </label>
                    <input
                        type="text"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        placeholder="Ví dụ: pop, rock, female vocalist"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 text-sm"
                        disabled={loading}
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                {statusMessage && (
                    <div className="flex items-center gap-2 p-3 bg-indigo-50 text-indigo-700 text-sm rounded-lg border border-indigo-100">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>{statusMessage}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-white transition-all cursor-pointer shadow-sm
                        ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Đang xử lý luồng AI...
                        </>
                    ) : (
                        <>
                            <Play size={18} fill="currentColor" />
                            Generate Music
                        </>
                    )}
                </button>
            </form>

            {audioUrl && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                        <Volume2 size={16} className="text-emerald-500" />
                        Thành phẩm âm nhạc từ Sonauto AI:
                    </div>
                    <audio src={audioUrl} controls className="w-full focus:outline-none rounded-lg shadow-inner bg-white" />
                </div>
            )}
        </div>
    );
}