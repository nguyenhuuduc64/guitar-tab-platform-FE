const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const transposeChord = (chordName: string, semitones: number) => {
    const match = chordName.match(/^([A-G][#b]?)(.*)/);
    if (!match) return chordName;

    let root = match[1];
    const suffix = match[2];

    if (root === "Db") root = "C#";
    if (root === "Eb") root = "D#";
    if (root === "Gb") root = "F#";
    if (root === "Ab") root = "G#";
    if (root === "Bb") root = "A#";

    const currentIndex = NOTES.indexOf(root);
    if (currentIndex === -1) return chordName;

    let newIndex = (currentIndex + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    return NOTES[newIndex] + suffix;
};
