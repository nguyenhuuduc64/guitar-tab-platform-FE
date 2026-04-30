import GuitarChordDiagram from "../../../components/chords/GuitarChordDiagram";
import {
    C_CHORDS,
    DM_CHORDS,
    EM_CHORDS,
    F_CHORDS,
    G_CHORDS,
} from "../../../constants/chords";
export default function TestPage() {
    // Cấu trúc mảng truyền vào

    return (
        <div className="flex justify-center mt-10">
            <GuitarChordDiagram chordData={F_CHORDS} />;
        </div>
    );
}
