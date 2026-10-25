import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
} from "lucide-react";
import { loginAdmin } from "../../services/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError("Please provide administrator credentials.");
      return;
    }

    setLoading(true);

    try {
      await loginAdmin({
        email,
        password: formData.password,
      });

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const responseData = err.response?.data;
      setError(
        responseData?.message ||
          "Administrator authorization failed. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F6F5] px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#24342E] text-white shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#24342E]">
              CommunityConnect
            </span>
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
            <KeyRound className="h-3 w-3" />
            Restricted Administration Area
          </div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-300 bg-white p-7 sm:p-9 shadow-sm"
        >
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Security Protocol
            </span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#24342E]">
              Admin Sign In
            </h1>
            <p className="mt-1 text-xs text-[#6F7D76]">
              Authorized platform supervisors and verification officers only.
            </p>
          </div>

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
                htmlFor="admin-email"
                className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@communityconnect.local"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#24342E] focus:bg-white focus:ring-4 focus:ring-[#24342E]/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
              >
                Security Passphrase
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-10 text-xs text-[#24342E] outline-none transition focus:border-[#24342E] focus:bg-white focus:ring-4 focus:ring-[#24342E]/10"
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
              className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#24342E] text-xs font-semibold text-white shadow-xs transition hover:bg-[#34463D] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating Authorization...
                </>
              ) : (
                <>
                  Access Admin Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-[#EEF2EF] pt-5 text-center text-xs text-[#6F7D76]">
            Return to{" "}
            <Link to="/home" className="font-bold text-[#427A65] hover:underline">
              Public Portal
            </Link>{" "}
            or{" "}
            <Link to="/private/login" className="font-bold text-[#4B78A8] hover:underline">
              Organization Portal
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
