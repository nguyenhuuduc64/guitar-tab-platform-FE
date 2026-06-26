import instance from "../config/axios";

export interface ArtistStats {
    artistId: string;
    artistName: string;
    imageUrl?: string;
    totalViews: number;
    songCount: number;
    songs?: any[];
}

export const getArtistById = async (id: string) => {
    try {
        const res = await instance.get(`/artists/${id}`);
        console.log("thong tin nghe sy", res.data.result);
        return res.data?.result;
    } catch (error) {
        console.log(error);
    }
};

export const fetchArtists = async () => {
    try {
        const res = await instance.get("/artists");
        console.log("danh sach nghe sy ", res.data.result);
        return res.data?.result;
    } catch (err) {
        console.error("Fetch artists error:", err);
    }
};

export const getTopArtistByViews = async (): Promise<ArtistStats | null> => {
    try {
        const response = await instance.get('/chords/mostViews');
        const topChords = response.data.result || [];

        if (topChords.length === 0) return null;

        const artistStats = new Map<string, { totalViews: number, songs: any[] }>();

        topChords.forEach((chord: any) => {
            const artistId = chord.artistId;
            if (!artistId) return;

            if (artistStats.has(artistId)) {
                const existing = artistStats.get(artistId)!;
                existing.totalViews += chord.views || 0;
                existing.songs.push(chord);
            } else {
                artistStats.set(artistId, {
                    totalViews: chord.views || 0,
                    songs: [chord]
                });
            }
        });

        let topArtistId = '';
        let maxViews = 0;
        let topSongs: any[] = [];

        artistStats.forEach((stats, artistId) => {
            if (stats.totalViews > maxViews) {
                maxViews = stats.totalViews;
                topArtistId = artistId;
                topSongs = stats.songs;
            }
        });

        if (!topArtistId) return null;

        const artistInfo = await getArtistById(topArtistId);

        return {
            artistId: topArtistId,
            artistName: artistInfo?.name || "Unknown Artist",
            imageUrl: artistInfo?.imageUrl || "",
            totalViews: maxViews,
            songCount: topSongs.length,
            songs: topSongs
        };

    } catch (error) {
        console.error("Lỗi lấy top artist:", error);
        return null;
    }
};

export const getArtistAlbums = async (artistId: string) => {
    try {
        const response = await instance.get(`/chords/artist/${artistId}`);
        return response.data.result || [];
    } catch (error) {
        console.error("Lỗi lấy album artist:", error);
        return [];
    }
};