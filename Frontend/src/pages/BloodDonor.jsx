import { useEffect, useState } from "react";
import {
  MapPin,
  ShieldCheck,
  AlertCircle,
  Loader2,
  HeartHandshake,
  CheckCircle2,
  Heart,
  Activity,
  Clock,
  UserCheck
} from "lucide-react";
import {
  registerBloodDonor,
  getMyDonorProfile,
  toggleDonorAvailability,
  getProfile,
} from "../services/api";
import ImageWithFallback from "../components/ui/ImageWithFallback";

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
    if (!formData.bloodGroup) {
      setError("Please select your blood group.");
      return;
    }
    if (!formData.location.trim()) {
      setError("Please enter your current location.");
      return;
    }
    if (!formData.hasReportLater && !formData.reportDocument.trim()) {
      setError("Please provide a lab report link or choose 'Submit report later'.");
      return;
    }

    setRegistering(true);
    setError("");
    setMessage("");

    try {
      const res = await registerBloodDonor(formData);
      setExistingDonor(res.donor);
      setMessage(res.message || "Donor registration successful! Thank you for offering help.");
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
          <Loader2 className="h-8 w-8 animate-spin text-[#C94C55]" />
          <span>Loading donor profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#24342E]">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        
        {/* =========================================================
            1. HERO: WHY DONATE BLOOD (Visual Storytelling)
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#F2D5D8] aspect-16/9 sm:aspect-21/8 shadow-md">
          <ImageWithFallback
            src="/images/blood/blood-donor.jpg"
            alt="Compassionate blood donor giving life-saving blood"
            priority
            aspectClassName="h-full w-full"
            overlay
            overlayClassName="bg-gradient-to-r from-black/85 via-black/60 to-black/75"
          >
            <div className="max-w-2xl text-white space-y-3 p-3 sm:p-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C94C55] px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                <HeartHandshake className="h-3.5 w-3.5" />
                Community Lifeline
              </span>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                One donation can save up to three lives.
              </h1>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
                Join our network of voluntary community donors. When a nearby hospital patient or accident victim needs blood, you’ll be notified directly.
              </p>
            </div>
          </ImageWithFallback>
        </section>

        {/* =========================================================
            2. VISUAL CARDS: WHY YOUR DONATION MATTERS
        ========================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C94C55]">
              Why Donate
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24342E]">
              Why Your Contribution Matters
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-3xl border border-[#F2D5D8] bg-white p-6 shadow-2xs space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FBEAEC] text-[#C94C55]">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#24342E]">Emergency Surge Defense</h3>
              <p className="text-xs leading-relaxed text-[#6F7D76]">
                Accidents, trauma cases, and complex surgeries depend on immediate blood availability within the golden hour.
              </p>
            </div>

            <div className="rounded-3xl border border-[#D8E4F2] bg-white p-6 shadow-2xs space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#24342E]">Thalassemia & Cancer Care</h3>
              <p className="text-xs leading-relaxed text-[#6F7D76]">
                Patients fighting chronic blood disorders and chemotherapy need regular, verified blood and platelet transfusions.
              </p>
            </div>

            <div className="rounded-3xl border border-[#D5E7DB] bg-white p-6 shadow-2xs space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[#24342E]">100% Free & Voluntary</h3>
              <p className="text-xs leading-relaxed text-[#6F7D76]">
                Commercial blood sales are strictly illegal. Our platform operates entirely on voluntary, compassionate community spirit.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. WHO CAN DONATE & HOW IT WORKS
        ========================================================= */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* Eligibility Criteria */}
          <div className="rounded-3xl border border-[#E2E9E4] bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF5EF] text-[#427A65]">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#24342E]">Who Can Donate?</h3>
            </div>

            <p className="text-xs text-[#6F7D76]">
              Standard clinical guidelines ensure blood donation is completely safe for both donor and recipient:
            </p>

            <ul className="space-y-3 text-xs text-[#24342E] pt-2">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>Age between <strong>18 and 65 years</strong> in good overall health.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>Body weight of at least <strong>45 kg or more</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>Normal blood pressure, pulse, and hemoglobin level (≥ 12.5 g/dL).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>At least <strong>3 months</strong> since your last whole blood donation.</span>
              </li>
            </ul>
          </div>

          {/* How It Works Steps */}
          <div className="rounded-3xl border border-[#E2E9E4] bg-white p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBEAEC] text-[#C94C55]">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#24342E]">How the Process Works</h3>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 text-xs">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FBEAEC] font-bold text-[#C94C55]">1</span>
                <div>
                  <p className="font-bold text-[#24342E]">Register Your Blood Group</p>
                  <p className="text-[11px] text-[#6F7D76]">Select group and locality below so seekers nearby can reach you.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF1FA] font-bold text-[#4B78A8]">2</span>
                <div>
                  <p className="font-bold text-[#24342E]">Receive Emergency Inquiries</p>
                  <p className="text-[11px] text-[#6F7D76]">When someone needs your blood group nearby, review their connection request.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E5F1EA] font-bold text-[#427A65]">3</span>
                <div>
                  <p className="font-bold text-[#24342E]">Donate at Accredited Blood Bank</p>
                  <p className="text-[11px] text-[#6F7D76]">Visit the licensed hospital or blood center for screening and safe donation.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. DONOR STATUS OR REGISTRATION FORM
        ========================================================= */}
        <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b border-[#EEF2EF] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C94C55]">
              {existingDonor ? "Donor Dashboard" : "Register as Donor"}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#24342E] mt-1">
              {existingDonor ? "Your Blood Donor Profile" : "Register as a Community Blood Donor"}
            </h2>
            <p className="text-xs text-[#6F7D76] mt-1">
              {existingDonor
                ? "Manage your live availability and location so emergency seekers can connect."
                : "Enter your blood group, coverage area, and availability status to become a donor."}
            </p>
          </div>

          {/* Feedbacks */}
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

          {/* Active Donor Toggle Card */}
          {existingDonor && (
            <div className="rounded-2xl border border-[#EEF2EF] bg-[#F8FAF9] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBEAEC] text-lg font-black text-[#C94C55]">
                  {existingDonor.bloodGroup}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#24342E]">Live Donor Status</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      formData.availability ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"
                    }`}>
                      {formData.availability ? "Available to Donate" : "Currently Paused"}
                    </span>
                  </div>
                  <p className="text-xs text-[#6F7D76] mt-0.5">
                    Location: {existingDonor.location} • Status: {existingDonor.verificationStatus || "Active"}
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
                    : "bg-[#427A65] text-white hover:bg-[#356651]"
                }`}
              >
                {toggling ? "Updating..." : formData.availability ? "Pause Availability" : "Activate as Available"}
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Blood Group Radio Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24342E] mb-2">
                Blood Group
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {bloodGroups.map((group) => {
                  const isSelected = formData.bloodGroup === group;
                  return (
                    <button
                      key={group}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, bloodGroup: group }))}
                      className={`flex flex-col items-center justify-center rounded-2xl py-2.5 px-2 border transition-all ${
                        isSelected
                          ? "bg-[#C94C55] text-white border-[#C94C55] shadow-xs scale-105"
                          : "bg-[#FAFCFB] text-[#24342E] border-[#E2E9E4] hover:border-[#C94C55]/40"
                      }`}
                    >
                      <span className="font-extrabold text-sm">{group}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24342E] mb-1.5">
                City / Operating Locality
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
                  className="h-11 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs font-medium text-[#24342E] outline-none focus:border-[#C94C55] focus:bg-white"
                />
              </div>
            </div>

            {/* Medical / Lab Verification Document */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#24342E]">
                Blood Group Medical Verification
              </label>
              
              <input
                type="text"
                name="reportDocument"
                value={formData.reportDocument}
                onChange={handleChange}
                disabled={formData.hasReportLater}
                placeholder="Link to blood test report / ID card / medical certificate"
                className="h-11 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#C94C55] disabled:opacity-50"
              />

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="hasReportLater"
                  checked={formData.hasReportLater}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-[#E2E9E4] text-[#C94C55] focus:ring-[#C94C55]"
                />
                <span className="text-xs text-[#6F7D76]">
                  I don't have my report document link right now (submit for verification later)
                </span>
              </label>
            </div>

            {/* Submit CTA */}
            <div className="pt-3 border-t border-[#EEF2EF] flex justify-end">
              <button
                type="submit"
                disabled={registering}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#C94C55] px-8 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#B53D46] active:scale-98 disabled:opacity-60"
              >
                {registering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <HeartHandshake className="h-4 w-4" />
                    <span>{existingDonor ? "Update Donor Information" : "Complete Donor Registration"}</span>
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
