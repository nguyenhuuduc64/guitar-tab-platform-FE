// src/context/ChordContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { transposeChord } from '../helper/transpose';

interface ChordContextType {
    transposeValue: number;
    setTransposeValue: (value: number) => void;
    transposeChordName: (chordName: string) => string;
}

const ChordContext = createContext<ChordContextType | undefined>(undefined);

export const ChordProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [transposeValue, setTransposeValue] = useState<number>(0);

    const transposeChordName = (chordName: string): string => {
        return transposeChord(chordName, transposeValue);
    };

    return (
        <ChordContext.Provider value={{ transposeValue, setTransposeValue, transposeChordName }}>
            {children}
        </ChordContext.Provider>
    );
};

export const useChordContext = () => {
    const context = useContext(ChordContext);
    if (!context) {
        throw new Error('useChordContext must be used within a ChordProvider');
    }
    return context;
};