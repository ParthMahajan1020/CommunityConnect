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
      setMessage(response?.message || "Profile saved.");
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
      <div className="flex min-h-[40vh] items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#427A65]" />
          <span className="text-xs text-[#6F7D76]">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F8FAF9] px-4 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")}>
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between rounded-2xl border border-[#D5E7DB] bg-[#EDF7EF] px-4 py-2.5 text-xs font-medium text-[#356651]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
              <button onClick={() => setMessage("")}>
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Identity Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-[#E5F1EA] text-xl font-bold text-[#427A65] border border-[#CFE2D6] shadow-2xs">
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#427A65] text-white">
                  <ShieldCheck className="h-2.5 w-2.5" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-[#24342E] sm:text-2xl">
                    {formData.name || "Member"}
                  </h1>
                  <span className="rounded-full bg-[#E5F1EA] px-2 py-0.5 text-[10px] font-bold text-[#427A65]">
                    Verified
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#6F7D76]">{formData.email}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#7A8881]">
                  {formData.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#8C9892]" />
                      {formData.location}
                    </span>
                  )}
                  {formData.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-[#8C9892]" />
                      {formData.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Strength Gauge */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-[#EEF2EF] pt-3 sm:border-0 sm:pt-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A8881]">
                  Profile Strength
                </span>
                <span className="text-xs font-bold text-[#427A65]">
                  {completion}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-[#EAEFEA]">
                <div
                  className="h-full rounded-full bg-[#427A65] transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Edit / View Form */}
        <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#24342E]">
                Account Information
              </h2>
              <p className="text-[11px] text-[#6F7D76]">
                Keep contact details current for quick local connections
              </p>
            </div>
            {!editing && (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE9E0] bg-[#F8FAF9] px-3 py-1.5 text-xs font-semibold text-[#427A65] hover:bg-[#EEF5F0] transition"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!editing}
                  className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white disabled:bg-[#F6F8F6] disabled:text-[#7A8881]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                  Email Address (Protected)
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="h-10.5 w-full rounded-xl border border-[#E8EDE9] bg-[#F6F8F6] px-3.5 text-xs text-[#7A8881] outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="+91..."
                  className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white disabled:bg-[#F6F8F6] disabled:text-[#7A8881]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">
                  Location Area
                </label>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Area or city"
                  className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none transition focus:border-[#427A65] focus:bg-white disabled:bg-[#F6F8F6] disabled:text-[#7A8881]"
                />
              </div>
            </div>

            {editing && (
              <div className="mt-4 flex justify-end gap-2 border-t border-[#EEF2EF] pt-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-xl border border-[#E2E9E4] bg-white px-3.5 py-2 text-xs font-semibold text-[#6F7D76] transition hover:bg-[#F5F8F6]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#427A65] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651] disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </section>

        {/* Roles Quick Link Cards */}
        <section className="grid gap-3 sm:grid-cols-2">
          {/* Blood Donor Role */}
          <div className="flex items-center justify-between rounded-3xl border border-[#F2D5D8] bg-white p-4.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FBEAEC] text-[#C94C55]">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#24342E]">
                  Blood Donor Profile
                </h3>
                <p className="text-[11px] text-[#6F7D76]">
                  Manage blood group & availability
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/blood/donor")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#FBEAEC] text-[#C94C55] hover:bg-[#F7D5D9] transition"
              aria-label="Manage blood donor settings"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Service Provider Role */}
          <div className="flex items-center justify-between rounded-3xl border border-[#D8E4F2] bg-white p-4.5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#24342E]">
                  Service Provider Profile
                </h3>
                <p className="text-[11px] text-[#6F7D76]">
                  Manage offered skills & schedule
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/services/provider")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8] hover:bg-[#D8E7F7] transition"
              aria-label="Manage service provider settings"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}