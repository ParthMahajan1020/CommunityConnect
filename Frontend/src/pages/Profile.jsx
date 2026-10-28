import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone,
  MapPin,
  Edit3,
  X,
  ShieldCheck,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Droplets,
  Wrench,
  ArrowRight,
  User,
  Mail,
  Sparkles,
  Inbox
} from "lucide-react";
import { getProfile, updateProfile } from "../services/api";
import { useNavigate } from "react-router-dom";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  location: "",
};

export default function Profile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_PROFILE);
  const [originalData, setOriginalData] = useState(EMPTY_PROFILE);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const response = await getProfile();
        const user = response?.user;

        if (!user) throw new Error("Could not retrieve user info.");

        const profileData = {
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          location: user.location || "",
        };

        if (cancelled) return;
        setFormData(profileData);
        setOriginalData(profileData);
      } catch (err) {
        if (cancelled) return;
        setError(
          err?.response?.data?.message || "Failed to load profile."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (message) setMessage("");
  };

  const handleEdit = () => {
    setError("");
    setMessage("");
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setEditing(false);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const location = formData.location.trim();

    if (!name) {
      setError("Please enter your name.");
      return;
    }
    if (phone && !/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!location) {
      setError("Please enter your location.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const updatedProfile = { name, phone, location };
      const response = await updateProfile(updatedProfile);

      const savedData = { ...formData, ...updatedProfile };
      setFormData(savedData);
      setOriginalData(savedData);
      setEditing(false);
      setMessage(response?.message || "Profile updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const initials = useMemo(() => {
    const name = formData.name.trim();
    if (!name) return "CC";
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase();
  }, [formData.name]);

  const completion = useMemo(() => {
    const fields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.location,
    ];
    const completed = fields.filter((f) => f?.trim()).length;
    return Math.round((completed / fields.length) * 100);
  }, [formData]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#427A65]" />
          <span className="text-xs font-semibold text-[#6F7D76]">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F8FAF9] min-h-screen">
      {/* =========================================================
          DARK HERO HEADER
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#121815] text-white pt-24 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#427A65] blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#2A4438] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-[11px] font-bold text-[#8AD4B2] backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Community Account</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Personal <span className="text-[#8AD4B2]">Space.</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/70 max-w-md leading-relaxed">
                Manage personal credentials, direct mutual phone contacts, and your active community volunteering roles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/requests")}
              className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-5 text-xs font-bold text-white shadow-xs transition backdrop-blur-md sm:self-auto"
            >
              <Inbox className="h-4 w-4 text-[#8AD4B2]" />
              <span>My Requests Hub</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-70" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT CARDS
      ========================================================= */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 -mt-6 sm:-mt-8 space-y-6 pb-20 relative z-10">
        
        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")} aria-label="Dismiss alert">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="status"
              className="flex items-center justify-between rounded-2xl border border-[#D5E7DB] bg-[#EDF7EF] px-4 py-3 text-xs font-medium text-[#356651] shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#427A65]" />
                <span>{message}</span>
              </div>
              <button onClick={() => setMessage("")} aria-label="Dismiss message">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================
            CARD 1: IDENTITY HERO & COMPLETION
        ========================================================= */}
        <div className="rounded-[2.5rem] border border-[#E2E9E4] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-[#E5F1EA] to-[#CFE2D6] text-2xl font-black text-[#427A65] border border-[#BBD5C5] shadow-xs">
                {initials}
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#427A65] text-white shadow-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-[#18231E]">
                    {formData.name || "Member"}
                  </h2>
                  <span className="rounded-full bg-[#E5F1EA] px-2.5 py-0.5 text-[10px] font-bold text-[#427A65]">
                    Active Member
                  </span>
                </div>
                
                <p className="mt-0.5 text-xs text-[#6F7D76] font-medium">{formData.email}</p>
                
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#6F7D76]">
                  {formData.location && (
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-[#427A65]" />
                      {formData.location}
                    </span>
                  )}
                  {formData.phone && (
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Phone className="h-3.5 w-3.5 text-[#427A65]" />
                      {formData.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Gauge & Edit Toggle */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between border-t border-[#EEF2EF] pt-4 sm:border-0 sm:pt-0 gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A8881]">
                  Profile Strength
                </span>
                <span className="text-sm font-black text-[#427A65]">
                  {completion}%
                </span>
              </div>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-[#EAEFEA]">
                <div
                  className="h-full rounded-full bg-[#427A65] transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 rounded-full border border-[#DCE9E0] bg-[#F8FAF9] px-4 py-2 text-xs font-bold text-[#427A65] hover:bg-[#EEF5F0] transition shadow-2xs"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================
            CARD 2: ACCOUNT INFORMATION (VIEW / EDIT)
        ========================================================= */}
        <div className="rounded-[2.5rem] border border-[#E2E9E4] bg-white p-6 sm:p-8 shadow-xs">
          <div className="mb-6 flex items-center justify-between border-b border-[#F0F4F2] pb-4">
            <div>
              <h3 className="text-base font-black text-[#18231E]">
                Account Information
              </h3>
              <p className="text-xs text-[#6F7D76]">
                Your direct neighborhood contact information used for accepted requests
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#427A65]">
                  <User className="h-3.5 w-3.5" />
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Your full legal name"
                  className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-4 text-xs font-semibold text-[#18231E] outline-none transition focus:border-[#427A65] focus:bg-white disabled:bg-[#F6F8F6] disabled:text-[#6F7D76]"
                />
              </div>

              {/* Email (Protected) */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-bold text-[#6F7D76]">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email Address
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#7A8881] bg-[#EEF2EF] px-2 py-0.5 rounded-full">
                    Protected
                  </span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-11 w-full rounded-2xl border border-[#E8EDE9] bg-[#F6F8F6] px-4 text-xs font-medium text-[#7A8881] outline-none cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#427A65]">
                  <Phone className="h-3.5 w-3.5" />
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="+91 98765 43210"
                  className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-4 text-xs font-semibold text-[#18231E] outline-none transition focus:border-[#427A65] focus:bg-white disabled:bg-[#F6F8F6] disabled:text-[#6F7D76]"
                />
              </div>

              {/* Location */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#427A65]">
                  <MapPin className="h-3.5 w-3.5" />
                  Location Area
                </label>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="e.g. Akurdi, Pune"
                  className="h-11 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] px-4 text-xs font-semibold text-[#18231E] outline-none transition focus:border-[#427A65] focus:bg-white disabled:bg-[#F6F8F6] disabled:text-[#6F7D76]"
                />
              </div>
            </div>

            {editing && (
              <div className="flex items-center justify-end gap-3 border-t border-[#EEF2EF] pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-full border border-[#E2E9E4] bg-white px-5 py-2.5 text-xs font-bold text-[#6F7D76] transition hover:bg-[#F5F8F6]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#427A65] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#356651] disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* =========================================================
            CARD 3: COMMUNITY ROLES & ENGAGEMENTS
        ========================================================= */}
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Blood Donor Role */}
          <div className="flex flex-col justify-between rounded-[2.5rem] border border-[#F2D5D8] bg-white p-6 sm:p-7 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBEAEC] text-[#C94C55]">
                  <Droplets className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-[#FBEAEC] px-3 py-1 text-[10px] font-bold text-[#C94C55]">
                  Emergency Network
                </span>
              </div>

              <h4 className="text-base font-black text-[#18231E]">
                Blood Donor Profile
              </h4>
              <p className="mt-1 text-xs text-[#6F7D76] leading-relaxed">
                Toggle immediate emergency availability, update your blood group, or pause donation requests when unavailable.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#FAEAEC]">
              <button
                type="button"
                onClick={() => navigate("/blood/donor")}
                className="w-full inline-flex items-center justify-between rounded-2xl bg-[#FBEAEC] hover:bg-[#F7D5D9] px-4 py-3 text-xs font-bold text-[#C94C55] transition"
              >
                <span>Manage Donor Settings</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Service Provider Role */}
          <div className="flex flex-col justify-between rounded-[2.5rem] border border-[#D8E4F2] bg-white p-6 sm:p-7 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                  <Wrench className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-[#EAF1FA] px-3 py-1 text-[10px] font-bold text-[#4B78A8]">
                  Community Marketplace
                </span>
              </div>

              <h4 className="text-base font-black text-[#18231E]">
                Service Provider Profile
              </h4>
              <p className="mt-1 text-xs text-[#6F7D76] leading-relaxed">
                List offered household skills, manage your direct hourly or visit pricing, and pause new incoming bookings.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EEF4FB]">
              <button
                type="button"
                onClick={() => navigate("/services/provider")}
                className="w-full inline-flex items-center justify-between rounded-2xl bg-[#EAF1FA] hover:bg-[#D8E7F7] px-4 py-3 text-xs font-bold text-[#4B78A8] transition"
              >
                <span>Manage Provider Settings</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            CARD 4: TRUST & PRIVACY GUARANTEES
        ========================================================= */}
        <div className="rounded-[2.5rem] border border-[#E2E9E4] bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-[#427A65]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#18231E]">
              Community Safety & Data Integrity
            </h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-xs text-[#6F7D76]">
            <div className="rounded-2xl border border-[#EEF2EF] bg-[#F8FAF9] p-4">
              <p className="font-bold text-[#18231E] mb-1">Direct Phone Contact</p>
              <p className="text-[11px] leading-relaxed">
                Your direct mobile number is revealed only to a requester after you mutually accept a connection.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EEF2EF] bg-[#F8FAF9] p-4">
              <p className="font-bold text-[#18231E] mb-1">0% Hidden Charges</p>
              <p className="text-[11px] leading-relaxed">
                CommunityConnect does not take commission cuts or broker fees on any local service or donation.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EEF2EF] bg-[#F8FAF9] p-4">
              <p className="font-bold text-[#18231E] mb-1">Instant Availability Control</p>
              <p className="text-[11px] leading-relaxed">
                You can pause donor or provider requests anytime with 1 click from your respective dashboards.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
