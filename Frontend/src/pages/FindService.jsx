import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Wrench,
  MapPin,
  Loader2,
  AlertCircle,
  Search
} from "lucide-react";
import { findServiceProviders, sendConnectionRequest } from "../services/api";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import ServiceCard from "../components/ui/ServiceCard";

const serviceCategories = [
  { id: "Cleaning", label: "Cleaning & Housekeeping", image: "/images/services/service-cleaning.jpg" },
  { id: "Electrician", label: "Electrician & Wiring", image: "/images/services/service-electrician.jpg" },
  { id: "Plumbing", label: "Plumbing & Piping", image: "/images/services/service-plumbing.jpg" },
  { id: "Food", label: "Homemade Food & Tiffin", image: "/images/services/service-food.jpg" },
  { id: "Care", label: "Elderly & Patient Care", image: "/images/services/service-eldercare.jpg" },
  { id: "Education", label: "Tutoring & Learning", image: "/images/services/service-tutoring.jpg" },
  { id: "Appliance", label: "Appliance Repairs", image: "/images/services/service-appliances.jpg" },
  { id: "Repair", label: "Carpentry & General", image: "/images/categories/cat-repair.jpg" },
];

const quickLocations = ["Akurdi", "Nigdi", "Pimpri", "Chinchwad", "Kothrud", "Baner", "Wakad", "Pune"];

export default function FindService() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [serviceType, setServiceType] = useState(searchParams.get("category") || "Cleaning");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});

  // Auto-search if params provided
  useEffect(() => {
    const initialCat = searchParams.get("category");
    const initialLoc = searchParams.get("location");
    if (initialCat) setServiceType(initialCat);
    if (initialLoc) setLocation(initialLoc);

    if (initialCat && initialLoc) {
      triggerSearch(initialCat, initialLoc);
    }
  }, [searchParams]);

  const triggerSearch = async (st, loc) => {
    setError("");
    setSearched(true);
    setLoading(true);
    setProviders([]);
    setRequestStatus({});

    try {
      const response = await findServiceProviders(st, loc.trim());
      setProviders(response.matches || []);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!serviceType) {
      setError("Please select a service category.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter a locality or city to search.");
      return;
    }
    triggerSearch(serviceType, location);
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
          message: "Please sign in to send a request.",
        },
      }));
      return;
    }

    let providerId = provider.userId?._id || provider.userId?.id || provider.userId;
    if (typeof providerId === "string" && providerId.startsWith("org_")) {
      providerId = providerId.replace("org_", "");
    }

    if (!providerId) {
      setRequestStatus((prev) => ({
        ...prev,
        [provider._id]: {
          type: "error",
          message: "Provider profile not found.",
        },
      }));
      return;
    }

    setRequesting(provider._id);
    setRequestStatus((prev) => ({ ...prev, [provider._id]: null }));

    try {
      const isOrg = provider.isProfessional;
      const desc = isOrg
        ? `Request for ${provider.title || serviceType} from ${provider.organizationName || 'Provider'} in ${location.trim()}.`
        : `Service request for ${serviceType} assistance in ${location.trim()}.`;

      await sendConnectionRequest({
        providerId,
        type: "SERVICE",
        description: desc,
        location: location.trim(),
      });

      setRequestStatus((prev) => ({
        ...prev,
        [provider._id]: {
          type: "success",
          message: "Request submitted! The provider will be notified immediately.",
        },
      }));
    } catch (err) {
      setRequestStatus((prev) => ({
        ...prev,
        [provider._id]: {
          type: "error",
          message: err.response?.data?.message || "Failed to submit request.",
        },
      }));
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#24342E]">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        
        {/* =========================================================
            HERO: VISUAL SERVICE MARKETPLACE BANNER
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#D8E4F2] aspect-16/9 sm:aspect-21/8 shadow-md">
          <ImageWithFallback
            src="/images/services/service-provider-hero.jpg"
            alt="Local verified skilled professionals and helpers"
            priority
            aspectClassName="h-full w-full"
            overlay
            overlayClassName="bg-gradient-to-r from-black/85 via-black/60 to-black/75"
          >
            <div className="max-w-2xl text-white space-y-3 p-3 sm:p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4B78A8] px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                <Wrench className="h-3.5 w-3.5" />
                Community Marketplace
              </span>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Trusted everyday services from people around you.
              </h1>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
                Discover verified electricians, plumbers, home cooks, housekeepers, and skilled neighbors without middleman markups.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/services/provider")}
                  className="rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 px-4 py-2 text-xs font-bold text-white transition"
                >
                  Have a skill? Offer help here →
                </button>
              </div>
            </div>
          </ImageWithFallback>
        </section>

        {/* =========================================================
            SEARCH & CATEGORY FILTERS
        ========================================================= */}
        <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* Visual Category Selection Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#24342E]">
                  1. Choose Service Category
                </label>
                <span className="text-[11px] text-[#6F7D76]">
                  Select the type of help you need
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {serviceCategories.map((cat) => {
                  const isSelected = serviceType.toLowerCase().includes(cat.id.toLowerCase());
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setServiceType(cat.id)}
                      className={`group flex items-center gap-3 rounded-2xl p-2.5 border text-left transition-all ${
                        isSelected
                          ? "bg-[#EAF1FA] text-[#4B78A8] border-[#4B78A8] shadow-xs"
                          : "bg-white text-[#24342E] border-[#E2E9E4] hover:border-[#4B78A8]/40 hover:bg-[#F8FAF9]"
                      }`}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                        <ImageWithFallback
                          src={cat.image}
                          alt={cat.label}
                          aspectClassName="h-full w-full"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold line-clamp-1">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location & Search CTA */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24342E] mb-2">
                2. Enter Locality / Neighborhood
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C9892]" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Akurdi, Pune, Nigdi, Pimpri, Kothrud"
                    className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs font-medium text-[#24342E] outline-none focus:border-[#4B78A8] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#4B78A8] px-8 text-xs font-bold text-white shadow-xs transition hover:bg-[#3D648E] active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Searching Helpers...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Find {serviceType}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Location Pills */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#8C9892] mr-1">Quick picks:</span>
                {quickLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      setLocation(loc);
                      triggerSearch(serviceType, loc);
                    }}
                    className="rounded-lg border border-[#EEF2EF] bg-[#F8FAF9] px-2.5 py-1 text-[11px] font-semibold text-[#55645E] hover:bg-white hover:border-[#4B78A8]/40 transition"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </section>

        {/* =========================================================
            RESULTS: VISUAL SERVICE CARDS
        ========================================================= */}
        {searched && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#EEF2EF] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#24342E]">
                  Available Providers ({providers.length})
                </h2>
                <p className="text-xs text-[#6F7D76]">
                  Showing nearby verified helpers and professional service listings for {serviceType} in {location}.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-[#6F7D76] space-y-3">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#4B78A8]" />
                <p className="font-semibold text-[#24342E]">Matching with local helpers and verified partners...</p>
              </div>
            ) : providers.length === 0 ? (
              /* EMPTY STATE */
              <div className="rounded-3xl border border-[#E2E9E4] bg-white p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                  <Wrench className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-[#24342E]">No Direct Matches Found in {location}</h3>
                <p className="max-w-md mx-auto text-xs text-[#6F7D76] leading-relaxed">
                  We currently do not have registered {serviceType} providers in this immediate locality.
                  Try searching a wider district (e.g. "Pune") or share your own skills to help local neighbors.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLocation("Pune");
                      triggerSearch(serviceType, "Pune");
                    }}
                    className="rounded-xl border border-[#D8E4F2] bg-[#F7FAFD] px-4 py-2 text-xs font-bold text-[#4B78A8]"
                  >
                    Search Greater Pune Area
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/services/provider")}
                    className="rounded-xl bg-[#4B78A8] px-4 py-2 text-xs font-bold text-white shadow-xs"
                  >
                    Offer This Service
                  </button>
                </div>
              </div>
            ) : (
              /* SERVICE CARDS GRID */
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {providers.map((provider) => (
                  <div key={provider._id} className="flex flex-col">
                    <ServiceCard
                      service={provider}
                      onRequest={() => handleSendRequest(provider)}
                      isRequesting={requesting === provider._id}
                    />

                    {/* Status Feedback under card */}
                    {requestStatus[provider._id] && (
                      <div className={`mt-2 rounded-xl p-2.5 text-xs font-semibold ${
                        requestStatus[provider._id].type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}>
                        {requestStatus[provider._id].message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
