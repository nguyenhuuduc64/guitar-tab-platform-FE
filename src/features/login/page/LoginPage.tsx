import { useState } from "react";
import ButtonCustom from "../../../components/common/ButtonCustom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import loginBanner from "../../../assets/login_banner.png";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.post(
                "http://localhost:8080/api/auth/log-in",
                { email, password }
            );

            const accessToken = res.data?.result?.token;
            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
            }
            window.location.href = "/";
        } catch (err) {
            setError("Tài khoản hoặc mật khẩu không chính xác");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex font-sans text-neutral-800 dark:text-zinc-200">
            {/* Cột Trái: Form đăng nhập chuẩn thiết kế */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-20 py-12">
                <div className="w-full max-w-md space-y-8">
                    {/* Header: Logo và Tên thương hiệu */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white text-xl shadow-md border border-neutral-800">
                            R
                        </div>
                        <span className="text-[#1A5FB4] dark:text-[#3584E4] text-lg tracking-wider uppercase">
                            HATCUNGTOI
                        </span>
                    </div>

                    {/* Tiêu đề Chào mừng */}
                    <div className="text-center pt-4">
                        <h2 className="text-2xl font-bold tracking-widest text-neutral-800 dark:text-zinc-100 uppercase">
                            CHÀO MỪNG QUAY TRỞ LẠI
                        </h2>
                    </div>

                    {error && (
                        <div className="text-xs bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/35 text-rose-500 dark:text-rose-400 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Nút Đăng nhập Google */}
                        <button className="w-full flex items-center justify-center gap-4 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-lg py-4 shadow-sm hover:shadow-md hover:bg-neutral-50 dark:hover:bg-zinc-800/80 transition-all font-semibold text-sm text-neutral-700 dark:text-zinc-300">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google logo" />
                            Đăng nhập bằng Google
                        </button>

                        {/* Đường chia cách */}
                        <div className="relative flex py-2 items-center text-[10px] font-bold text-neutral-400 dark:text-zinc-550 uppercase tracking-widest">
                            <div className="flex-grow border-t border-neutral-200 dark:border-zinc-800"></div>
                            <span className="flex-shrink mx-4">Hoặc đăng nhập với Email</span>
                            <div className="flex-grow border-t border-neutral-200 dark:border-zinc-800"></div>
                        </div>

                        {/* Các trường nhập liệu */}
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Email của bạn"
                                className="w-full border border-neutral-200 dark:border-zinc-800 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] transition-all bg-white dark:bg-zinc-900 text-neutral-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <input
                                type="password"
                                placeholder="Mật khẩu của bạn"
                                className="w-full border border-neutral-200 dark:border-zinc-800 rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] transition-all bg-white dark:bg-zinc-900 text-neutral-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Ghi nhớ & Quên mật khẩu */}
                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-zinc-450">
                            <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
                                <input type="checkbox" className="rounded border-neutral-300 dark:border-zinc-800 text-[#1a73e8] focus:ring-0 bg-transparent w-4 h-4 cursor-pointer" />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>
                            <span className="hover:underline hover:text-[#1a73e8] cursor-pointer font-semibold transition-colors">Quên mật khẩu?</span>
                        </div>

                        {/* Nút hành động */}
                        <div className="pt-2">
                            <ButtonCustom
                                name={loading ? "Đang xử lý..." : "Đăng nhập"}
                                onClick={handleLogin}
                                className="w-full bg-[#0b57d0] hover:bg-[#004ecb] text-white py-4 rounded-lg transition-all font-semibold text-sm shadow-md"
                            />
                        </div>
                    </div>

                    {/* Footer liên kết đăng ký */}
                    <p className="text-center text-sm text-neutral-500 dark:text-zinc-550 pt-2 font-medium">
                        Bạn chưa có tài khoản?{" "}
                        <span className="text-[#1a73e8] font-bold cursor-pointer hover:underline" onClick={() => navigate("/dang-ky")}>
                            Đăng ký
                        </span>
                    </p>
                </div>
            </div>

            {/* Cột Phải: Visual Banner trọn vẹn từ ảnh gốc */}
            <div className="hidden lg:block w-[55%] relative overflow-hidden bg-cover bg-center border-l border-neutral-100 dark:border-zinc-900" style={{ backgroundImage: `url(${loginBanner})` }} />
        </div>
    );
}