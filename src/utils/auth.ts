import instance from "../config/axios";
import type { User } from "../types/user";
export const getUserInfo = async () => {
    const res = await instance.get("/users/my-info");
    return res.data.result as User;
};

export const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
};
