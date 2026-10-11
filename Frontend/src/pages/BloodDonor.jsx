import { useEffect, useState } from "react";
import {
    registerBloodDonor,
    getProfile,
} from "../services/api";

const bloodGroups = [
    "A+", "A-", "B+", "B-",
    "AB+", "AB-", "O+", "O-",
];

function BloodDonor() {
    const [formData, setFormData] = useState({
        bloodGroup: "",
        location: "",
        availability: true,
    });

    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
            try {
                const response = await getProfile();

                if (!active) return;

                const user = response.user;

                setFormData((prev) => ({
                    ...prev,
                    location: user?.location || "",
                }));
            } catch (err) {
                if (!active) return;

                setError(
                    err.response?.data?.message ||
                    "Failed to load your profile."
                );
            } finally {
                if (active) setLoading(false);
            }
        };

        loadProfile();

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!formData.bloodGroup || !formData.location.trim()) {
            setError(
                "Please select your blood group and enter your location."
            );
            return;
        }

        let user;

        try {
            user = JSON.parse(localStorage.getItem("user"));
        } catch {
            user = null;
        }

        const userId = user?.id || user?._id;

        if (!userId) {
            setError("User information not found. Please log in again.");
            return;
        }

        setRegistering(true);

        try {
            const response = await registerBloodDonor({
                userId,
                bloodGroup: formData.bloodGroup,
                location: formData.location.trim(),
                availability: formData.availability,
            });

            setMessage(
                response.message ||
                "You are now registered as a blood donor."
            );

            setRegistered(true);
        } catch (err) {
            const status = err.response?.status;

            if (status === 409) {
                setRegistered(true);
            }

            setError(
                err.response?.data?.message ||
                "Failed to register as a blood donor."
            );
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#F8FAF9] px-4">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#F0D5D8] border-t-[#C94C55]" />
                    <p className="mt-4 text-sm text-[#6F7D76]">
                        Loading your profile...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAF9] px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-6xl">

                {/* Hero */}
                <section className="relative overflow-hidden rounded-[2rem] border border-[#F0DDDF] bg-gradient-to-br from-white to-[#FBEAEC] px-5 py-10 sm:px-10 sm:py-14">
                    <div className="absolute -right-10 -top-16 h-60 w-60 rounded-full bg-[#C94C55]/5 blur-3xl" />

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#F0D5D8] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#B83E49]">
                            <span className="h-2 w-2 rounded-full bg-[#C94C55]" />
                            Become a donor
                        </div>

                        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#24342E] sm:text-5xl">
                            Give blood.
                            <br />
                            Give someone hope.
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-[#6F7D76] sm:text-base">
                            Register as a blood donor and let your
                            community know when you're available to help.
                            A small step from you could make a meaningful difference.
                        </p>
                    </div>
                </section>

                <div className="mt-7 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">

                    {/* Information panel */}
                    <aside className="rounded-3xl bg-[#24342E] p-6 text-white sm:p-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl font-semibold text-[#F2A1A7]">
                            +
                        </div>

                        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.18em] text-[#F2A1A7]">
                            CommunityConnect
                        </p>

                        <h2 className="mt-3 text-2xl font-semibold leading-snug sm:text-3xl">
                            A little help can mean everything.
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-white/65">
                            Join the community of people who are willing
                            to help others during important moments.
                        </p>

                        <div className="mt-8 space-y-6">
                            {[
                                {
                                    number: "01",
                                    title: "Register your details",
                                    description:
                                        "Select your blood group and preferred location.",
                                },
                                {
                                    number: "02",
                                    title: "Manage availability",
                                    description:
                                        "Choose whether you're currently available to donate.",
                                },
                                {
                                    number: "03",
                                    title: "Connect with people",
                                    description:
                                        "Receive connection requests from people seeking help.",
                                },
                            ].map((item) => (
                                <div key={item.number} className="flex gap-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-[#F2A1A7]">
                                        {item.number}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold">
                                            {item.title}
                                        </h3>

                                        <p className="mt-1 text-sm leading-6 text-white/55">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Registration form */}
                    <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-sm sm:p-8">
                        {registered && !error ? (
                            <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5F1EA] text-3xl text-[#427A65]">
                                    ✓
                                </div>

                                <h2 className="mt-5 text-2xl font-semibold text-[#24342E]">
                                    You're registered!
                                </h2>

                                <p className="mt-3 max-w-sm text-sm leading-6 text-[#6F7D76]">
                                    Your blood donor registration has been
                                    processed. Thank you for being part of
                                    the community.
                                </p>

                                <div className="mt-6 rounded-2xl border border-[#F0D5D8] bg-[#FBEAEC] px-8 py-4">
                                    <p className="text-xs font-medium uppercase tracking-wider text-[#B83E49]">
                                        Your blood group
                                    </p>

                                    <p className="mt-1 text-3xl font-semibold text-[#C94C55]">
                                        {formData.bloodGroup}
                                    </p>
                                </div>

                                {message && (
                                    <p role="status" className="mt-5 text-sm text-[#427A65]">
                                        {message}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-7">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C94C55]">
                                        Donor registration
                                    </p>

                                    <h2 className="mt-2 text-2xl font-semibold text-[#24342E]">
                                        Your donor details
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-[#6F7D76]">
                                        Add the information people need to
                                        find you.
                                    </p>
                                </div>

                                <div>
                                    <label
                                        htmlFor="donor-blood-group"
                                        className="mb-2 block text-sm font-medium text-[#34463D]"
                                    >
                                        Blood group
                                    </label>

                                    <select
                                        id="donor-blood-group"
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-[#E2E9E4] bg-[#FAFBFA] px-4 py-3.5 text-sm text-[#24342E] outline-none transition focus:border-[#C94C55] focus:bg-white focus:ring-4 focus:ring-[#FBEAEC]"
                                    >
                                        <option value="">
                                            Select your blood group
                                        </option>

                                        {bloodGroups.map((group) => (
                                            <option key={group} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-5">
                                    <label
                                        htmlFor="donor-location"
                                        className="mb-2 block text-sm font-medium text-[#34463D]"
                                    >
                                        Location
                                    </label>

                                    <input
                                        id="donor-location"
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g. Akurdi, Pune"
                                        autoComplete="address-level2"
                                        required
                                        className="w-full rounded-xl border border-[#E2E9E4] bg-[#FAFBFA] px-4 py-3.5 text-sm text-[#24342E] outline-none transition placeholder:text-[#9AA69F] focus:border-[#C94C55] focus:bg-white focus:ring-4 focus:ring-[#FBEAEC]"
                                    />

                                    <p className="mt-2 text-xs leading-5 text-[#8A9690]">
                                        Enter the area where you are generally
                                        available to help.
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[#E2E9E4] bg-[#FAFBFA] p-4">
                                    <div>
                                        <p className="text-sm font-semibold text-[#24342E]">
                                            Available to donate
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-[#6F7D76]">
                                            Let people know if you're available.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={formData.availability}
                                        aria-label="Available to donate"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                availability: !prev.availability,
                                            }))
                                        }
                                        className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FBEAEC] ${
                                            formData.availability
                                                ? "bg-[#427A65]"
                                                : "bg-[#CBD3CE]"
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                                                formData.availability
                                                    ? "left-6"
                                                    : "left-1"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {error && (
                                    <div
                                        role="alert"
                                        className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {error}
                                    </div>
                                )}

                                {message && (
                                    <div
                                        role="status"
                                        className="mt-5 rounded-xl border border-[#D7E9DD] bg-[#F0F7F2] px-4 py-3 text-sm text-[#427A65]"
                                    >
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={registering}
                                    className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#C94C55] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B83E49] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {registering
                                        ? "Registering..."
                                        : "Register as a donor"}
                                </button>

                                <p className="mt-4 text-center text-xs leading-5 text-[#8A9690]">
                                    Your contact information is taken from
                                    your CommunityConnect profile.
                                </p>
                            </form>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

export default BloodDonor;