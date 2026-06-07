import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Ép đường dẫn tuyệt đối trỏ thẳng vào thư mục chứa vite.config.ts để tìm file .env
    const envDir = path.resolve(__dirname);
    const env = loadEnv(mode, envDir, "");

    // Log kiểm tra ngay trên Terminal chạy Node khi bạn gõ npm run dev
    if (!env.VITE_SONAUTO_KEY) {
        console.error("❌ CRITICAL ERROR: Không tìm thấy biến VITE_SONAUTO_API trong file .env tại: " + envDir);
    } else {
        console.log("✅ SUCCESS: Đã tìm thấy và cấu hình thành công Sonauto API Key tại Proxy.");
    }

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        server: {
            proxy: {
                "/api-sonauto": {
                    target: "https://api.sonauto.ai",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api-sonauto/, ""),
                    configure: (proxy) => {
                        proxy.on("proxyReq", (proxyReq) => {
                            if (env.VITE_SONAUTO_KEY) {
                                const cleanKey = env.VITE_SONAUTO_KEY.trim().replace(/^['"]|['"]$/g, "");
                                proxyReq.setHeader("Authorization", `Bearer ${cleanKey}`);
                            }
                        });
                    },
                },
            },
        },
    };
});