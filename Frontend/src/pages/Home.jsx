import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Sparkles,
  UserRoundPlus,
  Wrench,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const primaryActions = [
  {
    title: "Need Blood",
    description: "Find a suitable donor near you when timing matters most.",
    accent: "red",
    route: "/blood",
    icon: Droplets,
  },
  {
    title: "Donate Blood",
    description:
      "Register as a donor and help your community when someone needs you.",
    accent: "red",
    route: "/blood/donor",
    icon: HeartHandshake,
  },
  {
    title: "Need Help",
    description:
      "Discover trusted local helpers for home, repair, and daily needs.",
    accent: "blue",
    route: "/services",
    icon: Wrench,
  },
  {
    title: "Provide Help",
    description:
      "Share your skills and become an available local service provider.",
    accent: "blue",
    route: "/services/provider",
    icon: UserRoundPlus,
  },
];

const howItWorks = [
  "Choose what you need.",
  "Find a suitable available person.",
  "Send a request and manage the connection.",
];

const communityHighlights = [
  "Blood support for urgent and local needs",
  "Care for household and everyday tasks",
  "Clear request flow for both donors and helpers",
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#24342E]">
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[1.75rem] border border-[#E2E9E4] bg-white px-5 py-7 shadow-[0_10px_30px_rgba(36,52,46,0.04)] sm:rounded-[2rem] sm:px-8 sm:py-8 lg:px-12 lg:py-12">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(66,122,101,0.10),_transparent_62%)] lg:block" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DDE7E1] bg-[#F0F5F2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#427A65] sm:mb-5">
                <Sparkles className="h-3.5 w-3.5" />
                Community support
              </div>

              <h1 className="max-w-xl text-3xl font-bold tracking-[-0.05em] text-[#24342E] sm:text-5xl lg:text-6xl">
                Help is closer than you think.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-[#6F7D76] sm:mt-5 sm:text-lg sm:leading-7">
                Find trusted blood donors and local helpers in your community.
                Connect with people who can make a difference when you need it
                most.
              </p>
            </div>

            {/* Community Highlights */}
            <div className="relative hidden justify-center lg:flex lg:justify-end">
              <div className="w-full max-w-md rounded-[1.8rem] border border-[#E2E9E4] bg-[#F0F5F2] p-5 shadow-[0_18px_40px_rgba(66,122,101,0.08)]">
                <div className="rounded-[1.4rem] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
                        <MapPinned className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#6F7D76]">
                          Nearby support
                        </p>
                        <p className="text-sm font-semibold text-[#24342E]">
                          Your neighborhood
                        </p>
                      </div>
                    </div>

                    <div className="rounded-full bg-[#EAF1FA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6C8FBC]">
                      Local
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {communityHighlights.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-2xl border border-[#EEF2EF] bg-[#F8FAF9] p-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#427A65]" />
                        <p className="text-sm leading-6 text-[#24342E]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Actions: Compact on Mobile */}
        <section className="mt-9 sm:mt-14">
          <div className="mb-5 sm:mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F7D76]">
              Start here
            </p>

            <h2 className="mt-2 max-w-lg text-2xl font-bold tracking-[-0.04em] text-[#24342E] sm:text-3xl">
              Choose how you want to help
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            {primaryActions.map(
              ({ title, description, accent, route, icon: Icon }) => {
                const isBlood = accent === "red";

                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => navigate(route)}
                    aria-label={`${title}: ${description}`}
                    className={`group flex min-h-[142px] min-w-0 flex-col items-start rounded-2xl border p-3.5 text-left transition duration-200 active:scale-[0.98] sm:min-h-[210px] sm:rounded-[1.6rem] sm:p-5 lg:hover:-translate-y-1 lg:hover:shadow-[0_18px_32px_rgba(36,52,46,0.06)] ${
                      isBlood
                        ? "border-[#F2D9DC] bg-[#FBEAEC] hover:border-[#EBC4C9]"
                        : "border-[#DDE8F6] bg-[#EAF1FA] hover:border-[#C9D9ED]"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white sm:h-12 sm:w-12 ${
                        isBlood ? "text-[#C94C55]" : "text-[#6C8FBC]"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>

                    {/* Action title */}
                    <div className="mt-3 flex w-full min-w-0 items-center justify-between gap-1.5 sm:mt-5 sm:gap-2">
                      <h3 className="min-w-0 text-[15px] font-semibold leading-snug tracking-[-0.035em] text-[#24342E] sm:text-xl">
                        {title}
                      </h3>

                      <ArrowRight
                        className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 ${
                          isBlood ? "text-[#C94C55]" : "text-[#6C8FBC]"
                        }`}
                      />
                    </div>

                    {/* Descriptions only on larger screens */}
                    <p className="mt-2 hidden text-sm leading-6 text-[#6F7D76] sm:block">
                      {description}
                    </p>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* Why CommunityConnect */}
        <section className="mt-10 rounded-[1.75rem] border border-[#E2E9E4] bg-white p-5 sm:mt-16 sm:rounded-[2rem] sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-8">
            <div className="rounded-[1.4rem] bg-[#F4F8F6] p-5 sm:p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65] sm:h-16 sm:w-16">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-[-0.04em] text-[#24342E] sm:mt-6 sm:text-3xl">
                Finding the right help should be simple.
              </h2>
            </div>

            <div className="space-y-5 text-sm leading-7 text-[#6F7D76] sm:text-base">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-[#24342E] sm:text-xl">
                  Blood
                </h3>

                <p>
                  During a stressful moment, locating an available and suitable
                  donor can be difficult. CommunityConnect lets people find
                  nearby matches without the confusion of scattered messages
                  or missed calls.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-semibold text-[#24342E] sm:text-xl">
                  Local services
                </h3>

                <p>
                  Finding the right person for home help, upkeep, or practical
                  support nearby can take time. CommunityConnect brings local
                  providers and requesters into one simple, easy-to-use
                  experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Blood Information: Desktop Only */}
        <section className="mt-16 hidden gap-6 lg:grid lg:grid-cols-2">
          <div className="rounded-[2rem] border border-[#F2D9DC] bg-[#FBEAEC] p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#C94C55]">
              <Droplets className="h-3.5 w-3.5" />
              Blood care
            </div>

            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#24342E]">
              Looking for a blood donor?
            </h2>

            <p className="mt-3 max-w-lg leading-7 text-[#6F7D76]">
              Search for nearby donors based on location and blood group to
              connect with the right person when you need support.
            </p>

            <button
              type="button"
              onClick={() => navigate("/blood")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#C94C55] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b74249]"
            >
              Find Blood
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-[2rem] border border-[#F2D9DC] bg-white p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FBEAEC] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#C94C55]">
              <HeartHandshake className="h-3.5 w-3.5" />
              Give back
            </div>

            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#24342E]">
              Become a donor
            </h2>

            <p className="mt-3 max-w-lg leading-7 text-[#6F7D76]">
              Register to help people in your area. Your availability and
              location can make a real difference for someone who needs blood
              support.
            </p>

            <button
              type="button"
              onClick={() => navigate("/blood/donor")}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E2C8CB] bg-[#FFF7F7] px-5 py-3 text-sm font-semibold text-[#C94C55] transition hover:bg-[#FDEDEF]"
            >
              Become a Donor
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Local Services Information: Desktop Only */}
        <section className="mt-16 hidden gap-6 lg:grid lg:grid-cols-2">
          <div className="rounded-[2rem] border border-[#DDE8F6] bg-[#EAF1FA] p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6C8FBC]">
              <Wrench className="h-3.5 w-3.5" />
              Local services
            </div>

            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#24342E]">
              Need help around the house?
            </h2>

            <p className="mt-3 max-w-lg leading-7 text-[#6F7D76]">
              Explore trusted local helpers for housekeeping, plumbing,
              electrical work, cleaning, and other everyday services. You can
              specify the type and duration of help you need and connect with
              available people nearby.
            </p>

            <ul className="mt-5 flex flex-wrap gap-2 text-sm text-[#24342E]">
              {[
                "Housekeeping",
                "Plumbing",
                "Electrical work",
                "Cleaning",
                "Other services",
              ].map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[#D0DDED] bg-white/60 px-3 py-1.5"
                >
                  {item}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => navigate("/services")}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#6C8FBC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5d7ea7]"
            >
              Find a Service
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-[2rem] border border-[#DDE8F6] bg-white p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EAF1FA] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6C8FBC]">
              <UserRoundPlus className="h-3.5 w-3.5" />
              Offer support
            </div>

            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#24342E]">
              Provide a service
            </h2>

            <p className="mt-3 max-w-lg leading-7 text-[#6F7D76]">
              If you have skills to share, register as a provider and make
              yourself available for short-term or recurring support in your
              area.
            </p>

            <button
              type="button"
              onClick={() => navigate("/services/provider")}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#CFDDEA] bg-[#F4F8FC] px-5 py-3 text-sm font-semibold text-[#6C8FBC] transition hover:bg-[#EBF2FA]"
            >
              Provide a Service
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-10 rounded-[1.75rem] border border-[#E2E9E4] bg-white p-5 sm:mt-16 sm:rounded-[2rem] sm:p-8 lg:p-10">
          <div className="text-left sm:text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F7D76]">
              How it works
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#24342E] sm:text-3xl">
              Simple steps to get connected
            </h2>
          </div>

          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
            {howItWorks.map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-[#E2E9E4] bg-[#F8FAF9] p-4 sm:rounded-[1.4rem] sm:p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#E5F1EA] text-sm font-bold text-[#427A65] sm:mb-4 sm:h-10 sm:w-10">
                  {index + 1}
                </div>

                <p className="text-base font-semibold text-[#24342E] sm:text-lg">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E9E4] bg-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                <HeartHandshake className="h-5 w-5" />
              </div>

              <span className="text-xl font-bold tracking-[-0.04em] text-[#24342E]">
                CommunityConnect
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[#6F7D76]">
              A simple, people-first platform for local support, connection,
              and community care.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F7D76]">
              Explore
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-[#24342E]">
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/home")}
                  className="hover:text-[#427A65]"
                >
                  Home
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => navigate("/blood")}
                  className="hover:text-[#427A65]"
                >
                  Find Blood
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="hover:text-[#427A65]"
                >
                  Find Services
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F7D76]">
              Account
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-[#24342E]">
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="hover:text-[#427A65]"
                >
                  Profile
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => navigate("/requests")}
                  className="hover:text-[#427A65]"
                >
                  My Requests
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => navigate("/feedback")}
                  className="hover:text-[#427A65]"
                >
                  Feedback
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F7D76]">
              Connect
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-[#24342E]">
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="hover:text-[#427A65]"
                >
                  Login
                </button>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="hover:text-[#427A65]"
                >
                  Create account
                </button>
              </li>

              <li className="text-[#6F7D76]">
                © {new Date().getFullYear()} CommunityConnect
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;