import { type Chord } from "./chord";
import { type ArtistStats } from "./artist";

export interface CategoryStats {
    categoryId: string;
    categoryName: string;
    count: number;
    totalViews: number;
}

export interface DashboardStats {
    totalChords: number;
    totalArtists: number;
    totalViews: number;
    topArtist: ArtistStats | null;
    topChords: Chord[];
    trendingChords: Chord[];
    recentChords: Chord[];
    artistStats: ArtistStats[];
    categoryStats: CategoryStats[];
}
