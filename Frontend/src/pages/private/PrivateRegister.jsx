import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Info,
} from "lucide-react";
import { registerPrivate } from "../../services/api";

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
      setError("Please enter a valid email address.");
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
          "Organization registration failed. Please check your data."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
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
            Organization Registration
          </span>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#D8E4F2] bg-white p-7 sm:p-9 shadow-xs"
        >
          {registered ? (
            <div className="text-center py-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-[#24342E]">
                Registration Received
              </h2>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800">
                <span>Status: Pending Administrator Review</span>
              </div>
              <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-[#6F7D76]">
                Thank you for applying. To protect community safety, all organizations and professional service providers are vetted before operational features are enabled. You can now log into your dashboard to inspect your application status.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/private/login")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#4B78A8] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E]"
                >
                  Go to Organization Login
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#4B78A8]">
                  Partner Onboarding
                </span>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#24342E]">
                  Register Your Organization
                </h1>
                <p className="mt-1 text-xs text-[#6F7D76]">
                  Connect blood bank inventories and professional services with local neighbors.
                </p>
              </div>

              {/* Policy note */}
              <div className="mb-6 flex items-start gap-2.5 rounded-2xl border border-[#D8E4F2] bg-[#F7FAFD] p-3.5 text-xs text-[#35577D]">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-[#4B78A8]" />
                <span className="leading-relaxed">
                  New organizations begin with <strong>PENDING</strong> approval status. Administrators review registrations before public discovery and inventory capabilities are activated.
                </span>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Organization Type Selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6F7D76]">
                    Organization Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
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
                          className={`flex h-11 items-center justify-center rounded-2xl border text-xs font-bold transition-all ${
                            isSelected
                              ? "border-[#4B78A8] bg-[#4B78A8] text-white shadow-xs"
                              : "border-[#E2E9E4] bg-[#FBFCFB] text-[#24342E] hover:border-[#BED2E8]"
                          }`}
                        >
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                      Organization Official Name *
                    </label>
                    <input
                      name="organizationName"
                      type="text"
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder="e.g. City Central Blood Bank"
                      required
                      className="h-10.5 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                      Registration / License Number *
                    </label>
                    <input
                      name="registrationNumber"
                      type="text"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="e.g. REG-MH-2024-8841"
                      required
                      className="h-10.5 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                      Primary Contact Representative *
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Dr. Rajesh Sharma"
                      required
                      className="h-10.5 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                      Organization Email *
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@org.org"
                      required
                      className="h-10.5 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                      Phone Number *
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91..."
                      required
                      className="h-10.5 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                      City / Area *
                    </label>
                    <input
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Akurdi, Pune"
                      required
                      className="h-10.5 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
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
                    className="h-10.5 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                    License Reference / Document Link (Optional)
                  </label>
                  <input
                    name="licenseDocument"
                    type="text"
                    value={formData.licenseDocument}
                    onChange={handleChange}
                    placeholder="Link to certification or document verification ID"
                    className="h-10.5 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="8+ characters"
                        required
                        className="h-10.5 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-3.5 pr-8 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9892]"
                      >
                        {showPassword ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                      Confirm Password *
                    </label>
                    <input
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      required
                      className="h-10.5 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#4B78A8] text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E] active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting Registration...
                    </>
                  ) : (
                    <>
                      Register Organization
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-[#EEF2EF] pt-4 text-center text-xs text-[#6F7D76]">
                Already registered?{" "}
                <Link
                  to="/private/login"
                  className="font-bold text-[#4B78A8] hover:underline"
                >
                  Sign In to Private Portal
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
