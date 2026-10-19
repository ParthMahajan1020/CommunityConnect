import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  HeartHandshake,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { resetPassword } from "../services/api";
import { AnimatedSuccessCheck } from "../components/visuals/SuccessStateVisual";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(
    typeof location.state?.email === "string" ? location.state.email : ""
  );
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail) {
      setError("Please provide your email address.");
      return;
    }
    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError("OTP must contain 6 digits.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({
        email: trimmedEmail,
        otp: trimmedOtp,
        newPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message: "Password reset successful! You can now log in.",
          },
        });
      }, 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Brand */}
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
          {success ? (
            <AnimatedSuccessCheck
              title="Password Reset!"
              subtitle="Redirecting to login..."
            />
          ) : (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#24342E]">
                Set New Password
              </h1>
              <p className="mt-1 text-xs text-[#6F7D76]">
                Enter the 6-digit OTP and your new password.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {!location.state?.email && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#6F7D76]">
                      Registered Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="you@example.com"
                      required
                      className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#6F7D76]">
                    6-Digit OTP
                  </label>
                  <input
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    placeholder="••••••"
                    required
                    className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 font-mono text-center text-lg font-bold tracking-[0.4em] text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#6F7D76]">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                    <input
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="At least 8 characters"
                      required
                      className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#6F7D76]">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                    <input
                      name="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Repeat new password"
                      required
                      className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-[#EEF2EF] pt-4 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6F7D76] hover:text-[#24342E]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
