import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resendEmailOtp, verifyEmailOtp } from "../services/api";

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

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const verificationMessage = location.state?.message || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(60);

  const otpInputRef = useRef(null);

  // Redirect users who open this page without an email.
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // Resend-code countdown.
  useEffect(() => {
    if (countdown <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setCountdown((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  // Allow only six numeric digits.
  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setOtp(value);
    setError("");
  };

  // Verify the email OTP.
  const handleVerify = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the complete six-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await verifyEmailOtp(email, otp);

      navigate("/login", {
        replace: true,
        state: {
          email,
          message:
            response.message ||
            "Your email is verified. You can now log in.",
        },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Verification failed. Please check your code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Request a new OTP.
  const handleResend = async () => {
    if (resending || countdown > 0) return;

    setResending(true);
    setError("");
    setMessage("");

    try {
      const response = await resendEmailOtp(email);

      setMessage(
        response.message || "A new verification code has been sent."
      );

      setCountdown(60);
      setOtp("");
      otpInputRef.current?.focus();
    } catch (err) {
      const retryAfter = err?.response?.data?.retryAfterSeconds;

      if (retryAfter) {
        setCountdown(retryAfter);
      }

      setError(
        err?.response?.data?.message ||
          "Unable to resend the code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-4 py-8 text-[#24342E] sm:py-12">
      <section className="w-full max-w-md rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-[0_12px_50px_rgba(36,52,46,0.05)] sm:p-9">
        {/* Brand */}
        <header className="mb-8">
          <BrandLogo />
        </header>

        {/* Heading */}
        <div className="mb-7">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="m4 7 8 6 8-6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-[#427A65]">
            EMAIL VERIFICATION
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Check your inbox.
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6F7D76]">
            Enter the six-digit verification code sent to:
          </p>

          <p className="mt-2 break-all text-sm font-semibold text-[#34463D]">
            {email}
          </p>
        </div>

        {/* Message passed from the login page */}
        {verificationMessage && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-[#D4E7D9] bg-[#EDF7EF] px-4 py-3 text-sm leading-6 text-[#356651]"
          >
            {verificationMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-[#F0D1D5] bg-[#FBEAEC] px-4 py-3 text-sm leading-6 text-[#A63843]"
          >
            {error}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-[#DCE9E0] bg-[#EDF5EF] px-4 py-3 text-sm leading-6 text-[#356651]"
          >
            {message}
          </div>
        )}

        {/* OTP form */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium text-[#34463D]"
            >
              Verification code
            </label>

            <input
              ref={otpInputRef}
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              required
              aria-describedby="otp-help"
              className="h-14 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-4 text-center text-2xl font-semibold tracking-[0.45em] text-[#24342E] outline-none transition placeholder:text-[#C3CCC6] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
            />

            <p
              id="otp-help"
              className="mt-2 text-xs leading-5 text-[#89958E]"
            >
              Your verification code expires 10 minutes after it is issued.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#427A65] px-5 text-sm font-semibold text-white transition duration-200 hover:bg-[#356651] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#427A65]/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Verifying...
              </>
            ) : (
              <>
                Verify email
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 border-t border-[#EDF1EE] pt-5 text-center">
          <p className="text-sm text-[#6F7D76]">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="mt-2 text-sm font-semibold text-[#427A65] transition hover:text-[#356651] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending
              ? "Sending new code..."
              : countdown > 0
                ? `Resend code in ${countdown}s`
                : "Resend verification code"}
          </button>
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-xs leading-5 text-[#89958E]">
          Already verified?{" "}
          <Link
            to="/login"
            state={{ email }}
            className="font-semibold text-[#427A65] hover:underline"
          >
            Go to login
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#89958E]">
          Connecting people. Strengthening communities.
        </p>
      </section>
    </main>
  );
}