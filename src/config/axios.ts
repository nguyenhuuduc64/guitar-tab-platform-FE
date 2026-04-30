import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const instance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

const refreshInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api`,
    withCredentials: true,
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");

        const isRefreshRequest = config.url?.includes("/auth/refresh");

        if (token && !isRefreshRequest) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isUnauthorized = error.response?.status === 401;
        const isTokenExpired = error.response?.data?.message
            ?.toLowerCase()
            .includes("expired");

        if ((isUnauthorized || isTokenExpired) && !originalRequest._retry) {
            originalRequest._retry = true;

            const oldToken = localStorage.getItem("accessToken");
            if (!oldToken) {
                // Không có token → không refresh
                return Promise.reject(error);
            }
            try {
                const res = await refreshInstance.post("/auth/refresh", {
                    token: oldToken,
                });

                const newToken = res.data.result.token;
                localStorage.setItem("accessToken", newToken);

                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

                return instance(originalRequest);
            } catch (refreshError) {
                console.error(refreshError);

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

export default instance;
