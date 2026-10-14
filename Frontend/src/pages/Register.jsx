import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  registerUser,
  verifyEmailOTP,
  resendEmailOTP,
} from "../services/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  location: "",
  password: "",
  confirmPassword: "",
};

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

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
  rightElement,
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[#34463D]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`h-12 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-4 text-sm text-[#24342E] outline-none transition placeholder:text-[#9AA69F] hover:border-[#C9D8CF] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10 ${
            rightElement ? "pr-12" : ""
          }`}
        />

        {rightElement}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  showPassword,
  setShowPassword,
  autoComplete,
}) {
  return (
    <InputField
      label={label}
      name={name}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder="At least 8 characters"
      autoComplete={autoComplete}
      rightElement={
        <button
          type="button"
          onClick={() => setShowPassword((previous) => !previous)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#6F7D76] transition hover:bg-[#F0F5F2] hover:text-[#427A65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427A65]"
        >
          {showPassword ? (
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A11.8 11.8 0 0 1 12 5c5 0 8.5 5 8.5 7a8.5 8.5 0 0 1-2.2 3.5M6.2 6.3C3.9 7.8 2.5 10.2 2.5 12c0 2 3.5 7 9.5 7 1.3 0 2.5-.3 3.6-.8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />

              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="1.7"
              />
            </svg>
          )}
        </button>
      }
    />
  );
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function OTPVerification({
  email,
  otp,
  setOtp,
  onVerify,
  onResend,
  loading,
  resendLoading,
  error,
  successMessage,
  otpTimeLeft,
  resendTimeLeft,
}) {
  const resendAvailable = resendTimeLeft <= 0;

  return (
    <div>
      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold text-[#427A65]">
          VERIFY YOUR EMAIL
        </p>

        <h2 className="text-3xl font-semibold tracking-tight text-[#24342E] sm:text-4xl">
          Check your inbox.
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#6F7D76]">
          We sent a 6-digit verification code to
        </p>

        <p className="mt-1 break-all text-sm font-semibold text-[#24342E]">
          {email}
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-[#DCE9E0] bg-[#EDF5EF] px-4 py-3 text-sm leading-6 text-[#356651]"
        >
          {successMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-[#F0D1D5] bg-[#FBEAEC] px-4 py-3 text-sm leading-6 text-[#A63843]"
        >
          {error}
        </div>
      )}

      <form onSubmit={onVerify} className="space-y-5">
        <div>
          <label
            htmlFor="otp"
            className="mb-2 block text-sm font-medium text-[#34463D]"
          >
            Verification code
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
              const value = event.target.value
                .replace(/\D/g, "")
                .slice(0, 6);

              setOtp(value);
            }}
            placeholder="Enter 6-digit OTP"
            className="h-14 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-4 text-center text-xl font-semibold tracking-[0.5em] text-[#24342E] outline-none transition placeholder:tracking-normal placeholder:text-sm placeholder:font-normal placeholder:text-[#9AA69F] hover:border-[#C9D8CF] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
          />

          <div className="mt-3 flex items-center justify-between text-xs text-[#7B8880]">
            <span>
              {otpTimeLeft > 0
                ? `Code expires in ${formatTime(otpTimeLeft)}`
                : "This OTP has expired."}
            </span>

            <span>5 attempts</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6 || otpTimeLeft <= 0}
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

      <div className="mt-6 text-center">
        <p className="text-sm text-[#6F7D76]">
          Didn't receive the code?
        </p>

        <button
          type="button"
          onClick={onResend}
          disabled={resendLoading || !resendAvailable}
          className="mt-2 text-sm font-semibold text-[#427A65] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resendLoading
            ? "Sending..."
            : resendAvailable
              ? "Resend OTP"
              : `Resend in ${resendTimeLeft}s`}
        </button>
      </div>

      <div className="my-6 h-px bg-[#EDF1EE]" />

      <p className="text-center text-xs leading-5 text-[#89958E]">
        The verification code is valid for 10 minutes.
      </p>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [error, setError] = useState("");

  const [verificationMode, setVerificationMode] = useState(false);

  const [otp, setOtp] = useState("");

  const [verificationEmail, setVerificationEmail] = useState("");

  const [otpTimeLeft, setOtpTimeLeft] = useState(600);
  const [resendTimeLeft, setResendTimeLeft] = useState(30);

  const [successMessage, setSuccessMessage] = useState("");

  /*
   * OTP expiry countdown
   */
  useEffect(() => {
    if (!verificationMode || otpTimeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setOtpTimeLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationMode, otpTimeLeft]);

  /*
   * Resend OTP countdown
   */
  useEffect(() => {
    if (!verificationMode || resendTimeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimeLeft((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationMode, resendTimeLeft]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccessMessage("");

    const name = String(formData.name ?? "").trim();
    const email = String(formData.email ?? "").trim().toLowerCase();
    const phone = String(formData.phone ?? "").trim();
    const location = String(formData.location ?? "").trim();
    const password = String(formData.password ?? "");
    const confirmPassword = String(formData.confirmPassword ?? "");

    const requiredFields = [
      name,
      email,
      phone,
      location,
      password,
      confirmPassword,
    ];

    if (requiredFields.some((field) => field.length === 0)) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^[+]?\d[\d\s()-]{6,19}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        name,
        email,
        phone,
        location,
        password,
      });

      /*
       * Backend has created the account and sent the verification OTP.
       */
      if (response.requiresEmailVerification) {
        setVerificationEmail(response.email || email);
        setVerificationMode(true);
        setOtp("");
        setError("");

        setSuccessMessage(
          response.message ||
            "A verification OTP has been sent to your email.",
        );

        setOtpTimeLeft(600);
        setResendTimeLeft(30);

        return;
      }

      /*
       * Fallback for backend responses that don't require verification.
       */
      navigate("/login", {
        replace: true,
        state: {
          email: response.email || email,
          message:
            response.message ||
            "Account created successfully. Please log in.",
        },
      });
    } catch (err) {
      console.error("Registration failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "We couldn't create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (otpTimeLeft <= 0) {
      setError("This OTP has expired. Please request a new OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyEmailOTP(
        verificationEmail,
        otp,
      );

      navigate("/login", {
        replace: true,
        state: {
          email: verificationEmail,
          message:
            response.message ||
            "Email verified successfully. You can now log in.",
        },
      });
    } catch (err) {
      console.error("OTP verification failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "We couldn't verify your email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendLoading || resendTimeLeft > 0) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setResendLoading(true);

    try {
      const response = await resendEmailOTP(verificationEmail);

      setOtp("");
      setOtpTimeLeft(600);
      setResendTimeLeft(30);

      setSuccessMessage(
        response.message ||
          "A new OTP has been sent to your email.",
      );
    } catch (err) {
      console.error("Resend OTP failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "We couldn't resend the OTP. Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="mb-8 sm:mb-10">
          <BrandLogo />
        </header>

        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <section className="hidden lg:block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DCE9E0] bg-[#EDF5EF] px-4 py-2 text-sm font-medium text-[#427A65]">
              <span className="h-2 w-2 rounded-full bg-[#427A65]" />
              A community that cares
            </div>

            <h1 className="max-w-lg text-5xl font-semibold leading-[1.15] tracking-tight text-[#24342E] xl:text-6xl">
              Good things
              <br />
              happen when
              <br />
              <span className="text-[#427A65]">we connect.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-[#6F7D76]">
              Join CommunityConnect to discover blood donors, find local
              helpers, and make a meaningful difference in your community.
            </p>

            <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
              <div className="rounded-2xl border border-[#F0D9DC] bg-[#FBEAEC] p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#C94C55]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 21s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.5-8 11-8 11Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <p className="font-semibold text-[#24342E]">
                  Donate blood
                </p>

                <p className="mt-1 text-xs leading-5 text-[#6F7D76]">
                  Help when it matters.
                </p>
              </div>

              <div className="rounded-2xl border border-[#DCE6F4] bg-[#EAF1FA] p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#6C8FBC]">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3v18M3 12h18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="font-semibold text-[#24342E]">
                  Offer help
                </p>

                <p className="mt-1 text-xs leading-5 text-[#6F7D76]">
                  Share your skills.
                </p>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-xl">
            <div className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-[0_12px_50px_rgba(36,52,46,0.04)] sm:p-8 md:p-10">
              {verificationMode ? (
                <OTPVerification
                  email={verificationEmail}
                  otp={otp}
                  setOtp={setOtp}
                  onVerify={handleVerifyOTP}
                  onResend={handleResendOTP}
                  loading={loading}
                  resendLoading={resendLoading}
                  error={error}
                  successMessage={successMessage}
                  otpTimeLeft={otpTimeLeft}
                  resendTimeLeft={resendTimeLeft}
                />
              ) : (
                <>
                  <div className="mb-8">
                    <p className="mb-3 text-sm font-semibold text-[#427A65]">
                      CREATE YOUR ACCOUNT
                    </p>

                    <h2 className="text-3xl font-semibold tracking-tight text-[#24342E] sm:text-4xl">
                      Join the community.
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-[#6F7D76]">
                      Create your account and start connecting with people
                      around you.
                    </p>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="mb-6 rounded-xl border border-[#F0D1D5] bg-[#FBEAEC] px-4 py-3 text-sm leading-6 text-[#A63843]"
                    >
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <InputField
                      label="Full name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />

                    <InputField
                      label="Email address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <InputField
                        label="Phone number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Your phone number"
                        autoComplete="tel"
                      />

                      <InputField
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City or area"
                        autoComplete="address-level2"
                      />
                    </div>

                    <PasswordField
                      label="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      autoComplete="new-password"
                    />

                    <PasswordField
                      label="Confirm password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      showPassword={showConfirmPassword}
                      setShowPassword={setShowConfirmPassword}
                      autoComplete="new-password"
                    />

                    <p className="text-xs leading-5 text-[#7B8880]">
                      Use at least 8 characters for your password.
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#427A65] px-5 text-sm font-semibold text-white transition duration-200 hover:bg-[#356651] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#427A65]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create account
                          <span aria-hidden="true">→</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="my-6 h-px bg-[#EDF1EE]" />

                  <p className="text-center text-sm text-[#6F7D76]">
                    Already part of the community?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-[#427A65] underline-offset-4 hover:underline"
                    >
                      Log in
                    </Link>
                  </p>
                </>
              )}
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-[#89958E]">
              Connecting people. Strengthening communities.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}