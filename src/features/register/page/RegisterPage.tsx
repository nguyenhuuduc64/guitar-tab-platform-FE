import { useState } from "react";
import axios from "axios";
import ButtonCustom from "../../../components/common/ButtonCustom";
import { useNavigate } from "react-router-dom";

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
            setError("Email hoặc username đã tồn tại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-var(--header-height)-var(--subnav-height)-32px)] bg-white dark:bg-zinc-950 flex p-4 font-sans text-neutral-800 dark:text-zinc-200 lg:overflow-hidden overflow-y-auto">
            {/* Left Side: Art Banner Component */}
            <div className="hidden lg:flex w-1/2 relative bg-neutral-900 rounded-[2.5rem] overflow-hidden flex-col justify-between p-10 bg-[url('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000')] bg-cover bg-center">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-transparent to-black/80 z-0" />

                <div className="relative z-10 flex items-center justify-between">
                    <span className="text-white font-bold text-lg tracking-wide">Sound Library</span>
                    <div className="flex gap-4 text-sm font-medium">
                        <button className="text-white/80 hover:text-white" onClick={() => navigate("/login")}>Login</button>
                        <button className="bg-white/10 text-white px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm hover:bg-white/20">Join Us</button>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-fit max-w-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden shrink-0">
                            <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=100" alt="Track avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-xs font-semibold truncate">Track of the day</p>
                            <p className="text-white/60 text-[10px] truncate">The Weeknd, Playboi Carti</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Main Register Form */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-16 relative bg-white dark:bg-zinc-950">
                <div className="absolute top-8 right-8 flex items-center gap-2 border border-neutral-200 dark:border-zinc-800 px-3 py-1 rounded-full text-xs font-medium text-neutral-600 dark:text-zinc-400 cursor-pointer hover:bg-neutral-50 dark:hover:bg-zinc-900">
                    <span>🌐 EN</span>
                </div>

                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white animate-pulse">RHYTHMIC</h1>
                        <h2 className="text-3xl font-bold tracking-tight pt-4 text-neutral-800 dark:text-zinc-100">Create Account</h2>
                        <p className="text-neutral-400 dark:text-zinc-500 text-sm">Fill in the details to get started</p>
                    </div>

                    {error && (
                        <div className="text-sm bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 text-red-500 dark:text-red-400 p-3 rounded-xl">{error}</div>
                    )}

                    <div className="space-y-4">
                        <input
                            name="username"
                            placeholder="Username"
                            onChange={handleChange}
                            className="w-full border border-neutral-200 dark:border-zinc-800 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-850 transition-all bg-neutral-50/50 dark:bg-zinc-900/50 text-neutral-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                        />

                        <input
                            name="fullName"
                            placeholder="Full Name"
                            onChange={handleChange}
                            className="w-full border border-neutral-200 dark:border-zinc-800 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-850 transition-all bg-neutral-50/50 dark:bg-zinc-900/50 text-neutral-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                        />

                        <input
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            className="w-full border border-neutral-200 dark:border-zinc-800 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-850 transition-all bg-neutral-50/50 dark:bg-zinc-900/50 text-neutral-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleChange}
                            className="w-full border border-neutral-200 dark:border-zinc-800 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-zinc-850 transition-all bg-neutral-50/50 dark:bg-zinc-900/50 text-neutral-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-650"
                        />
                    </div>

                    <div className="space-y-4">
                        <ButtonCustom
                            name={loading ? "Processing..." : "Sign Up"}
                            onClick={handleRegister}
                            className="w-full bg-[#4fa6f1] text-white py-3.5 rounded-full hover:opacity-90 transition-all font-semibold text-sm shadow-sm"
                        />
                    </div>

                    <p className="text-center text-sm text-neutral-400 dark:text-zinc-500">
                        Already have an account?{" "}
                        <span className="text-blue-500 font-semibold cursor-pointer hover:underline" onClick={() => navigate("/login")}>
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}