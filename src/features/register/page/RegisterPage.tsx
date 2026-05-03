import { useState } from "react";
import axios from "axios";
import ButtonCustom from "../../../components/ui/ButtonCustom";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        fullName: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        setLoading(true);
        setError("");

        try {
            await axios.post("http://localhost:8080/api/users", form);
            navigate("/login");
        } catch (err) {
            setError("Email hoặc username đã tồn tại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f8fb]">
            <div className="w-full max-w-[500px] bg-white rounded-xl shadow-lg p-8">
                {/* Title */}
                <h2 className="text-3xl font-bold mb-2 text-gray-800">
                    Tạo tài khoản
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Điền thông tin để bắt đầu sử dụng
                </p>

                {/* Error */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-2 rounded-md">
                        {error}
                    </div>
                )}

                {/* Form */}
                <div className="space-y-4">
                    <input
                        name="username"
                        placeholder="Tên đăng nhập"
                        onChange={handleChange}
                        className="w-full bg-[#f0f4f8] border border-gray-200 rounded-md p-3 
                                   focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    <input
                        name="fullName"
                        placeholder="Họ và tên"
                        onChange={handleChange}
                        className="w-full bg-[#f0f4f8] border border-gray-200 rounded-md p-3 
                                   focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    <input
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="w-full bg-[#f0f4f8] border border-gray-200 rounded-md p-3 
                                   focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Mật khẩu"
                        onChange={handleChange}
                        className="w-full bg-[#f0f4f8] border border-gray-200 rounded-md p-3 
                                   focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    <ButtonCustom
                        name={loading ? "Đang xử lý..." : "Đăng ký"}
                        onClick={handleRegister}
                        className="w-full bg-[#4fa6f1] text-white py-3 rounded-md 
                                   hover:bg-[#3d95e0] transition font-medium"
                    />
                </div>

                {/* Footer */}
                <p className="text-sm text-gray-500 mt-6 text-center">
                    Đã có tài khoản?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        className="text-blue-500 cursor-pointer hover:underline font-medium"
                    >
                        Đăng nhập
                    </span>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
