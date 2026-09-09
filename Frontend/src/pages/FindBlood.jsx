import { useState } from "react";
import {
    findBloodDonors,
    sendConnectionRequest
} from "../services/api";

function FindBlood() {
    const [bloodGroup, setBloodGroup] = useState("");
    const [location, setLocation] = useState("");

    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const [error, setError] = useState("");
    const [requesting, setRequesting] = useState(null);
    const [requestStatus, setRequestStatus] = useState({});

    const bloodGroups = [
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
        "O+",
        "O-"
    ];

    const handleSearch = async (e) => {
        e.preventDefault();

        setError("");
        setSearched(true);

        if (!bloodGroup || !location.trim()) {
            setError("Please select a blood group and enter your location.");
            return;
        }

        setLoading(true);
        setDonors([]);

        try {
            const response = await findBloodDonors(
                bloodGroup,
                location.trim()
            );

            setDonors(response.matches || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to find blood donors."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (donor) => {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            setRequestStatus({
                [donor._id]: {
                    type: "error",
                    message: "Please login first."
                }
            });
            return;
        }

        const providerId =
            donor.userId?._id ||
            donor.userId?.id ||
            donor.userId;

        if (!providerId) {
            setRequestStatus({
                [donor._id]: {
                    type: "error",
                    message: "User or donor information is missing."
                }
            });
            return;
        }

        setRequesting(donor._id);

        try {
            await sendConnectionRequest({
                providerId,
                type: "BLOOD",
                description: `I need ${donor.bloodGroup} blood in ${location.trim()}.`,
                location: location.trim()
            });

            setRequestStatus({
                [donor._id]: {
                    type: "success",
                    message: "Request sent successfully."
                }
            });
        } catch (error) {
            setRequestStatus({
                [donor._id]: {
                    type: "error",
                    message:
                        error.response?.data?.message ||
                        "Failed to send request."
                }
            });
        } finally {
            setRequesting(null);
        }
    };

    return (
        <main className="min-h-screen px-6 pb-20">
            {/* HERO */}
            <section className="max-w-5xl mx-auto pt-10 md:pt-16 text-center">

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    BLOOD SUPPORT
                </div>

                <h1 className="mt-6 text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
                    Need
                    <span className="text-red-600"> Blood?</span>
                </h1>

                <p className="mt-5 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Find available blood donors near you and connect
                    with someone who can help.
                </p>
            </section>

            {/* SEARCH CARD */}
            <section className="max-w-4xl mx-auto mt-12">

                <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-2xl rounded-[2rem] p-7 md:p-10">

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Find a blood donor
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Select the required blood group and your location.
                        </p>
                    </div>

                    {/* BLOOD GROUPS */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-4">
                            Blood Group
                        </label>

                        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                            {bloodGroups.map((group) => (
                                <button
                                    key={group}
                                    type="button"
                                    onClick={() => {
                                        setBloodGroup(group);
                                        setError("");
                                    }}
                                    className={`
                                        h-14 rounded-xl border-2
                                        font-bold text-lg
                                        transition-all duration-200
                                        ${
                                            bloodGroup === group
                                                ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-200 scale-105"
                                                : "bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50"
                                        }
                                    `}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* LOCATION */}
                    <div className="mt-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Your Location
                        </label>

                        <div className="relative">
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    setError("");
                                }}
                                placeholder="Enter city or area"
                                className="
                                    w-full
                                    px-5 py-4
                                    rounded-2xl
                                    border border-gray-200
                                    bg-gray-50/70
                                    text-gray-900
                                    outline-none
                                    transition
                                    focus:bg-white
                                    focus:border-red-400
                                    focus:ring-4
                                    focus:ring-red-50
                                "
                            />
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mt-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* SEARCH BUTTON */}
                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={loading}
                        className="
                            w-full
                            mt-7
                            py-4
                            rounded-2xl
                            bg-gray-900
                            text-white
                            font-semibold
                            text-lg
                            hover:bg-black
                            transition
                            disabled:opacity-50
                            disabled:cursor-not-allowed
                        "
                    >
                        {loading ? "Finding Donors..." : "Find Available Donors"}
                    </button>
                </div>
            </section>

            {/* RESULTS */}
            {searched && (
                <section className="max-w-6xl mx-auto mt-16">

                    {/* RESULT HEADER */}
                    {!loading && (
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-7">

                            <div>
                                <p className="text-sm font-semibold text-red-600 uppercase tracking-wider">
                                    Search Results
                                </p>

                                <h2 className="text-3xl font-bold text-gray-900 mt-1">
                                    Available Donors
                                </h2>
                            </div>

                            <p className="text-gray-500">
                                {donors.length}{" "}
                                {donors.length === 1 ? "donor" : "donors"} found
                            </p>
                        </div>
                    )}

                    {/* LOADING SKELETON */}
                    {loading && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="bg-white/80 border rounded-3xl p-6 animate-pulse"
                                >
                                    <div className="flex justify-between">
                                        <div className="space-y-2">
                                            <div className="h-3 w-20 bg-gray-200 rounded" />
                                            <div className="h-8 w-14 bg-gray-200 rounded" />
                                        </div>

                                        <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                    </div>

                                    <div className="mt-8 space-y-4">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    </div>

                                    <div className="h-12 bg-gray-200 rounded-xl mt-7" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* EMPTY */}
                    {!loading && donors.length === 0 && !error && (
                        <div className="bg-white/80 backdrop-blur-xl border rounded-3xl p-12 text-center">

                            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
                                <span className="text-3xl font-bold text-red-500">
                                    +
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mt-5">
                                No donors found
                            </h3>

                            <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                We couldn't find an available donor matching
                                your blood group and location.
                            </p>

                            <p className="text-sm text-gray-400 mt-4">
                                Try another location or search again later.
                            </p>
                        </div>
                    )}

                    {/* DONOR CARDS */}
                    {!loading && donors.length > 0 && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {donors.map((donor) => {
                                const status = requestStatus[donor._id];

                                return (
                                    <div
                                        key={donor._id}
                                        className="
                                            group
                                            bg-white/90
                                            backdrop-blur-xl
                                            border border-white/80
                                            rounded-3xl
                                            p-6
                                            shadow-lg
                                            hover:shadow-2xl
                                            hover:-translate-y-1
                                            transition-all
                                            duration-300
                                        "
                                    >
                                        {/* CARD HEADER */}
                                        <div className="flex items-start justify-between">

                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                                                    Blood Group
                                                </p>

                                                <h3 className="text-4xl font-extrabold text-red-600 mt-1">
                                                    {donor.bloodGroup}
                                                </h3>
                                            </div>

                                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                                                <span className="text-2xl font-bold text-red-600">
                                                    +
                                                </span>
                                            </div>
                                        </div>

                                        {/* AVAILABILITY */}
                                        <div className="mt-6">
                                            <span
                                                className={`
                                                    inline-flex items-center gap-2
                                                    px-3 py-1.5
                                                    rounded-full
                                                    text-xs
                                                    font-semibold
                                                    ${
                                                        donor.availability
                                                            ? "bg-green-50 text-green-600"
                                                            : "bg-gray-100 text-gray-500"
                                                    }
                                                `}
                                            >
                                                <span
                                                    className={`
                                                        w-2 h-2 rounded-full
                                                        ${
                                                            donor.availability
                                                                ? "bg-green-500"
                                                                : "bg-gray-400"
                                                        }
                                                    `}
                                                />

                                                {donor.availability
                                                    ? "Available now"
                                                    : "Unavailable"}
                                            </span>
                                        </div>

                                        {/* DETAILS */}
                                        <div className="mt-7 space-y-5">

                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                    Donor
                                                </p>

                                                <p className="font-semibold text-gray-900 mt-1">
                                                    {donor.userId?.name ||
                                                        "Community Donor"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                    Location
                                                </p>

                                                <p className="font-medium text-gray-700 mt-1">
                                                    {donor.location}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                                    Contact
                                                </p>

                                                <p className="font-medium text-gray-700 mt-1">
                                                    {donor.contact ||
                                                        donor.userId?.phone ||
                                                        "Not available"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* STATUS */}
                                        {status && (
                                            <div
                                                className={`
                                                    mt-5 px-4 py-3 rounded-xl text-sm font-medium
                                                    ${
                                                        status.type === "success"
                                                            ? "bg-green-50 text-green-600 border border-green-100"
                                                            : "bg-red-50 text-red-600 border border-red-100"
                                                    }
                                                `}
                                            >
                                                {status.message}
                                            </div>
                                        )}

                                        {/* REQUEST BUTTON */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleSendRequest(donor)
                                            }
                                            disabled={
                                                requesting === donor._id ||
                                                !donor.availability
                                            }
                                            className="
                                                w-full
                                                mt-6
                                                py-3.5
                                                rounded-xl
                                                bg-gray-900
                                                text-white
                                                font-semibold
                                                hover:bg-black
                                                transition
                                                disabled:opacity-50
                                                disabled:cursor-not-allowed
                                            "
                                        >
                                            {requesting === donor._id
                                                ? "Sending Request..."
                                                : "Send Connection Request"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}

export default FindBlood;
