import { useState, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ButtonCustom from "../../../components/ui/ButtonCustom";
import {
    faMagicWandSparkles,
    faPlay,
    faPause,
    faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Hero = () => {
    const [lyrics, setLyrics] = useState("");
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleGenerateMusic = async () => {
        const apiKey = import.meta.env.VITE_GEMINI_KEY;
        if (!apiKey || !lyrics.trim() || loading) return;

        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // Sử dụng model clip-preview như trong doc bạn mới lấy
            const model = genAI.getGenerativeModel({
                model: "lyria-3-clip-preview",
            });

            const result = await model.generateContent(
                `Create a 30-second song based on these lyrics: ${lyrics}`,
            );

            const response = await result.response;

            // Duyệt qua các parts để tìm dữ liệu âm thanh (inlineData)
            const audioPart = response.candidates?.[0]?.content?.parts.find(
                (part: any) => part.inlineData,
            );

            if (audioPart && audioPart.inlineData) {
                const base64Data = audioPart.inlineData.data;
                const mimeType = audioPart.inlineData.mimeType || "audio/mp3";

                // Chuyển Base64 sang Blob trên trình duyệt
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const audioBlob = new Blob([byteArray], { type: mimeType });

                if (audioUrl) URL.revokeObjectURL(audioUrl);
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
            } else {
                throw new Error(
                    "Không tìm thấy dữ liệu âm thanh trong phản hồi.",
                );
            }
        } catch (error: any) {
            console.error("Lỗi tạo nhạc:", error);
            alert(error.message || "Đã xảy ra lỗi khi gọi API");
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        isPlaying ? audioRef.current.pause() : audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    return (
        <section className="relative border border-border-subtle bg-white p-6 mb-5">
            <div className="absolute top-0 left-0 h-[2px] w-16 bg-primary" />
            <h1 className="mb-4 text-xl font-bold uppercase">
                AI Music Generation
            </h1>

            <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Nhập mô tả hoặc lời bài hát..."
                className="min-h-[120px] w-full border p-3 text-sm outline-none focus:border-primary"
            />

            <div className="mt-4 flex justify-end gap-2">
                {audioUrl && (
                    <button
                        onClick={togglePlay}
                        className="h-10 w-10 border border-primary text-primary"
                    >
                        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onEnded={() => setIsPlaying(false)}
                            hidden
                        />
                    </button>
                )}
                <ButtonCustom
                    onClick={handleGenerateMusic}
                    name={loading ? "Đang tạo..." : "Tạo Audio AI"}
                    icon={loading ? faSpinner : faMagicWandSparkles}
                    variant="primary"
                    className={loading ? "animate-pulse" : ""}
                />
            </div>
        </section>
    );
};
