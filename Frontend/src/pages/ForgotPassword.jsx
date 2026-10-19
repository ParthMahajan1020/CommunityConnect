import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  HeartHandshake,
  ShieldCheck,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { forgotPassword } from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError("Please enter your registered email.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await forgotPassword({ email: trimmed });
      setSuccess(response.message || "OTP sent to your email.");

      setTimeout(() => {
        navigate("/reset-password", {
          state: { email: trimmed },
        });
      }, 800);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (err?.response?.status === 404
            ? "Email not registered."
            : "Request failed. Try again.")
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
          {/* Security Icon */}
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#24342E]">
            Reset Password
          </h1>
          <p className="mt-1 text-xs text-[#6F7D76]">
            Enter your registered email to receive a recovery code.
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

          {success && (
            <div
              role="status"
              className="mt-4 flex items-center gap-2 rounded-2xl border border-[#D5E7DB] bg-[#EDF7EF] p-3 text-xs font-medium text-[#356651]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
              >
                Registered Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  required
                  className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  Send OTP
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
        </motion.div>
      </div>
    </main>
  );
}