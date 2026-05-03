import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

import { getChordById } from "../../../services/chordService";
import { getArtistById } from "../../../services/artistService";
import GuitarChordDiagram from "../../../components/chords/GuitarChordDiagram";
import { getChordData } from "../../../constants/chords";

const ChordPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [chord, setChord] = useState(null);
    const [artist, setArtist] = useState(null);
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

                if (data.artistId) {
                    const artistData = await getArtistById(data.artistId);
                    setArtist(artistData);
                }
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
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
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
                                className="text-red-500 font-semibold cursor-pointer"
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
        <div className="h-[calc(100vh-64px)] p-4 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-6 h-full">
                <div className="w-full md:flex-[2] bg-white rounded-lg shadow-sm overflow-y-auto">
                    <div className="p-6">
                        <div className="flex flex-col gap-2 mb-6">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-semibold text-gray-800">
                                    {chord.title}
                                </h1>

                                <button className="p-1.5 bg-blue-100 text-blue-500 rounded-full">
                                    <Star size={18} fill="currentColor" />
                                </button>
                            </div>

                            {artist ? (
                                <p
                                    onClick={() =>
                                        navigate(`/nghe-sy/${artist.id}`)
                                    }
                                    className="text-sm text-gray-500 cursor-pointer hover:text-blue-500 hover:underline w-fit"
                                >
                                    {artist.name}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-400">
                                    Đang tải ca sĩ...
                                </p>
                            )}
                        </div>

                        <div className="whitespace-pre-wrap text-[15px] leading-[2.2]">
                            {renderContent(chord.content)}
                        </div>
                    </div>

                    {hoveredChord && chordData && (
                        <div
                            ref={popupRef}
                            className="fixed z-50"
                            style={{
                                top: popupPos.y - 180,
                                left: popupPos.x,
                                transform: "translateX(-50%)",
                            }}
                        >
                            <div className="bg-white shadow-xl rounded p-2 scale-75">
                                <GuitarChordDiagram chordData={chordData} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full md:flex-[1] bg-white rounded-lg shadow-sm p-4">
                    <iframe
                        src="https://guitarapp.com/metronome.html?embed=true"
                        className="w-full h-[250px]"
                    />
                </div>
            </div>
        </div>
    );
};

export default ChordPage;
