import { useEffect, useState } from "react";
import { registerBloodDonor, getProfile } from "../services/api";

function BloodDonor() {
    const [formData, setFormData] = useState({
        bloodGroup: "",
        location: "",
        availability: true
    });

    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await getProfile();

                const user = response.user;

                setFormData((prev) => ({
                    ...prev,
                    location: user.location || ""
                }));
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Failed to load your profile."
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
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!formData.bloodGroup || !formData.location) {
            setError("Please select your blood group and enter your location.");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));

        const userId = user?.id || user?._id;

        if (!userId) {
            setError("User information not found. Please login again.");
            return;
        }

        setRegistering(true);

        try {
            const response = await registerBloodDonor({
                userId,
                bloodGroup: formData.bloodGroup,
                location: formData.location,
                availability: formData.availability
            });

            setMessage(
                response.message ||
                "You are now registered as a blood donor."
            );

            setRegistered(true);

        } catch (error) {
            const status = error.response?.status;

            if (status === 409) {
                setRegistered(true);
            }

            setError(
                error.response?.data?.message ||
                "Failed to register as a blood donor."
            );
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto" />

                    <p className="mt-4 text-gray-500">
                        Loading your profile...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">

            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">

                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-100 mb-6">
                    <span className="text-3xl font-bold text-red-600">
                        +
                    </span>
                </div>

                <p className="text-sm font-semibold tracking-[0.2em] text-red-600 uppercase">
                    Blood Donation
                </p>

                <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                    Become a Blood Donor
                </h1>

                <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                    Your one registration could help someone find the blood
                    they need when it matters most.
                </p>

            </div>

            {/* Main Card */}
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6">

                {/* Information Card */}
                <div className="rounded-3xl bg-gray-950 text-white p-8 md:p-10 shadow-xl">

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <span className="text-xl text-red-400">
                                +
                            </span>
                        </div>

                        <span className="font-semibold">
                            Community Connect
                        </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                        Be someone's reason to hope.
                    </h2>

                    <p className="mt-4 text-gray-400 leading-relaxed">
                        By registering as a donor, people nearby can discover
                        that you are available to help.
                    </p>

                    <div className="mt-10 space-y-5">

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <span className="text-sm">01</span>
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Register
                                </h3>

                                <p className="text-sm text-gray-400 mt-1">
                                    Tell us your blood group and location.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <span className="text-sm">02</span>
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Stay available
                                </h3>

                                <p className="text-sm text-gray-400 mt-1">
                                    Keep your availability status updated.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                <span className="text-sm">03</span>
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    Help someone
                                </h3>

                                <p className="text-sm text-gray-400 mt-1">
                                    People can send you a connection request.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Registration Form */}
                <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-white/70 shadow-xl p-8 md:p-10">

                    {registered && !error ? (
                        <div className="min-h-[400px] flex flex-col items-center justify-center text-center">

                            <div className="w-20 h-20 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                                <svg
                                    className="w-10 h-10 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>

                            <h2 className="mt-6 text-2xl font-bold text-gray-900">
                                You're registered
                            </h2>

                            <p className="mt-2 max-w-sm text-gray-500">
                                You are now listed as a blood donor on
                                Community Connect.
                            </p>

                            <div className="mt-6 px-5 py-3 rounded-xl bg-red-50 text-red-600 font-bold">
                                {formData.bloodGroup}
                            </div>

                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-7"
                        >

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Donor details
                                </h2>

                                <p className="text-gray-500 mt-1">
                                    Enter the details people will use to find
                                    you.
                                </p>
                            </div>

                            {/* Blood Group */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Blood Group
                                </label>

                                <select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                                >
                                    <option value="">
                                        Select blood group
                                    </option>

                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Akurdi"
                                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-50"
                                />

                                <p className="text-xs text-gray-400 mt-2">
                                    Use the area or locality where you are
                                    generally available.
                                </p>
                            </div>

                            {/* Availability */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">

                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Available to donate
                                    </p>

                                    <p className="text-sm text-gray-500 mt-1">
                                        People can find you when this is on.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            availability: !prev.availability
                                        }))
                                    }
                                    className={`relative w-12 h-7 rounded-full transition ${
                                        formData.availability
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition ${
                                            formData.availability
                                                ? "left-6"
                                                : "left-1"
                                        }`}
                                    />
                                </button>

                            </div>

                            {/* Messages */}
                            {message && (
                                <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={registering}
                                className="w-full py-3.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {registering
                                    ? "Registering..."
                                    : "Register as Blood Donor"}
                            </button>

                            <p className="text-center text-xs text-gray-400">
                                Your contact information comes from your
                                Community Connect profile.
                            </p>

                        </form>
                    )}

                </div>

            </div>
        </main>
    );
}

export default BloodDonor;