import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen overflow-hidden">
            <main className="relative">
                {/* HERO */}
                <section className="max-w-7xl mx-auto px-6 md:px-8 pt-10 md:pt-14 pb-12">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
                            Community
                            <span className="text-red-600">
                                Connect
                            </span>
                        </h1>

                        <p className="mt-5 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            A simple platform to connect people who need help
                            with people who can provide it.
                        </p>
                    </div>
                </section>

                {/* MAIN SECTIONS */}
                <section className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
                    <div className="grid lg:grid-cols-2 gap-6 md:gap-8">

                        {/* BLOOD */}
                        <div
                            className="
                                group
                                overflow-hidden
                                rounded-3xl
                                bg-white/75
                                backdrop-blur-xl
                                border
                                border-white/70
                                shadow-xl
                                hover:shadow-2xl
                                hover:-translate-y-1
                                transition-all
                                duration-500
                            "
                        >
                            <div className="p-7 md:p-10">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="
                                            w-14
                                            h-14
                                            rounded-2xl
                                            bg-red-50/90
                                            flex
                                            items-center
                                            justify-center
                                            transition-transform
                                            duration-500
                                            group-hover:scale-110
                                        "
                                    >
                                        <span className="text-3xl text-red-600">
                                            +
                                        </span>
                                    </div>

                                    <span className="text-sm font-semibold tracking-wider text-red-600">
                                        BLOOD
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-8">
                                    Blood
                                </h2>

                                <p className="text-gray-600 mt-3 max-w-md leading-relaxed">
                                    Connect blood donors with people who need
                                    blood quickly and locally.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4 mt-8">

                                    {/* DONOR */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/blood/donor")
                                        }
                                        className="
                                            group/action
                                            text-left
                                            p-5
                                            rounded-2xl
                                            bg-white/70
                                            border
                                            border-gray-200
                                            hover:border-red-300
                                            hover:bg-red-50/80
                                            hover:-translate-y-1
                                            transition-all
                                            duration-300
                                        "
                                    >
                                        <p className="font-bold text-gray-900">
                                            Become a Donor
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Register yourself as a blood donor.
                                        </p>

                                        <span
                                            className="
                                                inline-block
                                                mt-4
                                                text-sm
                                                font-semibold
                                                text-red-600
                                                transition-transform
                                                duration-300
                                                group-hover/action:translate-x-1
                                            "
                                        >
                                            Donate →
                                        </span>
                                    </button>

                                    {/* FIND BLOOD */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/blood")
                                        }
                                        className="
                                            group/action
                                            text-left
                                            p-5
                                            rounded-2xl
                                            bg-white/70
                                            border
                                            border-gray-200
                                            hover:border-red-300
                                            hover:bg-red-50/80
                                            hover:-translate-y-1
                                            transition-all
                                            duration-300
                                        "
                                    >
                                        <p className="font-bold text-gray-900">
                                            Need Blood
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Find a suitable blood donor nearby.
                                        </p>

                                        <span
                                            className="
                                                inline-block
                                                mt-4
                                                text-sm
                                                font-semibold
                                                text-red-600
                                                transition-transform
                                                duration-300
                                                group-hover/action:translate-x-1
                                            "
                                        >
                                            Find Blood →
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SERVICES */}
                        <div
                            className="
                                group
                                overflow-hidden
                                rounded-3xl
                                bg-white/75
                                backdrop-blur-xl
                                border
                                border-white/70
                                shadow-xl
                                hover:shadow-2xl
                                hover:-translate-y-1
                                transition-all
                                duration-500
                            "
                        >
                            <div className="p-7 md:p-10">
                                <div className="flex items-center justify-between">
                                    <div
                                        className="
                                            w-14
                                            h-14
                                            rounded-2xl
                                            bg-blue-50/90
                                            flex
                                            items-center
                                            justify-center
                                            transition-transform
                                            duration-500
                                            group-hover:scale-110
                                        "
                                    >
                                        <span className="text-2xl font-bold text-blue-600">
                                            +
                                        </span>
                                    </div>

                                    <span className="text-sm font-semibold tracking-wider text-blue-600">
                                        SERVICES
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-8">
                                    Local Services
                                </h2>

                                <p className="text-gray-600 mt-3 max-w-md leading-relaxed">
                                    Find trusted local professionals or offer
                                    your own skills to people around you.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4 mt-8">

                                    {/* PROVIDE */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/services/provider")
                                        }
                                        className="
                                            group/action
                                            text-left
                                            p-5
                                            rounded-2xl
                                            bg-white/70
                                            border
                                            border-gray-200
                                            hover:border-blue-300
                                            hover:bg-blue-50/80
                                            hover:-translate-y-1
                                            transition-all
                                            duration-300
                                        "
                                    >
                                        <p className="font-bold text-gray-900">
                                            Provide a Service
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Offer your skills and services locally.
                                        </p>

                                        <span
                                            className="
                                                inline-block
                                                mt-4
                                                text-sm
                                                font-semibold
                                                text-blue-600
                                                transition-transform
                                                duration-300
                                                group-hover/action:translate-x-1
                                            "
                                        >
                                            Get Started →
                                        </span>
                                    </button>

                                    {/* FIND SERVICE */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/services")
                                        }
                                        className="
                                            group/action
                                            text-left
                                            p-5
                                            rounded-2xl
                                            bg-white/70
                                            border
                                            border-gray-200
                                            hover:border-blue-300
                                            hover:bg-blue-50/80
                                            hover:-translate-y-1
                                            transition-all
                                            duration-300
                                        "
                                    >
                                        <p className="font-bold text-gray-900">
                                            Need a Service
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Find people who can help you nearby.
                                        </p>

                                        <span
                                            className="
                                                inline-block
                                                mt-4
                                                text-sm
                                                font-semibold
                                                text-blue-600
                                                transition-transform
                                                duration-300
                                                group-hover/action:translate-x-1
                                            "
                                        >
                                            Find Help →
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;