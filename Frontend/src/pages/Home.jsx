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
    description: "Register as a donor and help your community when someone needs you.",
    accent: "red",
    route: "/blood/donor",
    icon: HeartHandshake,
  },
  {
    title: "Need Help",
    description: "Discover trusted local helpers for home, repair, and daily needs.",
    accent: "blue",
    route: "/services",
    icon: Wrench,
  },
  {
    title: "Provide Help",
    description: "Share your skills and become an available local service provider.",
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
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-[#E2E9E4] bg-white px-5 py-8 shadow-[0_10px_30px_rgba(36,52,46,0.04)] sm:px-8 lg:px-12 lg:py-12">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(66,122,101,0.10),_transparent_62%)] lg:block" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#DDE7E1] bg-[#F0F5F2] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#427A65]">
                <Sparkles className="h-3.5 w-3.5" />
                Community support
              </div>

              <h1 className="max-w-xl text-4xl font-bold tracking-[-0.05em] text-[#24342E] sm:text-5xl lg:text-6xl">
                Help is closer than you think.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-[#6F7D76] sm:text-lg">
                Find trusted blood donors and local helpers in your community. Connect with people who can make a difference when you need it most.
              </p>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-[1.8rem] border border-[#E2E9E4] bg-[#F0F5F2] p-5 shadow-[0_18px_40px_rgba(66,122,101,0.08)]">
                <div className="rounded-[1.4rem] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
                        <MapPinned className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#6F7D76]">Nearby support</p>
                        <p className="text-sm font-semibold text-[#24342E]">Your neighborhood</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-[#EAF1FA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6C8FBC]">
                      Local
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {communityHighlights.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#EEF2EF] bg-[#F8FAF9] p-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#427A65]" />
                        <p className="text-sm leading-6 text-[#24342E]">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F7D76]">Start here</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#24342E]">Choose how you want to help</h2>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {primaryActions.map(({ title, description, accent, route, icon: Icon }) => (
              <button
                key={title}
                type="button"
                onClick={() => navigate(route)}
                className={`group rounded-[1.6rem] border p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_32px_rgba(36,52,46,0.06)] ${
                  accent === "red"
                    ? "border-[#F2D9DC] bg-[#FBEAEC]"
                    : "border-[#DDE8F6] bg-[#EAF1FA]"
                }`}
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${accent === "red" ? "bg-white text-[#C94C55]" : "bg-white text-[#6C8FBC]"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#24342E]">{title}</h3>
                  <ArrowRight className={`h-4 w-4 ${accent === "red" ? "text-[#C94C55]" : "text-[#6C8FBC]"}`} />
                </div>
                <p className="text-sm leading-6 text-[#6F7D76]">{description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-[#E2E9E4] bg-white p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="rounded-[1.6rem] bg-[#F4F8F6] p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-[#24342E]">Finding the right help should be simple.</h2>
            </div>

            <div className="space-y-5 text-[#6F7D76]">
              <div>
                <h3 className="mb-2 text-xl font-semibold text-[#24342E]">Blood</h3>
                <p className="leading-7">
                  During a stressful moment, locating an available and suitable donor can be difficult. CommunityConnect lets people find nearby matches without the confusion of scattered messages or missed calls.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-[#24342E]">Local services</h3>
                <p className="leading-7">
                  Finding the right person for home help, upkeep, or practical support nearby can take time. CommunityConnect brings local providers and requesters into one simple, easy-to-use experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-[#F2D9DC] bg-[#FBEAEC] p-6 sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#C94C55]">
              <Droplets className="h-3.5 w-3.5" />
              Blood care
            </div>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#24342E]">Looking for a blood donor?</h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-[#6F7D76]">
              Search for nearby donors based on location and blood group to connect with the right person when you need support.
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

          <div className="rounded-[2rem] border border-[#F2D9DC] bg-white p-6 sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FBEAEC] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#C94C55]">
              <HeartHandshake className="h-3.5 w-3.5" />
              Give back
            </div>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#24342E]">Become a donor</h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-[#6F7D76]">
              Register to help people in your area. Your availability and location can make a real difference for someone who needs blood support.
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

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-[#DDE8F6] bg-[#EAF1FA] p-6 sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6C8FBC]">
              <Wrench className="h-3.5 w-3.5" />
              Local services
            </div>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#24342E]">Need help around the house?</h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-[#6F7D76]">
              Explore trusted local helpers for housekeeping, plumbing, electrical work, cleaning, and other everyday services. You can specify the type and duration of help you need and connect with available people nearby.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2 text-sm text-[#24342E]">
              {['Housekeeping', 'Plumbing', 'Electrical work', 'Cleaning', 'Other services'].map((item) => (
                <li key={item} className="rounded-full border border-[#D0DDED] bg-white/60 px-3 py-1.5">{item}</li>
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

          <div className="rounded-[2rem] border border-[#DDE8F6] bg-white p-6 sm:p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EAF1FA] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6C8FBC]">
              <UserRoundPlus className="h-3.5 w-3.5" />
              Offer support
            </div>
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#24342E]">Provide a service</h2>
            <p className="mt-3 max-w-lg text-base leading-7 text-[#6F7D76]">
              If you have skills to share, register as a provider and make yourself available for short-term or recurring support in your area.
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

        <section className="mt-16 rounded-[2rem] border border-[#E2E9E4] bg-white p-6 sm:p-8 lg:p-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6F7D76]">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#24342E]">Simple steps to get connected</h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {howItWorks.map((step, index) => (
              <div key={step} className="rounded-[1.4rem] border border-[#E2E9E4] bg-[#F8FAF9] p-5 text-left">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#E5F1EA] text-sm font-bold text-[#427A65]">
                  {index + 1}
                </div>
                <p className="text-lg font-semibold text-[#24342E]">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E2E9E4] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-[-0.04em] text-[#24342E]">CommunityConnect</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#6F7D76]">
              A simple, people-first platform for local support, connection, and community care.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F7D76]">Explore</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#24342E]">
              <li><button type="button" onClick={() => navigate("/home")} className="hover:text-[#427A65]">Home</button></li>
              <li><button type="button" onClick={() => navigate("/blood")} className="hover:text-[#427A65]">Find Blood</button></li>
              <li><button type="button" onClick={() => navigate("/services")} className="hover:text-[#427A65]">Find Services</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F7D76]">Account</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#24342E]">
              <li><button type="button" onClick={() => navigate("/profile")} className="hover:text-[#427A65]">Profile</button></li>
              <li><button type="button" onClick={() => navigate("/requests")} className="hover:text-[#427A65]">My Requests</button></li>
              <li><button type="button" onClick={() => navigate("/feedback")} className="hover:text-[#427A65]">Feedback</button></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6F7D76]">Connect</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#24342E]">
              <li><button type="button" onClick={() => navigate("/login")} className="hover:text-[#427A65]">Login</button></li>
              <li><button type="button" onClick={() => navigate("/register")} className="hover:text-[#427A65]">Create account</button></li>
              <li className="text-[#6F7D76]">© 2025 CommunityConnect</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;