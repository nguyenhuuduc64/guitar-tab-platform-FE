export interface Album {
    id: string;
    title: string;
    artistId: string;
    artistName: string;
    artistImage?: string;
    songs: any[];
    totalViews: number;
    createdAt: string;
    description?: string;
}
