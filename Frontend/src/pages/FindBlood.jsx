import { useState } from "react";
import {
    findBloodDonors,
    sendConnectionRequest,
} from "../services/api";

const bloodGroups = [
    "A+", "A-", "B+", "B-",
    "AB+", "AB-", "O+", "O-",
];

function FindBlood() {
    const [bloodGroup, setBloodGroup] = useState("");
    const [location, setLocation] = useState("");
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");
    const [requesting, setRequesting] = useState(null);
    const [requestStatus, setRequestStatus] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();

        setError("");
        setSearched(true);

        if (!bloodGroup || !location.trim()) {
            setError(
                "Please select a blood group and enter your location."
            );
            return;
        }

        setLoading(true);
        setDonors([]);
        setRequestStatus({});

        try {
            const response = await findBloodDonors(
                bloodGroup,
                location.trim()
            );

            setDonors(response.matches || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to find donors right now. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (donor) => {
        let user;

        try {
            user = JSON.parse(localStorage.getItem("user"));
        } catch {
            user = null;
        }

        if (!user) {
            setRequestStatus((prev) => ({
                ...prev,
                [donor._id]: {
                    type: "error",
                    message: "Please log in before sending a request.",
                },
            }));
            return;
        }

        const providerId =
            donor.userId?._id ||
            donor.userId?.id ||
            donor.userId;

        if (!providerId) {
            setRequestStatus((prev) => ({
                ...prev,
                [donor._id]: {
                    type: "error",
                    message: "Donor information is incomplete.",
                },
            }));
            return;
        }

        setRequesting(donor._id);

        setRequestStatus((prev) => ({
            ...prev,
            [donor._id]: null,
        }));

        try {
            await sendConnectionRequest({
                providerId,
                type: "BLOOD",
                description: `I need ${donor.bloodGroup} blood in ${location.trim()}.`,
                location: location.trim(),
            });

            setRequestStatus((prev) => ({
                ...prev,
                [donor._id]: {
                    type: "success",
                    message: "Connection request sent successfully.",
                },
            }));
        } catch (err) {
            setRequestStatus((prev) => ({
                ...prev,
                [donor._id]: {
                    type: "error",
                    message:
                        err.response?.data?.message ||
                        "Failed to send your request.",
                },
            }));
        } finally {
            setRequesting(null);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAF9] px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-6xl">

                {/* Hero */}
                <section className="relative overflow-hidden rounded-[2rem] border border-[#F0DDDF] bg-gradient-to-br from-white via-white to-[#FBEAEC] px-5 py-10 sm:px-10 sm:py-14">
                    <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#C94C55]/5 blur-3xl" />

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#F0D5D8] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#B83E49]">
                            <span className="h-2 w-2 rounded-full bg-[#C94C55]" />
                            Blood donation network
                        </div>

                        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#24342E] sm:text-5xl">
                            Every connection
                            <br className="hidden sm:block" /> can save a life.
                        </h1>

                        <p className="mt-4 max-w-xl text-sm leading-7 text-[#6F7D76] sm:text-base">
                            Find available blood donors in your area
                            and connect with people willing to help
                            when it matters most.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3 text-xs font-medium text-[#6F7D76] sm:text-sm">
                            <span className="rounded-xl border border-[#E8EAE6] bg-white/80 px-4 py-2.5">
                                Eight blood groups
                            </span>
                            <span className="rounded-xl border border-[#E8EAE6] bg-white/80 px-4 py-2.5">
                                Location-based search
                            </span>
                        </div>
                    </div>
                </section>

                {/* Search */}
                <section className="mx-auto mt-7 max-w-4xl rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-sm sm:p-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C94C55]">
                            Find a donor
                        </p>

                        <h2 className="mt-2 text-xl font-semibold text-[#24342E] sm:text-2xl">
                            What blood group do you need?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#6F7D76]">
                            Select the required group and enter the
                            area where you need assistance.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="mt-7">
                        <label className="mb-3 block text-sm font-medium text-[#34463D]">
                            Required blood group
                        </label>

                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-3">
                            {bloodGroups.map((group) => (
                                <button
                                    key={group}
                                    type="button"
                                    aria-pressed={bloodGroup === group}
                                    onClick={() => {
                                        setBloodGroup(group);
                                        setError("");
                                    }}
                                    className={`min-h-12 rounded-xl border text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FBEAEC] sm:min-h-14 sm:text-base ${
                                        bloodGroup === group
                                            ? "border-[#C94C55] bg-[#C94C55] text-white shadow-sm"
                                            : "border-[#E2E9E4] bg-white text-[#34463D] hover:border-[#D98A91] hover:bg-[#FDF5F5]"
                                    }`}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6">
                            <label
                                htmlFor="blood-location"
                                className="mb-2 block text-sm font-medium text-[#34463D]"
                            >
                                Your location
                            </label>

                            <input
                                id="blood-location"
                                type="text"
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    setError("");
                                }}
                                placeholder="Enter your city or area"
                                autoComplete="address-level2"
                                className="w-full rounded-xl border border-[#E2E9E4] bg-[#FAFBFA] px-4 py-3.5 text-sm text-[#24342E] outline-none transition placeholder:text-[#9AA69F] focus:border-[#C94C55] focus:bg-white focus:ring-4 focus:ring-[#FBEAEC]"
                            />
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#24342E] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#344A40] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#DCE8E0] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-56"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    Finding donors...
                                </>
                            ) : (
                                "Find available donors"
                            )}
                        </button>
                    </form>
                </section>

                {/* Results */}
                {searched && (
                    <section className="mt-10 sm:mt-14">
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C94C55]">
                                    Search results
                                </p>

                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#24342E] sm:text-3xl">
                                    Available donors
                                </h2>
                            </div>

                            {!loading && (
                                <p className="text-sm text-[#6F7D76]">
                                    {donors.length}{" "}
                                    {donors.length === 1 ? "donor" : "donors"} found
                                </p>
                            )}
                        </div>

                        {/* Loading skeleton */}
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
                                                <div className="h-9 w-16 rounded bg-gray-200" />
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
                        {!loading && donors.length === 0 && !error && (
                            <div className="rounded-3xl border border-[#E2E9E4] bg-white px-5 py-12 text-center sm:px-10">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEAEC] text-2xl font-semibold text-[#C94C55]">
                                    +
                                </div>

                                <h3 className="mt-5 text-xl font-semibold text-[#24342E]">
                                    No donors found
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6F7D76]">
                                    We couldn't find matching donors for
                                    this search. Try another location or
                                    search again later.
                                </p>
                            </div>
                        )}

                        {/* Donor cards */}
                        {!loading && donors.length > 0 && (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {donors.map((donor) => {
                                    const status = requestStatus[donor._id];

                                    return (
                                        <article
                                            key={donor._id}
                                            className="flex flex-col rounded-2xl border border-[#E2E9E4] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#E7C7CA] hover:shadow-lg hover:shadow-[#24342E]/5 sm:p-6"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#8A9690]">
                                                        Blood group
                                                    </p>

                                                    <h3 className="mt-2 text-4xl font-semibold tracking-tight text-[#C94C55]">
                                                        {donor.bloodGroup}
                                                    </h3>
                                                </div>

                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBEAEC] text-2xl font-semibold text-[#C94C55]">
                                                    +
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                                                        donor.availability
                                                            ? "bg-[#E5F1EA] text-[#427A65]"
                                                            : "bg-gray-100 text-gray-500"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            donor.availability
                                                                ? "bg-[#427A65]"
                                                                : "bg-gray-400"
                                                        }`}
                                                    />
                                                    {donor.availability
                                                        ? "Available"
                                                        : "Unavailable"}
                                                </span>
                                            </div>

                                            <div className="mt-6 flex-1 space-y-4">
                                                <div>
                                                    <p className="text-xs text-[#8A9690]">
                                                        Donor
                                                    </p>
                                                    <p className="mt-1 break-words text-sm font-medium text-[#24342E]">
                                                        {donor.userId?.name ||
                                                            "Community Donor"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-[#8A9690]">
                                                        Location
                                                    </p>
                                                    <p className="mt-1 break-words text-sm font-medium text-[#24342E]">
                                                        {donor.location || "Not provided"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-[#8A9690]">
                                                        Contact
                                                    </p>
                                                    <p className="mt-1 break-words text-sm font-medium text-[#24342E]">
                                                        {donor.contact ||
                                                            donor.userId?.phone ||
                                                            "Not available"}
                                                    </p>
                                                </div>
                                            </div>

                                            {status && (
                                                <div
                                                    role="status"
                                                    className={`mt-5 rounded-xl border px-3 py-3 text-sm ${
                                                        status.type === "success"
                                                            ? "border-[#D7E9DD] bg-[#F0F7F2] text-[#427A65]"
                                                            : "border-red-100 bg-red-50 text-red-700"
                                                    }`}
                                                >
                                                    {status.message}
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSendRequest(donor)
                                                }
                                                disabled={
                                                    requesting === donor._id ||
                                                    !donor.availability
                                                }
                                                className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl bg-[#C94C55] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#B83E49] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {requesting === donor._id
                                                    ? "Sending request..."
                                                    : donor.availability
                                                      ? "Send connection request"
                                                      : "Currently unavailable"}
                                            </button>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}

export default FindBlood;