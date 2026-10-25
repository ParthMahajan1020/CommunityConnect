import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  HeartHandshake,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Droplets,
  Wrench,
  Building2,
  Sparkles
} from "lucide-react";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const successMessage = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim();
    if (!email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      await loginUser({
        email,
        password: formData.password,
      });

      const destination = location.state?.from;
      const safeDestination =
        typeof destination?.pathname === "string" &&
        destination.pathname.startsWith("/") &&
        !destination.pathname.startsWith("//")
          ? `${destination.pathname}${destination.search || ""}${destination.hash || ""}`
          : "/home";

      navigate(safeDestination, { replace: true });
    } catch (err) {
      const responseData = err.response?.data;
      setError(
        responseData?.message ||
          responseData?.error ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Check if error suggests another portal
  const isOrgRedirectError = typeof error === "string" && error.includes("/private/login");
  const isAdminRedirectError = typeof error === "string" && error.includes("/admin/login");

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
            to="/register"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#427A65] hover:text-[#356651] transition"
          >
            <span>Need an account?</span>
            <span className="underline underline-offset-4">Sign up</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Main Two-Section Grid */}
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* LEFT SIDE: Brand Story & Trust Value Points */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#CFE2D6] bg-[#E5F1EA]/80 px-3 py-1 text-xs font-semibold text-[#356651]">
                <Sparkles className="h-3.5 w-3.5 text-[#427A65]" />
                <span>One Community. Many Ways to Help.</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#24342E] sm:text-4xl lg:text-[40px] lg:leading-[1.15]">
                Connecting people who need help with those who can provide it.
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-[#6F7D76]">
                Whether you need urgent emergency blood, are ready to save a life as a voluntary donor, or seek everyday local assistance, CommunityConnect connects neighbors with direct transparency.
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
                  Emergency Blood
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-[#6F7D76]">
                  Instantly locate compatible local donors and accredited blood center inventories.
                </p>
              </div>

              <div className="rounded-2xl border border-[#E2E9E4] bg-white p-4 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8]">
                  <Wrench className="h-4 w-4" />
                </div>
                <h3 className="mt-2.5 text-xs font-bold text-[#24342E]">
                  Community Services
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-[#6F7D76]">
                  Find or offer local help for home meals, repairs, cleaning, and assistance.
                </p>
              </div>
            </motion.div>

            {/* Trust Points */}
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
                    Privacy First & Mutual Consent
                  </h4>
                  <p className="mt-0.5 text-[11px] text-[#6F7D76]">
                    Your phone number and exact address are protected and only shared after both parties accept a connection request.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Organization Portal Link */}
            <div className="pt-1 flex items-center gap-2 text-xs text-[#6F7D76]">
              <Building2 className="h-4 w-4 text-[#4B78A8]" />
              <span>Are you a Hospital or Blood Bank?</span>
              <Link
                to="/private/login"
                className="font-bold text-[#4B78A8] hover:underline inline-flex items-center gap-1"
              >
                Go to Organization Portal
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: Premium Login Card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md rounded-3xl border border-[#E2E9E4] bg-white p-7 sm:p-9 shadow-xs"
            >
              {/* Card Header */}
              <div className="mb-6">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#E5F1EA] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#356651]">
                  Public Portal
                </span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#24342E] sm:text-3xl">
                  Sign in to your account
                </h2>
                <p className="mt-1 text-xs text-[#6F7D76]">
                  Enter your verified email and password to continue.
                </p>
              </div>

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

              {/* Error Notification */}
              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                    <div className="flex-1">
                      <span>{error}</span>
                      {isOrgRedirectError && (
                        <div className="mt-2">
                          <Link
                            to="/private/login"
                            className="inline-flex items-center gap-1 font-bold text-rose-800 underline hover:text-rose-950"
                          >
                            Open Organization Login Portal
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                      {isAdminRedirectError && (
                        <div className="mt-2">
                          <Link
                            to="/admin/login"
                            className="inline-flex items-center gap-1 font-bold text-rose-800 underline hover:text-rose-950"
                          >
                            Open Admin Login Portal
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
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

                {/* Password Field */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-[#6F7D76]"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-[#427A65] hover:text-[#356651] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-11 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9892] transition hover:text-[#24342E] focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#427A65] text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Card Footer: Switch to Register */}
              <div className="mt-6 border-t border-[#EEF2EF] pt-5 text-center text-xs text-[#6F7D76]">
                <span>Don't have a community account? </span>
                <Link
                  to="/register"
                  className="font-bold text-[#427A65] hover:text-[#356651] hover:underline"
                >
                  Create Account
                </Link>
              </div>

              {/* Portal Selector Footer */}
              <div className="mt-4 rounded-xl bg-[#F8FAF9] p-3 text-center text-[11px] text-[#6F7D76]">
                Looking for another portal?{" "}
                <Link
                  to="/private/login"
                  className="font-semibold text-[#4B78A8] hover:underline"
                >
                  Organization
                </Link>{" "}
                ·{" "}
                <Link
                  to="/admin/login"
                  className="font-semibold text-[#24342E] hover:underline"
                >
                  Administrator
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
