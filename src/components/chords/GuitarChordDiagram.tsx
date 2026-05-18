import { useState, useEffect } from "react";
import { transposeChord } from "../../helper/transpose";
import { getChordData } from "../../constants/chords";

const GuitarChordDiagram = ({ initialChordName = "C" }) => {
    const [transpose, setTranspose] = useState(0);
    const [currentIdx, setCurrentIdx] = useState(0);

    const displayedName = transposeChord(initialChordName, transpose);
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

    return (
        <div className="w-[200px] text-center font-sans select-none bg-white p-5">
            {/* Phần tăng hạ tone mới thêm */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1 border rounded px-1 text-[12px]">
                    <button
                        onClick={() => setTranspose((t) => t - 1)}
                        className="px-1 hover:bg-gray-100"
                    >
                        -
                    </button>
                    <span className="min-w-[45px] font-bold">
                        Tone {transpose > 0 ? `+${transpose}` : transpose}
                    </span>
                    <button
                        onClick={() => setTranspose((t) => t + 1)}
                        className="px-1 hover:bg-gray-100"
                    >
                        +
                    </button>
                </div>
                <div className="text-[#3366cc] text-[14px]">guitar</div>
            </div>

            <div className="text-[24px] font-bold my-[5px]">
                {name} <span className="cursor-pointer">🔊</span>
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

                <div className="border-t-2 border-black relative mt-[5px]">
                    <div className="flex justify-between h-[100px]">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[1px] bg-black h-full" />
                        ))}
                    </div>

                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-full h-[1px] bg-black"
                            style={{ top: `${(i + 1) * 25}%` }}
                        />
                    ))}

                    <div className="absolute -right-[30px] top-0 h-full flex flex-col justify-around text-[12px]">
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
                                className="absolute w-[18px] h-[18px] bg-black text-white rounded-full flex items-center justify-center text-[11px] -translate-x-1/2 -translate-y-1/2 z-[2]"
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
                    <span onClick={prevVariation} className="cursor-pointer">
                        ◁
                    </span>
                    Thế tay {currentIdx + 1}
                    <span onClick={nextVariation} className="cursor-pointer">
                        ▷
                    </span>
                </div>

                <div className="flex items-center justify-center gap-[5px] mt-[5px]">
                    <button
                        onClick={prevVariation}
                        className="border-none bg-[#4a90e2] text-white py-[2px] px-[8px] rounded-[3px] cursor-pointer"
                    >
                        ◀
                    </button>
                    Đổi thế bấm
                    <button
                        onClick={nextVariation}
                        className="border-none bg-[#4a90e2] text-white py-[2px] px-[8px] rounded-[3px] cursor-pointer"
                    >
                        ▶
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GuitarChordDiagram;
