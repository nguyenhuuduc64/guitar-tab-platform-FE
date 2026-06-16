import { useLocation } from "react-router-dom";
import AiSidebar from "../../../components/common/AiSidebar";
import TextToChord from "../components/TextToChord";
import ChordToMelody from "../components/ChordToMelody";
import ChordGeneration from "../components/ChordGeneration";
export default function AIPage() {
    const location = useLocation();

    const renderChildComponent = () => {
        if (location.pathname.includes("/ai-composer/text2melody")) {
            return <TextToChord />;
        }
        if (location.pathname.includes("/ai-composer/melody2chord")) {
            return <ChordToMelody />;
        }
        if (location.pathname.includes("/ai-composer/chord-generation")) {
            return <ChordGeneration />;
        }
        return null;
    };

    return (
        <div className="relative left-1/2 right-1/2 -ml-[50vw] mr-[50vw] w-screen min-h-screen bg-gray-50 flex">
            <AiSidebar />

            <div className="flex-1 overflow-y-auto">
                {renderChildComponent()}
            </div>
        </div>
    );
}