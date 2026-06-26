// src/components/common/ToneController.tsx
import { useChordContext } from "../../../context/ChordContext";
import { Button } from "../../ui/button";

export const ToneController = () => {
    const { transposeValue, setTransposeValue } = useChordContext();

    return (
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setTransposeValue(transposeValue - 1)}
            >
                -
            </Button>
            <span className="min-w-[60px] text-center font-medium">
                Tone {transposeValue > 0 ? `+${transposeValue}` : transposeValue}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setTransposeValue(transposeValue + 1)}
            >
                +
            </Button>
            {transposeValue !== 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTransposeValue(0)}
                    className="text-xs"
                >
                    Reset
                </Button>
            )}
        </div>
    );
};