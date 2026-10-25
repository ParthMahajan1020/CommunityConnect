import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  HeartHandshake,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  ShieldCheck,
  Droplets,
  Wrench,
  Building2,
  Sparkles
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      setError("Password must be at least 8 characters long.");
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
      setError("Please provide both phone number and location.");
      return;
    }

    if (!/^[+]?\d[\d\s()-]{6,19}$/.test(phone)) {
      setError("Please enter a valid phone number (e.g. +91 9876543210).");
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
        setSuccessMessage(response.message || "A 6-digit verification code has been sent to your email.");
        setOtpTimeLeft(600);
        setResendTimeLeft(30);
        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          email: response.email || formData.email,
          message: response.message || "Account created successfully. Please log in.",
        },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Registration failed. Please check your details and try again."
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
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    if (otpTimeLeft <= 0) {
      setError("Verification code has expired. Please request a new one.");
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
            message: response.message || "Email verified successfully! You can now sign in.",
          },
        });
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Verification code is invalid or has expired."
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
      setSuccessMessage(response.message || "A fresh verification code has been sent.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const stepLabels = [
    { num: 1, title: "Account", sub: "Login info" },
    { num: 2, title: "Details", sub: "Contact & city" },
    { num: 3, title: "Verify", sub: "Email code" },
  ];

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;
  const passwordsMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {/* Top Brand Bar */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex items-center gap-2.5 transition focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65] shadow-2xs transition group-hover:scale-105 group-hover:bg-[#d8eadd]">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#24342E]">
                CommunityConnect
              </span>
              <span className="text-[10px] font-medium text-[#6F7D76]">
                Peer Network & Local Aid
              </span>
            </div>
          </Link>

          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#427A65] hover:text-[#356651] transition"
          >
            <span>Already have an account?</span>
            <span className="underline underline-offset-4">Sign in</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Main Two-Section Grid */}
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* LEFT SIDE: Brand Narrative & Community Trust Values */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#CFE2D6] bg-[#E5F1EA]/80 px-3 py-1 text-xs font-semibold text-[#356651]">
                <Sparkles className="h-3.5 w-3.5 text-[#427A65]" />
                <span>Join our neighbor-to-neighbor movement</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#24342E] sm:text-4xl lg:text-[40px] lg:leading-[1.15]">
                Join a community that takes care of each other.
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-[#6F7D76]">
                Register your free account in less than a minute. Whether you want to volunteer as a blood donor, request emergency units, or find trusted local service providers, you are in safe hands.
              </p>
            </motion.div>

            {/* Feature Cards Grid */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <div className="rounded-2xl border border-[#E2E9E4] bg-white p-4 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FBEAEC] text-[#C94C55]">
                  <Droplets className="h-4 w-4" />
                </div>
                <h3 className="mt-2.5 text-xs font-bold text-[#24342E]">
                  Rapid Emergency Match
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-[#6F7D76]">
                  Get connected directly when someone nearby needs your blood group in emergencies.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E2E9E4] bg-white p-4 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8]">
                  <Wrench className="h-4 w-4" />
                </div>
                <h3 className="mt-2.5 text-xs font-bold text-[#24342E]">
                  Transparent Services
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-[#6F7D76]">
                  Offer or discover local home food, cleaning, assistance, and skilled neighborhood help.
                </p>
              </div>
            </motion.div>

            {/* Trust Point */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl border border-[#E2E9E4] bg-gradient-to-br from-white to-[#F8FAF9] p-4 text-xs shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E5F1EA] text-[#427A65]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#24342E]">
                    Your Privacy is Safeguarded
                  </h4>
                  <p className="mt-0.5 text-[11px] text-[#6F7D76]">
                    Your personal phone number is never shown publicly on the directory. Communication happens strictly through verified mutual requests.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Organization Link */}
            <div className="pt-1 flex items-center gap-2 text-xs text-[#6F7D76]">
              <Building2 className="h-4 w-4 text-[#4B78A8]" />
              <span>Are you a registered Blood Bank or Hospital?</span>
              <Link
                to="/private/register"
                className="font-bold text-[#4B78A8] hover:underline inline-flex items-center gap-1"
              >
                Register as Organization
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: Multi-Step Registration Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md rounded-3xl border border-[#E2E9E4] bg-white p-7 sm:p-9 shadow-xs"
            >
              {/* Step Indicator Header */}
              <div className="mb-6 border-b border-[#EEF2EF] pb-4">
                <div className="flex items-center justify-between">
                  {stepLabels.map((item) => {
                    const isPassed = step > item.num;
                    const isCurrent = step === item.num;

                    return (
                      <div
                        key={item.num}
                        className={`flex items-center gap-2 ${
                          isCurrent
                            ? "opacity-100"
                            : isPassed
                            ? "opacity-90"
                            : "opacity-40"
                        }`}
                      >
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold transition ${
                            isPassed
                              ? "bg-[#427A65] text-white"
                              : isCurrent
                              ? "bg-[#E5F1EA] text-[#427A65] ring-2 ring-[#427A65]/20"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isPassed ? "✓" : item.num}
                        </div>
                        <div className="hidden sm:block text-left">
                          <p className="text-[11px] font-bold text-[#24342E] leading-tight">
                            {item.title}
                          </p>
                          <p className="text-[9px] text-[#6F7D76]">
                            {item.sub}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-5">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#E5F1EA] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#356651]">
                  Step {step} of 3
                </span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#24342E]">
                  {step === 1 && "Create your account"}
                  {step === 2 && "Contact & location"}
                  {step === 3 && "Verify your email"}
                </h2>
                <p className="mt-1 text-xs text-[#6F7D76]">
                  {step === 1 && "Start by providing your name, email, and password."}
                  {step === 2 && "Help neighbors reach you for emergency or service requests."}
                  {step === 3 && `Enter the 6-digit code sent to ${verificationEmail}`}
                </p>
              </div>

              {/* Success Notification */}
              {successMessage && (
                <div
                  role="status"
                  className="mb-4 flex items-start gap-2.5 rounded-2xl border border-[#D5E7DB] bg-[#EDF7EF] p-3.5 text-xs font-medium text-[#356651]"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#427A65]" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Notification */}
              {error && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: Name, Email & Password */}
              {step === 1 && (
                <form onSubmit={handleNextToStep2} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Jane Doe"
                        autoComplete="name"
                        required
                        className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3">
                    <div>
                      <label
                        htmlFor="password"
                        className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8C9892]" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="8+ chars"
                          autoComplete="new-password"
                          required
                          className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-9 pr-8 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9892] hover:text-[#24342E]"
                          aria-label={showPassword ? "Hide password" : "Show password"}
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
                      <div className="mb-1.5 flex items-center justify-between">
                        <label
                          htmlFor="confirmPassword"
                          className="block text-xs font-semibold text-[#6F7D76]"
                        >
                          Confirm
                        </label>
                        {passwordsMatch && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            Match ✓
                          </span>
                        )}
                        {passwordsMismatch && (
                          <span className="text-[10px] font-bold text-rose-500">
                            Mismatch
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8C9892]" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repeat"
                          autoComplete="new-password"
                          required
                          className={`h-12 w-full rounded-2xl border bg-[#FBFCFB] pl-9 pr-8 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:bg-white focus:ring-4 ${
                            passwordsMismatch
                              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                              : "border-[#E2E9E4] focus:border-[#427A65] focus:ring-[#427A65]/10"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9892] hover:text-[#24342E]"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Next Button */}
                  <button
                    type="submit"
                    className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] active:scale-[0.99]"
                  >
                    <span>Continue to Contact Info</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: Phone & Location */}
              {step === 2 && (
                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                        required
                        className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#8C9892]">
                      Used for connection request alerts. Kept private until you approve.
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="location"
                      className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
                    >
                      Neighborhood, City, or PIN
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Akurdi, Pune"
                        required
                        className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-[#8C9892]">
                      Helps match you with nearby blood emergencies and local services.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-[#E2E9E4] bg-white px-4 text-xs font-semibold text-[#6F7D76] hover:bg-[#F5F8F6] transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Creating account...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Registration</span>
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
                      subtitle="Redirecting to sign in..."
                    />
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div className="rounded-2xl border border-[#E2E9E4] bg-[#F8FAF9] p-4 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65] shadow-2xs">
                          <Mail className="h-5 w-5" />
                        </div>
                        <h3 className="mt-2 text-sm font-bold text-[#24342E]">
                          Check your email
                        </h3>
                        <p className="mt-1 text-xs text-[#6F7D76]">
                          We've sent a 6-digit confirmation code to:
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-[#24342E]">
                          {verificationEmail}
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="otp"
                          className="mb-1.5 block text-xs font-semibold text-[#6F7D76] text-center"
                        >
                          Enter 6-Digit Code
                        </label>
                        <input
                          id="otp"
                          name="otp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          placeholder="••••••"
                          autoFocus
                          className="h-14 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] text-center font-mono text-2xl font-bold tracking-[0.5em] text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                        />

                        <div className="mt-2.5 flex items-center justify-between text-xs text-[#7A8881]">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            Expires in {formatTime(otpTimeLeft)}
                          </span>

                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={resendLoading || resendTimeLeft > 0}
                            className="font-semibold text-[#427A65] hover:text-[#356651] hover:underline disabled:opacity-50"
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
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Verifying code...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify Email & Continue</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Card Footer: Sign In Link */}
              {step !== 3 && (
                <div className="mt-6 border-t border-[#EEF2EF] pt-5 text-center text-xs text-[#6F7D76]">
                  <span>Already registered? </span>
                  <Link
                    to="/login"
                    className="font-bold text-[#427A65] hover:text-[#356651] hover:underline"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
