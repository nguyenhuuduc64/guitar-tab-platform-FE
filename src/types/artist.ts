import { type Chord } from "./chord";

export interface Artist {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
}

export interface ArtistStats {
    artistId: string;
    artistName: string;
    totalViews: number;
    songCount: number;
    songs: Chord[];
    topSong?: Chord;
    imageUrl?: string;
    description?: string;
}

export interface ArtistStat {
    artistId: string;
    artistName: string;
    imageUrl?: string;
    collectionCount: number;
    totalViews: number;
    chordCount: number;
    topChord?: Chord;
}

export interface RankingArtist {
    artistId: string;
    artistName: string;
    imageUrl?: string;
    totalViews: number;
    songCount: number;
}