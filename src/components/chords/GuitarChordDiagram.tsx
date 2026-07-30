import { useState, useEffect } from "react";
import { getChordData } from "../../constants/chords";
import { useChordContext } from "../../context/ChordContext";
import { Volume2 } from "lucide-react";

// Helper dynamically loading external scripts
const loadScript = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
            if ((existingScript as any).ready) {
                resolve();
            } else {
                existingScript.addEventListener("load", () => resolve());
                existingScript.addEventListener("error", (err) => reject(err));
            }
            return;
        }

        const script = document.createElement("script");
        script.src = url;
        script.async = true;
        script.addEventListener("load", () => {
            (script as any).ready = true;
            resolve();
        });
        script.addEventListener("error", (err) => reject(err));
        document.body.appendChild(script);
    });
};

const GuitarChordDiagram = ({ initialChordName = "C" }) => {
    const { transposeValue, setTransposeValue, transposeChordName } = useChordContext();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isSoundLoading, setIsSoundLoading] = useState(false);

    // Sử dụng transpose từ context để hiển thị hợp âm đã được transpose
    const displayedName = transposeChordName(initialChordName);
    const chordData = getChordData(displayedName) || [];

    useEffect(() => {
        setCurrentIdx(0);
    }, [displayedName]);

    if (chordData.length === 0) {
        return (
            <div className="text-red-500 p-5">
                Không có dữ liệu cho {displayedName}
            </div>
        );
    }

    const currentChord = chordData[currentIdx];
    const { name, startingFret, openStrings, mutedStrings, fingerings } =
        currentChord;

    const nextVariation = () =>
        setCurrentIdx((prev) => (prev + 1) % chordData.length);
    const prevVariation = () =>
        setCurrentIdx(
            (prev) => (prev - 1 + chordData.length) % chordData.length,
        );

    const handlePlaySound = async () => {
        if (isSoundLoading) return;

        try {
            setIsSoundLoading(true);

            // Tải thư viện WebAudioFont và âm sắc Steel Guitar chất lượng cao từ CDN
            await loadScript("https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js");
            await loadScript("https://surikov.github.io/webaudiofontdata/sound/0250_SoundBlasterOld_sf2.js");

            setIsSoundLoading(false);

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const now = ctx.currentTime;
            const strumDelay = 0.05; // 50ms delay giữa các dây (arpeggiated strum)

            const player = new (window as any).WebAudioFontPlayer();
            const instrument = (window as any)._tone_0250_SoundBlasterOld_sf2;

            // Nốt MIDI cơ sở của 6 dây đàn Guitar (chuẩn E-Standard)
            const baseMidiNotes: Record<number, number> = {
                6: 40, // E2 (thấp nhất)
                5: 45, // A2
                4: 50, // D3
                3: 55, // G3
                2: 59, // B3
                1: 64  // E4 (cao nhất)
            };

            const stringFrets: Record<number, number | null> = {
                6: null, 5: null, 4: null, 3: null, 2: null, 1: null
            };

            // Thiết lập trạng thái phím bấm của từng dây
            openStrings.forEach(s => {
                stringFrets[s] = 0;
            });

            fingerings.forEach(([_, string, fret]) => {
                stringFrets[string] = fret;
            });

            mutedStrings.forEach(s => {
                stringFrets[s] = null;
            });

            let playedStringCount = 0;
            const duration = 2.0;

            // Strum dây từ trầm đến bổng (từ dây 6 về dây 1)
            for (let s = 6; s >= 1; s--) {
                const fret = stringFrets[s];
                if (fret === null) continue;

                // Nốt nhạc thực tế phát ra = nốt dây buông + số ngăn bấm
                const midiNote = baseMidiNotes[s] + fret;
                const playTime = now + (playedStringCount * strumDelay);

                // Phát nốt nhạc guitar thật từ SoundFont wavetable
                player.queueWaveTable(ctx, ctx.destination, instrument, playTime, midiNote, duration, 0.6);
                playedStringCount++;
            }
        } catch (err) {
            console.error("Lỗi tải WebAudioFont hoặc phát nhạc:", err);
            setIsSoundLoading(false);
        }
    };

    return (
        <div className="w-[200px] text-center font-sans select-none bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 p-5">
            {/* Phần tăng hạ tone */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1 border border-gray-200 dark:border-slate-800 rounded px-1 text-[12px]">
                    <button
                        onClick={() => setTransposeValue(transposeValue - 1)}
                        className="px-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-350"
                    >
                        -
                    </button>
                    <span className="min-w-[45px] font-bold text-gray-800 dark:text-slate-200">
                        Tone {transposeValue > 0 ? `+${transposeValue}` : transposeValue}
                    </span>
                    <button
                        onClick={() => setTransposeValue(transposeValue + 1)}
                        className="px-1 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-350"
                    >
                        +
                    </button>
                </div>
                <div className="text-[#3366cc] dark:text-blue-400 text-[14px]">guitar</div>
            </div>

            <div className="text-[24px] font-bold my-[5px] text-gray-900 dark:text-white flex items-center justify-center gap-2">
                {name}
                <button
                    onClick={handlePlaySound}
                    disabled={isSoundLoading}
                    className={`cursor-pointer text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-all p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center ${isSoundLoading ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
                    title={isSoundLoading ? "Đang tải âm thanh..." : "Nghe thử hợp âm"}
                >
                    <Volume2 className="w-5 h-5" />
                </button>
            </div>

            <div className="relative w-[120px] mx-auto">
                <div className="flex justify-between px-[5px] text-[12px] h-[15px]">
                    {[6, 5, 4, 3, 2, 1].map((s) => (
                        <span key={s} className="w-[15px]">
                            {mutedStrings.includes(s)
                                ? "x"
                                : openStrings.includes(s)
                                    ? "o"
                                    : ""}
                        </span>
                    ))}
                </div>

                <div className="border-t-2 border-black dark:border-slate-300 relative mt-[5px]">
                    <div className="flex justify-between h-[100px]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[1px] bg-black dark:bg-slate-450 h-full" />
                        ))}
                    </div>

                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-full h-[1px] bg-black dark:bg-slate-450"
                            style={{ top: `${(i + 1) * 25}%` }}
                        />
                    ))}

                    <div className="absolute -right-[30px] top-0 h-full flex flex-col justify-around text-[12px] text-gray-500 dark:text-slate-400">
                        {[...Array(4)].map((_, i) => (
                            <span key={i}>{startingFret + i}fr</span>
                        ))}
                    </div>

                    {fingerings.map(([finger, string, fret], i) => {
                        const relFret = fret - startingFret;
                        if (relFret < 0 || relFret >= 4) return null;
                        return (
                            <div
                                key={i}
                                className="absolute w-[18px] h-[18px] bg-black dark:bg-slate-200 text-white dark:text-slate-900 rounded-full flex items-center justify-center text-[11px] font-bold -translate-x-1/2 -translate-y-1/2 z-[2]"
                                style={{
                                    top: `${(relFret + 0.5) * 25}%`,
                                    left: `${(6 - string) * 20}%`,
                                }}
                            >
                                {finger}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-[15px] text-[14px]">
                <div className="flex items-center justify-center gap-[10px]">
                    <span onClick={prevVariation} className="cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                        ◁
                    </span>
                    Thế tay {currentIdx + 1}
                    <span onClick={nextVariation} className="cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                        ▷
                    </span>
                </div>

                <div className="flex items-center justify-center gap-[5px] mt-[5px]">
                    <button
                        onClick={prevVariation}
                        className="border-none bg-[#4a90e2] hover:bg-[#357abd] text-white py-[2px] px-[8px] rounded-[3px] cursor-pointer transition"
                    >
                        ◀
                    </button>
                    Đổi thế bấm
                    <button
                        onClick={nextVariation}
                        className="border-none bg-[#4a90e2] hover:bg-[#357abd] text-white py-[2px] px-[8px] rounded-[3px] cursor-pointer transition"
                    >
                        ▶
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuitarChordDiagram;