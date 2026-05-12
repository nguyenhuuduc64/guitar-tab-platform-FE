import instance from "../config/axios";

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
