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
