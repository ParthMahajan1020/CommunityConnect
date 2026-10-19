import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  HeartHandshake,
  User,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
} from "lucide-react";
import { registerUser, verifyEmailOTP, resendEmailOTP } from "../services/api";
import { AnimatedSuccessCheck } from "../components/visuals/SuccessStateVisual";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  location: "",
  password: "",
  confirmPassword: "",
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Account, 2: Details, 3: Verify (OTP)
  const [formData, setFormData] = useState(initialForm);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [otp, setOtp] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [otpTimeLeft, setOtpTimeLeft] = useState(600);
  const [resendTimeLeft, setResendTimeLeft] = useState(30);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    if (step !== 3 || otpTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setOtpTimeLeft((p) => Math.max(p - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, otpTimeLeft]);

  useEffect(() => {
    if (step !== 3 || resendTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setResendTimeLeft((p) => Math.max(p - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, resendTimeLeft]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateStep1 = () => {
    setError("");
    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all account fields.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleNextToStep2 = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const phone = formData.phone.trim();
    const location = formData.location.trim();

    if (!phone || !location) {
      setError("Please provide phone and location.");
      return;
    }

    if (!/^[+]?\d[\d\s()-]{6,19}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone,
        location,
        password: formData.password,
      });

      if (response.requiresEmailVerification) {
        setVerificationEmail(response.email || formData.email.trim().toLowerCase());
        setStep(3);
        setOtp("");
        setError("");
        setSuccessMessage(response.message || "Verification OTP sent to your email.");
        setOtpTimeLeft(600);
        setResendTimeLeft(30);
        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          email: response.email || formData.email,
          message: response.message || "Account created. Please log in.",
        },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    if (otpTimeLeft <= 0) {
      setError("This code has expired. Request a new one.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyEmailOTP(verificationEmail, otp);
      setVerifiedSuccess(true);

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            email: verificationEmail,
            message: response.message || "Email verified! You can now log in.",
          },
        });
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendLoading || resendTimeLeft > 0) return;
    setError("");
    setSuccessMessage("");
    setResendLoading(true);

    try {
      const response = await resendEmailOTP(verificationEmail);
      setOtp("");
      setOtpTimeLeft(600);
      setResendTimeLeft(30);
      setSuccessMessage(response.message || "New code sent.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  const stepLabels = ["1. Account", "2. Details", "3. Verify"];

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="mb-6 flex justify-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#24342E]">
              CommunityConnect
            </span>
          </Link>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#E2E9E4] bg-white p-7 sm:p-9 shadow-xs"
        >
          {/* Visual Step Indicator */}
          <div className="mb-6 flex items-center justify-between border-b border-[#EEF2EF] pb-4">
            {stepLabels.map((lbl, idx) => {
              const num = idx + 1;
              const isCurrent = step === num;
              const isPassed = step > num;

              return (
                <div key={lbl} className="flex items-center gap-1.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      isPassed
                        ? "bg-[#427A65] text-white"
                        : isCurrent
                          ? "bg-[#E5F1EA] text-[#427A65] border border-[#CFE2D6]"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {num}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? "text-[#24342E]" : "text-[#8C9892]"
                    }`}
                  >
                    {lbl.split(". ")[1]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Alerts */}
          {successMessage && (
            <div
              role="status"
              className="mb-4 flex items-center gap-2 rounded-2xl border border-[#D5E7DB] bg-[#EDF7EF] p-3 text-xs font-medium text-[#356651]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Account credentials */}
          {step === 1 && (
            <form onSubmit={handleNextToStep2} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6F7D76]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                    className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6F7D76]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#6F7D76]">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="8+ chars"
                      required
                      className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-3.5 pr-8 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9892] hover:text-[#24342E]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#6F7D76]">
                    Confirm
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat"
                      required
                      className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651]"
              >
                Next: Contact Info
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Location & Contact */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6F7D76]">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91..."
                    required
                    className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#6F7D76]">
                  Neighborhood or City
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                  <input
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Akurdi, Pune"
                    required
                    className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-[#E2E9E4] bg-white px-4 text-xs font-semibold text-[#6F7D76] hover:bg-[#F5F8F6]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: OTP Verification */}
          {step === 3 && (
            <div>
              {verifiedSuccess ? (
                <AnimatedSuccessCheck
                  title="Email Verified!"
                  subtitle="Redirecting to your account..."
                />
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
                      <Mail className="h-6 w-6" />
                    </div>
                    <h2 className="mt-3 text-lg font-bold text-[#24342E]">
                      Enter Verification Code
                    </h2>
                    <p className="mt-1 text-xs text-[#6F7D76]">
                      Sent to <strong className="text-[#24342E]">{verificationEmail}</strong>
                    </p>
                  </div>

                  <div>
                    <input
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="••••••"
                      className="h-13 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] text-center font-mono text-2xl font-bold tracking-[0.5em] text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                    />

                    <div className="mt-2.5 flex items-center justify-between text-xs text-[#7A8881]">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Expires: {formatTime(otpTimeLeft)}
                      </span>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendLoading || resendTimeLeft > 0}
                        className="font-semibold text-[#427A65] hover:underline disabled:opacity-50"
                      >
                        {resendLoading
                          ? "Sending..."
                          : resendTimeLeft > 0
                            ? `Resend in ${resendTimeLeft}s`
                            : "Resend Code"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6 || otpTimeLeft <= 0}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Continue
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {step !== 3 && (
            <div className="mt-6 border-t border-[#EEF2EF] pt-4 text-center text-xs text-[#6F7D76]">
              Already registered?{" "}
              <Link to="/login" className="font-bold text-[#427A65] hover:underline">
                Sign In
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}