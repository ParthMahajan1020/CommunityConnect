import { useState } from "react";
import {
    findServiceProviders,
    sendConnectionRequest
} from "../services/api";

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

        if (!serviceType || !location.trim()) {
            setError("Please select a service and enter your location.");
            return;
        }

        setLoading(true);
        setError("");
        setRequestMessage("");
        setSearched(true);

        try {
            const response = await findServiceProviders(
                serviceType,
                location.trim()
            );

            setProviders(response.matches || []);
        } catch (error) {
            setProviders([]);

            setError(
                error.response?.data?.message ||
                "Failed to find service providers."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (provider) => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            setRequestMessage("Please login first.");
            return;
        }

        const providerId =
            provider.userId?._id ||
            provider.userId?.id ||
            provider.userId;

        if (!providerId) {
            setRequestMessage(
                "User or provider information is missing."
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
                location: location.trim()
            });

            setRequestMessage(
                "Connection request sent successfully."
            );
        } catch (error) {
            setRequestMessage(
                error.response?.data?.message ||
                "Failed to send connection request."
            );
        } finally {
            setRequesting(null);
        }
    };

    return (
        <main className="max-w-6xl mx-auto px-6 py-16">

            {/* HEADER */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-gray-900">
                    Need a Service?
                </h1>

                <p className="mt-4 text-lg text-gray-500">
                    Find trusted local professionals who can help you.
                </p>
            </div>

            {/* SEARCH BOX */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border p-8 max-w-3xl mx-auto">

                <form
                    onSubmit={handleSearch}
                    className="grid md:grid-cols-3 gap-4"
                >

                    {/* SERVICE */}
                    <select
                        value={serviceType}
                        onChange={(e) =>
                            setServiceType(e.target.value)
                        }
                        className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="">
                            Select Service
                        </option>

                        <option value="Plumber">
                            Plumber
                        </option>

                        <option value="Electrician">
                            Electrician
                        </option>

                        <option value="Carpenter">
                            Carpenter
                        </option>

                        <option value="Painter">
                            Painter
                        </option>

                        <option value="Mechanic">
                            Mechanic
                        </option>

                        <option value="House Help">
                            House Help
                        </option>

                        <option value="AC Repair">
                            AC Repair
                        </option>

                        <option value="Computer Repair">
                            Computer Repair
                        </option>
                    </select>

                    {/* LOCATION */}
                    <input
                        type="text"
                        placeholder="Location"
                        value={location}
                        onChange={(e) =>
                            setLocation(e.target.value)
                        }
                        className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-200"
                    />

                    {/* BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading
                            ? "Searching..."
                            : "Find Services"}
                    </button>

                </form>

                {error && (
                    <p className="text-red-500 text-sm mt-4">
                        {error}
                    </p>
                )}

            </div>

            {/* RESULTS */}
            {searched && !loading && (
                <section className="mt-14">

                    <div className="flex items-center justify-between mb-6">

                        <h2 className="text-2xl font-bold">
                            Available Service Providers
                        </h2>

                        <span className="text-gray-500">
                            {providers.length} found
                        </span>

                    </div>

                    {/* REQUEST MESSAGE */}
                    {requestMessage && (
                        <div className="mb-6 text-center font-medium">
                            {requestMessage}
                        </div>
                    )}

                    {/* NO RESULTS */}
                    {providers.length === 0 ? (

                        <div className="bg-white/80 rounded-2xl border p-10 text-center">

                            <h3 className="text-xl font-semibold">
                                No service providers found
                            </h3>

                            <p className="text-gray-500 mt-2">
                                Try another service or location.
                            </p>

                        </div>

                    ) : (

                        /* PROVIDER CARDS */
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {providers.map((provider, index) => (

                                <div
                                    key={
                                        provider._id || index
                                    }
                                    className="bg-white/90 backdrop-blur-md rounded-2xl border shadow-md p-6 hover:shadow-xl transition"
                                >

                                    {/* TOP */}
                                    <div className="flex items-center justify-between">

                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Service
                                            </p>

                                            <h3 className="text-2xl font-extrabold text-blue-600">
                                                {provider.serviceType}
                                            </h3>

                                        </div>

                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                            +
                                        </div>

                                    </div>

                                    {/* DETAILS */}
                                    <div className="mt-6 space-y-3">

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Provider
                                            </p>

                                            <p className="font-medium">
                                                {provider.userId?.name ||
                                                    "Community Provider"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Location
                                            </p>

                                            <p className="font-medium">
                                                {provider.location}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Availability
                                            </p>

                                            <p className="text-green-600 font-semibold">
                                                Available
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Contact
                                            </p>

                                            <p className="font-medium">
                                                {provider.contact ||
                                                    provider.userId?.phone ||
                                                    "Not available"}
                                            </p>
                                        </div>

                                    </div>

                                    {/* REQUEST */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleSendRequest(provider)
                                        }
                                        disabled={
                                            requesting === provider._id
                                        }
                                        className="w-full mt-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                                    >
                                        {requesting === provider._id
                                            ? "Sending..."
                                            : "Send Request"}
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </section>
            )}

        </main>
    );
}

export default FindService;
