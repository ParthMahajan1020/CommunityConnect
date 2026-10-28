import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  CheckCircle2,
  Building2
} from "lucide-react";
import { loginAdmin } from "../../services/api";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

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
    <main className="min-h-screen bg-[#F8FAF9] flex items-stretch">
      <div className="w-full grid lg:grid-cols-12 min-h-screen">
        
        {/* =========================================================
            LEFT COLUMN: SECURE GOVERNANCE PHOTOGRAPHIC STORY (DESKTOP)
        ========================================================= */}
        <div className="hidden lg:relative lg:col-span-5 xl:col-span-6 lg:flex flex-col justify-between overflow-hidden bg-[#18231E] p-10 xl:p-14 text-white">
          <div className="absolute inset-0">
            <ImageWithFallback
              src="/images/auth/admin-login.jpg"
              fallbackSrc="/images/hero/hero-community.jpg"
              alt="System operations and administration center"
              priority
              aspectClassName="h-full w-full"
              className="h-full w-full object-cover"
              overlay
              overlayClassName="bg-gradient-to-t from-[#0E1512] via-[#18231E]/80 to-[#18231E]/90"
            />
          </div>

          {/* Top Brand Link */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 transition group-hover:scale-105">
                <ShieldCheck className="h-5 w-5 text-[#8AD4B2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white">
                  CommunityConnect
                </span>
                <span className="text-[10px] text-white/70">
                  Platform Administration
                </span>
              </div>
            </Link>
          </div>

          {/* Center Story & Governance Narrative */}
          <div className="relative z-10 space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-semibold text-[#8AD4B2]">
              <KeyRound className="h-3.5 w-3.5" />
              <span>Restricted Administration</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              System <br />
              <span className="text-[#8AD4B2]">Administration</span>
            </h1>

            <p className="text-sm text-white/80 leading-relaxed">
              Secure platform supervision, organization verification auditing, and community network governance.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[#8AD4B2]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Organization license and credential vetting</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[#8AD4B2]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Platform connection and activity audit ledger</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[#8AD4B2]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Role-isolated session validation</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-white/70 pt-4 border-t border-white/10">
            <ShieldCheck className="h-4 w-4 text-[#8AD4B2]" />
            <span>Authorized access only · Monitored supervisory endpoint</span>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: MINIMAL CONTROL CARD (RESPONSIVE)
        ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-between p-4 sm:p-8 lg:p-12 xl:p-16">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#24342E] text-white">
                <ShieldCheck className="h-5 w-5 text-[#8AD4B2]" />
              </div>
              <span className="text-sm font-bold text-[#24342E]">CommunityConnect</span>
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE9E0] bg-[#EDF5EF] px-3 py-1 text-xs font-semibold text-[#427A65] ml-auto">
              <KeyRound className="h-3 w-3" />
              <span>Secure Supervisor Login</span>
            </span>
          </div>

          {/* Form Container */}
          <div className="mx-auto w-full max-w-md my-auto">
            
            {/* Mobile Visual Banner (renders only on < lg) */}
            <div className="lg:hidden relative w-full h-40 sm:h-48 overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm mb-6">
              <ImageWithFallback
                src="/images/auth/admin-login.jpg"
                fallbackSrc="/images/hero/hero-community.jpg"
                alt="System administration operations"
                aspectClassName="h-full w-full"
                className="h-full w-full object-cover"
                overlay
                overlayClassName="bg-gradient-to-t from-[#0E1512] via-[#18231E]/75 to-[#18231E]/85"
              />
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white w-max mb-1">
                  Admin Portal
                </span>
                <p className="text-base sm:text-lg font-bold leading-tight">
                  System Administration & Oversight
                </p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#24342E] text-white px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                Admin Access
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24342E]">
                Administrator Sign In
              </h1>
              <p className="mt-1 text-xs text-[#6F7D76]">
                Enter supervisor credentials to access platform controls.
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
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
                    className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-4 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#24342E] focus:ring-4 focus:ring-[#24342E]/10"
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    placeholder="Enter security passphrase"
                    autoComplete="current-password"
                    required
                    className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-11 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#24342E] focus:ring-4 focus:ring-[#24342E]/10"
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
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#24342E] text-xs font-semibold text-white shadow-xs transition hover:bg-[#18231E] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Validating Authorization...</span>
                  </>
                ) : (
                  <>
                    <span>Access Admin Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Portal Switch Footer (no public or org registration links!) */}
            <div className="mt-8 rounded-2xl bg-white border border-[#E2E9E4] p-3 text-center text-xs text-[#6F7D76] flex items-center justify-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-[#4B78A8]" />
              <span>Looking for another portal?</span>
              <Link
                to="/home"
                className="font-bold text-[#427A65] hover:underline"
              >
                Public Portal
              </Link>
              <span>·</span>
              <Link
                to="/private/login"
                className="font-bold text-[#4B78A8] hover:underline"
              >
                Organization Portal
              </Link>
            </div>
          </div>

          {/* Bottom Security Notice */}
          <div className="mt-6 text-center text-[11px] text-[#8C9892]">
            CommunityConnect Administration · Restricted Area · Unauthorized access is logged
          </div>
        </div>

      </div>
    </main>
  );
}
