import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Droplets,
  MapPin,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  Phone,
  Search,
  Building2,
  CheckCircle2
} from "lucide-react";
import { findBloodDonors, sendConnectionRequest } from "../services/api";
import ImageWithFallback from "../components/ui/ImageWithFallback";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const quickLocations = ["Akurdi", "Nigdi", "Pimpri", "Chinchwad", "Kothrud", "Baner", "Wakad", "Pune"];

export default function FindBlood() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bloodGroup, setBloodGroup] = useState(searchParams.get("group") || "A+");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});

  // Auto-search if group or location passed in query params
  useEffect(() => {
    const initialGroup = searchParams.get("group");
    const initialLoc = searchParams.get("location");
    if (initialGroup) setBloodGroup(initialGroup);
    if (initialLoc) setLocation(initialLoc);

    if (initialGroup && initialLoc) {
      triggerSearch(initialGroup, initialLoc);
    }
  }, [searchParams]);

  const triggerSearch = async (bg, loc) => {
    setError("");
    setSearched(true);
    setLoading(true);
    setDonors([]);
    setRequestStatus({});

    try {
      const response = await findBloodDonors(bg, loc.trim());
      setDonors(response.matches || []);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!bloodGroup) {
      setError("Please select a blood group.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter a locality or city to search.");
      return;
    }
    triggerSearch(bloodGroup, location);
  };

  const handleSendRequest = async (donor) => {
    let user;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch {
      user = null;
    }

    if (!user) {
      setRequestStatus((prev) => ({
        ...prev,
        [donor._id]: {
          type: "error",
          message: "Please sign in to send a connection request.",
        },
      }));
      return;
    }

    let providerId = donor.userId?._id || donor.userId?.id || donor.userId;
    if (typeof providerId === "string" && providerId.startsWith("org_")) {
      providerId = providerId.replace("org_", "");
    }

    if (!providerId) {
      setRequestStatus((prev) => ({
        ...prev,
        [donor._id]: {
          type: "error",
          message: "Incomplete donor profile.",
        },
      }));
      return;
    }

    setRequesting(donor._id);
    setRequestStatus((prev) => ({ ...prev, [donor._id]: null }));

    try {
      const isOrg = donor.isOrganization;
      const desc = isOrg
        ? `Urgent emergency blood request for ${donor.bloodGroup} at ${donor.organizationName || 'Center'}.`
        : `Urgent need: ${donor.bloodGroup} in ${location.trim()}.`;

      await sendConnectionRequest({
        providerId,
        type: "BLOOD",
        description: desc,
        location: location.trim(),
      });

      setRequestStatus((prev) => ({
        ...prev,
        [donor._id]: {
          type: "success",
          message: "Request submitted! The provider will be notified immediately.",
        },
      }));
    } catch (err) {
      setRequestStatus((prev) => ({
        ...prev,
        [donor._id]: {
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
            HERO: SPECIALIZED VISUAL BLOOD DISCOVERY
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#F2D5D8] aspect-16/9 sm:aspect-21/8 shadow-md">
          <ImageWithFallback
            src="/images/blood/blood-hero.jpg"
            alt="Medical blood bank and transfusion facility"
            aspectClassName="h-full w-full"
            priority
            overlay
            overlayClassName="bg-gradient-to-r from-black/85 via-black/60 to-black/75"
          >
            <div className="max-w-2xl text-white space-y-3 p-3 sm:p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C94C55] px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                <Droplets className="h-3.5 w-3.5" />
                Live Blood Registry
              </span>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Find available blood when every minute counts.
              </h1>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
                Instantly connect with nearby voluntary blood donors, accredited hospital reserves, and verified blood banks across the city.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/blood/donor")}
                  className="rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 px-4 py-2 text-xs font-bold text-white transition"
                >
                  Want to donate? Register here →
                </button>
              </div>
            </div>
          </ImageWithFallback>
        </section>

        {/* =========================================================
            SEARCH & BLOOD GROUP FILTER SECTION
        ========================================================= */}
        <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* Blood Group Visual Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[#24342E]">
                  1. Select Required Blood Group
                </label>
                <span className="text-[11px] text-[#6F7D76]">
                  Matching handles compatible universal donors automatically
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {bloodGroups.map((group) => {
                  const isSelected = bloodGroup === group;
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setBloodGroup(group)}
                      className={`flex flex-col items-center justify-center rounded-2xl py-3 px-2 border transition-all ${
                        isSelected
                          ? "bg-[#C94C55] text-white border-[#C94C55] shadow-xs scale-105"
                          : "bg-[#FAFCFB] text-[#24342E] border-[#E2E9E4] hover:border-[#C94C55]/40"
                      }`}
                    >
                      <span className="text-base font-extrabold">{group}</span>
                      <span className={`text-[9px] font-semibold mt-0.5 ${isSelected ? "text-white/80" : "text-[#8C9892]"}`}>
                        Group
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Input & Search Button */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24342E] mb-2">
                2. Enter City, Locality, or Hospital Area
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C9892]" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Akurdi, Pune, Nigdi, Pimpri, Kothrud"
                    className="h-12 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs font-medium text-[#24342E] outline-none focus:border-[#C94C55] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#C94C55] px-8 text-xs font-bold text-white shadow-xs transition hover:bg-[#B53D46] active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Scanning Network...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Search {bloodGroup} Blood</span>
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
                      triggerSearch(bloodGroup, loc);
                    }}
                    className="rounded-lg border border-[#EEF2EF] bg-[#F8FAF9] px-2.5 py-1 text-[11px] font-semibold text-[#55645E] hover:bg-white hover:border-[#C94C55]/40 transition"
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
            RESULTS: REAL DONOR & ORGANIZATION CARDS
        ========================================================= */}
        {searched && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#EEF2EF] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#24342E]">
                  Available Matches ({donors.length})
                </h2>
                <p className="text-xs text-[#6F7D76]">
                  Showing nearby verified donors and accredited healthcare centers for {bloodGroup} in {location}.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-[#6F7D76] space-y-3">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#C94C55]" />
                <p className="font-semibold text-[#24342E]">Scanning verified community donors and hospital blood banks...</p>
              </div>
            ) : donors.length === 0 ? (
              /* EMPTY STATE */
              <div className="rounded-3xl border border-[#E2E9E4] bg-white p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEAEC] text-[#C94C55]">
                  <Droplets className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-[#24342E]">No Direct Matches Found in {location}</h3>
                <p className="max-w-md mx-auto text-xs text-[#6F7D76] leading-relaxed">
                  We could not find active {bloodGroup} donors or blood banks in this immediate locality.
                  Try searching a broader district (e.g. "Pune") or register yourself to expand our community coverage.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLocation("Pune");
                      triggerSearch(bloodGroup, "Pune");
                    }}
                    className="rounded-xl border border-[#D8E4F2] bg-[#F7FAFD] px-4 py-2 text-xs font-bold text-[#4B78A8]"
                  >
                    Search Entire Pune Metro
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/blood/donor")}
                    className="rounded-xl bg-[#C94C55] px-4 py-2 text-xs font-bold text-white shadow-xs"
                  >
                    Become a Donor
                  </button>
                </div>
              </div>
            ) : (
              /* MATCHES GRID */
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {donors.map((donor) => {
                  const isOrg = donor.isOrganization;
                  const name = isOrg ? (donor.organizationName || donor.userId?.organizationName || donor.userId?.name) : (donor.userId?.name || "Community Donor");
                  const contact = donor.contact || donor.userId?.phone;
                  const reqStat = requestStatus[donor._id];
                  const isReq = requesting === donor._id;

                  return (
                    <div
                      key={donor._id}
                      className="flex flex-col justify-between rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs hover:shadow-xs transition"
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FBEAEC] text-base font-extrabold text-[#C94C55]">
                              {donor.bloodGroup}
                            </span>
                            <div>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                isOrg ? "bg-[#EAF1FA] text-[#4B78A8]" : "bg-[#EDF5EF] text-[#427A65]"
                              }`}>
                                {isOrg ? <Building2 className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                                {isOrg ? "Accredited Center" : "Community Donor"}
                              </span>
                              <h3 className="text-sm font-bold text-[#24342E] line-clamp-1 mt-0.5">
                                {name}
                              </h3>
                            </div>
                          </div>

                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                            Available
                          </span>
                        </div>

                        {/* Location & Details */}
                        <div className="mt-4 space-y-1.5 text-xs text-[#6F7D76] border-t border-[#EEF2EF] pt-3">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#8C9892] shrink-0" />
                            <span className="truncate">{donor.location || "Pune Area"}</span>
                          </div>

                          {isOrg && donor.availableUnits > 0 && (
                            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{donor.availableUnits} units currently in reserve</span>
                            </div>
                          )}
                        </div>

                        {/* Request Feedback toast */}
                        {reqStat && (
                          <div className={`mt-3 rounded-xl p-2.5 text-xs font-semibold ${
                            reqStat.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}>
                            {reqStat.message}
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="mt-5 pt-3 border-t border-[#EEF2EF] space-y-2">
                        {contact && (
                          <a
                            href={`tel:${contact}`}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            Direct Call: {contact}
                          </a>
                        )}

                        <button
                          type="button"
                          disabled={isReq}
                          onClick={() => handleSendRequest(donor)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#C94C55] py-2.5 text-xs font-bold text-white hover:bg-[#B53D46] transition disabled:opacity-50"
                        >
                          {isReq ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          <span>Send Emergency Request</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
