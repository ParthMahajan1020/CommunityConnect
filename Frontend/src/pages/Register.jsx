import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser, resendEmailOTP, verifyEmailOTP } from "../services/api";

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
    const [otpLoading, setOtpLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [otpStep, setOtpStep] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [registrationEmail, setRegistrationEmail] = useState("");
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) {
            return undefined;
        }

        const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [countdown]);

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
            if (response.requiresEmailVerification) {
                setRegistrationEmail(response.email || formData.email);
                setOtpStep(true);
                setMessage(response.message || "Verification code sent to your email.");
                setCountdown(60);
                return;
            }

            setMessage(response.message || "User registered successfully");
            setTimeout(() => {
                navigate("/login");
            }, 800);
        } catch (registerError) {
            setError(registerError.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpVerify = async () => {
        if (!registrationEmail || !otpValue || otpValue.length !== 6) {
            setError("Enter the 6-digit verification code.");
            return;
        }

        setOtpLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await verifyEmailOTP({ email: registrationEmail, otp: otpValue });
            setMessage(response.message || "Email verified successfully.");
            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (verifyError) {
            setError(verifyError.response?.data?.message || "Unable to verify the code.");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!registrationEmail) {
            return;
        }

        setError("");
        setMessage("");
        setOtpLoading(true);

        try {
            const response = await resendEmailOTP({ email: registrationEmail });
            setMessage(response.message || "A new verification code has been sent.");
            setCountdown(60);
            setOtpValue("");
        } catch (resendError) {
            setError(resendError.response?.data?.message || "Unable to resend the verification code.");
        } finally {
            setOtpLoading(false);
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

                {!otpStep ? (
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
                            {loading ? "Sending code..." : "Register"}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 rounded-3xl border border-blue-100 bg-blue-50/50 p-5">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Email verification</p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900">Verify your account</h2>
                            <p className="mt-2 text-sm text-slate-600">We sent a 6-digit code to <span className="font-semibold">{registrationEmail}</span>.</p>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={otpValue}
                                onChange={(event) => setOtpValue(event.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="Enter 6-digit OTP"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-blue-500"
                            />
                        </div>

                        {message && (
                            <p className="text-green-600 text-sm">{message}</p>
                        )}

                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}

                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={handleOtpVerify}
                                disabled={otpLoading || otpValue.length !== 6}
                                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                {otpLoading ? "Verifying..." : "Verify OTP"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setOtpStep(false)}
                                className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700"
                            >
                                Edit
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>Need a new code?</span>
                            <button
                                type="button"
                                disabled={countdown > 0 || otpLoading}
                                onClick={handleResendOTP}
                                className="font-semibold text-blue-600 disabled:text-slate-400"
                            >
                                {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                            </button>
                        </div>
                    </div>
                )}

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