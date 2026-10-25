import { useState } from "react";
import { motion } from "motion/react";
import {
  Wrench,
  MapPin,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  Phone,
  Sparkles,
  Search,
  CheckCircle2,
  Users,
  Building2,
  Tag
} from "lucide-react";
import { findServiceProviders, sendConnectionRequest } from "../services/api";
import {
  ServiceCategoryBadge,
  ServiceScanningRadar,
} from "../components/visuals/ServiceVisual";
import { renderServiceIcon } from "../components/visuals/serviceIcons";
import { EmptyStateVisual } from "../components/visuals/EmptyStateVisual";
import { useNavigate } from "react-router-dom";

const serviceTypes = [
  "Homemade food",
  "Cleaning",
  "Sweeper/helper",
  "Guest assistance",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "Mechanic",
  "House Help",
  "AC Repair",
  "Computer Repair",
  "Tutor",
  "Gardener",
  "Appliance Repair",
  "Other community services",
];

const serviceWorkflowSteps = [
  {
    step: "01",
    title: "Choose Service",
    desc: "Select category and enter your locality",
    icon: Wrench,
    accent: "bg-[#EAF1FA] text-[#4B78A8]",
  },
  {
    step: "02",
    title: "Scan Providers",
    desc: "Discover community helpers and verified organizations",
    icon: Search,
    accent: "bg-[#E5F1EA] text-[#427A65]",
  },
  {
    step: "03",
    title: "Direct Request",
    desc: "Connect directly with zero middleman markup",
    icon: Users,
    accent: "bg-[#F3EAFD] text-[#7E57C2]",
  },
];

const popularServices = [
  { name: "Homemade food", label: "Tiffin & home meals" },
  { name: "Cleaning", label: "House & deep clean" },
  { name: "Plumber", label: "Piping & leaks" },
  { name: "Electrician", label: "Wiring & power" },
];

export default function FindService() {
  const navigate = useNavigate();

  const [serviceType, setServiceType] = useState("");
  const [location, setLocation] = useState("");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setSearched(true);

    if (!serviceType || !location.trim()) {
      setError("Please select a service and enter location.");
      return;
    }

    setLoading(true);
    setProviders([]);
    setRequestStatus({});

    try {
      const response = await findServiceProviders(serviceType, location.trim());
      setProviders(response.matches || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Search failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (provider) => {
    let user;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    if (!user) {
      setRequestStatus((prev) => ({
        ...prev,
        [provider._id]: {
          type: "error",
          message: "Please log in first.",
        },
      }));
      return;
    }

    const providerId = provider.userId?._id || provider.userId?.id || provider.userId;

    if (!providerId) {
      setRequestStatus((prev) => ({
        ...prev,
        [provider._id]: {
          type: "error",
          message: "Provider information is missing.",
        },
      }));
      return;
    }

    setRequesting(provider._id);
    setRequestStatus((prev) => ({ ...prev, [provider._id]: null }));

    try {
      const description = provider.isProfessional
        ? `Professional booking inquiry for ${provider.title || serviceType} in ${location.trim()}.`
        : `Service request for ${serviceType} in ${location.trim()}.`;

      await sendConnectionRequest({
        providerId,
        type: "SERVICE",
        description,
        location: location.trim(),
      });

      setRequestStatus((prev) => ({
        ...prev,
        [provider._id]: {
          type: "success",
          message: "Request sent successfully.",
        },
      }));
    } catch (err) {
      setRequestStatus((prev) => ({
        ...prev,
        [provider._id]: {
          type: "error",
          message: err.response?.data?.message || "Failed to send request.",
        },
      }));
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="w-full bg-[#F8FAF9] px-4 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Compact Header Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-[#D8E4F2] bg-gradient-to-br from-white via-[#F7FAFD] to-[#EAF1FA] p-5 shadow-2xs sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#D3E2F4] bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#4B78A8]">
                <Wrench className="h-3 w-3" />
                Community & Pro Skills
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#24342E] sm:text-3xl">
                Find Local Services
              </h1>
              <p className="mt-1 text-xs text-[#6F7D76]">
                Connect with everyday community helpers and accredited professional service providers.
              </p>
            </div>

            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#D3E2F4] bg-white text-[#4B78A8] shadow-2xs">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>
        </section>

        {/* Compact Category Selector & Search Box */}
        <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs sm:p-6">
          <form onSubmit={handleSearch}>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6F7D76]">
                  Select Category
                </label>
                <span className="text-[11px] text-[#8C9892]">
                  {serviceType ? `Selected: ${serviceType}` : `${serviceTypes.length} available`}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {serviceTypes.map((type) => (
                  <ServiceCategoryBadge
                    key={type}
                    service={type}
                    selected={serviceType === type}
                    onClick={() => {
                      setServiceType(type);
                      setError("");
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Location + Search */}
            <div className="mt-4 grid gap-2.5 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B9891]" />
                <input
                  id="service-location"
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter neighborhood, locality or city..."
                  className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#4B78A8] focus:bg-white focus:ring-2 focus:ring-[#4B78A8]/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#4B78A8] px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Find Helpers
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-3.5 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </section>

        {/* Results Area OR Initial Discovery Workflow */}
        {searched ? (
          <section className="pt-1">
            {loading ? (
              <ServiceScanningRadar label="Scanning for available service providers and helpers..." />
            ) : providers.length === 0 && !error ? (
              <div className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs sm:p-8">
                <EmptyStateVisual
                  type="service"
                  title="No providers found in this area"
                  actionLabel="Offer this service"
                  onAction={() => navigate("/services/provider")}
                />
              </div>
            ) : (
              <div>
                <div className="mb-3.5 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#24342E]">
                    Available Providers ({providers.length})
                  </h2>
                  <span className="text-[11px] text-[#6F7D76]">Community Helpers & Verified Pros</span>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {providers.map((provider) => {
                    const status = requestStatus[provider._id];
                    const isAvailable = provider.availability;
                    const isPro = provider.isProfessional;

                    return (
                      <motion.article
                        key={provider._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex flex-col justify-between rounded-3xl border border-[#E2E9E4] bg-white p-4.5 shadow-2xs transition hover:border-[#D3E2F4] hover:shadow-xs"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                                {renderServiceIcon(provider.serviceType, "h-5 w-5")}
                              </span>
                              <div>
                                <h3 className="text-xs font-semibold text-[#24342E]">
                                  {isPro
                                    ? provider.organizationName
                                    : provider.userId?.name || "Community Helper"}
                                </h3>
                                <p className="text-[11px] font-medium text-[#4B78A8]">
                                  {provider.title || provider.serviceType}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                isPro
                                  ? "bg-[#EAF1FA] text-[#4B78A8]"
                                  : "bg-[#E5F1EA] text-[#427A65]"
                              }`}
                            >
                              {isPro ? (
                                <>
                                  <Building2 className="h-3 w-3" />
                                  Pro Provider
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="h-3 w-3" />
                                  Community
                                </>
                              )}
                            </span>
                          </div>

                          {/* Pricing & Rate Basis */}
                          {isPro && provider.pricing > 0 && (
                            <div className="mt-2.5 inline-flex items-center gap-1 rounded-xl bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-[#24342E]">
                              <Tag className="h-3 w-3 text-[#4B78A8]" />
                              <span>₹{provider.pricing} / {provider.pricingType}</span>
                            </div>
                          )}

                          {provider.description && (
                            <p className="mt-2 text-xs text-[#6F7D76] line-clamp-2 leading-relaxed">
                              {provider.description}
                            </p>
                          )}

                          {/* Info chips */}
                          <div className="mt-3 space-y-1 border-t border-[#EEF2EF] pt-2.5 text-xs text-[#6F7D76]">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8C9993]" />
                              <span className="truncate">{provider.location || "Location not set"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isAvailable ? "bg-[#427A65]" : "bg-gray-300"
                                }`}
                              />
                              <span className="text-[11px]">{isAvailable ? "Available Now" : "Unavailable"}</span>
                            </div>
                            {(provider.contact || provider.userId?.phone) && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-[#8C9993]" />
                                <span className="truncate">{provider.contact || provider.userId?.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Message or Request CTA */}
                        <div className="mt-4">
                          {status && (
                            <div
                              className={`mb-2.5 rounded-xl px-3 py-2 text-xs font-medium ${
                                status.type === "success"
                                  ? "border border-[#D4E7D9] bg-[#EDF7EF] text-[#356651]"
                                  : "border border-red-100 bg-red-50 text-red-700"
                              }`}
                            >
                              {status.message}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSendRequest(provider)}
                            disabled={requesting === provider._id || !isAvailable}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#24342E] px-4 text-xs font-semibold text-white transition hover:bg-[#34463D] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {requesting === provider._id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Sending...
                              </>
                            ) : !isAvailable ? (
                              "Unavailable"
                            ) : (
                              <>
                                Send Connection Request
                                <Send className="h-3.5 w-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        ) : (
          /* Visual Content Workflow */
          <div className="space-y-5">
            <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B78A8]">
                    Workflow
                  </span>
                  <h2 className="text-sm font-bold text-[#24342E]">
                    How service requests work
                  </h2>
                </div>
                <span className="text-[11px] text-[#8C9892]">3 simple steps</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {serviceWorkflowSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.step}
                      className="group relative flex flex-col justify-between rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4 transition hover:border-[#D8E4F2] hover:bg-white"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-[#8C9892]">
                            {step.step}
                          </span>
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-xl transition group-hover:scale-105 ${step.accent}`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                        </div>

                        <h3 className="mt-3 text-xs font-bold text-[#24342E]">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-[11px] text-[#6F7D76]">
                          {step.desc}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-[#8C9892]">
                        <CheckCircle2 className="h-3 w-3 text-[#427A65]" />
                        <span>Peer-to-Peer Verified</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Popular Categories */}
            <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs sm:p-6">
              <div className="mb-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#427A65]">
                    Quick Pick
                  </span>
                  <h2 className="text-sm font-bold text-[#24342E]">
                    Popular skill categories
                  </h2>
                </div>
                <span className="text-[11px] text-[#8C9892]">Click to select</span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {popularServices.map((srv) => (
                  <button
                    key={srv.name}
                    type="button"
                    onClick={() => {
                      setServiceType(srv.name);
                      setError("");
                    }}
                    className={`group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition ${
                      serviceType === srv.name
                        ? "border-[#4B78A8] bg-[#EAF1FA]/60"
                        : "border-[#EEF2EF] bg-[#FBFCFB] hover:border-[#D3E2F4] hover:bg-white"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs text-[#4B78A8] group-hover:scale-105 transition">
                      {renderServiceIcon(srv.name, "h-5 w-5")}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#24342E]">
                        {srv.name}
                      </p>
                      <p className="truncate text-[10px] text-[#6F7D76]">
                        {srv.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
