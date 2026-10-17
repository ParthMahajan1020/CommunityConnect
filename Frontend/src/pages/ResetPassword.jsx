import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { resetPassword } from "../services/api";

function BrandLogo() {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#427A65] text-white shadow-sm">
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3.5C12 3.5 5 11 5 15.5a7 7 0 0 0 14 0C19 11 12 3.5 12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 15.5a3.5 3.5 0 0 0 3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div>
        <span className="block text-lg font-bold tracking-tight text-[#24342E]">
          CommunityConnect
        </span>
        <span className="block text-xs text-[#6F7D76]">
          Together, we help.
        </span>
      </div>
    </Link>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    typeof location.state?.email === "string"
      ? location.state.email.trim().toLowerCase()
      : "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      setError("Missing email. Please start again from Forgot Password.");
      setSuccess("");
      return;
    }

    const trimmedOtp = otp.trim();

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError("OTP must contain exactly 6 digits.");
      setSuccess("");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      setSuccess("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setSuccess("");
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await resetPassword({
        email,
        otp: trimmedOtp,
        newPassword,
      });

      setSuccess(
        response.message ||
          "Password reset successfully. You can now log in with your new password."
      );

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Password reset successfully. You can now log in with your new password.",
        },
      });
    } catch (err) {
      if (err?.response?.status === 404) {
        setError(
          err?.response?.data?.message || "This email is not registered."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Unable to reset password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-md">
        <header className="mb-8">
          <BrandLogo />
        </header>

        <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-[0_12px_50px_rgba(36,52,46,0.04)] sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#427A65]">
            Account recovery
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#24342E]">
            Reset your password
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6F7D76]">
            Enter the 6-digit OTP sent to{" "}
            {email ? (
              <span className="font-medium text-[#24342E]">{email}</span>
            ) : (
              "your registered email"
            )}
            , then choose a new password.
          </p>

          {!email && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-[#F0D1D5] bg-[#FBEAEC] px-4 py-3 text-sm leading-6 text-[#A63843]"
            >
              Missing email. Please request a new OTP from Forgot Password.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-[#F0D1D5] bg-[#FBEAEC] px-4 py-3 text-sm leading-6 text-[#A63843]"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-[#D4E7D9] bg-[#EDF7EF] px-4 py-3 text-sm leading-6 text-[#356651]"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-[#34463D]"
              >
                OTP
              </label>

              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                  setSuccess("");
                }}
                placeholder="6-digit code"
                className="h-12 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-4 text-sm tracking-[0.35em] text-[#24342E] outline-none transition placeholder:tracking-normal placeholder:text-[#9AA69F] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-[#34463D]"
              >
                New password
              </label>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9891]" />

                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="At least 8 characters"
                  className="h-12 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] pl-11 pr-4 text-sm text-[#24342E] outline-none transition placeholder:text-[#9AA69F] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-[#34463D]"
              >
                Confirm password
              </label>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9891]" />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Re-enter new password"
                  className="h-12 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] pl-11 pr-4 text-sm text-[#24342E] outline-none transition placeholder:text-[#9AA69F] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#427A65] px-5 text-sm font-semibold text-white transition hover:bg-[#356651] disabled:cursor-not-allowed disabled:bg-[#9AA69F]"
            >
              {loading ? "Resetting password..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-6 border-t border-[#EEF2EF] pt-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#427A65] transition hover:text-[#356651]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
