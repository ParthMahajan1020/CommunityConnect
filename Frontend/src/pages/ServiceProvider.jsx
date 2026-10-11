import { useState } from "react";
import { registerServiceProvider } from "../services/api";

const serviceTypes = [
    "Plumber",
    "Electrician",
    "Carpenter",
    "Painter",
    "House Help",
    "Mechanic",
    "Tutor",
    "Gardener",
    "AC Repair",
    "Appliance Repair",
    "Other",
];

function ServiceProvider() {
    const [formData, setFormData] = useState({
        serviceType: "",
        location: "",
        availability: true,
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
        setMessage("");
    };

    const handleAvailability = () => {
        setFormData((prev) => ({
            ...prev,
            availability: !prev.availability,
        }));

        setError("");
        setMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!formData.serviceType || !formData.location.trim()) {
            setError("Please select a service and enter your location.");
            return;
        }

        let user;

        try {
            user = JSON.parse(localStorage.getItem("user"));
        } catch {
            user = null;
        }

        if (!user) {
            setError("Please log in before registering a service.");
            return;
        }

        setLoading(true);

        try {
            const response = await registerServiceProvider({
                serviceType: formData.serviceType,
                location: formData.location.trim(),
                availability: formData.availability,
            });

            setMessage(
                response.message ||
                "You are now registered as a service provider."
            );

            setFormData({
                serviceType: "",
                location: "",
                availability: true,
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to register as a service provider."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAF9] px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-6xl">

                {/* Hero */}
                <section className="relative overflow-hidden rounded-[2rem] border border-[#DDE7F3] bg-gradient-to-br from-white via-white to-[#EAF1FA] px-5 py-10 sm:px-10 sm:py-14">
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#6C8FBC]/10 blur-3xl" />

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#DDE7F3] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#547BA9]">
                            <span className="h-2 w-2 rounded-full bg-[#6C8FBC]" />
                            Share your skills
                        </div>

                        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#24342E] sm:text-5xl">
                            Your skills.
                            <br />
                            Your community.
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-[#6F7D76] sm:text-base">
                            Make your services discoverable to people
                            around you. Register your expertise and
                            help your local community find the assistance
                            they need.
                        </p>
                    </div>
                </section>

                {/* Registration form */}
                <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

                    <section className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-sm sm:p-8">
                        <div className="mb-7">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6C8FBC]">
                                Provider registration
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold text-[#24342E]">
                                Register your service
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-[#6F7D76]">
                                Tell the community what you offer and
                                where you are available.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="provider-service"
                                    className="mb-2 block text-sm font-medium text-[#34463D]"
                                >
                                    What service do you provide?
                                </label>

                                <select
                                    id="provider-service"
                                    name="serviceType"
                                    value={formData.serviceType}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-[#E2E9E4] bg-[#FAFBFA] px-4 py-3.5 text-sm text-[#24342E] outline-none transition focus:border-[#6C8FBC] focus:bg-white focus:ring-4 focus:ring-[#EAF1FA]"
                                >
                                    <option value="">
                                        Select your service
                                    </option>

                                    {serviceTypes.map((service) => (
                                        <option key={service} value={service}>
                                            {service}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-5">
                                <label
                                    htmlFor="provider-location"
                                    className="mb-2 block text-sm font-medium text-[#34463D]"
                                >
                                    Service location
                                </label>

                                <input
                                    id="provider-location"
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Akurdi, Pune"
                                    autoComplete="address-level2"
                                    required
                                    className="w-full rounded-xl border border-[#E2E9E4] bg-[#FAFBFA] px-4 py-3.5 text-sm text-[#24342E] outline-none transition placeholder:text-[#9AA69F] focus:border-[#6C8FBC] focus:bg-white focus:ring-4 focus:ring-[#EAF1FA]"
                                />

                                <p className="mt-2 text-xs leading-5 text-[#8A9690]">
                                    Enter the area where you normally
                                    provide your service.
                                </p>
                            </div>

                            {/* Availability */}
                            <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-[#E2E9E4] bg-[#FAFBFA] p-4">
                                <div>
                                    <p className="text-sm font-semibold text-[#24342E]">
                                        Currently available
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[#6F7D76]">
                                        Let people know if you can take requests.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={formData.availability}
                                    aria-label="Currently available"
                                    onClick={handleAvailability}
                                    className={`relative h-7 w-12 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#EAF1FA] ${
                                        formData.availability
                                            ? "bg-[#6C8FBC]"
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

                            <div className="mt-3 flex items-center gap-2 text-xs text-[#6F7D76]">
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        formData.availability
                                            ? "bg-[#427A65]"
                                            : "bg-gray-400"
                                    }`}
                                />
                                {formData.availability
                                    ? "People can see that you're available."
                                    : "Your status will be marked unavailable."}
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
                                disabled={loading}
                                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#24342E] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#344A40] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Registering service..."
                                    : "Register as a service provider"}
                            </button>

                            <p className="mt-4 text-center text-xs leading-5 text-[#8A9690]">
                                Please provide an accurate service
                                category and location.
                            </p>
                        </form>
                    </section>

                    {/* Information panel */}
                    <aside className="flex flex-col rounded-3xl border border-[#DDE7F3] bg-[#EAF1FA]/60 p-6 sm:p-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-semibold text-[#6C8FBC]">
                            +
                        </div>

                        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#547BA9]">
                            How it works
                        </p>

                        <h2 className="mt-3 text-2xl font-semibold leading-snug text-[#24342E] sm:text-3xl">
                            Turn your skills into community support.
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-[#6F7D76]">
                            CommunityConnect helps people discover
                            service providers in their local area.
                            Registering helps others find the support
                            they're looking for.
                        </p>

                        <div className="mt-8 space-y-6">
                            {[
                                {
                                    number: "01",
                                    title: "Register",
                                    description:
                                        "Choose your service and enter your location.",
                                },
                                {
                                    number: "02",
                                    title: "Get discovered",
                                    description:
                                        "People can search for your service and area.",
                                },
                                {
                                    number: "03",
                                    title: "Connect",
                                    description:
                                        "Receive connection requests from people who need help.",
                                },
                            ].map((item) => (
                                <div key={item.number} className="flex gap-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#DDE7F3] bg-white text-xs font-semibold text-[#547BA9]">
                                        {item.number}
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-[#24342E]">
                                            {item.title}
                                        </h3>

                                        <p className="mt-1 text-sm leading-6 text-[#6F7D76]">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-8">
                            <div className="rounded-2xl border border-white bg-white/80 p-4">
                                <p className="text-sm font-semibold text-[#24342E]">
                                    Built around local communities
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#6F7D76]">
                                    Make it easier for people nearby
                                    to find the services they need.
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}

export default ServiceProvider;