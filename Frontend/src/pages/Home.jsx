import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplets,
  HeartHandshake,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Search,
  CheckCircle2,
  Users,
  MapPin,
  Heart,
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

  // Fetch real blood stock availability for the interactive chips
  useEffect(() => {
    let ignore = false;
    async function loadStats() {
      try {
        const res = await getPublicStats();
        if (!ignore && res.success) {
          if (res.bloodAvailability) setBloodAvailability(res.bloodAvailability);
        }
      } catch (err) {
        console.error("Home stats fetch error:", err.message);
      }
    }
    loadStats();
    return () => {
      ignore = true;
    };
  }, []);

  // Visual Discovery Cards (Section 2)
  const discoveryCards = [
    {
      title: "Find Blood",
      eyebrow: "Emergency",
      image: "/images/categories/cat-blood.jpg",
      route: "/blood",
      badgeColor: "bg-[#C94C55] text-white"
    },
    {
      title: "Find Services",
      eyebrow: "Everyday Help",
      image: "/images/categories/cat-homehelp.jpg",
      route: "/services",
      badgeColor: "bg-[#4B78A8] text-white"
    },
    {
      title: "Homemade Food",
      eyebrow: "Fresh Meals",
      image: "/images/categories/cat-food.jpg",
      route: "/services?category=Food",
      badgeColor: "bg-[#427A65] text-white"
    },
    {
      title: "Donate Blood",
      eyebrow: "Save Lives",
      image: "/images/blood/blood-donor.jpg",
      route: "/blood/donor",
      badgeColor: "bg-[#24342E] text-white"
    }
  ];

  // Featured sample services for the marketplace grid
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
      organizationName: "Pune Technical Services"
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
      organizationName: "CleanCare Professionals"
    },
    {
      _id: "fs_3",
      category: "Food",
      title: "Healthy Homemade Tiffin Service",
      description: "Nutritious vegetarian Indian home meals prepared fresh daily.",
      pricing: 120,
      pricingType: "Fixed",
      location: "Pimpri, Pune",
      availability: true,
      isProfessional: false,
      organizationName: "Annapurna Home Kitchen"
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
      organizationName: "Seva Elderly Care"
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
      organizationName: "City Plumbers Alliance"
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
      organizationName: "Community Mentor Network"
    }
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
        {/* Subtle background ambient gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#427A65]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#C94C55]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#8AD4B2] backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>CommunityConnect Network</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.05]">
                Help starts <br />
                <span className="text-[#8AD4B2]">nearby.</span>
              </h1>

              <p className="max-w-md text-base sm:text-lg font-medium text-white/70 leading-relaxed">
                Find help. Give help. Connect with verified blood donors and trusted neighbors for everyday tasks.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="inline-flex items-center gap-2 rounded-full bg-[#427A65] px-7 py-4 text-xs font-bold text-white shadow-lg transition hover:bg-[#356651] active:scale-95"
                >
                  <Search className="h-4 w-4" />
                  <span>Find Help</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/blood/donor")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-7 py-4 text-xs font-bold text-white transition backdrop-blur-md active:scale-95"
                >
                  <HeartHandshake className="h-4 w-4 text-[#8AD4B2]" />
                  <span>Offer Help</span>
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
                  <CheckCircle2 className="h-4 w-4 text-[#8AD4B2]" /> Zero Broker Fees
                </span>
              </div>
            </div>

            {/* Right: Real Visual Hero Image with Floating UI Badges */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 shadow-2xl aspect-4/3 sm:aspect-16/11">
                <ImageWithFallback
                  src="/images/hero/hero-community.jpg"
                  alt="Community members helping together"
                  priority
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover"
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
                      Urgent Need
                    </span>
                    <p className="text-xs font-extrabold text-[#24342E]">A+ Blood Needed Nearby</p>
                    <p className="text-[10px] text-[#6F7D76]">Akurdi, Pune • Direct match</p>
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
                      <span className="text-[10px] font-bold text-emerald-700">Verified Helper</span>
                    </div>
                    <p className="text-xs font-extrabold text-[#24342E]">Electrician Available</p>
                    <p className="text-[10px] text-[#6F7D76]">Ready to assist</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          2. LIGHT SERVICE DISCOVERY (Visual Image-Led Cards)
      ========================================================= */}
      <section className="bg-[#F8FAF9] py-16 sm:py-24 border-b border-[#E2E9E4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#427A65]">
                Discovery
              </span>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-[#18231E] sm:text-4xl">
                What do you need?
              </h2>
            </div>
            <p className="text-xs text-[#6F7D76] max-w-sm">
              Tap any category to explore verified donors, accredited facilities, or local helpers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {discoveryCards.map((card) => (
              <div
                key={card.title}
                onClick={() => navigate(card.route)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#E2E9E4] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#427A65]/40 hover:shadow-xl"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <ImageWithFallback
                    src={card.image}
                    alt={card.title}
                    aspectClassName="h-full w-full"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${card.badgeColor}`}>
                      {card.eyebrow}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-[#24342E] group-hover:text-[#427A65] transition">
                    {card.title}
                  </h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAF9] text-[#6F7D76] group-hover:bg-[#427A65] group-hover:text-white transition">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          3. DARK BLOOD SECTION (High-Contrast Editorial Split)
      ========================================================= */}
      <section className="bg-[#181012] text-white py-16 sm:py-24 relative overflow-hidden">
        {/* Blood glow */}
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#C94C55]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            
            {/* Visual Medical Image Banner */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/15 aspect-4/3 shadow-2xl">
              <ImageWithFallback
                src="/images/blood/blood-hero.jpg"
                alt="Medical blood donation facility"
                aspectClassName="h-full w-full"
                overlay
                overlayClassName="bg-gradient-to-t from-[#181012] via-transparent to-transparent"
              >
                <div className="space-y-1 p-4">
                  <span className="inline-block rounded-full bg-[#C94C55] px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Emergency Blood Grid
                  </span>
                  <p className="text-xl font-black text-white">Every Drop Saves Lives</p>
                  <p className="text-xs text-white/70">Connecting voluntary donors, hospitals & blood banks directly.</p>
                </div>
              </ImageWithFallback>
            </div>

            {/* Content & Live Interactive Blood Chips */}
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C94C55]/20 border border-[#C94C55]/40 px-3.5 py-1 text-xs font-bold text-[#FFA4AA]">
                  <Droplets className="h-3.5 w-3.5 text-[#C94C55]" />
                  Blood Registry
                </span>
                <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  Give when it <span className="text-[#C94C55]">matters.</span>
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/70">
                  Select your blood group to check live stock or locate voluntary donors near you.
                </p>
              </div>

              {/* 8 Blood Group Visual Chips */}
              <div>
                <p className="text-xs font-bold text-white/90 mb-3 uppercase tracking-wider">
                  Select Blood Group:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {BLOOD_GROUPS.map((group) => {
                    const isSelected = selectedBloodGroup === group;
                    const availabilityData = bloodAvailability[group];
                    const isAvailable = availabilityData ? availabilityData.totalAvailable > 0 : true;

                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setSelectedBloodGroup(group)}
                        className={`flex flex-col items-center justify-center rounded-2xl py-3 px-2 border transition-all ${
                          isSelected
                            ? "bg-[#C94C55] text-white border-[#C94C55] shadow-lg scale-105"
                            : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="font-black text-sm">{group}</span>
                        <span className={`text-[9px] font-bold mt-1 ${
                          isSelected ? "text-white" : isAvailable ? "text-emerald-400" : "text-white/40"
                        }`}>
                          {availabilityData ? `${availabilityData.totalAvailable} avail` : "Ready"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(`/blood?group=${encodeURIComponent(selectedBloodGroup)}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C94C55] px-7 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#B53D46] active:scale-95"
                >
                  <Search className="h-4 w-4" />
                  <span>Find {selectedBloodGroup} Blood</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/blood/donor")}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-7 py-3.5 text-xs font-bold text-white transition active:scale-95"
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span>Become a Donor</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          4. LIGHT SERVICES MARKETPLACE (Help, nearby.)
      ========================================================= */}
      <section className="bg-[#F8FAF9] py-16 sm:py-24 border-b border-[#E2E9E4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4B78A8]">
                Everyday Support
              </span>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-[#18231E] sm:text-4xl">
                Help, nearby.
              </h2>
            </div>
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {["ALL", "Cleaning", "Repair", "Food", "Care", "Education"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setServiceCategoryTab(tab)}
                  className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
                    serviceCategoryTab === tab
                      ? "bg-[#4B78A8] text-white shadow-xs"
                      : "border border-[#E2E9E4] bg-white text-[#6F7D76] hover:bg-[#F2F6FA]"
                  }`}
                >
                  {tab === "ALL" ? "All Services" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFeaturedServices.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onRequest={() => navigate(`/services?search=${encodeURIComponent(service.category)}`)}
              />
            ))}
          </div>

          <div className="text-center pt-4">
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
          5. SERVICE SHOWCASE (Alternating Asymmetric Story Blocks)
      ========================================================= */}
      <section className="bg-white py-16 sm:py-24 border-b border-[#E2E9E4] space-y-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#427A65]">
              Showcase
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#18231E]">
              Made for your everyday life
            </h2>
          </div>

          {/* Block A: Image Left, Content Right */}
          <div className="overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-[#F8FAF9] shadow-xs">
            <div className="grid items-center lg:grid-cols-2">
              <div className="relative aspect-16/10 lg:aspect-auto lg:h-full">
                <ImageWithFallback
                  src="/images/services/service-cleaning.jpg"
                  alt="Home help and cleaning"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 sm:p-14 space-y-4">
                <span className="inline-block rounded-full bg-[#EAF1FA] px-3.5 py-1 text-xs font-bold text-[#4B78A8] uppercase tracking-wider">
                  Home Help
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-[#18231E]">
                  Help nearby.
                </h3>
                <p className="text-sm leading-relaxed text-[#6F7D76]">
                  From deep sanitization to daily housekeeping, discover verified neighbors ready to lend a hand.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/services?category=Cleaning")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#4B78A8] px-6 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#3D638D] transition"
                  >
                    <span>Explore Home Help</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Block B: Content Left, Image Right */}
          <div className="overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-[#F8FAF9] shadow-xs">
            <div className="grid items-center lg:grid-cols-2">
              <div className="p-8 sm:p-14 space-y-4 order-2 lg:order-1">
                <span className="inline-block rounded-full bg-[#EDF5EF] px-3.5 py-1 text-xs font-bold text-[#427A65] uppercase tracking-wider">
                  Homemade Food
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-[#18231E]">
                  Made close to home.
                </h3>
                <p className="text-sm leading-relaxed text-[#6F7D76]">
                  Craving fresh home-cooked food or dietary tiffins? Connect directly with local home cooks.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/services?category=Food")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#427A65] px-6 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#356651] transition"
                  >
                    <span>Explore Homemade Food</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="relative aspect-16/10 lg:aspect-auto lg:h-full order-1 lg:order-2">
                <ImageWithFallback
                  src="/images/services/service-food.jpg"
                  alt="Fresh homemade food and meals"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Block C: Image Left, Content Right */}
          <div className="overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-[#F8FAF9] shadow-xs">
            <div className="grid items-center lg:grid-cols-2">
              <div className="relative aspect-16/10 lg:aspect-auto lg:h-full">
                <ImageWithFallback
                  src="/images/services/service-eldercare.jpg"
                  alt="Compassionate elder care and support"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 sm:p-14 space-y-4">
                <span className="inline-block rounded-full bg-[#FBEAEC] px-3.5 py-1 text-xs font-bold text-[#C94C55] uppercase tracking-wider">
                  Care & Support
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-[#18231E]">
                  Someone to help.
                </h3>
                <p className="text-sm leading-relaxed text-[#6F7D76]">
                  Compassionate companions, mobility assistance, and patient support from trusted community volunteers.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/services?category=Care")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#C94C55] px-6 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#B53D46] transition"
                  >
                    <span>Explore Care Services</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          6. DARK COMMUNITY SECTION (Emotional Brand Section)
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#111714] py-20 sm:py-28 text-white">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="/images/cta/cta-community.jpg"
            alt="Neighbors joining hands in solidarity"
            aspectClassName="h-full w-full"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111714] via-[#111714]/80 to-[#111714]/90" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#8AD4B2] backdrop-blur-md">
            Solidarity
          </span>

          <h2 className="text-3xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Good people are closer <br />
            <span className="text-[#8AD4B2]">than you think.</span>
          </h2>

          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
            A neighbor with the right blood group. A cook with warm food. An electrician on your street.
          </p>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => navigate("/services")}
              className="rounded-full bg-white px-8 py-4 text-xs font-bold text-[#121815] shadow-xl hover:bg-white/90 transition active:scale-95"
            >
              Find Help Nearby
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. LIGHT HOW IT WORKS (Ultra-Concise 4 Steps)
      ========================================================= */}
      <section className="bg-white py-16 sm:py-24 border-b border-[#E2E9E4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#427A65]">
              Simple & Direct
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#18231E]">
              How it works
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "CHOOSE",
                desc: "Select blood or service.",
                icon: Search,
                accent: "text-[#427A65] bg-[#E5F1EA]"
              },
              {
                step: "02",
                title: "CONNECT",
                desc: "Find verified neighbors nearby.",
                icon: MapPin,
                accent: "text-[#C94C55] bg-[#FBEAEC]"
              },
              {
                step: "03",
                title: "REQUEST",
                desc: "Submit your details securely.",
                icon: HeartHandshake,
                accent: "text-[#4B78A8] bg-[#EAF1FA]"
              },
              {
                step: "04",
                title: "HELP",
                desc: "Coordinate and get assisted.",
                icon: CheckCircle2,
                accent: "text-[#427A65] bg-[#E5F1EA]"
              }
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="flex flex-col justify-between rounded-3xl border border-[#EEF2EF] bg-[#F8FAF9] p-6 hover:border-[#427A65]/40 hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-[#8C9892]">
                        {s.step}
                      </span>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="mt-6 text-lg font-black text-[#18231E]">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#6F7D76]">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================
          8. LIGHT TRUST SECTION (4 Visual Cards)
      ========================================================= */}
      <section className="bg-[#F8FAF9] py-16 sm:py-20 border-b border-[#E2E9E4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            
            <div className="rounded-3xl border border-[#D8E4F2] bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-[#18231E]">VERIFIED</h3>
              <p className="mt-1 text-xs text-[#6F7D76]">
                Trusted profiles & reviewed providers.
              </p>
            </div>

            <div className="rounded-3xl border border-[#D5E7DB] bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-[#18231E]">LOCAL</h3>
              <p className="mt-1 text-xs text-[#6F7D76]">
                Community right around your block.
              </p>
            </div>

            <div className="rounded-3xl border border-[#F2D5D8] bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FBEAEC] text-[#C94C55]">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-[#18231E]">DIRECT</h3>
              <p className="mt-1 text-xs text-[#6F7D76]">
                Connect directly with zero middlemen.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F8FAF9] text-[#18231E]">
                <Heart className="h-5 w-5 text-[#427A65]" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-[#18231E]">SIMPLE</h3>
              <p className="mt-1 text-xs text-[#6F7D76]">
                Easy requests and quick response.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          9. DARK FINAL CTA SECTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#121815] py-20 sm:py-28 text-white">
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
