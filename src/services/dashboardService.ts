import instance from "../config/axios";

export const getDashboardStats = async () => {
    try {
        const chordsCountRes = await instance.get('/chords?page=0&size=1');
        const totalChords = chordsCountRes.data.result?.total || 0;

        const topChordsRes = await instance.get('/chords/mostViews');
        const topChords = topChordsRes.data.result || [];

        const trendingRes = await instance.get('/chords/trending');
        const trendingChords = trendingRes.data.result || [];

        const recentRes = await instance.get('/chords?page=0&size=5');
        const recentChords = recentRes.data.result?.data || [];

        return {
            totalChords,
            topChords,
            trendingChords,
            recentChords,

        };
    } catch (error) {
        console.error("Lỗi lấy dashboard stats:", error);
        throw error;
    }
};