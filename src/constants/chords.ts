export const C_CHORDS = [
    // Open C
    {
        name: "C",
        startingFret: 1,
        openStrings: [1, 3, 5],
        mutedStrings: [6],
        fingerings: [
            [1, 2, 1],
            [2, 4, 2],
            [3, 5, 3],
        ],
    },

    // C barre (A shape - fret 3)
    {
        name: "C",
        startingFret: 3,
        openStrings: [],
        mutedStrings: [],
        fingerings: [
            [1, 5, 3],
            [1, 1, 3],
            [3, 4, 5],
            [4, 3, 5],
            [2, 2, 5],
        ],
    },

    // C triad (high)
    {
        name: "C",
        startingFret: 5,
        openStrings: [],
        mutedStrings: [4, 5, 6],
        fingerings: [
            [1, 3, 5],
            [2, 2, 5],
            [3, 1, 5],
        ],
    },
];
export const DM_CHORDS = [
    // Open Dm
    {
        name: "Dm",
        startingFret: 1,
        openStrings: [1, 4],
        mutedStrings: [5, 6],
        fingerings: [
            [1, 1, 1],
            [2, 3, 2],
            [3, 2, 3],
        ],
    },

    // Dm barre (A shape - fret 5)
    {
        name: "Dm",
        startingFret: 5,
        openStrings: [],
        mutedStrings: [],
        fingerings: [
            [1, 5, 5],
            [1, 1, 5],
            [3, 4, 7],
            [4, 3, 7],
            [2, 2, 6],
        ],
    },

    // Dm triad
    {
        name: "Dm",
        startingFret: 5,
        openStrings: [],
        mutedStrings: [4, 5, 6],
        fingerings: [
            [1, 3, 5],
            [2, 2, 6],
            [3, 1, 5],
        ],
    },
];
export const EM_CHORDS = [
    // Open Em
    {
        name: "Em",
        startingFret: 1,
        openStrings: [1, 2, 3, 6],
        mutedStrings: [],
        fingerings: [
            [1, 5, 2],
            [2, 4, 2],
        ],
    },

    // Em barre (E shape - fret 7)
    {
        name: "Em",
        startingFret: 7,
        openStrings: [],
        mutedStrings: [],
        fingerings: [
            [1, 6, 7],
            [1, 1, 7],
            [3, 5, 9],
            [4, 4, 9],
        ],
    },

    // Em triad
    {
        name: "Em",
        startingFret: 7,
        openStrings: [],
        mutedStrings: [4, 5, 6],
        fingerings: [
            [1, 3, 7],
            [2, 2, 8],
            [3, 1, 7],
        ],
    },
];
export const F_CHORDS = [
    // F barre (E shape)
    {
        name: "F",
        startingFret: 1,
        openStrings: [],
        mutedStrings: [],
        fingerings: [
            [1, 6, 1],
            [1, 1, 1],
            [2, 3, 2],
            [3, 5, 3],
            [4, 4, 3],
        ],
    },

    // F mini (easy)
    {
        name: "F",
        startingFret: 1,
        openStrings: [],
        mutedStrings: [4, 5, 6],
        fingerings: [
            [1, 1, 1],
            [2, 3, 2],
            [3, 2, 1],
        ],
    },

    // F high triad
    {
        name: "F",
        startingFret: 8,
        openStrings: [],
        mutedStrings: [4, 5, 6],
        fingerings: [
            [1, 3, 8],
            [2, 2, 10],
            [3, 1, 8],
        ],
    },
];
export const G_CHORDS = [
    // Open G
    {
        name: "G",
        startingFret: 1,
        openStrings: [2, 3],
        mutedStrings: [],
        fingerings: [
            [1, 5, 2],
            [2, 6, 3],
            [3, 1, 3],
        ],
    },

    // G barre (E shape - fret 3)
    {
        name: "G",
        startingFret: 3,
        openStrings: [],
        mutedStrings: [],
        fingerings: [
            [1, 6, 3],
            [1, 1, 3],
            [3, 5, 5],
            [4, 4, 5],
            [2, 3, 4],
        ],
    },

    // G triad
    {
        name: "G",
        startingFret: 7,
        openStrings: [],
        mutedStrings: [4, 5, 6],
        fingerings: [
            [1, 3, 7],
            [2, 2, 8],
            [3, 1, 7],
        ],
    },
];
export const AM_CHORDS = [
    // Open Am
    {
        name: "Am",
        startingFret: 1,
        openStrings: [1, 2, 3, 5],
        mutedStrings: [6],
        fingerings: [
            [1, 2, 1],
            [2, 4, 2],
            [3, 3, 2],
        ],
    },

    // Am barre (E shape - fret 5)
    {
        name: "Am",
        startingFret: 5,
        openStrings: [],
        mutedStrings: [],
        fingerings: [
            [1, 6, 5],
            [1, 1, 5],
            [3, 5, 7],
            [4, 4, 7],
            [2, 3, 6],
        ],
    },

    // Am triad
    {
        name: "Am",
        startingFret: 9,
        openStrings: [],
        mutedStrings: [4, 5, 6],
        fingerings: [
            [1, 3, 9],
            [2, 2, 10],
            [3, 1, 9],
        ],
    },
];
export const getChordData = (name) => {
    if (name === "C") return C_CHORDS;
    if (name === "Dm") return DM_CHORDS;
    if (name === "Em") return EM_CHORDS;
    if (name === "F") return F_CHORDS;
    if (name === "G") return G_CHORDS;
    if (name === "Am") return AM_CHORDS;
    console.log("❌ Chưa có chord:", name); // debug ngay đây
    return null;
};
