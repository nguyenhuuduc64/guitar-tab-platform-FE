import { type Chord } from "./chord";
import { type ArtistStat } from "./artist";

export interface Collection {
    id: string;
    name: string;
    slug: string;
    description?: string;
    userId: string;
    chords?: Chord[];
    createdAt: string;
    updatedAt: string;
    totalViews?: number;
    chordCount?: number;
    artistCount?: number;
}

export type Playlist = Collection;

export interface CollectionStats {
    totalCollections: number;
    totalChords: number;
    totalViews: number;
    totalArtists: number;
    topCollections: Collection[];
    recentCollections: Collection[];
    artistStats: ArtistStat[];
    collectionsByCategory: Record<string, number>;
}
