import axios from "axios";

/**
 * @returns {Promise<Object|null>} Trả về Object User hoặc null nếu lỗi/không có token
 */
export const fetchUser = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        return null;
    }

    try {
        const res = await axios.get("http://localhost:8080/api/users/my-info", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Trả về data (xử lý trường hợp có hoặc không có bọc qua field 'result')
        return res.data?.result || res.data;
    } catch (err) {
        console.error("Fetch user failed:", err.response?.data || err.message);

        // Nếu lỗi 401 (Unauthorized) thì nên xóa token
        if (err.response?.status === 401) {
            localStorage.removeItem("accessToken");
        }

        return null;
    }
};
