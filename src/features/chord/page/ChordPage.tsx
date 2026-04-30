import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Star,
    PlayCircle,
    Type,
    Columns,
    Minus,
    Plus,
    Flag,
    Edit3,
} from "lucide-react";

import { getChordById } from "../../../services/chordService";
import GuitarChordDiagram from "../../../components/chords/GuitarChordDiagram";
import { getChordData } from "../../../constants/chords";

const ChordPage = () => {
    const { id } = useParams();

    const [chord, setChord] = useState(null);
    const [loading, setLoading] = useState(true);

    const [hoveredChord, setHoveredChord] = useState(null);
    const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
    const popupRef = useRef(null);
    useEffect(() => {
        const fetchChordDetail = async () => {
            try {
                setLoading(true);
                const data = await getChordById(id);
                setChord(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchChordDetail();
    }, [id]);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setHoveredChord(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const renderContent = (content) => {
        return content.split("\n").map((line, idx) => (
            <p key={idx}>
                {line.split(/(\[.*?\])/g).map((part, i) => {
                    if (part.startsWith("[")) {
                        const chordName = part.replace(/[\[\]]/g, "");

                        return (
                            <span
                                key={i}
                                className="text-red-600 font-bold cursor-pointer"
                                onClick={(e) => {
                                    const rect =
                                        e.currentTarget.getBoundingClientRect();

                                    setHoveredChord(chordName);
                                    setPopupPos({
                                        x: rect.left + rect.width / 2,
                                        y: rect.top,
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

    if (loading)
        return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

    if (!chord)
        return <div className="p-10 text-center">Không tìm thấy bài hát.</div>;

    const chordData = hoveredChord ? getChordData(hoveredChord) : null;

    return (
        <div className="h-[calc(100vh-64px)] p-4">
            <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* LEFT: 2/3 */}
                <div className="w-full md:flex-[2] bg-white text-[#333] relative overflow-y-auto overscroll-contain rounded-md shadow">
                    <div className="p-4">
                        {/* ===== CONTENT GIỮ NGUYÊN ===== */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-light text-gray-700">
                                    {chord.title}
                                </h1>
                                <button className="p-1.5 bg-blue-100 text-blue-500 rounded-full">
                                    <Star size={20} fill="currentColor" />
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {["Ghi ta", "Guitar", "Nhạc"].map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-[11px] px-3 py-1 border border-blue-200 rounded-full text-blue-600 bg-blue-50"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* phần còn lại giữ nguyên */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 text-[15px] leading-[2.2]">
                            <div className="whitespace-pre-wrap">
                                {renderContent(chord.content)}
                            </div>

                            <div className="hidden md:block border-l border-dashed border-gray-300 pl-8 opacity-50 text-sm italic"></div>
                        </div>
                    </div>

                    {/* Popup chord */}
                    {hoveredChord && chordData && (
                        <div
                            ref={popupRef}
                            className="fixed z-50"
                            style={{
                                top: popupPos.y - 190,
                                left: popupPos.x,
                                transform: "translateX(-50%)",
                            }}
                        >
                            <div className="bg-white shadow-xl rounded-md p-2 scale-60">
                                <GuitarChordDiagram chordData={chordData} />
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: 1/3 */}
                <div className="w-full md:flex-[1] overflow-y-auto rounded-md shadow bg-white p-3">
                    <div className="flex flex-col gap-4">
                        <iframe
                            src="https://guitarapp.com/metronome.html?embed=true&tempo=120&timeSignature=2&pattern=1"
                            title="Metronome"
                            className="w-full h-[300px] rounded-md border-0"
                        />

                        <iframe
                            src="https://guitarapp.com/tuner.html?embed=true&theme=light"
                            allow="microphone"
                            title="Tuner"
                            className="w-full h-[350px] rounded-md border-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChordPage;
