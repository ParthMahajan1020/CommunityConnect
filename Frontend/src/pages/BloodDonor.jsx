import { useEffect, useState } from "react";
import {
  MapPin,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Heart,
  Radio,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import {
  registerBloodDonor,
  getMyDonorProfile,
  toggleDonorAvailability,
  getProfile,
} from "../services/api";
import { AnimatedBloodDrop } from "../components/visuals/BloodVisual";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function BloodDonor() {
  const [formData, setFormData] = useState({
    bloodGroup: "",
    location: "",
    availability: true,
    reportDocument: "",
    hasReportLater: false,
  });

  const [existingDonor, setExistingDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [profileRes, donorRes] = await Promise.all([
          getProfile(),
          getMyDonorProfile().catch(() => ({ donor: null })),
        ]);

        if (!active) return;

        const user = profileRes.user;
        const donor = donorRes?.donor;

        if (donor) {
          setExistingDonor(donor);
          setFormData({
            bloodGroup: donor.bloodGroup || "",
            location: donor.location || user?.location || "",
            availability: donor.availability !== undefined ? donor.availability : true,
            reportDocument: donor.reportDocument || "",
            hasReportLater: donor.hasReportLater || false,
          });
        } else {
          setFormData((prev) => ({
            ...prev,
            location: user?.location || "",
          }));
        }
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || "Failed to load donor profile.");
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
    if (!existingDonor || toggling) return;
    setToggling(true);
    try {
      const res = await toggleDonorAvailability();
      setExistingDonor(res.donor);
      setFormData((prev) => ({ ...prev, availability: res.donor.availability }));
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

    if (!formData.bloodGroup || !formData.location.trim()) {
      setError("Please select blood group and location.");
      return;
    }

    if (!formData.reportDocument.trim() && !formData.hasReportLater) {
      setError(
        "Please provide a blood report link/reference or check 'I will upload my blood report later'."
      );
      return;
    }

    setRegistering(true);

    try {
      const response = await registerBloodDonor({
        bloodGroup: formData.bloodGroup,
        location: formData.location.trim(),
        availability: formData.availability,
        reportDocument: formData.reportDocument.trim(),
        hasReportLater: formData.hasReportLater,
      });

      setExistingDonor(response.donor);
      setMessage(response.message || "Blood donor profile registered successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to register as a donor."
      );
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#C94C55]" />
          <span className="text-xs text-[#6F7D76]">Loading donor profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F8FAF9] px-4 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-[#F2D5D8] bg-gradient-to-br from-white via-[#FCF9FA] to-[#FBEAEC] p-5 shadow-2xs sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#F0D5D8] bg-white px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#C94C55]">
                <Heart className="h-3 w-3 fill-[#C94C55]" />
                Peer Donor Registry
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#24342E] sm:text-3xl">
                Donate Blood
              </h1>
              <p className="mt-1 text-xs text-[#6F7D76]">
                Make yourself discoverable to nearby neighbors in critical emergencies.
              </p>
            </div>

            <div className="hidden sm:block shrink-0">
              <AnimatedBloodDrop size="md" pulse />
            </div>
          </div>
        </section>

        {/* Existing Donor Status Badge */}
        {existingDonor && (
          <div className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBEAEC] text-lg font-bold text-[#C94C55]">
                {existingDonor.bloodGroup}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#24342E]">Registered Community Donor</h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      existingDonor.verificationStatus === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {existingDonor.verificationStatus === "VERIFIED" ? (
                      <>
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        Report Verified
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-3 w-3 text-amber-600" />
                        Report Pending
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-[#6F7D76] mt-0.5">
                  Location: {existingDonor.location} • Status:{" "}
                  <strong>{existingDonor.availability ? "Active" : "Paused"}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={toggling}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  existingDonor.availability
                    ? "bg-[#24342E] text-white hover:bg-[#34463D]"
                    : "bg-[#427A65] text-white hover:bg-[#356651]"
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                {toggling
                  ? "Updating..."
                  : existingDonor.availability
                  ? "Pause Availability"
                  : "Activate Availability"}
              </button>
            </div>
          </div>
        )}

        {/* Form and Impact Columns */}
        <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs sm:p-6">
            <h2 className="text-base font-bold text-[#24342E] mb-4">
              {existingDonor ? "Update Donor Information" : "Register as a Blood Donor"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Blood Group selection */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#6F7D76]">
                  Blood Group *
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((group) => {
                    const isSelected = formData.bloodGroup === group;
                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            bloodGroup: group,
                          }))
                        }
                        className={`flex h-11 items-center justify-center rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
                          isSelected
                            ? "border-[#C94C55] bg-[#C94C55] text-white shadow-xs"
                            : "border-[#E2E9E4] bg-[#FBFCFB] text-[#24342E] hover:border-[#F0D5D8]"
                        }`}
                      >
                        {group}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Input */}
              <div>
                <label
                  htmlFor="donor-location"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6F7D76]"
                >
                  Locality / Neighborhood *
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B9891]" />
                  <input
                    id="donor-location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Akurdi, Pune"
                    required
                    className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none transition focus:border-[#C94C55] focus:bg-white focus:ring-2 focus:ring-[#C94C55]/10"
                  />
                </div>
              </div>

              {/* Blood Report Verification Field */}
              <div className="rounded-2xl border border-[#EEF2EF] bg-[#FAFBFA] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#24342E]">
                    Blood Test Report
                  </label>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      formData.reportDocument
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {formData.reportDocument ? "Will be marked Verified" : "Unverified"}
                  </span>
                </div>

                <div>
                  <input
                    name="reportDocument"
                    type="text"
                    value={formData.reportDocument}
                    onChange={handleChange}
                    disabled={formData.hasReportLater}
                    placeholder="Link or reference to medical blood group report (e.g. Google Drive, Lab ID)"
                    className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-white px-3 text-xs text-[#24342E] outline-none focus:border-[#C94C55] disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#6F7D76]">
                  <input
                    type="checkbox"
                    name="hasReportLater"
                    checked={formData.hasReportLater}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded text-[#C94C55] focus:ring-[#C94C55]"
                  />
                  <span>
                    <strong>I don't have a blood report yet</strong> — I will verify and upload it later. (Note: Unverified donors are clearly marked in matching search).
                  </span>
                </label>
              </div>

              {/* Availability Switch */}
              <div className="flex items-center justify-between rounded-2xl border border-[#E2E9E4] bg-[#FAFBFA] p-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      formData.availability
                        ? "bg-[#E5F1EA] text-[#427A65]"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#24342E]">
                      Live Donor Availability
                    </p>
                    <p className="text-[11px] text-[#6F7D76]">
                      {formData.availability ? "Active on emergency network" : "Paused"}
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
                    formData.availability ? "bg-[#427A65]" : "bg-[#CBD3CE]"
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
                  className="flex items-center gap-2 rounded-xl border border-[#F2D5D8] bg-[#FBEAEC] px-3.5 py-2.5 text-xs font-medium text-[#C94C55]"
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
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#C94C55] px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#B53D46] disabled:opacity-60"
              >
                {registering ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving Donor Profile...
                  </>
                ) : (
                  <>
                    {existingDonor ? "Save Updated Donor Profile" : "Confirm Donor Registration"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Visual Neighborhood Impact Card */}
          <aside className="flex flex-col justify-between rounded-3xl border border-[#E2E9E4] bg-gradient-to-br from-[#24342E] to-[#1B2923] p-5 text-white shadow-2xs sm:p-6">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#F2A1A7]">
                <Heart className="h-4 w-4 fill-[#F2A1A7]" />
              </div>

              <h3 className="mt-4 text-lg font-bold leading-tight">
                Peer Donor Safety Standard
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/70">
                CommunityConnect verifies donors to ensure seekers receive safe, timely assistance during critical moments.
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-2.5 rounded-2xl bg-white/5 p-3 text-xs text-white/80 border border-white/10">
                  <ShieldCheck className="h-4 w-4 text-[#75C89F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Verified Donors</span>
                    <p className="text-[11px] text-white/60">Upload medical proof to receive a Verified badge on search results.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-2xl bg-white/5 p-3 text-xs text-white/80 border border-white/10">
                  <ShieldAlert className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Unverified Option</span>
                    <p className="text-[11px] text-white/60">You may register now and verify later without blocking community registration.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
              <p className="text-[11px] text-white/60">
                Contact information is never publicly indexed; it is shared only when you accept a request.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
