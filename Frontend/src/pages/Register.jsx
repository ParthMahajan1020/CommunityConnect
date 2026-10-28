import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Sparkles,
  Building2
} from "lucide-react";
import { registerUser, verifyEmailOTP, resendEmailOTP } from "../services/api";
import { AnimatedSuccessCheck } from "../components/visuals/SuccessStateVisual";
import ImageWithFallback from "../components/ui/ImageWithFallback";

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
    { num: 1, title: "Account" },
    { num: 2, title: "Details" },
    { num: 3, title: "Verify" },
  ];

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;
  const passwordsMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  return (
    <main className="min-h-screen bg-[#F8FAF9] flex items-stretch">
      <div className="w-full grid lg:grid-cols-12 min-h-screen">
        
        {/* =========================================================
            LEFT COLUMN: FULL-HEIGHT PHOTOGRAPHIC STORY
        ========================================================= */}
        <div className="hidden lg:relative lg:col-span-5 xl:col-span-6 lg:flex flex-col justify-between overflow-hidden bg-[#1B2822] p-10 xl:p-14 text-white">
          <div className="absolute inset-0">
            <ImageWithFallback
              src="/images/cta/cta-community.jpg"
              alt="Neighbors joining hands in solidarity"
              priority
              aspectClassName="h-full w-full"
              className="h-full w-full object-cover"
              overlay
              overlayClassName="bg-gradient-to-t from-[#141E1A] via-[#1B2822]/75 to-[#1B2822]/85"
            />
          </div>

          {/* Top Brand Link */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 transition group-hover:scale-105">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white">
                  CommunityConnect
                </span>
                <span className="text-[10px] text-white/70">
                  Peer Network & Local Aid
                </span>
              </div>
            </Link>
          </div>

          {/* Center Story */}
          <div className="relative z-10 space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-semibold text-[#8AD4B2]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Free Community Membership</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Join a community that <br />
              <span className="text-[#8AD4B2]">takes care of each other.</span>
            </h1>

            <p className="text-sm text-white/80 leading-relaxed">
              Create your account in 30 seconds. Connect directly with verified donors, hospital reserves, and local service providers in your neighborhood.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[#8AD4B2]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Free forever · Zero middleman commissions</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[#8AD4B2]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Privacy-first · Contact shared only upon mutual request acceptance</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[#8AD4B2]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Fast emergency blood matching across city centers</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-white/70 pt-4 border-t border-white/10">
            <ShieldCheck className="h-4 w-4 text-[#8AD4B2]" />
            <span>Encrypted credentials · Safe community protocol</span>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: STEP-BY-STEP SIGN-UP CARD
        ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
          
          {/* Top Header */}
          <div className="flex items-center justify-between lg:justify-end mb-6">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-[#24342E]">CommunityConnect</span>
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#427A65] hover:text-[#356651] transition"
            >
              <span>Already have an account?</span>
              <span className="underline underline-offset-4">Sign in</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Form Container */}
          <div className="mx-auto w-full max-w-md my-auto">
            {/* Mobile Visual Banner (renders only on < lg) */}
            <div className="lg:hidden relative w-full h-40 sm:h-48 overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm mb-6">
              <ImageWithFallback
                src="/images/cta/cta-community.jpg"
                alt="Community volunteers uniting"
                aspectClassName="h-full w-full"
                className="h-full w-full object-cover"
                overlay
                overlayClassName="bg-gradient-to-t from-[#141E1A] via-[#1B2822]/65 to-[#1B2822]/80"
              />
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white w-max mb-1">
                  Public Registration
                </span>
                <p className="text-base sm:text-lg font-bold leading-tight">
                  Join a community that takes care of each other.
                </p>
              </div>
            </div>

            {/* Step Wizard Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between border-b border-[#EEF2EF] pb-4 mb-4">
                {stepLabels.map((s, idx) => (
                  <div key={s.num} className="flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                        step === s.num
                          ? "bg-[#427A65] text-white shadow-2xs"
                          : step > s.num
                          ? "bg-[#E5F1EA] text-[#427A65]"
                          : "bg-[#F8FAF9] text-[#8C9892] border border-[#E2E9E4]"
                      }`}
                    >
                      {step > s.num ? "✓" : s.num}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        step === s.num ? "text-[#24342E]" : "text-[#8C9892]"
                      }`}
                    >
                      {s.title}
                    </span>
                    {idx < stepLabels.length - 1 && (
                      <span className="text-[#D3DED7] mx-1">·</span>
                    )}
                  </div>
                ))}
              </div>

              <span className="inline-flex items-center gap-1 rounded-md bg-[#E5F1EA] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#356651]">
                Public Registration
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24342E]">
                {step === 1 && "Create your account"}
                {step === 2 && "Personal details"}
                {step === 3 && "Verify your email"}
              </h2>
              <p className="mt-1 text-xs text-[#6F7D76]">
                {step === 1 && "Enter your basic account login credentials."}
                {step === 2 && "Tell us your contact number and locality."}
                {step === 3 && `Enter the 6-digit code sent to ${verificationEmail}.`}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div
                role="status"
                className="mb-5 flex items-start gap-2.5 rounded-2xl border border-[#D5E7DB] bg-[#EDF7EF] p-3.5 text-xs font-medium text-[#356651]"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#427A65]" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* =======================================================
                STEP 1: ACCOUNT CREDENTIALS
            ======================================================= */}
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
                      placeholder="e.g. Rahul Sharma"
                      autoComplete="name"
                      required
                      className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-4 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:ring-4 focus:ring-[#427A65]/10"
                    />
                  </div>
                </div>

                {/* Email Address */}
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
                      className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-4 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:ring-4 focus:ring-[#427A65]/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
                  >
                    Password (min. 8 characters)
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      required
                      className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-11 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:ring-4 focus:ring-[#427A65]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9892] transition hover:text-[#24342E] focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      required
                      className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-11 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:ring-4 focus:ring-[#427A65]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9892] transition hover:text-[#24342E] focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordsMatch && (
                    <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                  {passwordsMismatch && (
                    <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3" /> Passwords do not match
                    </p>
                  )}
                </div>

                {/* Continue to Step 2 */}
                <button
                  type="submit"
                  className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] active:scale-[0.99]"
                >
                  <span>Continue to Details</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* =======================================================
                STEP 2: CONTACT & LOCATION DETAILS
            ======================================================= */}
            {step === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                {/* Phone Number */}
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
                      className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-4 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:ring-4 focus:ring-[#427A65]/10"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-[#8C9892]">
                    Only shared when you accept a mutual assistance request.
                  </p>
                </div>

                {/* Locality / City */}
                <div>
                  <label
                    htmlFor="location"
                    className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
                  >
                    Locality & City
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
                      autoComplete="address-level2"
                      required
                      className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-4 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:ring-4 focus:ring-[#427A65]/10"
                    />
                  </div>
                </div>

                {/* Buttons: Back and Register */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep(1);
                    }}
                    className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-[#E2E9E4] bg-white px-5 text-xs font-semibold text-[#6F7D76] hover:bg-[#F8FAF9] transition"
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
                        <span>Creating Account...</span>
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

            {/* =======================================================
                STEP 3: EMAIL OTP VERIFICATION
            ======================================================= */}
            {step === 3 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                {verifiedSuccess ? (
                  <div className="py-6 flex flex-col items-center justify-center space-y-3">
                    <AnimatedSuccessCheck size={60} />
                    <p className="text-sm font-bold text-[#24342E]">Email Verified!</p>
                    <p className="text-xs text-[#6F7D76]">Redirecting you to sign in...</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="otp"
                          className="block text-xs font-semibold text-[#6F7D76]"
                        >
                          6-Digit Code
                        </label>
                        <span className="text-xs font-mono text-[#8C9892] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(otpTimeLeft)}
                        </span>
                      </div>
                      <input
                        id="otp"
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        autoComplete="one-time-code"
                        autoFocus
                        required
                        className="h-12 w-full text-center text-xl font-mono tracking-[0.4em] font-bold rounded-2xl border border-[#E2E9E4] bg-white text-[#24342E] outline-none transition placeholder:text-[#D3DED7] focus:border-[#427A65] focus:ring-4 focus:ring-[#427A65]/10"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Continue</span>
                          <CheckCircle2 className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={resendLoading || resendTimeLeft > 0}
                        className="text-xs font-semibold text-[#427A65] hover:underline disabled:text-[#8C9892] disabled:no-underline"
                      >
                        {resendLoading
                          ? "Resending..."
                          : resendTimeLeft > 0
                          ? `Resend code in ${resendTimeLeft}s`
                          : "Resend verification code"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* Switch to Login */}
            <div className="mt-6 border-t border-[#EEF2EF] pt-5 text-center text-xs text-[#6F7D76]">
              <span>Already have an account? </span>
              <Link
                to="/login"
                className="font-bold text-[#427A65] hover:text-[#356651] hover:underline"
              >
                Sign In
              </Link>
            </div>

            {/* Organization / Admin Portal Quick Switch */}
            <div className="mt-5 rounded-2xl bg-white border border-[#E2E9E4] p-3 text-center text-xs text-[#6F7D76] flex items-center justify-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-[#4B78A8]" />
              <span>Registering an organization?</span>
              <Link
                to="/private/register"
                className="font-bold text-[#4B78A8] hover:underline"
              >
                Hospital / Blood Bank Portal
              </Link>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-6 text-center text-[11px] text-[#8C9892]">
            © {new Date().getFullYear()} CommunityConnect. All rights reserved.
          </div>
        </div>

      </div>
    </main>
  );
}
