// services/chordService.js
import instance from "../config/axios";

export const getChords = async () => {
    try {
        const res = await instance.get("/chords");
        return res.data?.result || res.data;
    } catch (error) {
        console.error("getChords error:", error);
        throw error;
    }
};
export const getChordById = async (id) => {
    try {
        const res = await instance.get(`/chords/${id}`);
        return res.data?.result || res.data;
    } catch (error) {
        throw error;
    }
};
