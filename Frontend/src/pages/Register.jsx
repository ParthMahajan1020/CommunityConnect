import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    registerUser,
    sendEmailOTP,
    verifyEmailOTP,
    sendPhoneOTP,
    verifyPhoneOTP
} from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
        password: ""
    });

    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // STEP 1 → Send Email OTP
    const handleSendEmailOTP = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await sendEmailOTP(formData.email);

            setMessage(
                "Email OTP sent successfully. Check your inbox."
            );

            setOtp("");
            setStep(2);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to send email OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    // STEP 2 → Verify Email
    const handleVerifyEmail = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await verifyEmailOTP(
                formData.email,
                otp
            );

            setOtp("");
            setMessage(
                "Email verified successfully."
            );

            setStep(3);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Invalid email OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    // STEP 3 → Send Phone OTP
    const handleSendPhoneOTP = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await sendPhoneOTP(formData.phone);

            setMessage(
                "Phone OTP generated. Check the backend terminal."
            );

            setOtp("");
            setStep(4);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to generate phone OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    // STEP 4 → Verify Phone → Create Account
    const handleVerifyPhone = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setMessage("");

        try {
            await verifyPhoneOTP(
                formData.phone,
                otp
            );

            setMessage(
                "Phone verified. Creating your account..."
            );

            await registerUser(formData);

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Phone verification failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">

            <div className="w-full max-w-md">

                {/* STEP 1 — REGISTER */}
                {step === 1 && (
                    <div>

                        <h1 className="text-4xl font-extrabold mb-2">
                            Create Account
                        </h1>

                        <p className="text-gray-500 mb-8">
                            Join Community Connect
                        </p>

                        <form
                            onSubmit={handleSendEmailOTP}
                            className="space-y-4"
                        >

                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border"
                            />

                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border"
                            />

                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border"
                            />

                            <input
                                type="text"
                                name="location"
                                placeholder="Location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border"
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-xl border"
                            />

                            {error && (
                                <p className="text-red-500 text-sm">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-50"
                            >
                                {loading
                                    ? "Sending OTP..."
                                    : "Continue"}
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
                )}

                {/* STEP 2 — EMAIL OTP */}
                {step === 2 && (
                    <div>

                        <h1 className="text-4xl font-extrabold mb-2">
                            Verify Email
                        </h1>

                        <p className="text-gray-500 mb-8">
                            Enter the OTP sent to
                            <br />
                            <span className="font-semibold text-gray-800">
                                {formData.email}
                            </span>
                        </p>

                        <form
                            onSubmit={handleVerifyEmail}
                            className="space-y-5"
                        >

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }
                                required
                                className="w-full px-4 py-4 rounded-xl border text-center text-2xl tracking-[0.5em]"
                            />

                            {message && (
                                <p className="text-green-600 text-sm">
                                    {message}
                                </p>
                            )}

                            {error && (
                                <p className="text-red-500 text-sm">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    otp.length !== 6
                                }
                                className="w-full py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-50"
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify Email"}
                            </button>

                        </form>

                        <button
                            onClick={() => {
                                setStep(1);
                                setOtp("");
                                setError("");
                                setMessage("");
                            }}
                            className="w-full mt-4 text-gray-500"
                        >
                            Change Details
                        </button>

                    </div>
                )}

                {/* STEP 3 — SEND PHONE OTP */}
                {step === 3 && (
                    <div>

                        <h1 className="text-4xl font-extrabold mb-2">
                            Verify Phone
                        </h1>

                        <p className="text-gray-500 mb-8">
                            Verify your phone number
                            <br />

                            <span className="font-semibold text-gray-800">
                                {formData.phone}
                            </span>
                        </p>

                        <form
                            onSubmit={handleSendPhoneOTP}
                            className="space-y-5"
                        >

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-50"
                            >
                                {loading
                                    ? "Generating OTP..."
                                    : "Send Phone OTP"}
                            </button>

                        </form>

                        {message && (
                            <p className="text-green-600 text-sm mt-4">
                                {message}
                            </p>
                        )}

                        {error && (
                            <p className="text-red-500 text-sm mt-4">
                                {error}
                            </p>
                        )}

                    </div>
                )}

                {/* STEP 4 — PHONE OTP */}
                {step === 4 && (
                    <div>

                        <h1 className="text-4xl font-extrabold mb-2">
                            Verify Phone
                        </h1>

                        <p className="text-gray-500 mb-8">
                            Enter the OTP generated for
                            <br />

                            <span className="font-semibold text-gray-800">
                                {formData.phone}
                            </span>
                        </p>

                        <form
                            onSubmit={handleVerifyPhone}
                            className="space-y-5"
                        >

                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value.replace(
                                            /\D/g,
                                            ""
                                        )
                                    )
                                }
                                required
                                className="w-full px-4 py-4 rounded-xl border text-center text-2xl tracking-[0.5em]"
                            />

                            {message && (
                                <p className="text-green-600 text-sm">
                                    {message}
                                </p>
                            )}

                            {error && (
                                <p className="text-red-500 text-sm">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    otp.length !== 6
                                }
                                className="w-full py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-50"
                            >
                                {loading
                                    ? "Creating Account..."
                                    : "Verify & Create Account"}
                            </button>

                        </form>

                        <button
                            onClick={() => {
                                setStep(3);
                                setOtp("");
                                setError("");
                                setMessage("");
                            }}
                            className="w-full mt-4 text-gray-500"
                        >
                            Back
                        </button>

                    </div>
                )}

            </div>

        </div>
    );
}

export default Register;