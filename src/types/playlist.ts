import { type Chord } from "./chord";
import { type ArtistStat } from "./artist";

export interface Playlist {
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

export interface PlaylistStats {
    totalPlaylists: number;
    totalChords: number;
    totalViews: number;
    totalArtists: number;
    topPlaylists: Playlist[];
    recentPlaylists: Playlist[];
    artistStats: ArtistStat[];
    playlistsByCategory: Record<string, number>;
}
