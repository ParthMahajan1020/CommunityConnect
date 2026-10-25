import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { loginPrivate } from "../../services/api";

export default function PrivateLogin() {
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
      setError("Please enter organization email and password.");
      return;
    }

    setLoading(true);

    try {
      await loginPrivate({
        email,
        password: formData.password,
      });

      navigate("/private/dashboard", { replace: true });
    } catch (err) {
      const responseData = err.response?.data;
      setError(
        responseData?.message ||
          "Invalid organization credentials. Please verify your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#24342E]">
              CommunityConnect
            </span>
          </Link>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#4B78A8]">
            Organization & Provider Portal
          </span>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#D8E4F2] bg-white p-7 sm:p-9 shadow-xs"
        >
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4B78A8]">
              Private Portal
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#24342E]">
              Organization Sign In
            </h1>
            <p className="mt-1 text-xs text-[#6F7D76]">
              For verified Blood Banks, Hospitals, and Professional Service Providers.
            </p>
          </div>

          {successMessage && (
            <div
              role="status"
              className="mb-5 flex items-center gap-2 rounded-2xl border border-[#D5E7DB] bg-[#EDF7EF] p-3 text-xs font-medium text-[#356651]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
              >
                Organization Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@bloodbank.org or provider@service.com"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white focus:ring-4 focus:ring-[#4B78A8]/10"
                />
              </div>
            </div>

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
                  className="text-xs font-medium text-[#4B78A8] hover:underline"
                >
                  Forgot?
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
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-10 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white focus:ring-4 focus:ring-[#4B78A8]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9892] hover:text-[#24342E]"
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#4B78A8] text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Organization Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3 border-t border-[#EEF2EF] pt-5 text-center text-xs text-[#6F7D76]">
            <div>
              New Organization or Provider?{" "}
              <Link
                to="/private/register"
                className="font-bold text-[#4B78A8] hover:underline"
              >
                Register Organization
              </Link>
            </div>
            <div>
              Looking for Community Member Login?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#427A65] hover:underline"
              >
                Go to Public Portal
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
