import { useLocation } from "react-router-dom";
import TextToChord from "../components/TextToChord";
import ChordToMelody from "../components/ChordToMelody";
import AudioExtend from "../components/AudioExtend";

export default function AIPage() {
    const location = useLocation();

    const renderChildComponent = () => {
        if (location.pathname.includes("/ai-composer/text2melody")) {
            return <TextToChord />;
        }
        if (location.pathname.includes("/ai-composer/melody2chord")) {
            return <ChordToMelody />;
        }
        if (location.pathname.includes("/ai-composer/extend")) {
            return <AudioExtend />;
        }

        return null;
    };

    return (
        <div className="relative left-1/2 right-1/2 -ml-[50vw] mr-[50vw] w-screen h-[calc(100vh-var(--header-height))] bg-gray-50 dark:bg-zinc-950 flex overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden">
                {renderChildComponent()}
            </div>
        </div>
    );
}
