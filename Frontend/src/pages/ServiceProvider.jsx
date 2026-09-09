import { useState } from "react";
import { registerServiceProvider } from "../services/api";

function ServiceProvider() {
    const [formData, setFormData] = useState({
        serviceType: "",
        location: "",
        availability: true
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

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
        "Other"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
        setMessage("");
    };

    const handleAvailability = () => {
        setFormData((prev) => ({
            ...prev,
            availability: !prev.availability
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (!formData.serviceType || !formData.location.trim()) {
            setError("Please select a service and enter your location.");
            return;
        }

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
            setError("Please login first.");
            return;
        }

        setLoading(true);

        try {
            const response = await registerServiceProvider({
                serviceType: formData.serviceType,
                location: formData.location.trim(),
                availability: formData.availability
            });

            setMessage(
                response.message ||
                "You are now registered as a service provider."
            );

            setFormData({
                serviceType: "",
                location: "",
                availability: true
            });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to register as a service provider."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen px-6 pb-20">

            {/* HERO */}
            <section className="max-w-5xl mx-auto pt-10 md:pt-16 text-center">

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    LOCAL SERVICES
                </div>

                <h1 className="mt-6 text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
                    Provide
                    <span className="text-blue-600"> a Service</span>
                </h1>

                <p className="mt-5 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                    Share your skills with people around you and help
                    your local community.
                </p>
            </section>

            {/* FORM */}
            <section className="max-w-3xl mx-auto mt-12">

                <div className="bg-white/85 backdrop-blur-xl border border-white/70 shadow-2xl rounded-[2rem] p-7 md:p-10">

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Register your service
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Tell people what you can help them with.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* SERVICE TYPE */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                What service do you provide?
                            </label>

                            <select
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleChange}
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
                                    focus:border-blue-400
                                    focus:ring-4
                                    focus:ring-blue-50
                                "
                            >
                                <option value="">
                                    Select a service
                                </option>

                                {serviceTypes.map((service) => (
                                    <option
                                        key={service}
                                        value={service}
                                    >
                                        {service}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* LOCATION */}
                        <div className="mt-7">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Service Location
                            </label>

                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Enter your city or area"
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
                                    focus:border-blue-400
                                    focus:ring-4
                                    focus:ring-blue-50
                                "
                            />

                            <p className="text-xs text-gray-400 mt-2">
                                People nearby will be able to find your service.
                            </p>
                        </div>

                        {/* AVAILABILITY */}
                        <div className="mt-7">

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Availability
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Let people know if you're currently available.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAvailability}
                                    className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${formData.availability ? "bg-blue-600" : "bg-gray-300"
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.availability ? "translate-x-6" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* SUCCESS */}
                        {message && (
                            <div className="mt-6 px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm font-medium">
                                {message}
                            </div>
                        )}

                        {/* SUBMIT */}
                        <button
                            type="submit"
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
                            {loading
                                ? "Registering..."
                                : "Register as Service Provider"}
                        </button>

                    </form>
                </div>
            </section>

            {/* INFO */}
            <section className="max-w-3xl mx-auto mt-8">

                <div className="grid md:grid-cols-3 gap-4">

                    <div className="bg-white/70 border rounded-2xl p-5">
                        <p className="text-blue-600 font-bold text-lg">
                            01
                        </p>
                        <h3 className="font-semibold mt-2">
                            Register
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Tell us what service you provide.
                        </p>
                    </div>

                    <div className="bg-white/70 border rounded-2xl p-5">
                        <p className="text-blue-600 font-bold text-lg">
                            02
                        </p>
                        <h3 className="font-semibold mt-2">
                            Get discovered
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            People nearby can find your service.
                        </p>
                    </div>

                    <div className="bg-white/70 border rounded-2xl p-5">
                        <p className="text-blue-600 font-bold text-lg">
                            03
                        </p>
                        <h3 className="font-semibold mt-2">
                            Help others
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Receive and respond to service requests.
                        </p>
                    </div>

                </div>
            </section>

        </main>
    );
}

export default ServiceProvider;
