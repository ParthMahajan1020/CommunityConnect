import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Edit3,
    Check,
    X,
    ShieldCheck,
    CalendarDays,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

import { getProfile, updateProfile } from "../services/api";

function Profile() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
    });

    const [originalData, setOriginalData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await getProfile();
                const user = response.user;

                const profileData = {
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    location: user.location || "",
                };

                setFormData(profileData);
                setOriginalData(profileData);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load profile"
                );
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const response = await updateProfile({
                name: formData.name,
                phone: formData.phone,
                location: formData.location,
            });

            setOriginalData(formData);
            setEditing(false);

            setMessage(
                response.message || "Profile updated successfully."
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to update profile"
            );
        } finally {
            setSaving(false);
        }
    };

    const initials = useMemo(() => {
        if (!formData.name) return "CC";

        return formData.name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
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

        return Math.round((completed / fields.length) * 100);
    }, [formData]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3"
                >
                    <Loader2 className="w-7 h-7 animate-spin text-gray-700" />

                    <p className="text-sm text-gray-500">
                        Loading your profile...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <main className="min-h-screen px-4 sm:px-6 lg:px-8 pb-20">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">

                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">
                                ACCOUNT
                            </p>

                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                                My Profile
                            </h1>

                            <p className="mt-2 text-gray-500">
                                Manage your personal information and
                                CommunityConnect account.
                            </p>
                        </div>

                        {!editing && (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    px-5
                                    py-3
                                    rounded-2xl
                                    bg-gray-900
                                    text-white
                                    font-semibold
                                    shadow-lg
                                    shadow-gray-900/10
                                    hover:bg-gray-800
                                    hover:-translate-y-0.5
                                    transition-all
                                "
                            >
                                <Edit3 size={17} />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Notifications */}
                <AnimatePresence mode="wait">
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="
                                mb-6
                                flex
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-green-200
                                bg-green-50
                                px-4
                                py-3
                                text-sm
                                text-green-700
                            "
                        >
                            <CheckCircle2 size={18} />
                            {message}
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="
                                mb-6
                                flex
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-red-200
                                bg-red-50
                                px-4
                                py-3
                                text-sm
                                text-red-700
                            "
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid lg:grid-cols-[340px_1fr] gap-6">

                    {/* LEFT PROFILE CARD */}
                    <motion.section
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.45 }}
                        className="
                            relative
                            overflow-hidden
                            rounded-[28px]
                            border
                            border-white/70
                            bg-white/75
                            backdrop-blur-xl
                            shadow-xl
                            shadow-gray-900/5
                        "
                    >
                        {/* Decorative background */}
                        <div className="
                            absolute
                            inset-x-0
                            top-0
                            h-32
                            bg-linear-to-br
                            from-gray-900
                            via-gray-800
                            to-gray-600
                        " />

                        <div className="relative p-7 pt-16">

                            {/* Avatar */}
                            <div className="
                                w-24
                                h-24
                                rounded-[28px]
                                bg-white
                                p-1
                                shadow-xl
                            ">
                                <div className="
                                    w-full
                                    h-full
                                    rounded-[24px]
                                    bg-linear-to-br
                                    from-red-500
                                    to-red-700
                                    flex
                                    items-center
                                    justify-center
                                    text-white
                                    text-3xl
                                    font-extrabold
                                ">
                                    {initials}
                                </div>
                            </div>

                            {/* User */}
                            <div className="mt-5">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {formData.name || "Community Member"}
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    {formData.email}
                                </p>
                            </div>

                            {/* Verified */}
                            <div className="
                                inline-flex
                                items-center
                                gap-2
                                mt-4
                                px-3
                                py-1.5
                                rounded-full
                                bg-green-50
                                border
                                border-green-100
                                text-green-700
                                text-xs
                                font-semibold
                            ">
                                <ShieldCheck size={14} />
                                Verified Account
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-gray-100 my-6" />

                            {/* Profile completion */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm font-semibold text-gray-700">
                                        Profile completion
                                    </p>

                                    <p className="text-sm font-bold text-gray-900">
                                        {completion}%
                                    </p>
                                </div>

                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${completion}%`,
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            ease: "easeOut",
                                        }}
                                        className="h-full rounded-full bg-gray-900"
                                    />
                                </div>
                            </div>

                            {/* Account info */}
                            <div className="mt-7 space-y-4">

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                                        <CalendarDays
                                            size={17}
                                            className="text-gray-600"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Account
                                        </p>

                                        <p className="text-sm font-semibold text-gray-700">
                                            Community Member
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                                        <ShieldCheck
                                            size={17}
                                            className="text-gray-600"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Status
                                        </p>

                                        <p className="text-sm font-semibold text-gray-700">
                                            Active
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </motion.section>

                    {/* RIGHT INFORMATION CARD */}
                    <motion.section
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.45,
                            delay: 0.05,
                        }}
                        className="
                            rounded-[28px]
                            border
                            border-white/70
                            bg-white/75
                            backdrop-blur-xl
                            shadow-xl
                            shadow-gray-900/5
                            p-6 md:p-8
                        "
                    >

                        <form onSubmit={handleSubmit}>

                            {/* Section header */}
                            <div className="flex items-start justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Personal Information
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Keep your information up to date.
                                    </p>
                                </div>

                                {editing && (
                                    <div className="
                                        hidden sm:flex
                                        items-center
                                        gap-2
                                        text-xs
                                        font-medium
                                        text-blue-600
                                        bg-blue-50
                                        px-3
                                        py-2
                                        rounded-full
                                    ">
                                        <Edit3 size={13} />
                                        Editing
                                    </div>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">

                                {/* NAME */}
                                <ProfileField
                                    icon={User}
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    editing={editing}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                />

                                {/* EMAIL */}
                                <ProfileField
                                    icon={Mail}
                                    label="Email Address"
                                    name="email"
                                    value={formData.email}
                                    editing={false}
                                    disabled
                                    placeholder="Your email"
                                />

                                {/* PHONE */}
                                <ProfileField
                                    icon={Phone}
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    editing={editing}
                                    onChange={handleChange}
                                    placeholder="Your phone number"
                                    type="tel"
                                />

                                {/* LOCATION */}
                                <ProfileField
                                    icon={MapPin}
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    editing={editing}
                                    onChange={handleChange}
                                    placeholder="Your location"
                                />

                            </div>

                            {/* Email note */}
                            <div className="
                                mt-6
                                flex
                                gap-3
                                rounded-2xl
                                bg-gray-50
                                border
                                border-gray-100
                                p-4
                            ">
                                <ShieldCheck
                                    size={18}
                                    className="text-gray-500 mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="text-sm font-semibold text-gray-700">
                                        Email address is protected
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        Your email cannot be changed from
                                        your profile for account security.
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <AnimatePresence>
                                {editing && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            height: 0,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            height: "auto",
                                        }}
                                        exit={{
                                            opacity: 0,
                                            height: 0,
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <div className="
                                            flex
                                            flex-col-reverse
                                            sm:flex-row
                                            sm:justify-end
                                            gap-3
                                            mt-8
                                            pt-6
                                            border-t
                                            border-gray-100
                                        ">

                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                disabled={saving}
                                                className="
                                                    inline-flex
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                    px-5
                                                    py-3
                                                    rounded-2xl
                                                    border
                                                    border-gray-200
                                                    bg-white
                                                    text-gray-700
                                                    font-semibold
                                                    hover:bg-gray-50
                                                    transition
                                                    disabled:opacity-50
                                                "
                                            >
                                                <X size={17} />
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="
                                                    inline-flex
                                                    items-center
                                                    justify-center
                                                    gap-2
                                                    px-5
                                                    py-3
                                                    rounded-2xl
                                                    bg-gray-900
                                                    text-white
                                                    font-semibold
                                                    shadow-lg
                                                    shadow-gray-900/10
                                                    hover:bg-gray-800
                                                    transition
                                                    disabled:opacity-60
                                                "
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2
                                                            size={17}
                                                            className="animate-spin"
                                                        />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save size={17} />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </form>
                    </motion.section>
                </div>

                {/* Bottom community card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.45,
                        delay: 0.15,
                    }}
                    className="
                        mt-6
                        rounded-[28px]
                        bg-gray-900
                        text-white
                        p-6 md:p-8
                        shadow-xl
                        overflow-hidden
                        relative
                    "
                >
                    <div className="
                        absolute
                        -right-20
                        -top-20
                        w-64
                        h-64
                        rounded-full
                        bg-red-500/20
                        blur-3xl
                    " />

                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>
                            <p className="text-xs font-semibold tracking-widest text-gray-400">
                                COMMUNITYCONNECT
                            </p>

                            <h3 className="text-xl md:text-2xl font-bold mt-2">
                                Your profile represents you in the community.
                            </h3>

                            <p className="text-sm text-gray-400 mt-2 max-w-xl">
                                Keep your contact information accurate so
                                people can connect with you when they need
                                help.
                            </p>
                        </div>

                        <div className="
                            shrink-0
                            w-14
                            h-14
                            rounded-2xl
                            bg-white/10
                            border
                            border-white/10
                            flex
                            items-center
                            justify-center
                        ">
                            <Check
                                size={26}
                                className="text-green-400"
                            />
                        </div>

                    </div>
                </motion.div>

            </div>
        </main>
    );
}

/* -----------------------------------------
   Reusable Profile Field
----------------------------------------- */

function ProfileField({
    icon: Icon,
    label,
    name,
    value,
    editing,
    onChange,
    disabled = false,
    placeholder,
    type = "text",
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
            </label>

            <div className="relative">
                <div className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    w-8
                    h-8
                    rounded-lg
                    bg-gray-100
                    flex
                    items-center
                    justify-center
                ">
                    <Icon size={16} className="text-gray-500" />
                </div>

                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={!editing || disabled}
                    placeholder={placeholder}
                    className={`
                        w-full
                        h-14
                        pl-14
                        pr-4
                        rounded-2xl
                        border
                        outline-none
                        text-sm
                        font-medium
                        transition-all

                        ${
                            !editing || disabled
                                ? `
                                    bg-gray-50
                                    border-gray-100
                                    text-gray-600
                                    cursor-default
                                  `
                                : `
                                    bg-white
                                    border-gray-200
                                    text-gray-900
                                    focus:border-gray-900
                                    focus:ring-4
                                    focus:ring-gray-900/5
                                  `
                        }
                    `}
                />
            </div>
        </div>
    );
}

export default Profile;