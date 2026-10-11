import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Edit3,
  X,
  ShieldCheck,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  CircleUserRound,
} from "lucide-react";

import { getProfile, updateProfile } from "../services/api";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  location: "",
};

function ProfileField({
  label,
  name,
  value,
  icon: Icon,
  editing,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
  helperText,
}) {
  const isDisabled = !editing || disabled;

  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[#34473D]"
      >
        {label}
      </label>

      <div
        className={`flex min-h-[52px] items-center gap-3 rounded-xl border px-3.5 transition duration-200 sm:px-4 ${
          isDisabled
            ? "border-[#E8EDE9] bg-[#F7F9F7]"
            : "border-[#C8D9CE] bg-white focus-within:border-[#427A65] focus-within:ring-4 focus-within:ring-[#427A65]/10"
        }`}
      >
        <Icon
          size={18}
          strokeWidth={1.8}
          className={`shrink-0 ${
            isDisabled ? "text-[#94A198]" : "text-[#427A65]"
          }`}
        />

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          placeholder={placeholder}
          autoComplete={
            name === "name"
              ? "name"
              : name === "email"
                ? "email"
                : name === "phone"
                  ? "tel"
                  : "address-level2"
          }
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#24342E] outline-none placeholder:text-[#A0AAA3] disabled:cursor-default disabled:text-[#64736B]"
        />
      </div>

      {helperText && (
        <p className="mt-2 text-xs leading-5 text-[#89958D]">
          {helperText}
        </p>
      )}
    </div>
  );
}

function Notice({ type, message, onDismiss }) {
  if (!message) return null;

  const success = type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      role={success ? "status" : "alert"}
      className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      <Icon size={19} className="mt-0.5 shrink-0" />

      <p className="flex-1 text-sm leading-6">{message}</p>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-md p-1 transition hover:bg-black/5"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

function Profile() {
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

        if (!user) {
          throw new Error("Unable to retrieve your profile information.");
        }

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
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load your profile. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setMessage("");
    setError("");
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setEditing(false);
    setMessage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (formData.phone.trim() && !/^[+]?[\d\s()-]{7,20}$/.test(formData.phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter your location.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updatedProfile = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
      };

      const response = await updateProfile(updatedProfile);

      const savedData = {
        ...formData,
        ...updatedProfile,
      };

      setFormData(savedData);
      setOriginalData(savedData);
      setEditing(false);

      setMessage(
        response?.message || "Your profile has been updated successfully."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const initials = useMemo(() => {
    if (!formData.name.trim()) return "CC";

    return formData.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0))
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

    const completed = fields.filter((field) => field?.trim()).length;

    return Math.round((completed / fields.length) * 100);
  }, [formData]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F8FAF9] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DCE8DF] bg-white">
            <Loader2
              size={24}
              className="animate-spin text-[#427A65]"
            />
          </div>

          <p className="text-sm text-[#718078]">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8 sm:mb-10"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DCE8DF] bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-[#427A65]">
            <UserRound size={14} />
            YOUR ACCOUNT
          </div>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#24342E] sm:text-4xl">
                My profile<span className="text-[#427A65]">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#718078] sm:text-base">
                Manage your personal information and keep your
                CommunityConnect account up to date.
              </p>
            </div>

            {!editing && (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#427A65] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#356650] focus:outline-none focus:ring-4 focus:ring-[#427A65]/20 sm:self-auto"
              >
                <Edit3 size={16} />
                Edit profile
              </button>
            )}
          </div>
        </motion.header>

        {/* Notifications */}
        <AnimatePresence mode="wait">
          {error && (
            <Notice
              key="error"
              type="error"
              message={error}
              onDismiss={() => setError("")}
            />
          )}

          {!error && message && (
            <Notice
              key="success"
              type="success"
              message={message}
              onDismiss={() => setMessage("")}
            />
          )}
        </AnimatePresence>

        {/* Main layout */}
        <div className="grid items-start gap-6 lg:grid-cols-[0.8fr_1.5fr]">
          {/* Profile overview */}
          <motion.aside
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="overflow-hidden rounded-2xl border border-[#E2E9E4] bg-white"
          >
            <div className="h-2 bg-[#427A65]" />

            <div className="p-5 sm:p-7">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-[#D6E6DB] bg-[#E5F1EA] text-3xl font-semibold tracking-tight text-[#427A65]">
                  {initials}
                </div>

                <h2 className="mt-5 break-words text-xl font-semibold text-[#24342E]">
                  {formData.name || "Community member"}
                </h2>

                <p className="mt-1 break-all text-sm text-[#87938C]">
                  {formData.email || "No email available"}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F0F6F1] px-3 py-1.5 text-xs font-medium text-[#427A65]">
                  <ShieldCheck size={14} />
                  Community member
                </div>
              </div>

              {/* Completion */}
              <div className="mt-8 border-t border-[#EAF0EC] pt-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#34473D]">
                    Profile completion
                  </h3>

                  <span className="text-sm font-semibold text-[#427A65]">
                    {completion}%
                  </span>
                </div>

                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-[#EAF0EC]"
                  role="progressbar"
                  aria-label="Profile completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={completion}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-[#427A65]"
                  />
                </div>

                <p className="mt-3 text-xs leading-5 text-[#87938C]">
                  {completion === 100
                    ? "Your profile has all four basic information fields filled in."
                    : "Complete your basic information to keep your account details up to date."}
                </p>
              </div>

              {/* Quick information */}
              <div className="mt-6 space-y-4 border-t border-[#EAF0EC] pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F6F3] text-[#64776A]">
                    <Phone size={17} />
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs text-[#87938C]">
                      Phone number
                    </p>

                    <p className="mt-1 break-words text-sm font-medium text-[#34473D]">
                      {formData.phone || "Not added yet"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F6F3] text-[#64776A]">
                    <MapPin size={17} />
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p className="text-xs text-[#87938C]">
                      Your location
                    </p>

                    <p className="mt-1 break-words text-sm font-medium text-[#34473D]">
                      {formData.location || "Not added yet"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Personal information form */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl border border-[#E2E9E4] bg-white"
          >
            <div className="border-b border-[#EAF0EC] px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                  <CircleUserRound size={20} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-[#24342E]">
                    Personal information
                  </h2>

                  <p className="mt-1 text-xs text-[#87938C]">
                    Your basic account details
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:gap-6 sm:p-7">
                <ProfileField
                  label="Full name"
                  name="name"
                  value={formData.name}
                  icon={UserRound}
                  editing={editing}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />

                <ProfileField
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  icon={Mail}
                  editing={editing}
                  onChange={handleChange}
                  disabled
                  placeholder="Your email address"
                  helperText="Your registered email address cannot be changed here."
                />

                <ProfileField
                  label="Phone number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  icon={Phone}
                  editing={editing}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />

                <ProfileField
                  label="Location"
                  name="location"
                  value={formData.location}
                  icon={MapPin}
                  editing={editing}
                  onChange={handleChange}
                  placeholder="City or area"
                  helperText="Helps people connect with you locally."
                />
              </div>

              {/* Form footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#EAF0EC] bg-[#FCFDFC] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p className="text-xs leading-5 text-[#87938C]">
                  Your information helps your community connect with you.
                </p>

                {editing ? (
                  <div className="grid grid-cols-2 gap-3 sm:flex sm:shrink-0">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DDE6E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#526159] transition hover:bg-[#F3F6F3] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X size={16} />
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#427A65] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356650] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}

                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DDE6E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#427A65] transition hover:bg-[#F0F6F1] sm:shrink-0"
                  >
                    Update details
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </form>
          </motion.section>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#E2E9E4] bg-white p-4 sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#24342E]">
              Your account, your information
            </h3>

            <p className="mt-1 text-sm leading-6 text-[#718078]">
              Keep your contact details accurate so other community members
              can connect with you when needed. Your email address remains
              read-only on this page.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;