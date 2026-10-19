import { useState } from "react";
import { motion } from "motion/react";
import {
  Droplets,
  MapPin,
  ShieldCheck,
  Send,
  Loader2,
  AlertCircle,
  Phone,
  Search,
  HeartHandshake,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { findBloodDonors, sendConnectionRequest } from "../services/api";
import {
  AnimatedBloodDrop,
  BloodCompatibilityIndicator,
  ScanningRadar,
} from "../components/visuals/BloodVisual";
import { EmptyStateVisual } from "../components/visuals/EmptyStateVisual";
import { useNavigate } from "react-router-dom";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const workflowSteps = [
  {
    step: "01",
    title: "Select Group",
    desc: "Pick required blood group and enter locality",
    icon: Droplets,
    badge: "Input",
    accent: "bg-[#FBEAEC] text-[#C94C55]",
  },
  {
    step: "02",
    title: "Radar Match",
    desc: "System scans compatible, verified donors nearby",
    icon: Search,
    badge: "Scan",
    accent: "bg-[#EAF1FA] text-[#4B78A8]",
  },
  {
    step: "03",
    title: "Direct Connect",
    desc: "Send connection request & get phone contact",
    icon: HeartHandshake,
    badge: "Connect",
    accent: "bg-[#E5F1EA] text-[#427A65]",
  },
];

export default function FindBlood() {
  const navigate = useNavigate();

  const [bloodGroup, setBloodGroup] = useState("");
  const [location, setLocation] = useState("");
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setSearched(true);

    if (!bloodGroup || !location.trim()) {
      setError("Select a blood group and enter location.");
      return;
    }

    setLoading(true);
    setDonors([]);
    setRequestStatus({});

    try {
      const response = await findBloodDonors(bloodGroup, location.trim());
      setDonors(response.matches || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Search failed. Try again in a moment."
      );
    } finally {
      setLoading(false);
    }
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
          message: "Please log in first.",
        },
      }));
      return;
    }

    const providerId =
      donor.userId?._id || donor.userId?.id || donor.userId;

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
      await sendConnectionRequest({
        providerId,
        type: "BLOOD",
        description: `Urgent need: ${donor.bloodGroup} in ${location.trim()}.`,
        location: location.trim(),
      });

      setRequestStatus((prev) => ({
        ...prev,
        [donor._id]: {
          type: "success",
          message: "Request sent successfully.",
        },
      }));
    } catch (err) {
      setRequestStatus((prev) => ({
        ...prev,
        [donor._id]: {
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
        <section className="relative overflow-hidden rounded-3xl border border-[#F2D5D8] bg-gradient-to-br from-white via-[#FCF9FA] to-[#FBEAEC] p-5 shadow-2xs sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#F0D5D8] bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#C94C55]">
                <Droplets className="h-3 w-3" />
                Blood Network
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#24342E] sm:text-3xl">
                Find Blood Donors
              </h1>
              <p className="mt-1 text-xs text-[#6F7D76]">
                Instant matching with verified local community donors.
              </p>
            </div>

            <div className="hidden sm:block shrink-0">
              <AnimatedBloodDrop size="md" pulse />
            </div>
          </div>
        </section>

        {/* Compact Search Card */}
        <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs sm:p-6">
          <form onSubmit={handleSearch}>
            {/* Blood Group Chips */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6F7D76]">
                  Select Blood Group
                </label>
                <span className="text-[11px] text-[#8C9892]">
                  {bloodGroup ? `Selected: ${bloodGroup}` : "Required"}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {bloodGroups.map((group) => {
                  const isSelected = bloodGroup === group;
                  return (
                    <button
                      key={group}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setBloodGroup(group);
                        setError("");
                      }}
                      className={`flex h-11 flex-col items-center justify-center rounded-2xl border text-xs font-bold transition-all duration-150 active:scale-95 ${
                        isSelected
                          ? "border-[#C94C55] bg-[#C94C55] text-white shadow-xs"
                          : "border-[#E2E9E4] bg-[#FBFCFB] text-[#24342E] hover:border-[#F0D5D8] hover:bg-[#FFF8F9]"
                      }`}
                    >
                      <span>{group}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blood Compatibility Guide */}
            {bloodGroup && (
              <div className="mt-3.5">
                <BloodCompatibilityIndicator selectedGroup={bloodGroup} />
              </div>
            )}

            {/* Location + Submit row */}
            <div className="mt-4 grid gap-2.5 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B9891]" />
                <input
                  id="blood-location"
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter neighborhood, locality or city..."
                  className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#C94C55] focus:bg-white focus:ring-2 focus:ring-[#C94C55]/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#C94C55] px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#B53D46] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    Find Donors
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-3.5 flex items-center gap-2 rounded-xl border border-[#F2D5D8] bg-[#FBEAEC] px-3.5 py-2.5 text-xs font-medium text-[#C94C55]"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </section>

        {/* RESULTS OR VISUAL INITIAL WORKFLOW */}
        {searched ? (
          <section className="pt-1">
            {loading ? (
              <ScanningRadar label="Scanning for matching blood donors nearby..." />
            ) : donors.length === 0 && !error ? (
              <div className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs sm:p-8">
                <EmptyStateVisual
                  type="blood"
                  title="No registered donors found in this locality"
                  actionLabel="Register as a donor"
                  onAction={() => navigate("/blood/donor")}
                />
              </div>
            ) : (
              <div>
                <div className="mb-3.5 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#24342E]">
                    Available Donors ({donors.length})
                  </h2>
                  <span className="text-[11px] text-[#6F7D76]">Local & Verified</span>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                  {donors.map((donor) => {
                    const status = requestStatus[donor._id];
                    const isAvailable = donor.availability;

                    return (
                      <motion.article
                        key={donor._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex flex-col justify-between rounded-3xl border border-[#E2E9E4] bg-white p-4.5 shadow-2xs transition hover:border-[#F0D5D8] hover:shadow-xs"
                      >
                        {/* Top Group & Badge */}
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FBEAEC] text-base font-bold text-[#C94C55]">
                                {donor.bloodGroup}
                              </span>
                              <div>
                                <h3 className="text-xs font-semibold text-[#24342E]">
                                  {donor.userId?.name || "Community Donor"}
                                </h3>
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isAvailable ? "bg-[#427A65]" : "bg-gray-300"
                                    }`}
                                  />
                                  <span className="text-[10px] font-medium text-[#6F7D76]">
                                    {isAvailable ? "Available" : "Unavailable"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <span className="inline-flex items-center gap-1 rounded-full bg-[#E5F1EA] px-2 py-0.5 text-[10px] font-semibold text-[#427A65]">
                              <ShieldCheck className="h-3 w-3" />
                              Verified
                            </span>
                          </div>

                          {/* Info chips */}
                          <div className="mt-3 space-y-1 border-t border-[#EEF2EF] pt-2.5 text-xs text-[#6F7D76]">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#8C9993]" />
                              <span className="truncate">{donor.location || "Location not set"}</span>
                            </div>
                            {(donor.contact || donor.userId?.phone) && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-[#8C9993]" />
                                <span className="truncate">{donor.contact || donor.userId?.phone}</span>
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
                                  : "border border-[#F0D1D5] bg-[#FBEAEC] text-[#A63843]"
                              }`}
                            >
                              {status.message}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSendRequest(donor)}
                            disabled={requesting === donor._id || !isAvailable}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#24342E] px-4 text-xs font-semibold text-white transition hover:bg-[#34463D] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {requesting === donor._id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Sending...
                              </>
                            ) : !isAvailable ? (
                              "Unavailable"
                            ) : (
                              <>
                                Send Request
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
          /* =======================================================
             VISUAL CONTENT WHEN NO SEARCH PERFORMED YET (Prevents Empty Page)
             ======================================================= */
          <div className="space-y-5">
            {/* 3-Step Visual Process: How Matching Works */}
            <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C94C55]">
                    Process
                  </span>
                  <h2 className="text-sm font-bold text-[#24342E]">
                    How matching works
                  </h2>
                </div>
                <span className="text-[11px] text-[#8C9892]">3 simple steps</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {workflowSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.step}
                      className="group relative flex flex-col justify-between rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4 transition hover:border-[#F2D5D8] hover:bg-white"
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
                        <span>Verified Community Step</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Quick Emergency Reference Cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Universal Donor Card */}
              <div className="flex items-center justify-between rounded-3xl border border-[#F2D5D8] bg-gradient-to-r from-white to-[#FFF5F6] p-4.5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C94C55] text-sm font-bold text-white shadow-2xs">
                    O-
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#24342E]">
                      Universal Red Cell Donor
                    </h3>
                    <p className="text-[11px] text-[#6F7D76]">
                      Can donate red blood cells to any recipient
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBloodGroup("O-");
                    setError("");
                  }}
                  className="rounded-xl border border-[#F0D5D8] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#C94C55] transition hover:bg-[#FBEAEC]"
                >
                  Select O-
                </button>
              </div>

              {/* Become Donor Prompt Card */}
              <div className="flex items-center justify-between rounded-3xl border border-[#D5E7DB] bg-gradient-to-r from-white to-[#F2F8F4] p-4.5 shadow-2xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#427A65] text-white shadow-2xs">
                    <Activity className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#24342E]">
                      Are you healthy to donate?
                    </h3>
                    <p className="text-[11px] text-[#6F7D76]">
                      Join the neighborhood donor registry
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/blood/donor")}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#427A65] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#356651]"
                >
                  Join
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}