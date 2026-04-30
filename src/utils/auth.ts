import instance from "../config/axios";
export const getUserInfo = async () => {
    const res = await instance.get("/users/my-info");
    console.log(res.data.result);
    return res.data.result;
};

export const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/";
};
