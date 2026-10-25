import { useEffect, useState } from "react";
import {
  MapPin,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Radio,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  registerServiceProvider,
  getMyServiceProviderProfile,
  toggleProviderAvailability,
  getProfile,
} from "../services/api";
import { ServiceCategoryBadge } from "../components/visuals/ServiceVisual";
import { renderServiceIcon } from "../components/visuals/serviceIcons";

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

const rateTypes = ["Hourly", "Daily", "Monthly"];

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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      setMessage(res.message);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to toggle availability.");
    } finally {
      setToggling(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.serviceType || !formData.location.trim()) {
      setError("Please select a community service and enter location.");
      return;
    }

    setRegistering(true);

    try {
      const response = await registerServiceProvider({
        serviceType: formData.serviceType,
        location: formData.location.trim(),
        availability: formData.availability,
        rateType: formData.rateType,
        description: formData.description.trim(),
      });

      setExistingProvider(response.provider);
      setMessage(response.message || "Community provider profile active.");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to register as community provider."
      );
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#4B78A8]" />
          <span className="text-xs text-[#6F7D76]">Loading provider profile...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-[#D8E4F2] bg-gradient-to-br from-white via-[#F7FAFD] to-[#EAF1FA] p-6 shadow-xs sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#D3E2F4] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#4B78A8]">
                <Sparkles className="h-3.5 w-3.5" />
                Community Help Registry
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#24342E] sm:text-4xl">
                Provide Community Service
              </h1>
              <p className="mt-2 text-sm text-[#6F7D76]">
                Offer homemade food, cleaning, helper assistance, and practical skills directly to your neighborhood.
              </p>
            </div>

            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl border border-[#D3E2F4] bg-white text-[#4B78A8] shadow-xs">
              {renderServiceIcon(formData.serviceType, "h-8 w-8 sm:h-10 sm:w-10")}
            </div>
          </div>
        </section>

        {/* Existing Provider Status Card */}
        {existingProvider && (
          <div className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1FA] text-lg font-bold text-[#4B78A8]">
                {renderServiceIcon(existingProvider.serviceType, "h-6 w-6")}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#24342E]">{existingProvider.serviceType}</h3>
                  <span className="rounded-full bg-[#EAF1FA] px-2 py-0.5 text-[10px] font-bold text-[#4B78A8]">
                    {existingProvider.rateType || "Hourly"}
                  </span>
                </div>
                <p className="text-xs text-[#6F7D76] mt-0.5">
                  Location: {existingProvider.location} • Status:{" "}
                  <strong>{existingProvider.availability ? "Active & Visible" : "Paused"}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleAvailability}
              disabled={toggling}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                existingProvider.availability
                  ? "bg-[#24342E] text-white hover:bg-[#34463D]"
                  : "bg-[#427A65] text-white hover:bg-[#356651]"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              {toggling
                ? "Updating..."
                : existingProvider.availability
                ? "Pause Availability"
                : "Activate Availability"}
            </button>
          </div>
        )}

        {/* Form Grid */}
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-xs sm:p-7">
            <h2 className="text-base font-bold text-[#24342E] mb-4">
              {existingProvider ? "Update Community Listing" : "Register Your Assistance"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Service categories */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#6F7D76]">
                  Choose Community Service Type *
                </label>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {serviceTypes.map((type) => (
                    <ServiceCategoryBadge
                      key={type}
                      service={type}
                      selected={formData.serviceType === type}
                      compact
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          serviceType: type,
                        }));
                        setError("");
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Rate Type */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6F7D76]">
                  Availability Schedule / Rate Basis
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {rateTypes.map((rt) => {
                    const isSelected = formData.rateType === rt;
                    return (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, rateType: rt }))}
                        className={`flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition ${
                          isSelected
                            ? "border-[#4B78A8] bg-[#4B78A8] text-white shadow-2xs"
                            : "border-[#E2E9E4] bg-[#FBFCFB] text-[#24342E] hover:border-[#BED2E8]"
                        }`}
                      >
                        {rt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6F7D76]">
                  Service Description & Hours
                </label>
                <textarea
                  rows="3"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. Fresh homemade lunches, cleaning assistance, weekend guest support..."
                  className="w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] p-3 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                />
              </div>

              {/* Location Input */}
              <div>
                <label
                  htmlFor="provider-location"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6F7D76]"
                >
                  Locality / Neighborhood *
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B9891]" />
                  <input
                    id="provider-location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Akurdi, Pune"
                    required
                    className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-11 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white"
                  />
                </div>
              </div>

              {/* Availability Switch */}
              <div className="flex items-center justify-between rounded-2xl border border-[#E2E9E4] bg-[#FAFBFA] p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      formData.availability
                        ? "bg-[#EAF1FA] text-[#4B78A8]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#24342E]">
                      Available for Community Requests
                    </p>
                    <p className="text-[11px] text-[#6F7D76]">
                      {formData.availability ? "Visible in search" : "Paused"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.availability}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      availability: !prev.availability,
                    }))
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    formData.availability ? "bg-[#4B78A8]" : "bg-[#CBD3CE]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-all ${
                      formData.availability ? "left-5.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={registering}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#4B78A8] px-6 text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E] disabled:opacity-60"
              >
                {registering ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {existingProvider ? "Save Updated Provider Profile" : "Activate Provider Profile"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Side Info */}
          <aside className="flex flex-col justify-between rounded-3xl border border-[#D8E4F2] bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 text-white sm:p-7 shadow-xs">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#7DD3FC]">
                <Sparkles className="h-5 w-5" />
              </div>

              <h3 className="mt-5 text-xl font-bold leading-tight">
                Peer Community Helpers
              </h3>
              <p className="mt-2 text-xs leading-5 text-white/70">
                Whether offering home-cooked tiffins, household cleaning, helper support, or skilled repair, you directly empower your local neighborhood.
              </p>

              <div className="mt-6 space-y-2.5">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                  <p className="font-semibold text-white">Community Rates</p>
                  <p className="text-[11px] text-white/60">Choose Hourly, Daily, or Monthly support based on your availability.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                  <p className="font-semibold text-white">Direct Neighbor Contact</p>
                  <p className="text-[11px] text-white/60">No platform fee, commission, or middleman intervention.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs text-white/80">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-[#75C89F]" />
                <span>Zero Commission Community Network</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
