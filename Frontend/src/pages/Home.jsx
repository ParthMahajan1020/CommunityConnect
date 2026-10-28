import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Droplets,
  HeartHandshake,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Search,
  CheckCircle2,
  Users,
  Sparkles
} from "lucide-react";
import ServiceCard from "../components/ui/ServiceCard";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import { getPublicStats } from "../services/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Home() {
  const navigate = useNavigate();

  const [bloodAvailability, setBloodAvailability] = useState({});
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("A+");
  const [serviceCategoryTab, setServiceCategoryTab] = useState("ALL");

  // Fetch real blood stock availability from backend
  useEffect(() => {
    let ignore = false;
    async function loadStats() {
      try {
        const res = await getPublicStats();
        if (!ignore && res?.success) {
          if (res.bloodAvailability) setBloodAvailability(res.bloodAvailability);
        }
      } catch (err) {
        console.error("Home stats fetch error:", err?.message || err);
      }
    }
    loadStats();
    return () => {
      ignore = true;
    };
  }, []);

  // Featured sample services (100% supported categories, no food)
  const sampleFeaturedServices = [
    {
      _id: "fs_1",
      category: "Electrician",
      title: "Electrical Inspection & Repairs",
      description: "Switchboard troubleshooting, home rewiring, and appliance checks.",
      pricing: 350,
      pricingType: "Hourly",
      location: "Akurdi, Pune",
      availability: true,
      isProfessional: true,
      organizationName: "Pune Technical Services",
    },
    {
      _id: "fs_2",
      category: "Cleaning",
      title: "Deep Kitchen & Home Sanitization",
      description: "Thorough floor scrubbing, sanitization, and deep kitchen cleaning.",
      pricing: 500,
      pricingType: "Fixed",
      location: "Nigdi, Pune",
      availability: true,
      isProfessional: true,
      organizationName: "CleanCare Professionals",
    },
    {
      _id: "fs_3",
      category: "Appliance",
      title: "Appliance & Air Conditioning Service",
      description: "Diagnostics, filter cleaning, and appliance servicing by certified local technician.",
      pricing: 450,
      pricingType: "Fixed",
      location: "Pimpri, Pune",
      availability: true,
      isProfessional: true,
      organizationName: "Pimpri Home Tech",
    },
    {
      _id: "fs_4",
      category: "Care",
      title: "Elderly Companion & Mobility Support",
      description: "Assistance with daily walks, medication reminders, and companionship.",
      pricing: 400,
      pricingType: "Hourly",
      location: "Kothrud, Pune",
      availability: true,
      isProfessional: true,
      organizationName: "Seva Elderly Care",
    },
    {
      _id: "fs_5",
      category: "Plumbing",
      title: "Emergency Pipe Leak Repair",
      description: "Rapid response plumber for bathroom leakages and drainage unclogging.",
      pricing: 300,
      pricingType: "Hourly",
      location: "Baner, Pune",
      availability: true,
      isProfessional: true,
      organizationName: "City Plumbers Alliance",
    },
    {
      _id: "fs_6",
      category: "Education",
      title: "Mathematics & Science Tutoring",
      description: "Patient home tutor for school students with concept clarity and doubt clearing.",
      pricing: 250,
      pricingType: "Hourly",
      location: "Wakad, Pune",
      availability: true,
      isProfessional: false,
      organizationName: "Community Mentor Network",
    },
  ];

  const filteredFeaturedServices = sampleFeaturedServices.filter((s) => {
    if (serviceCategoryTab === "ALL") return true;
    return s.category.toUpperCase().includes(serviceCategoryTab.toUpperCase());
  });

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#24342E]">
      
      {/* =========================================================
          1. DARK HERO SECTION (Cinematic, Visual, Editorial)
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#121815] text-white pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#427A65]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#C94C55]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#8AD4B2] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>CommunityConnect Network</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.05]">
                Help starts <br />
                <span className="text-[#8AD4B2]">nearby.</span>
              </h1>

              <p className="max-w-md text-base sm:text-lg font-medium text-white/70 leading-relaxed">
                Emergency blood matching and verified neighborhood services. Connect directly with people on your street.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/blood")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C94C55] px-7 py-4 text-xs font-bold text-white shadow-lg transition hover:bg-[#B53D46] active:scale-95"
                >
                  <Droplets className="h-4 w-4" />
                  <span>Find Blood</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-7 py-4 text-xs font-bold text-white transition backdrop-blur-md active:scale-95"
                >
                  <Wrench className="h-4 w-4 text-[#8AD4B2]" />
                  <span>Find Services</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 border-t border-white/10 pt-6 text-xs text-white/60">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#8AD4B2]" /> Verified Profiles
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#8EB8E5]" /> Direct Neighbors
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8AD4B2]" /> 0% Middlemen
                </span>
              </div>
            </motion.div>

            {/* Right: Visual Hero Image with Floating UI Badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 shadow-2xl aspect-4/3 sm:aspect-16/11">
                <ImageWithFallback
                  src="/images/hero/hero-community.jpg"
                  alt="Community members helping together"
                  priority
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121815]/80 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating UI Card 1: Urgent Blood Match */}
              <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 rounded-3xl border border-[#F2D5D8] bg-white p-3.5 shadow-xl backdrop-blur-md text-[#24342E]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FBEAEC] text-[#C94C55]">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="rounded-full bg-[#FBEAEC] px-2 py-0.5 text-[9px] font-bold text-[#C94C55] uppercase">
                      Live Matching
                    </span>
                    <p className="text-xs font-extrabold text-[#24342E]">Emergency Blood Network</p>
                    <p className="text-[10px] text-[#6F7D76]">Direct voluntary donor calls</p>
                  </div>
                </div>
              </div>

              {/* Floating UI Card 2: Verified Provider */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 rounded-3xl border border-[#D8E4F2] bg-white p-3.5 shadow-xl backdrop-blur-md text-[#24342E]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700">Neighborhood Helper</span>
                    </div>
                    <p className="text-xs font-extrabold text-[#24342E]">Skilled Local Support</p>
                    <p className="text-[10px] text-[#6F7D76]">Zero broker commission</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* =========================================================
          2. LARGE DEDICATED BLOOD SECTION (Dark, Editorial, Interactive)
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#140C0E] text-white py-20 sm:py-28 border-b border-[#30161A]">
        {/* Ambient Red Glows */}
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#C94C55]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-[#8F232B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Editorial Split: Left Title & Info, Right Photography */}
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            
            {/* Left 6 cols: Title, Eyebrow & Minimal Copy */}
            <div className="space-y-6 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C94C55]/40 bg-[#C94C55]/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FFA4AA]">
                <Droplets className="h-3.5 w-3.5 text-[#C94C55]" />
                <span>BLOOD</span>
              </div>

              <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.05]">
                Give when it <br />
                <span className="text-[#C94C55]">matters.</span>
              </h2>

              <p className="text-sm sm:text-base text-white/70 max-w-md leading-relaxed">
                Connect voluntary donors with patients and hospitals in real time. Direct coordination, zero delays.
              </p>

              {/* 8 Blood Group Visual Chips */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                    Select Blood Group
                  </span>
                  <span className="text-[11px] text-[#FFA4AA] font-semibold">
                    Live Stock & Donors
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {BLOOD_GROUPS.map((group) => {
                    const isSelected = selectedBloodGroup === group;
                    const availabilityData = bloodAvailability[group];
                    const count = availabilityData?.totalAvailable ?? 0;

                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setSelectedBloodGroup(group)}
                        className={`group relative flex flex-col items-center justify-center rounded-2xl py-3 px-2 border transition-all duration-200 ${
                          isSelected
                            ? "bg-[#C94C55] text-white border-[#C94C55] shadow-lg scale-105 z-10"
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="font-black text-sm">{group}</span>
                        <span className={`text-[9px] font-bold mt-1 ${
                          isSelected ? "text-white" : count > 0 ? "text-emerald-400" : "text-white/40"
                        }`}>
                          {count > 0 ? `${count} avail` : "Ready"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/blood?group=${encodeURIComponent(selectedBloodGroup)}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C94C55] px-7 py-4 text-xs font-bold text-white shadow-xl transition hover:bg-[#B53D46] active:scale-95"
                >
                  <Search className="h-4 w-4" />
                  <span>Find {selectedBloodGroup} Blood</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/blood/donor")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-7 py-4 text-xs font-bold text-white transition backdrop-blur-md active:scale-95"
                >
                  <HeartHandshake className="h-4 w-4 text-[#FFA4AA]" />
                  <span>Donate Blood</span>
                </button>
              </div>
            </div>

            {/* Right 6 cols: Large Dramatic Blood Facility / Donor Image */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 aspect-4/3 sm:aspect-16/11 shadow-2xl group">
                <ImageWithFallback
                  src="/images/blood/blood-hero.jpg"
                  alt="Voluntary blood donation facility and emergency coordination"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140C0E]/90 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-white/90">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold">Active Emergency Network</span>
                  </div>
                  <span className="text-white/60">Verified Donors & Hospitals</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          3. UNIFIED SERVICES MARKETPLACE (One Connected Section)
      ========================================================= */}
      <section className="bg-[#F8FAF9] py-20 sm:py-28 border-b border-[#E2E9E4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section Header: Label, Heading & Interactive Category Pills */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4B78A8]">
                SERVICES
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#18231E]">
                Help, nearby.
              </h2>
            </div>
            
            {/* Interactive Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {["ALL", "Cleaning", "Electrician", "Plumbing", "Care", "Education", "Appliance"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setServiceCategoryTab(tab)}
                  className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    serviceCategoryTab === tab
                      ? "bg-[#4B78A8] text-white shadow-xs scale-102"
                      : "border border-[#E2E9E4] bg-white text-[#6F7D76] hover:bg-[#F2F6FA] hover:text-[#24342E]"
                  }`}
                >
                  {tab === "ALL" ? "All Services" : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Provider Cards Grid */}
          {filteredFeaturedServices.length === 0 ? (
            <div className="rounded-3xl border border-[#E2E9E4] bg-white p-8 text-center space-y-3">
              <p className="text-sm font-bold text-[#18231E]">
                No active providers listed under {serviceCategoryTab} right now.
              </p>
              <p className="text-xs text-[#6F7D76]">
                Try another category or browse the community directory.
              </p>
              <button
                type="button"
                onClick={() => setServiceCategoryTab("ALL")}
                className="rounded-full bg-[#4B78A8] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D638D] transition"
              >
                Show All Services
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredFeaturedServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onRequest={() => navigate(`/services?search=${encodeURIComponent(service.category)}`)}
                />
              ))}
            </div>
          )}

          {/* Bottom Explore Directory CTA */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 rounded-full border border-[#D8E4F2] bg-white px-7 py-3.5 text-xs font-bold text-[#4B78A8] shadow-xs transition hover:bg-[#EAF1FA]"
            >
              <span>Explore All Community Services</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================
          4. PROVIDE SERVICE (Large Prominent Dark / Image Section)
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#111714] text-white py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="overflow-hidden rounded-[2.5rem] border border-white/15 bg-gradient-to-br from-[#18231E] to-[#111714] shadow-2xl">
            <div className="grid items-center lg:grid-cols-12">
              
              {/* Left 7 cols: Content */}
              <div className="p-8 sm:p-14 lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#8AD4B2]/30 bg-[#8AD4B2]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#8AD4B2]">
                  <Wrench className="h-3.5 w-3.5" />
                  <span>PROVIDE SERVICE</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  Your skill. <br />
                  <span className="text-[#8AD4B2]">Someone nearby.</span>
                </h2>

                <p className="text-sm sm:text-base text-white/70 max-w-lg leading-relaxed">
                  Offer electrical, plumbing, house cleaning, patient care, or tutoring in your neighborhood. Direct bookings, 0% commission fees, complete schedule control.
                </p>

                {/* 3 Quick Value Highlights */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="font-extrabold text-white">0% Fee</p>
                    <p className="text-[10px] text-white/60">No middlemen cuts</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="font-extrabold text-white">Direct Calls</p>
                    <p className="text-[10px] text-white/60">Mutual phone access</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="font-extrabold text-white">1-Click Pause</p>
                    <p className="text-[10px] text-white/60">Toggle when free</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/services/provider")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#427A65] hover:bg-[#356651] px-8 py-4 text-xs font-bold text-white shadow-xl transition active:scale-95"
                  >
                    <span>Provide Service</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Right 5 cols: Large Real Image of Skilled Helper */}
              <div className="relative aspect-4/3 sm:aspect-16/10 lg:aspect-auto lg:h-full lg:col-span-5 overflow-hidden">
                <ImageWithFallback
                  src="/images/services/service-provider-hero.jpg"
                  alt="Skilled neighborhood service provider ready to assist"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111714] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#18231E] lg:via-transparent lg:to-transparent" />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          5. NEW HOW IT WORKS — VISUAL STORYTELLING (Alternating Editorial)
      ========================================================= */}
      <section className="bg-white py-20 sm:py-28 border-b border-[#E2E9E4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#427A65]">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#18231E]">
              Simple & Direct
            </h2>
          </div>

          {/* Vertical Storytelling Steps (Alternating Left / Right) */}
          <div className="space-y-12 sm:space-y-16">
            
            {/* Step 01: CHOOSE (Text Left, Image Right) */}
            <div className="grid items-center gap-8 lg:grid-cols-12 overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-[#F8FAF9] p-6 sm:p-10 shadow-xs">
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#427A65]">01</span>
                  <span className="rounded-full bg-[#E5F1EA] px-3 py-1 text-xs font-black uppercase text-[#427A65]">
                    CHOOSE
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#18231E]">
                  Find what you need.
                </h3>
                <p className="text-xs sm:text-sm text-[#6F7D76] leading-relaxed">
                  Search by blood group or explore neighborhood skills like plumbing, electrical work, home cleaning, and elder care.
                </p>
              </div>

              <div className="relative aspect-16/10 lg:col-span-7 overflow-hidden rounded-3xl border border-[#E2E9E4]">
                <ImageWithFallback
                  src="/images/categories/cat-homehelp.jpg"
                  alt="Step 01 - Choose what you need"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
            </div>

            {/* Step 02: CONNECT (Image Left, Text Right) */}
            <div className="grid items-center gap-8 lg:grid-cols-12 overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-[#F8FAF9] p-6 sm:p-10 shadow-xs">
              <div className="relative aspect-16/10 lg:col-span-7 overflow-hidden rounded-3xl border border-[#E2E9E4] order-2 lg:order-1">
                <ImageWithFallback
                  src="/images/categories/cat-community.jpg"
                  alt="Step 02 - Connect with someone nearby"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>

              <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#C94C55]">02</span>
                  <span className="rounded-full bg-[#FBEAEC] px-3 py-1 text-xs font-black uppercase text-[#C94C55]">
                    CONNECT
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#18231E]">
                  Find someone nearby.
                </h3>
                <p className="text-xs sm:text-sm text-[#6F7D76] leading-relaxed">
                  Locate verified voluntary donors or active providers within your immediate area or town.
                </p>
              </div>
            </div>

            {/* Step 03: REQUEST (Text Left, Image Right) */}
            <div className="grid items-center gap-8 lg:grid-cols-12 overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-[#F8FAF9] p-6 sm:p-10 shadow-xs">
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#4B78A8]">03</span>
                  <span className="rounded-full bg-[#EAF1FA] px-3 py-1 text-xs font-black uppercase text-[#4B78A8]">
                    REQUEST
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#18231E]">
                  Send the request.
                </h3>
                <p className="text-xs sm:text-sm text-[#6F7D76] leading-relaxed">
                  Submit your assistance request directly with one click. No brokerage forms or payments required.
                </p>
              </div>

              <div className="relative aspect-16/10 lg:col-span-7 overflow-hidden rounded-3xl border border-[#E2E9E4]">
                <ImageWithFallback
                  src="/images/blood/blood-donor.jpg"
                  alt="Step 03 - Send the request directly"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>
            </div>

            {/* Step 04: HELP (Image Left, Text Right) */}
            <div className="grid items-center gap-8 lg:grid-cols-12 overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-[#F8FAF9] p-6 sm:p-10 shadow-xs">
              <div className="relative aspect-16/10 lg:col-span-7 overflow-hidden rounded-3xl border border-[#E2E9E4] order-2 lg:order-1">
                <ImageWithFallback
                  src="/images/cta/cta-community.jpg"
                  alt="Step 04 - Get connected and helped"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
              </div>

              <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#427A65]">04</span>
                  <span className="rounded-full bg-[#E5F1EA] px-3 py-1 text-xs font-black uppercase text-[#427A65]">
                    HELP
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#18231E]">
                  Get connected.
                </h3>
                <p className="text-xs sm:text-sm text-[#6F7D76] leading-relaxed">
                  Once mutually accepted, connect via phone, coordinate directly, and get the job or donation done.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          6. WHY COMMUNITYCONNECT (Dark Editorial Visual Trust)
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#111714] text-white py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            
            {/* Left 6 cols: Large Photograph */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 aspect-4/3 sm:aspect-16/11 shadow-2xl">
                <ImageWithFallback
                  src="/images/hero/hero-community.jpg"
                  alt="Built around real people in our community"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111714]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-lg font-black text-white">Built around people.</p>
                  <p className="text-xs text-white/70">A neighborhood network for direct mutual support.</p>
                </div>
              </div>
            </div>

            {/* Right 6 cols: 3 Visual Points */}
            <div className="space-y-8 lg:col-span-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8AD4B2]">
                  WHY COMMUNITYCONNECT
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  Built around people.
                </h2>
              </div>

              <div className="space-y-6">
                
                {/* 01 LOCAL */}
                <div className="flex items-start gap-4 border-b border-white/10 pb-6">
                  <span className="text-2xl font-black text-[#8AD4B2] font-mono">01</span>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-white">LOCAL</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      People right around your block, ready to assist when it counts.
                    </p>
                  </div>
                </div>

                {/* 02 DIRECT */}
                <div className="flex items-start gap-4 border-b border-white/10 pb-6">
                  <span className="text-2xl font-black text-[#8AD4B2] font-mono">02</span>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-white">DIRECT</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Connect without unnecessary middlemen, hidden commissions, or broker fees.
                    </p>
                  </div>
                </div>

                {/* 03 COMMUNITY */}
                <div className="flex items-start gap-4 pb-2">
                  <span className="text-2xl font-black text-[#8AD4B2] font-mono">03</span>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-white">COMMUNITY</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Mutual assistance built on transparency, direct contact, and neighborly trust.
                    </p>
                  </div>
                </div>

              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="rounded-full bg-white px-8 py-3.5 text-xs font-bold text-[#111714] shadow-xl hover:bg-white/90 transition active:scale-95"
                >
                  Explore Network
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          7. DARK FINAL CTA SECTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#121815] py-20 sm:py-28 text-white border-t border-white/10">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-[#8AD4B2] uppercase tracking-wider">
              Get Involved
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Be the help someone needs.
            </h2>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-lg">
              Sign up as a voluntary blood donor or list your everyday skills. It costs nothing and directly supports those around you.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/blood/donor")}
                className="inline-flex items-center gap-2 rounded-full bg-[#C94C55] px-7 py-4 text-xs font-bold text-white shadow-lg transition hover:bg-[#B53D46] active:scale-95"
              >
                <Droplets className="h-4 w-4" />
                <span>Donate Blood</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/services/provider")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-xs font-bold text-[#121815] shadow-lg transition hover:bg-white/90 active:scale-95"
              >
                <Wrench className="h-4 w-4 text-[#427A65]" />
                <span>Provide Service</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
