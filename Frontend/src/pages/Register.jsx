import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await registerUser(formData);
            setMessage(response.message || "Account created successfully.");
            setTimeout(() => {
                navigate("/login");
            }, 800);
        } catch (registerError) {
            setError(registerError.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-md">
                <h1 className="text-4xl font-extrabold mb-2">
                    Create Account
                </h1>

                <p className="text-gray-500 mb-8">
                    Join Community Connect
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                        />

                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                        />

                        <input
                            type="text"
                            name="location"
                            placeholder="Location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                        />

                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                        />

                        {message && (
                            <p className="text-green-600 text-sm">{message}</p>
                        )}

                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-50"
                        >
                            {loading ? "Creating account..." : "Register"}
                        </button>
                </form>

                <p className="text-center mt-6 text-gray-500">
                    Already have an account?
                    <button
                        onClick={() => navigate("/login")}
                        className="ml-2 text-blue-600 font-semibold"
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Register;