import { useState } from "react";
import instance from "../../../config/axios";
import ButtonCustom from "../../../components/ui/ButtonCustom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faGooglePlusG } from "@fortawesome/free-brands-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
                {
                    email,
                    password,
                },
            );

            const accessToken = res.data?.result?.token;
            console.log(res.data.result);
            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
            }
            window.location.href = "/";
        } catch (err) {
            setError("Sai tài khoản hoặc mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-10 font-sans text-[#444]">
            <div className="w-full max-w-[700px] px-6">
                <h2 className="text-3xl mb-1">Đăng nhập</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Đăng nhập bằng tài khoản có sẵn
                </p>

                {/* Social Login sử dụng FontAwesomeIcon component */}
                <div className="flex gap-4 mb-10">
                    <button className="flex-1 flex items-center bg-[#3b5998] text-white rounded-sm overflow-hidden h-12 hover:opacity-90 transition-opacity">
                        <span className="bg-black/10 w-12 h-full flex items-center justify-center text-xl">
                            <FontAwesomeIcon icon={faFacebookF} />
                        </span>
                        <span className="flex-1 text-center font-bold tracking-wide">
                            Facebook
                        </span>
                    </button>

                    <button className="flex-1 flex items-center bg-[#dd4b39] text-white rounded-sm overflow-hidden h-12 hover:opacity-90 transition-opacity">
                        <span className="bg-black/10 w-12 h-full flex items-center justify-center text-2xl">
                            <FontAwesomeIcon icon={faGooglePlusG} />
                        </span>
                        <span className="flex-1 text-center font-bold tracking-wide">
                            Google
                        </span>
                    </button>
                </div>

                <div className="border-t border-gray-100 pt-8">
                    <p className="text-sm text-gray-400 mb-4">
                        Đăng nhập bằng tài khoản Hợp Âm Chuẩn
                    </p>

                    {error && (
                        <div className="mb-4 text-sm text-red-500">{error}</div>
                    )}

                    <div className="space-y-4 max-w-[600px]">
                        <div>
                            <label className="text-sm font-bold block mb-2">
                                Tên tài khoản hoặc Email
                            </label>
                            <input
                                type="text"
                                className="w-full bg-[#f0f4f8] border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-200"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold block mb-2">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                className="w-full bg-[#f0f4f8] border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-200"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-start justify-between pt-2">
                            <ButtonCustom
                                name={loading ? "..." : "Đăng nhập"}
                                onClick={handleLogin}
                                className="bg-[#4fa6f1] text-white px-8 py-2 rounded-md shadow-sm hover:bg-[#3d95e0] text-sm font-medium transition-colors"
                            />
                            <div className="text-right space-y-2">
                                <p className="text-sm text-gray-400 cursor-pointer hover:text-blue-500 hover:underline">
                                    Quên mật khẩu?
                                </p>
                                <p className="text-sm text-gray-400 cursor-pointer hover:text-blue-500 hover:underline">
                                    Gửi lại email kích hoạt
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
