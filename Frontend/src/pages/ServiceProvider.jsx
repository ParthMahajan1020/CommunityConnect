import { useState } from "react";
import { motion } from "motion/react";
import {
  MapPin,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Radio,
  ArrowRight,
} from "lucide-react";
import { registerServiceProvider } from "../services/api";
import { ServiceCategoryBadge } from "../components/visuals/ServiceVisual";
import { renderServiceIcon } from "../components/visuals/serviceIcons";
import { AnimatedSuccessCheck } from "../components/visuals/SuccessStateVisual";
import { useNavigate } from "react-router-dom";

const serviceTypes = [
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
  "Other",
];

export default function ServiceProvider() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    serviceType: "",
    location: "",
    availability: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.serviceType || !formData.location.trim()) {
      setError("Please select a service and enter location.");
      return;
    }

    let user;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    if (!user) {
      setError("Please log in first.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerServiceProvider({
        serviceType: formData.serviceType,
        location: formData.location.trim(),
        availability: formData.availability,
      });

      setMessage(response.message || "Registration complete.");
      setRegistered(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to register as provider."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-[#D8E4F2] bg-gradient-to-br from-white via-[#F7FAFD] to-[#EAF1FA] p-6 shadow-xs sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#D3E2F4] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#4B78A8]">
                <Sparkles className="h-3.5 w-3.5" />
                Provider Setup
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#24342E] sm:text-4xl">
                Provide a Service.
              </h1>
              <p className="mt-2 text-sm text-[#6F7D76]">
                List your skills to connect with local neighbors in need.
              </p>
            </div>

            <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl border border-[#D3E2F4] bg-white text-[#4B78A8] shadow-xs">
              {renderServiceIcon(formData.serviceType, "h-8 w-8 sm:h-10 sm:w-10")}
            </div>
          </div>
        </section>

        {registered && !error ? (
          /* Confirmation Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 rounded-3xl border border-[#D5E7DB] bg-white p-8 text-center shadow-xs"
          >
            <AnimatedSuccessCheck
              title="Provider Profile Active!"
              subtitle={message || "Neighbors searching for this skill can now discover you."}
              accent="blue"
            />

            <div className="mx-auto mt-4 inline-flex items-center gap-3 rounded-2xl border border-[#D3E2F4] bg-[#EAF1FA] px-6 py-3">
              <span className="text-xs font-semibold uppercase text-[#4B78A8]">
                Active Service:
              </span>
              <span className="text-xl font-bold text-[#4B78A8]">
                {formData.serviceType}
              </span>
            </div>

            <div className="mt-8 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/requests")}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#24342E] px-5 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#34463D]"
              >
                View Requests
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* Visual Setup Form */
          <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-xs sm:p-7">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Visual Category Selection */}
                <div>
                  <label className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-[#6F7D76]">
                    Choose Your Specialty
                  </label>

                  <div className="flex flex-wrap gap-2">
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

                {/* Location Input */}
                <div>
                  <label
                    htmlFor="provider-location"
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#6F7D76]"
                  >
                    Service Area
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
                      className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-11 pr-4 text-sm text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white focus:ring-4 focus:ring-[#4B78A8]/10"
                    />
                  </div>
                </div>

                {/* Live Availability Toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-[#E2E9E4] bg-[#FAFBFA] p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        formData.availability
                          ? "bg-[#EAF1FA] text-[#4B78A8]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Radio className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#24342E]">
                        Available for Work
                      </p>
                      <p className="text-[11px] text-[#6F7D76]">
                        {formData.availability
                          ? "Visible to community"
                          : "Paused"}
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
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                      formData.availability ? "bg-[#4B78A8]" : "bg-[#CBD3CE]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-xs transition-all ${
                        formData.availability ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#4B78A8] px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-[#3D648E] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Activate Provider Profile
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Visual Skill Network Card */}
            <aside className="flex flex-col justify-between rounded-3xl border border-[#D8E4F2] bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 text-white sm:p-7 shadow-xs">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#7DD3FC]">
                  <Sparkles className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-xl font-bold leading-tight">
                  Your skill can help someone nearby.
                </h3>
                <p className="mt-2 text-xs leading-5 text-white/70">
                  Join verified neighborhood service providers offering reliable assistance.
                </p>

                {/* Animated visual pulse ring */}
                <div className="relative mt-8 flex h-32 items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute h-28 w-28 rounded-full border border-[#7DD3FC]/30"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute h-20 w-20 rounded-full border border-[#7DD3FC]/40"
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xs text-[#7DD3FC]">
                    {renderServiceIcon(formData.serviceType, "h-6 w-6")}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-xs text-white/80">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-[#75C89F]" />
                  <span>Direct Peer Contact</span>
                </div>
                <p className="mt-1 text-[11px] text-white/60">
                  Requests route straight to your inbox with zero platform commission.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}