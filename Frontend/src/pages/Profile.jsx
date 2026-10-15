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
    ArrowUpRight,
} from "lucide-react";
import { getProfile, updateProfile } from "../services/api";

const EMPTY_PROFILE = {
    name: "",
    email: "",
    phone: "",
    location: "",
};

function Notice({ type, message, onDismiss }) {
    if (!message) return null;

    const isSuccess = type === "success";
    const Icon = isSuccess ? CheckCircle2 : AlertCircle;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 flex items-start gap-3 rounded-2xl border px-4 py-3.5 ${
                isSuccess
                    ? "border-[#D5E7DB] bg-[#F0F7F2] text-[#356651]"
                    : "border-[#F0D1D5] bg-[#FBEAEC] text-[#A63843]"
            }`}
            role={isSuccess ? "status" : "alert"}
        >
            <Icon size={18} className="mt-0.5 shrink-0" />

            <p className="flex-1 text-sm leading-6">
                {message}
            </p>

            <button
                type="button"
                onClick={onDismiss}
                className="rounded-lg p-1 transition hover:bg-black/5"
                aria-label="Dismiss notification"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F6F2] text-[#427A65]">
                <Icon size={18} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#98A49D]">
                    {label}
                </p>

                <p className="mt-0.5 break-words text-sm font-medium text-[#34473D]">
                    {value || "Not added yet"}
                </p>
            </div>
        </div>
    );
}

function ProfileInput({
    icon: Icon,
    label,
    name,
    value,
    onChange,
    disabled = false,
    placeholder,
    type = "text",
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#718078]"
            >
                {label}
            </label>

            <div
                className={`group flex min-h-[54px] items-center gap-3 rounded-2xl border px-4 transition-all ${
                    disabled
                        ? "cursor-not-allowed border-[#E8EDE9] bg-[#F6F8F6]"
                        : "border-[#DCE6DF] bg-[#FBFCFB] focus-within:border-[#427A65] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#427A65]/10 hover:border-[#C7D7CD]"
                }`}
            >
                <Icon
                    size={18}
                    strokeWidth={1.8}
                    className={
                        disabled
                            ? "shrink-0 text-[#A1ACA5]"
                            : "shrink-0 text-[#718D80] group-focus-within:text-[#427A65]"
                    }
                />

                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete={
                        name === "name"
                            ? "name"
                            : name === "phone"
                              ? "tel"
                              : "address-level2"
                    }
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#24342E] outline-none placeholder:text-[#A0AAA3] disabled:cursor-not-allowed disabled:text-[#7C8881]"
                />
            </div>
        </div>
    );
}

export default function Profile() {
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
                    throw new Error(
                        "Unable to retrieve your profile information."
                    );
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

        if (error) {
            setError("");
        }

        if (message) {
            setMessage("");
        }
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (saving) return;

        const name = formData.name.trim();
        const phone = formData.phone.trim();
        const location = formData.location.trim();

        if (!name) {
            setError("Please enter your name.");
            return;
        }

        if (
            phone &&
            !/^[+]?[\d\s()-]{7,20}$/.test(phone)
        ) {
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
            const updatedProfile = {
                name,
                phone,
                location,
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
                response?.message ||
                    "Your profile has been updated successfully."
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
        const name = formData.name.trim();

        if (!name) return "CC";

        return name
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

        const completed = fields.filter(
            (field) => field?.trim()
        ).length;

        return Math.round(
            (completed / fields.length) * 100
        );
    }, [formData]);

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#F8FAF9] px-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#DCE8DF] bg-white shadow-sm">
                        <Loader2
                            size={23}
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
        <main className="min-h-screen bg-[#F8FAF9] px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8">
            <div className="mx-auto max-w-6xl">

                {/* HEADER */}

                <motion.header
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mb-8"
                >
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DCE9E0] bg-white px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[#427A65]">
                                <UserRound size={13} />
                                YOUR ACCOUNT
                            </div>

                            <h1 className="text-4xl font-semibold tracking-tight text-[#24342E] sm:text-5xl">
                                Your profile
                                <span className="text-[#427A65]">.</span>
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-[#718078] sm:text-base">
                                Keep your information updated so people in
                                your community can reach you when it matters.
                            </p>
                        </div>

                        {!editing && (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#427A65] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#356650] focus:outline-none focus:ring-4 focus:ring-[#427A65]/20 sm:self-auto"
                            >
                                <Edit3 size={16} />
                                Edit profile
                            </button>
                        )}
                    </div>
                </motion.header>

                {/* NOTIFICATIONS */}

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

                {/* PROFILE HERO */}

                <motion.section
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative mb-6 overflow-hidden rounded-3xl border border-[#DDE8E1] bg-white"
                >
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-[#427A65]" />

                    <div className="relative flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-9">

                        {/* Identity */}

                        <div className="flex min-w-0 items-center gap-5 sm:gap-7">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] border border-[#CFE2D6] bg-[#E5F1EA] text-2xl font-semibold tracking-tight text-[#427A65] sm:h-24 sm:w-24 sm:text-3xl">
                                {initials}
                            </div>

                            <div className="min-w-0">
                                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#F0F6F1] px-2.5 py-1 text-[11px] font-medium text-[#427A65]">
                                    <ShieldCheck size={13} />
                                    Community member
                                </div>

                                <h2 className="truncate text-2xl font-semibold tracking-tight text-[#24342E] sm:text-3xl">
                                    {formData.name || "Community member"}
                                </h2>

                                <p className="mt-1 truncate text-sm text-[#87938C]">
                                    {formData.email || "No email available"}
                                </p>
                            </div>
                        </div>

                        {/* Completion */}

                        <div className="w-full max-w-sm lg:w-80">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wide text-[#718078]">
                                    Profile completion
                                </span>

                                <span className="text-sm font-semibold text-[#427A65]">
                                    {completion}%
                                </span>
                            </div>

                            <div
                                className="h-2 overflow-hidden rounded-full bg-[#EAF0EC]"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={completion}
                            >
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${completion}%`,
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        ease: "easeOut",
                                    }}
                                    className="h-full rounded-full bg-[#427A65]"
                                />
                            </div>

                            <p className="mt-2 text-xs text-[#98A49D]">
                                {completion === 100
                                    ? "Your basic profile is complete."
                                    : "Add your missing details to complete your profile."}
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* MAIN CONTENT */}

                <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">

                    {/* CONTACT SUMMARY */}

                    <motion.aside
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.4,
                            delay: 0.05,
                        }}
                        className="rounded-3xl border border-[#DDE8E1] bg-white"
                    >
                        <div className="border-b border-[#EAF0EC] px-6 py-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#427A65]">
                                Account details
                            </p>

                            <h2 className="mt-1 text-lg font-semibold text-[#24342E]">
                                Your information
                            </h2>
                        </div>

                        <div className="space-y-5 p-6">
                            <InfoRow
                                icon={Mail}
                                label="Email"
                                value={formData.email}
                            />

                            <InfoRow
                                icon={Phone}
                                label="Phone"
                                value={formData.phone}
                            />

                            <InfoRow
                                icon={MapPin}
                                label="Location"
                                value={formData.location}
                            />
                        </div>

                        <div className="mx-6 border-t border-[#EAF0EC]" />

                        <div className="p-6">
                            <div className="rounded-2xl bg-[#F5F8F5] p-4">
                                <div className="flex gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#427A65]">
                                        <ShieldCheck size={17} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-[#34473D]">
                                            Your details stay yours
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-[#7B8880]">
                                            Your email address is protected
                                            and cannot be edited from this
                                            page.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>

                    {/* EDIT PROFILE */}

                    <motion.section
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.4,
                            delay: 0.1,
                        }}
                        className="overflow-hidden rounded-3xl border border-[#DDE8E1] bg-white"
                    >
                        <div className="flex flex-col gap-4 border-b border-[#EAF0EC] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#427A65]">
                                    Personal information
                                </p>

                                <h2 className="mt-1 text-lg font-semibold text-[#24342E]">
                                    {editing
                                        ? "Edit your details"
                                        : "Personal details"}
                                </h2>

                                <p className="mt-1 text-xs text-[#89958D]">
                                    {editing
                                        ? "Make your changes and save them when you're done."
                                        : "Your registered account information."}
                                </p>
                            </div>

                            {!editing && (
                                <button
                                    type="button"
                                    onClick={handleEdit}
                                    className="inline-flex items-center gap-2 self-start rounded-xl border border-[#D9E5DE] bg-[#F8FBF9] px-4 py-2.5 text-xs font-semibold text-[#427A65] transition hover:bg-[#EEF5F0]"
                                >
                                    <Edit3 size={15} />
                                    Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">

                                <ProfileInput
                                    icon={UserRound}
                                    label="Full name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="Enter your full name"
                                />

                                <ProfileInput
                                    icon={Mail}
                                    label="Email address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    placeholder="Your email address"
                                />

                                <ProfileInput
                                    icon={Phone}
                                    label="Phone number"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="Enter your phone number"
                                />

                                <ProfileInput
                                    icon={MapPin}
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    placeholder="City or area"
                                />
                            </div>

                            {/* FORM FOOTER */}

                            <div className="border-t border-[#EAF0EC] bg-[#FCFDFC] px-6 py-5 sm:px-8">
                                {editing ? (
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs leading-5 text-[#89958D]">
                                            Changes will be saved to your
                                            CommunityConnect account.
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DCE5DF] bg-white px-5 py-2.5 text-sm font-semibold text-[#526159] transition hover:bg-[#F3F6F3] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <X size={16} />
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#427A65] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#356650] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {saving ? (
                                                    <Loader2
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Save size={16} />
                                                )}

                                                {saving
                                                    ? "Saving..."
                                                    : "Save changes"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs leading-5 text-[#89958D]">
                                            Need to change something? You can
                                            update your name, phone and
                                            location.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={handleEdit}
                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#427A65] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356650]"
                                        >
                                            Update details
                                            <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </motion.section>
                </div>

                {/* BOTTOM INFO */}

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.4,
                        delay: 0.15,
                    }}
                    className="mt-6 rounded-3xl border border-[#DDE8E1] bg-white p-5 sm:p-6"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
                            <ShieldCheck size={20} />
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-[#24342E]">
                                Keep your community profile updated
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-[#718078] sm:text-sm">
                                Accurate contact information helps other
                                CommunityConnect members reach you when help
                                is needed.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}