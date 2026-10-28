import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  ShieldCheck,
  Droplets,
  Wrench,
  Sparkles
} from "lucide-react";
import { loginPrivate } from "../../services/api";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

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
    <main className="min-h-screen bg-[#F8FAF9] flex items-stretch">
      <div className="w-full grid lg:grid-cols-12 min-h-screen">
        
        {/* =========================================================
            LEFT COLUMN: FULL-HEIGHT PHOTOGRAPHIC STORY (DESKTOP)
        ========================================================= */}
        <div className="hidden lg:relative lg:col-span-5 xl:col-span-6 lg:flex flex-col justify-between overflow-hidden bg-[#162534] p-10 xl:p-14 text-white">
          <div className="absolute inset-0">
            <ImageWithFallback
              src="/images/auth/org-login.jpg"
              fallbackSrc="/images/blood/blood-hospital.jpg"
              alt="Accredited hospital and healthcare facility"
              priority
              aspectClassName="h-full w-full"
              className="h-full w-full object-cover"
              overlay
              overlayClassName="bg-gradient-to-t from-[#0F1B26] via-[#162534]/75 to-[#162534]/85"
            />
          </div>

          {/* Top Brand Link */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 transition group-hover:scale-105">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-white">
                  CommunityConnect
                </span>
                <span className="text-[10px] text-white/70">
                  Organization & Healthcare Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Center Story & Tagline */}
          <div className="relative z-10 space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-semibold text-[#8EB8E5]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verified Organization Network</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              CommunityConnect <br />
              <span className="text-[#8EB8E5]">Organizations</span>
            </h1>

            <p className="text-sm text-white/80 leading-relaxed">
              Connect people with the help they need. Manage emergency blood stocks, respond to community requests, and provide verified local services.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C94C55]/30 text-white mb-2">
                  <Droplets className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-white">Blood Centers</p>
                <p className="text-[11px] text-white/70">Live inventory sync</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4B78A8]/40 text-white mb-2">
                  <Wrench className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-white">Pro Providers</p>
                <p className="text-[11px] text-white/70">Verified community aid</p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-white/70 pt-4 border-t border-white/10">
            <ShieldCheck className="h-4 w-4 text-[#8EB8E5]" />
            <span>Accredited facilities · Audited inventory · Direct connection</span>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: PREMIUM FORM CARD (RESPONSIVE)
        ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-between p-4 sm:p-8 lg:p-12 xl:p-16">
          
          {/* Top Bar for Desktop & Mobile */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8]">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-[#24342E]">CommunityConnect</span>
            </Link>

            <Link
              to="/private/register"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B78A8] hover:text-[#3D648E] transition ml-auto"
            >
              <span>New organization?</span>
              <span className="underline underline-offset-4">Register</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Form Container */}
          <div className="mx-auto w-full max-w-md my-auto">
            
            {/* Mobile Visual Banner (renders only on < lg) */}
            <div className="lg:hidden relative w-full h-40 sm:h-48 overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm mb-6">
              <ImageWithFallback
                src="/images/auth/org-login.jpg"
                fallbackSrc="/images/blood/blood-hospital.jpg"
                alt="Healthcare organization facility"
                aspectClassName="h-full w-full"
                className="h-full w-full object-cover"
                overlay
                overlayClassName="bg-gradient-to-t from-[#0F1B26] via-[#162534]/65 to-[#162534]/80"
              />
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white w-max mb-1">
                  Organization Portal
                </span>
                <p className="text-base sm:text-lg font-bold leading-tight">
                  Connect people with the help they need.
                </p>
              </div>
            </div>

            {/* Form Header */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#EAF1FA] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#4B78A8]">
                Private Portal
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24342E]">
                Organization Sign In
              </h1>
              <p className="mt-1 text-xs text-[#6F7D76]">
                Enter verified credentials to manage inventory and requests.
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
                className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Organization Email Field */}
              <div>
                <label
                  htmlFor="org-email"
                  className="mb-1.5 block text-xs font-semibold text-[#6F7D76]"
                >
                  Organization Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                  <input
                    id="org-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@bloodbank.org or provider@service.com"
                    autoComplete="email"
                    required
                    className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-4 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="org-password"
                    className="block text-xs font-semibold text-[#6F7D76]"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-[#4B78A8] hover:text-[#3D648E] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                  <input
                    id="org-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-11 text-xs text-[#24342E] outline-none transition placeholder:text-[#9EA8A3] focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
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
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#4B78A8] text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Organization Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <div className="mt-6 border-t border-[#EEF2EF] pt-5 text-center text-xs text-[#6F7D76]">
              <span>New organization or service provider? </span>
              <Link
                to="/private/register"
                className="font-bold text-[#4B78A8] hover:text-[#3D648E] hover:underline"
              >
                Create Organization Account
              </Link>
            </div>

            {/* Portal Switch Footer */}
            <div className="mt-5 rounded-2xl bg-white border border-[#E2E9E4] p-3 text-center text-xs text-[#6F7D76] flex items-center justify-center gap-2">
              <span>Switch portal:</span>
              <Link
                to="/login"
                className="font-bold text-[#427A65] hover:underline"
              >
                Public Portal
              </Link>
              <span>·</span>
              <Link
                to="/admin/login"
                className="font-bold text-[#24342E] hover:underline"
              >
                Admin
              </Link>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-6 text-center text-[11px] text-[#8C9892]">
            © {new Date().getFullYear()} CommunityConnect. Verified Organization Access.
          </div>
        </div>

      </div>
    </main>
  );
}
