import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { forgotPassword } from "../services/api";

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

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      setSuccess("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await forgotPassword({
        email: trimmedEmail,
      });

      setSuccess(
        response.message ||
          "Password reset OTP has been sent to your registered email."
      );

      navigate("/reset-password", {
        state: {
          email: trimmedEmail,
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
            "Unable to process your request. Please try again."
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
            Forgot your password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6F7D76]">
            Enter the email address you used to create your CommunityConnect
            account. If it is registered, we'll send instructions to reset your
            password.
          </p>

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
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#34463D]"
              >
                Registered email
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A9891]" />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] pl-11 pr-4 text-sm text-[#24342E] outline-none transition placeholder:text-[#9AA69F] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#427A65] px-5 text-sm font-semibold text-white transition hover:bg-[#356651] disabled:cursor-not-allowed disabled:bg-[#9AA69F]"
            >
              {loading ? "Checking email..." : "Reset password"}
            </button>
          </form>

          <div className="mt-6 border-t border-[#EEF2EF] pt-6">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#427A65] transition hover:text-[#356651]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}