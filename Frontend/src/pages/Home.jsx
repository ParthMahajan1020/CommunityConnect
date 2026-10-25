import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Droplets,
  HeartHandshake,
  Wrench,
  UserRoundPlus,
  Sparkles,
  ShieldCheck,
  Activity,
  Clock3,
  Building2,
  KeyRound,
  Users
} from "lucide-react";
import NetworkIllustration from "../components/visuals/NetworkIllustration";

export default function Home() {
  const navigate = useNavigate();

  const featureBlocks = [
    {
      id: "blood-find",
      title: "Need Blood",
      subtitle: "8 blood groups covered",
      route: "/blood",
      icon: Droplets,
      accent: "red",
      tag: "Urgent",
      bg: "hover:border-[#E8BFC4] hover:shadow-[0_12px_30px_rgba(201,76,85,0.08)]",
    },
    {
      id: "blood-donate",
      title: "Donate Blood",
      subtitle: "Save someone nearby",
      route: "/blood/donor",
      icon: HeartHandshake,
      accent: "red",
      tag: "Give Hope",
      bg: "hover:border-[#E8BFC4] hover:shadow-[0_12px_30px_rgba(201,76,85,0.08)]",
    },
    {
      id: "service-find",
      title: "Need Help",
      subtitle: "Verified local helpers",
      route: "/services",
      icon: Wrench,
      accent: "blue",
      tag: "Daily Care",
      bg: "hover:border-[#BED2E8] hover:shadow-[0_12px_30px_rgba(75,120,168,0.08)]",
    },
    {
      id: "service-provide",
      title: "Provide Help",
      subtitle: "Share your skills",
      route: "/services/provider",
      icon: UserRoundPlus,
      accent: "blue",
      tag: "Community",
      bg: "hover:border-[#BED2E8] hover:shadow-[0_12px_30px_rgba(75,120,168,0.08)]",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Choose need",
      caption: "Blood or local service",
      icon: Activity,
    },
    {
      num: "02",
      title: "Match nearby",
      caption: "Instant local availability",
      icon: Sparkles,
    },
    {
      num: "03",
      title: "Connect directly",
      caption: "Fast, peer-to-peer request",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#24342E]">
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {/* =======================================================
            HERO: Visual Network + Concise Headline
        ======================================================= */}
        <section className="relative overflow-hidden rounded-[2rem] border border-[#E2E9E4] bg-white p-6 shadow-[0_12px_40px_rgba(36,52,46,0.04)] sm:p-10 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            {/* Left Headline */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DCE9E0] bg-[#EDF5EF] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#427A65]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Community Resilience
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="max-w-xl text-3xl font-bold tracking-tight text-[#24342E] sm:text-5xl lg:text-6xl"
              >
                Community help,{" "}
                <span className="text-[#427A65]">connected.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 max-w-lg text-sm text-[#6F7D76] sm:text-base leading-relaxed"
              >
                Three connected portals uniting neighbors, accredited blood banks, hospitals, and professional service providers on a unified ecosystem.
              </motion.p>

              {/* Fast Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => navigate("/blood")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#C94C55] px-5 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#B53D46] active:scale-[0.98]"
                >
                  <Droplets className="h-4 w-4" />
                  Find Blood
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#D0DFEF] bg-[#EAF1FA] px-5 py-3 text-sm font-semibold text-[#4B78A8] shadow-xs transition hover:bg-[#DEEAF7] active:scale-[0.98]"
                >
                  <Wrench className="h-4 w-4" />
                  Find Services
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/private/login")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#E2E9E4] bg-white px-4 py-3 text-sm font-semibold text-[#24342E] shadow-xs transition hover:bg-[#F8FAF9] active:scale-[0.98]"
                >
                  <Building2 className="h-4 w-4 text-[#4B78A8]" />
                  Org Portal
                </button>
              </motion.div>

              {/* Micro Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-wrap items-center gap-4 text-xs font-medium text-[#7A8881]"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#427A65]" /> Verified Members
                </span>
                <span className="text-[#D3DED7]">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4 text-[#427A65]" /> Real-time Matching
                </span>
                <span className="text-[#D3DED7]">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-[#4B78A8]" /> Accredited Centers
                </span>
              </motion.div>
            </div>

            {/* Right: Interactive Central Network Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <NetworkIllustration />
            </motion.div>
          </div>
        </section>

        {/* =======================================================
            VISUAL FEATURE TILES
        ======================================================= */}
        <section className="mt-8 sm:mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-[#24342E] sm:text-2xl">
              Quick Actions
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6F7D76]">
              Choose Path
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4">
            {featureBlocks.map((item) => {
              const isRed = item.accent === "red";
              const Icon = item.icon;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.route)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative flex flex-col items-start rounded-3xl border bg-white p-4.5 sm:p-6 text-left transition-all ${
                    isRed
                      ? "border-[#F2D5D8] hover:border-[#C94C55]/40"
                      : "border-[#D8E4F2] hover:border-[#4B78A8]/40"
                  } ${item.bg}`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 ${
                        isRed
                          ? "bg-[#FBEAEC] text-[#C94C55]"
                          : "bg-[#EAF1FA] text-[#4B78A8]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isRed
                          ? "bg-[#FBEAEC] text-[#C94C55]"
                          : "bg-[#EAF1FA] text-[#4B78A8]"
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <h3 className="text-base font-bold text-[#24342E] sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#6F7D76]">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-[#24342E] group-hover:text-[#427A65] transition-colors">
                    <span>Open</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* =======================================================
            VISUAL WORKFLOW
        ======================================================= */}
        <section className="mt-8 rounded-[2rem] border border-[#E2E9E4] bg-white p-6 shadow-xs sm:mt-12 sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#427A65]">
                Process
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-[#24342E] sm:text-2xl">
                How connections work
              </h2>
            </div>
            <span className="text-xs text-[#7B8880]">3 simple steps</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative flex flex-col rounded-2xl border border-[#EAEFEA] bg-[#FAFBFA] p-5 transition hover:border-[#CFDEC9]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#427A65]">
                      {step.num}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#427A65] shadow-2xs">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <h3 className="mt-4 text-base font-bold text-[#24342E]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#6F7D76]">
                    {step.caption}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* =======================================================
            THREE INTEGRATED PORTALS OVERVIEW
        ======================================================= */}
        <section className="mt-8 sm:mt-12">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#427A65]">
                Platform Ecosystem
              </span>
              <h2 className="text-xl font-bold tracking-tight text-[#24342E] sm:text-2xl">
                Three Integrated Portals
              </h2>
            </div>
            <span className="text-xs text-[#6F7D76]">Unified Backend & Database</span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Portal 1 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#D5E7DB] bg-white p-6 shadow-2xs hover:shadow-xs transition">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
                  <Users className="h-6 w-6" />
                </div>
                <span className="mt-3 inline-block rounded-full bg-[#E5F1EA] px-2.5 py-0.5 text-[10px] font-bold text-[#427A65]">
                  PORTAL 1
                </span>
                <h3 className="mt-2 text-lg font-bold text-[#24342E]">Public User Portal</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#6F7D76]">
                  For local citizens seeking emergency blood, donating blood, finding everyday community services, and offering neighborhood help.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EEF2EF]">
                <button
                  type="button"
                  onClick={() => navigate("/blood")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#427A65] py-2.5 text-xs font-semibold text-white transition hover:bg-[#356651]"
                >
                  Explore Public Portal <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Portal 2 */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#D8E4F2] bg-white p-6 shadow-2xs hover:shadow-xs transition">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="mt-3 inline-block rounded-full bg-[#EAF1FA] px-2.5 py-0.5 text-[10px] font-bold text-[#4B78A8]">
                  PORTAL 2
                </span>
                <h3 className="mt-2 text-lg font-bold text-[#24342E]">Organization Portal</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#6F7D76]">
                  For accredited Blood Banks, Hospitals, and Professional Service Providers with stock tracking and request management.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EEF2EF]">
                <button
                  type="button"
                  onClick={() => navigate("/private/login")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4B78A8] py-2.5 text-xs font-semibold text-white transition hover:bg-[#3D648E]"
                >
                  Organization Portal <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Portal 3 */}
            <div className="flex flex-col justify-between rounded-3xl border border-slate-300 bg-white p-6 shadow-2xs hover:shadow-xs transition">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
                  <KeyRound className="h-6 w-6" />
                </div>
                <span className="mt-3 inline-block rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold text-slate-800">
                  PORTAL 3
                </span>
                <h3 className="mt-2 text-lg font-bold text-[#24342E]">Admin Portal</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#6F7D76]">
                  For authorized verification officers and platform supervisors to approve organizations, review audit logs, and oversee the ecosystem.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EEF2EF]">
                <button
                  type="button"
                  onClick={() => navigate("/admin/login")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#24342E] py-2.5 text-xs font-semibold text-white transition hover:bg-[#34463D]"
                >
                  Admin Control <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
