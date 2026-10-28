import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Info,
  Sparkles,
  FileText,
  User
} from "lucide-react";
import { registerPrivate } from "../../services/api";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

const initialForm = {
  name: "",
  organizationName: "",
  organizationType: "BLOOD_BANK",
  registrationNumber: "",
  email: "",
  phone: "",
  location: "",
  address: "",
  licenseDocument: "",
  bio: "",
  password: "",
  confirmPassword: "",
};

export default function PrivateRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name.trim() ||
      !formData.organizationName.trim() ||
      !formData.registrationNumber.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.location.trim() ||
      !formData.address.trim() ||
      !formData.password
    ) {
      setError("Please fill in all required organization fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setError("Please enter a valid official email address.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerPrivate({
        name: formData.name.trim(),
        organizationName: formData.organizationName.trim(),
        organizationType: formData.organizationType,
        registrationNumber: formData.registrationNumber.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        address: formData.address.trim(),
        licenseDocument: formData.licenseDocument.trim(),
        bio: formData.bio.trim(),
        password: formData.password,
      });

      setRegistered(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Organization registration failed. Please verify your data."
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;
  const passwordsMismatch =
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  return (
    <main className="min-h-screen bg-[#F8FAF9] flex items-stretch">
      <div className="w-full grid lg:grid-cols-12 min-h-screen">
        
        {/* =========================================================
            LEFT COLUMN: FULL-HEIGHT PHOTOGRAPHIC STORY (DESKTOP)
        ========================================================= */}
        <div className="hidden lg:relative lg:col-span-5 xl:col-span-6 lg:flex flex-col justify-between overflow-hidden bg-[#162534] p-10 xl:p-14 text-white">
          <div className="absolute inset-0">
            <ImageWithFallback
              src="/images/auth/org-register.jpg"
              fallbackSrc="/images/blood/blood-drive.jpg"
              alt="Medical and community professionals collaborating"
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
                  Organization Registration
                </span>
              </div>
            </Link>
          </div>

          {/* Center Story & Tagline */}
          <div className="relative z-10 space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-semibold text-[#8EB8E5]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Partner Onboarding</span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Join the <br />
              <span className="text-[#8EB8E5]">organization network.</span>
            </h1>

            <p className="text-sm text-white/80 leading-relaxed">
              Register your accredited blood bank, hospital, or professional service provider organization to publish inventory and fulfill community requests directly.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4B78A8]/30 text-[#8EB8E5]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Direct community reach without middlemen or listing fees</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4B78A8]/30 text-[#8EB8E5]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Audited blood inventory sync across 8 blood groups</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4B78A8]/30 text-[#8EB8E5]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>Structured request management with status lifecycle tracking</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-white/70 pt-4 border-t border-white/10">
            <ShieldCheck className="h-4 w-4 text-[#8EB8E5]" />
            <span>Strict administrator verification · Community transparency</span>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: REGISTRATION FORM (RESPONSIVE)
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
              to="/private/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B78A8] hover:text-[#3D648E] transition ml-auto"
            >
              <span>Already registered?</span>
              <span className="underline underline-offset-4">Sign in</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Form Container */}
          <div className="mx-auto w-full max-w-xl my-auto">
            
            {/* Mobile Visual Banner (renders only on < lg) */}
            <div className="lg:hidden relative w-full h-40 sm:h-48 overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm mb-6">
              <ImageWithFallback
                src="/images/auth/org-register.jpg"
                fallbackSrc="/images/blood/blood-drive.jpg"
                alt="Healthcare professional team"
                aspectClassName="h-full w-full"
                className="h-full w-full object-cover"
                overlay
                overlayClassName="bg-gradient-to-t from-[#0F1B26] via-[#162534]/65 to-[#162534]/80"
              />
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white w-max mb-1">
                  Organization Registration
                </span>
                <p className="text-base sm:text-lg font-bold leading-tight">
                  Join the CommunityConnect network.
                </p>
              </div>
            </div>

            {registered ? (
              /* Success / Pending Admin Review State */
              <div className="rounded-3xl border border-[#D8E4F2] bg-white p-8 sm:p-10 text-center shadow-xs space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                    Status: Pending Administrator Review
                  </span>
                  <h2 className="mt-3 text-2xl font-extrabold text-[#24342E]">
                    Registration Submitted
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#6F7D76] max-w-md mx-auto">
                    Thank you for applying. To protect community health and safety, all blood banks, hospitals, and professional service organizations are reviewed before public visibility is granted.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/private/login")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#4B78A8] px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-[#3D648E] transition"
                  >
                    <span>Proceed to Organization Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Form Header */}
                <div className="mb-6">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#EAF1FA] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#4B78A8]">
                    Partner Onboarding
                  </span>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24342E]">
                    Register Your Organization
                  </h1>
                  <p className="mt-1 text-xs text-[#6F7D76]">
                    Publish verified inventory and services directly to local citizens.
                  </p>
                </div>

                {/* Review Policy Note */}
                <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-[#D8E4F2] bg-[#F7FAFD] p-3.5 text-xs text-[#35577D]">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-[#4B78A8]" />
                  <span className="leading-relaxed">
                    Registrations undergo standard verification by platform administrators before inventory appears in public searches.
                  </span>
                </div>

                {/* Error Banner */}
                {error && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* GROUP 1: ORGANIZATION TYPE SELECTOR */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6F7D76]">
                      1. Organization Type
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "BLOOD_BANK", label: "Blood Bank" },
                        { id: "HOSPITAL", label: "Hospital" },
                        { id: "SERVICE_PROVIDER", label: "Pro Service" },
                      ].map((type) => {
                        const isSelected = formData.organizationType === type.id;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() =>
                              setFormData((p) => ({
                                ...p,
                                organizationType: type.id,
                              }))
                            }
                            className={`flex h-11 items-center justify-center rounded-2xl border text-xs font-bold transition ${
                              isSelected
                                ? "border-[#4B78A8] bg-[#4B78A8] text-white shadow-xs"
                                : "border-[#E2E9E4] bg-white text-[#24342E] hover:border-[#4B78A8]/40"
                            }`}
                          >
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* GROUP 2: ORGANIZATION IDENTIFIERS */}
                  <div className="space-y-3.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6F7D76]">
                      2. Organization Details
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                          Official Organization Name *
                        </label>
                        <div className="relative">
                          <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                          <input
                            name="organizationName"
                            type="text"
                            value={formData.organizationName}
                            onChange={handleChange}
                            placeholder="e.g. City Central Blood Bank"
                            required
                            className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                          Registration / License Number *
                        </label>
                        <div className="relative">
                          <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                          <input
                            name="registrationNumber"
                            type="text"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            placeholder="e.g. REG-MH-2024-8841"
                            required
                            className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GROUP 3: PRIMARY CONTACT */}
                  <div className="space-y-3.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6F7D76]">
                      3. Contact Representative
                    </label>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                          Representative Name *
                        </label>
                        <div className="relative">
                          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                          <input
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Dr. Rajesh Sharma"
                            required
                            className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                          Official Email *
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                          <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="contact@org.org"
                            required
                            className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                          <input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            required
                            className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GROUP 4: LOCATION */}
                  <div className="space-y-3.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6F7D76]">
                      4. Location & Address
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                          City / Locality *
                        </label>
                        <div className="relative">
                          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                          <input
                            name="location"
                            type="text"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. Akurdi, Pune"
                            required
                            className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                          Full Physical Address *
                        </label>
                        <input
                          name="address"
                          type="text"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Plot 42, Sector 24, Pradhikaran, Pune 411044"
                          required
                          className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-white px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                        License / Credential Document Reference (Optional)
                      </label>
                      <input
                        name="licenseDocument"
                        type="text"
                        value={formData.licenseDocument}
                        onChange={handleChange}
                        placeholder="Link or identifier to certification document"
                        className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-white px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                      />
                    </div>
                  </div>

                  {/* GROUP 5: SECURITY CREDENTIALS */}
                  <div className="space-y-3.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6F7D76]">
                      5. Account Credentials
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                          Password (min. 8 characters) *
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                          <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create password"
                            required
                            className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-10 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9892] hover:text-[#24342E]"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C9892]" />
                          <input
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repeat password"
                            required
                            className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-white pl-10 pr-10 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:ring-4 focus:ring-[#4B78A8]/10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((p) => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9892] hover:text-[#24342E]"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {passwordsMatch && (
                      <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Passwords match
                      </p>
                    )}
                    {passwordsMismatch && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3 w-3" /> Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#4B78A8] text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Registration...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Organization Registration</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switch */}
                <div className="mt-6 border-t border-[#EEF2EF] pt-5 text-center text-xs text-[#6F7D76]">
                  Already have an organization account?{" "}
                  <Link
                    to="/private/login"
                    className="font-bold text-[#4B78A8] hover:underline"
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}

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
