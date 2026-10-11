import { useState } from "react";
import {
    findServiceProviders,
    sendConnectionRequest,
} from "../services/api";

const serviceTypes = [
    "Plumber",
    "Electrician",
    "Carpenter",
    "Painter",
    "Mechanic",
    "House Help",
    "AC Repair",
    "Computer Repair",
    "Tutor",
    "Gardener",
    "Appliance Repair",
    "Other",
];

function FindService() {
    const [serviceType, setServiceType] = useState("");
    const [location, setLocation] = useState("");
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");
    const [requesting, setRequesting] = useState(null);
    const [requestMessage, setRequestMessage] = useState("");

    const handleSearch = async (e) => {
        e.preventDefault();

        setError("");
        setRequestMessage("");
        setSearched(true);

        if (!serviceType || !location.trim()) {
            setError("Please select a service and enter your location.");
            return;
        }

        setLoading(true);
        setProviders([]);

        try {
            const response = await findServiceProviders(
                serviceType,
                location.trim()
            );

            setProviders(response.matches || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to find service providers."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (provider) => {
        let user;

        try {
            user = JSON.parse(localStorage.getItem("user"));
        } catch {
            user = null;
        }

        if (!user) {
            setRequestMessage("Please log in before sending a request.");
            return;
        }

        const providerId =
            provider.userId?._id ||
            provider.userId?.id ||
            provider.userId;

        if (!providerId) {
            setRequestMessage(
                "Provider information is missing. Please try again."
            );
            return;
        }

        setRequesting(provider._id);
        setRequestMessage("");

        try {
            await sendConnectionRequest({
                providerId,
                type: "SERVICE",
                description: `I need ${serviceType} service.`,
                location: location.trim(),
            });

            setRequestMessage(
                "Connection request sent successfully."
            );
        } catch (err) {
            setRequestMessage(
                err.response?.data?.message ||
                "Failed to send your connection request."
            );
        } finally {
            setRequesting(null);
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
                            Local services
                        </div>

                        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#24342E] sm:text-5xl">
                            Find the right help,
                            <br className="hidden sm:block" />
                            right around you.
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-[#6F7D76] sm:text-base">
                            Discover local service providers for everyday
                            needs. Search by service and location, then
                            connect directly through CommunityConnect.
                        </p>
                    </div>
                </section>

                {/* Search */}
                <section className="mx-auto mt-7 max-w-4xl rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-sm sm:p-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6C8FBC]">
                            Find local professionals
                        </p>

                        <h2 className="mt-2 text-xl font-semibold text-[#24342E] sm:text-2xl">
                            What do you need help with?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#6F7D76]">
                            Choose a service and enter the area where
                            you need assistance.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="mt-7 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
                    >
                        <div>
                            <label
                                htmlFor="service-type"
                                className="mb-2 block text-sm font-medium text-[#34463D]"
                            >
                                Service
                            </label>

                            <select
                                id="service-type"
                                value={serviceType}
                                onChange={(e) => {
                                    setServiceType(e.target.value);
                                    setError("");
                                }}
                                required
                                className="min-h-12 w-full rounded-xl border border-[#E2E9E4] bg-[#FAFBFA] px-4 py-3 text-sm text-[#24342E] outline-none transition focus:border-[#6C8FBC] focus:bg-white focus:ring-4 focus:ring-[#EAF1FA]"
                            >
                                <option value="">
                                    Select a service
                                </option>

                                {serviceTypes.map((service) => (
                                    <option key={service} value={service}>
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="service-location"
                                className="mb-2 block text-sm font-medium text-[#34463D]"
                            >
                                Location
                            </label>

                            <input
                                id="service-location"
                                type="text"
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    setError("");
                                }}
                                placeholder="e.g. Akurdi, Pune"
                                autoComplete="address-level2"
                                required
                                className="min-h-12 w-full rounded-xl border border-[#E2E9E4] bg-[#FAFBFA] px-4 py-3 text-sm text-[#24342E] outline-none transition placeholder:text-[#9AA69F] focus:border-[#6C8FBC] focus:bg-white focus:ring-4 focus:ring-[#EAF1FA]"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex min-h-12 items-center justify-center rounded-xl bg-[#24342E] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#344A40] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Searching..." : "Find services"}
                        </button>
                    </form>

                    {error && (
                        <div
                            role="alert"
                            className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}
                </section>

                {/* Results */}
                {searched && (
                    <section className="mt-10 sm:mt-14">
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6C8FBC]">
                                    Search results
                                </p>

                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#24342E] sm:text-3xl">
                                    Local professionals
                                </h2>
                            </div>

                            {!loading && (
                                <p className="text-sm text-[#6F7D76]">
                                    {providers.length}{" "}
                                    {providers.length === 1
                                        ? "provider"
                                        : "providers"}{" "}
                                    found
                                </p>
                            )}
                        </div>

                        {/* Request feedback */}
                        {requestMessage && (
                            <div
                                role="status"
                                className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                                    requestMessage.toLowerCase().includes("success")
                                        ? "border-[#D7E9DD] bg-[#F0F7F2] text-[#427A65]"
                                        : "border-[#DDE7F3] bg-[#EAF1FA] text-[#456D9C]"
                                }`}
                            >
                                {requestMessage}
                            </div>
                        )}

                        {/* Loading */}
                        {loading && (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="animate-pulse rounded-2xl border border-[#E2E9E4] bg-white p-6"
                                    >
                                        <div className="flex justify-between">
                                            <div className="space-y-3">
                                                <div className="h-3 w-20 rounded bg-gray-200" />
                                                <div className="h-6 w-32 rounded bg-gray-200" />
                                            </div>
                                            <div className="h-12 w-12 rounded-2xl bg-gray-200" />
                                        </div>

                                        <div className="mt-8 space-y-4">
                                            <div className="h-4 w-3/4 rounded bg-gray-200" />
                                            <div className="h-4 w-1/2 rounded bg-gray-200" />
                                            <div className="h-4 w-2/3 rounded bg-gray-200" />
                                        </div>

                                        <div className="mt-7 h-11 rounded-xl bg-gray-200" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && providers.length === 0 && !error && (
                            <div className="rounded-3xl border border-[#E2E9E4] bg-white px-5 py-12 text-center sm:px-10">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF1FA] text-2xl font-semibold text-[#6C8FBC]">
                                    +
                                </div>

                                <h3 className="mt-5 text-xl font-semibold text-[#24342E]">
                                    No providers found
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6F7D76]">
                                    No matching providers were found for
                                    your search. Try another service or
                                    location.
                                </p>
                            </div>
                        )}

                        {/* Provider cards */}
                        {!loading && providers.length > 0 && (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {providers.map((provider, index) => (
                                    <article
                                        key={provider._id || index}
                                        className="flex flex-col rounded-2xl border border-[#E2E9E4] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#C8D8EA] hover:shadow-lg hover:shadow-[#24342E]/5 sm:p-6"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8A9690]">
                                                    Service offered
                                                </p>

                                                <h3 className="mt-2 break-words text-xl font-semibold text-[#547BA9]">
                                                    {provider.serviceType}
                                                </h3>
                                            </div>

                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF1FA] text-xl font-semibold text-[#6C8FBC]">
                                                +
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            <span
                                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                                                    provider.availability
                                                        ? "bg-[#E5F1EA] text-[#427A65]"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        provider.availability
                                                            ? "bg-[#427A65]"
                                                            : "bg-gray-400"
                                                    }`}
                                                />

                                                {provider.availability
                                                    ? "Available"
                                                    : "Unavailable"}
                                            </span>
                                        </div>

                                        <div className="mt-6 flex-1 space-y-4">
                                            <div>
                                                <p className="text-xs text-[#8A9690]">
                                                    Provider
                                                </p>

                                                <p className="mt-1 break-words text-sm font-medium text-[#24342E]">
                                                    {provider.userId?.name ||
                                                        "Community Provider"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-[#8A9690]">
                                                    Location
                                                </p>

                                                <p className="mt-1 break-words text-sm font-medium text-[#24342E]">
                                                    {provider.location || "Not provided"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-[#8A9690]">
                                                    Contact
                                                </p>

                                                <p className="mt-1 break-words text-sm font-medium text-[#24342E]">
                                                    {provider.contact ||
                                                        provider.userId?.phone ||
                                                        "Not available"}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSendRequest(provider)
                                            }
                                            disabled={
                                                requesting === provider._id ||
                                                !provider.availability
                                            }
                                            className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-[#24342E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#344A40] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {requesting === provider._id
                                                ? "Sending request..."
                                                : provider.availability
                                                  ? "Send connection request"
                                                  : "Currently unavailable"}
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}

export default FindService;