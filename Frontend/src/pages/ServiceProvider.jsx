import { useEffect, useState } from "react";
import {
  MapPin,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  Wrench,
  Clock,
  HeartHandshake,
  DollarSign
} from "lucide-react";
import {
  registerServiceProvider,
  getMyServiceProviderProfile,
  toggleProviderAvailability,
  getProfile,
} from "../services/api";
import ImageWithFallback from "../components/ui/ImageWithFallback";

const serviceTypes = [
  "Homemade food",
  "Cleaning",
  "Sweeper/helper",
  "Guest assistance",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "House Help",
  "Mechanic",
  "Tutor",
  "Gardener",
  "AC Repair",
  "Appliance Repair",
  "Other community services",
];

const rateTypes = ["Hourly", "Daily", "Monthly", "Fixed"];

export default function ServiceProvider() {
  const [formData, setFormData] = useState({
    serviceType: "",
    location: "",
    availability: true,
    rateType: "Hourly",
    description: "",
  });

  const [existingProvider, setExistingProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [profileRes, providerRes] = await Promise.all([
          getProfile(),
          getMyServiceProviderProfile().catch(() => ({ provider: null })),
        ]);

        if (!active) return;

        const user = profileRes.user;
        const provider = providerRes?.provider;

        if (provider) {
          setExistingProvider(provider);
          setFormData({
            serviceType: provider.serviceType || "",
            location: provider.location || user?.location || "",
            availability: provider.availability !== undefined ? provider.availability : true,
            rateType: provider.rateType || "Hourly",
            description: provider.description || "",
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            location: user?.location || "",
          }));
        }
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || "Failed to load provider profile.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setMessage("");
  };

  const handleToggleAvailability = async () => {
    if (!existingProvider || toggling) return;
    setToggling(true);
    try {
      const res = await toggleProviderAvailability();
      setExistingProvider(res.provider);
      setFormData((prev) => ({ ...prev, availability: res.provider.availability }));
      setMessage(res.message || "Availability status updated.");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update availability.");
    } finally {
      setToggling(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceType) {
      setError("Please select a service category.");
      return;
    }
    if (!formData.location.trim()) {
      setError("Please specify your primary service location.");
      return;
    }
    if (!formData.description.trim()) {
      setError("Please provide a brief description of your capabilities.");
      return;
    }

    setRegistering(true);
    setError("");
    setMessage("");

    try {
      const res = await registerServiceProvider(formData);
      setExistingProvider(res.provider);
      setMessage(res.message || "Service profile published successfully! Neighbors can now reach you.");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-3 text-xs text-[#6F7D76]">
          <Loader2 className="h-8 w-8 animate-spin text-[#4B78A8]" />
          <span>Loading provider profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#24342E]">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        
        {/* =========================================================
            1. HERO: HAVE A SKILL? HELP SOMEONE NEARBY
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#D8E4F2] aspect-16/9 sm:aspect-21/8 shadow-md">
          <ImageWithFallback
            src="/images/services/service-provider-hero.jpg"
            alt="Dedicated local skilled helpers and technicians"
            priority
            aspectClassName="h-full w-full"
            overlay
            overlayClassName="bg-gradient-to-r from-black/85 via-black/60 to-black/75"
          >
            <div className="max-w-2xl text-white space-y-3 p-3 sm:p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4B78A8] px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Community Skill Network
              </span>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Have a skill? Help someone nearby.
              </h1>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
                Whether you're an electrician, home cook, cleaner, tutor, or handy neighbor, join CommunityConnect to connect directly with nearby households.
              </p>
            </div>
          </ImageWithFallback>
        </section>

        {/* =========================================================
            2. WHY PROVIDE WITH COMMUNITYCONNECT
        ========================================================= */}
        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#D8E4F2] bg-white p-6 shadow-2xs space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#24342E]">Zero Platform Commissions</h3>
            <p className="text-xs leading-relaxed text-[#6F7D76]">
              Keep 100% of your earnings. We connect you directly with neighbors with zero middleman deductions.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0F5F2] text-[#427A65]">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#24342E]">Complete Schedule Control</h3>
            <p className="text-xs leading-relaxed text-[#6F7D76]">
              Work when you choose. Toggle your availability on or off with a single click whenever you're busy.
            </p>
          </div>

          <div className="rounded-3xl border border-[#D5E7DB] bg-white p-6 shadow-2xs space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[#24342E]">Direct Local Neighborhood</h3>
            <p className="text-xs leading-relaxed text-[#6F7D76]">
              Serve families in your own community, saving travel time and building long-lasting local trust.
            </p>
          </div>
        </section>

        {/* =========================================================
            3. REGISTRATION / PROFILE FORM
        ========================================================= */}
        <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b border-[#EEF2EF] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4B78A8]">
              {existingProvider ? "Provider Dashboard" : "Offer Help"}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#24342E] mt-1">
              {existingProvider ? "Your Service Provider Profile" : "Register as a Community Service Provider"}
            </h2>
            <p className="text-xs text-[#6F7D76] mt-1">
              {existingProvider
                ? "Update your service category, coverage area, and live availability."
                : "List your skills and rates so neighbors searching for help can reach you."}
            </p>
          </div>

          {/* Toast feedback */}
          {message && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Active Provider Status Card */}
          {existingProvider && (
            <div className="rounded-2xl border border-[#EEF2EF] bg-[#F8FAF9] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#24342E]">{existingProvider.serviceType}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      formData.availability ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                    }`}>
                      {formData.availability ? "Accepting Requests" : "Currently Paused"}
                    </span>
                  </div>
                  <p className="text-xs text-[#6F7D76] mt-0.5">
                    Rate: {formData.rateType} • Coverage: {existingProvider.location}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={toggling}
                onClick={handleToggleAvailability}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-2xs ${
                  formData.availability
                    ? "bg-[#C94C55] text-white hover:bg-[#B53D46]"
                    : "bg-[#4B78A8] text-white hover:bg-[#3D648E]"
                }`}
              >
                {toggling ? "Updating..." : formData.availability ? "Pause Requests" : "Activate Listing"}
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Service Type Dropdown / Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24342E] mb-2">
                Primary Service Offering
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs font-medium text-[#24342E] outline-none focus:border-[#4B78A8] focus:bg-white"
              >
                <option value="">Select a service category...</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Rate Type & Locality Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24342E] mb-1.5">
                  Billing Basis
                </label>
                <select
                  name="rateType"
                  value={formData.rateType}
                  onChange={handleChange}
                  className="h-11 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs font-medium text-[#24342E] outline-none focus:border-[#4B78A8] focus:bg-white"
                >
                  {rateTypes.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24342E] mb-1.5">
                  Coverage Locality
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C9892]" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Akurdi, Pune"
                    required
                    className="h-11 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs font-medium text-[#24342E] outline-none focus:border-[#4B78A8] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24342E] mb-1.5">
                Description of Skills & Experience
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mention your tools, experience, specialties, or standard response time..."
                required
                className="w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] p-3 text-xs text-[#24342E] outline-none focus:border-[#4B78A8] focus:bg-white"
              />
            </div>

            {/* Submit */}
            <div className="pt-3 border-t border-[#EEF2EF] flex justify-end">
              <button
                type="submit"
                disabled={registering}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#4B78A8] px-8 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#3D648E] active:scale-98 disabled:opacity-60"
              >
                {registering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4" />
                    <span>{existingProvider ? "Update Provider Profile" : "Publish Service Offering"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

      </main>
    </div>
  );
}
