import { useState } from "react";
import axios from "axios";
import ButtonCustom from "../../../components/common/ButtonCustom";
import { useNavigate } from "react-router-dom";
import loginBanner from "../../../assets/login_banner.png";

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        fullName: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        setLoading(true);
        setError("");

        try {
            await axios.post("http://localhost:8080/api/users", form);
            navigate("/login");
        } catch (err) {
            setError("Email hoặc tên tài khoản đã tồn tại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex font-sans text-neutral-800 dark:text-zinc-200">
            {/* Cột Trái: Form đăng ký chuẩn thiết kế */}
            <div className="flex-1 flex flex-col justify-center items-center px-8 lg:px-20 py-12">
                <div className="w-full max-w-md space-y-6">
                    {/* Header: Logo và Tên thương hiệu */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white font-extrabold text-xl shadow-md border border-neutral-800" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
                            R
                        </div>
                        <span className="text-[#1A5FB4] dark:text-[#3584E4] font-extrabold text-lg tracking-wider uppercase" onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
                            RHYTHM FUSION
                        </span>
                    </div>

                    {/* Tiêu đề Đăng ký */}
                    <div className="text-center pt-4">
                        <h2 className="text-2xl font-extrabold tracking-widest text-neutral-800 dark:text-zinc-100 uppercase">
                            TẠO TÀI KHOẢN MỚI
                        </h2>
                    </div>

                    {error && (
                        <div className="text-xs bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/35 text-rose-500 dark:text-rose-450 p-3.5 rounded-2xl">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Các trường nhập liệu */}
                        <div className="space-y-3.5">
                            <input
                                name="username"
                                placeholder="Tên tài khoản"
                                onChange={handleChange}
                                className="w-full border border-neutral-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] transition-all bg-white dark:bg-zinc-900 text-neutral-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                            />

                            <input
                                name="fullName"
                                placeholder="Họ và tên của bạn"
                                onChange={handleChange}
                                className="w-full border border-neutral-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] transition-all bg-white dark:bg-zinc-900 text-neutral-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                            />

                            <input
                                name="email"
                                type="email"
                                placeholder="Địa chỉ Email"
                                onChange={handleChange}
                                className="w-full border border-neutral-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] transition-all bg-white dark:bg-zinc-900 text-neutral-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Mật khẩu bảo mật"
                                onChange={handleChange}
                                className="w-full border border-neutral-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] transition-all bg-white dark:bg-zinc-900 text-neutral-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                            />
                        </div>

                        {/* Nút hành động */}
                        <div className="pt-2">
                            <ButtonCustom
                                name={loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
                                onClick={handleRegister}
                                className="w-full bg-[#0b57d0] hover:bg-[#004ecb] text-white py-4 rounded-2xl transition-all font-semibold text-sm shadow-md"
                            />
                        </div>
                    </div>

                    {/* Footer liên kết đăng nhập */}
                    <p className="text-center text-sm text-neutral-500 dark:text-zinc-550 pt-2 font-medium">
                        Bạn đã có tài khoản?{" "}
                        <span className="text-[#1a73e8] font-bold cursor-pointer hover:underline" onClick={() => navigate("/login")}>
                            Đăng nhập ngay
                        </span>
                    </p>
                </div>
            </div>

            {/* Cột Phải: Visual Banner trọn vẹn từ ảnh gốc */}
            <div className="hidden lg:block w-[55%] relative overflow-hidden bg-cover bg-center border-l border-neutral-100 dark:border-zinc-900" style={{ backgroundImage: `url(${loginBanner})` }} />
        </div>
    );
}