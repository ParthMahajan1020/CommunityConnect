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
  Sparkles,
  MapPin,
  Heart
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

  // Quick Action Cards (Section 2)
  const quickActions = [
    {
      title: "Find Blood",
      subtitle: "Instant donor match",
      image: "/images/categories/cat-blood.jpg",
      route: "/blood",
      badge: "Emergency",
      badgeColor: "bg-[#FBEAEC] text-[#C94C55]"
    },
    {
      title: "Donate Blood",
      subtitle: "Register as donor",
      image: "/images/blood/blood-donor.jpg",
      route: "/blood/donor",
      badge: "Save Lives",
      badgeColor: "bg-[#EDF5EF] text-[#427A65]"
    },
    {
      title: "Find Services",
      subtitle: "Everyday local help",
      image: "/images/categories/cat-homehelp.jpg",
      route: "/services",
      badge: "Verified Help",
      badgeColor: "bg-[#EAF1FA] text-[#4B78A8]"
    },
    {
      title: "Provide Service",
      subtitle: "Offer your skills",
      image: "/images/services/service-provider-hero.jpg",
      route: "/services/provider",
      badge: "Zero Fee",
      badgeColor: "bg-[#F8FAF9] text-[#24342E]"
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
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24 py-6 sm:py-10">
        
        {/* =========================================================
            SECTION 1: HERO (Image-Driven Visual Composition)
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-white p-6 sm:p-10 lg:p-12 shadow-[0_16px_48px_rgba(36,52,46,0.04)]">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            
            {/* Left Content: Ultra-Concise */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE9E0] bg-[#EDF5EF] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#427A65]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>CommunityConnect Network</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#24342E] sm:text-5xl lg:text-6xl leading-[1.1]">
                Help. Connect. <span className="text-[#427A65]">Give back.</span>
              </h1>

              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-[#6F7D76]">
                Instant connection for emergency blood, everyday household assistance, homemade meals, elder care, and skilled repairs from verified neighbors.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#427A65] px-6 py-3.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#356651] active:scale-98"
                >
                  <Search className="h-4 w-4" />
                  <span>Find Help</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/blood/donor")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#E2E9E4] bg-white px-6 py-3.5 text-sm font-semibold text-[#24342E] shadow-2xs transition hover:bg-[#F8FAF9] active:scale-98"
                >
                  <HeartHandshake className="h-4 w-4 text-[#427A65]" />
                  <span>Offer Help</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-5 border-t border-[#EEF2EF] pt-5 text-xs font-semibold text-[#7A8881]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#427A65]" /> Verified Citizens
                </span>
                <span className="text-[#D3DED7]">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-[#4B78A8]" /> Local Neighbors
                </span>
                <span className="text-[#D3DED7]">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#427A65]" /> Direct Connection
                </span>
              </div>
            </div>

            {/* Right: Visual Hero Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-[#E2E9E4] shadow-xl aspect-4/3 sm:aspect-16/11">
                <ImageWithFallback
                  src="/images/hero/hero-community.jpg"
                  alt="Community members helping together"
                  priority
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating UI Card 1: Urgent Blood Match */}
              <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 rounded-2xl border border-[#F2D5D8] bg-white/95 p-3.5 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBEAEC] text-[#C94C55]">
                    <Droplets className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="rounded-full bg-[#FBEAEC] px-2 py-0.5 text-[9px] font-bold text-[#C94C55] uppercase">
                      Urgent Need
                    </span>
                    <p className="text-xs font-bold text-[#24342E]">A+ Blood Needed Nearby</p>
                    <p className="text-[10px] text-[#6F7D76]">Akurdi, Pune • Direct match</p>
                  </div>
                </div>
              </div>

              {/* Floating UI Card 2: Verified Provider */}
              <div className="absolute -bottom-4 -right-4 sm:-bottom-5 sm:-right-5 rounded-2xl border border-[#D8E4F2] bg-white/95 p-3.5 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8]">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span className="text-[10px] font-bold text-emerald-700">Verified Helper</span>
                    </div>
                    <p className="text-xs font-bold text-[#24342E]">Electrician Available</p>
                    <p className="text-[10px] text-[#6F7D76]">Local • Ready to assist</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            SECTION 2: QUICK ACTIONS (4 Visual Cards)
        ========================================================= */}
        <section className="space-y-6">
          <div className="text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#427A65]">
              Quick Access
            </span>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#24342E] sm:text-3xl">
              What would you like to do?
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {quickActions.map((action) => (
              <div
                key={action.title}
                onClick={() => navigate(action.route)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#E2E9E4] bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:border-[#427A65]/40 hover:shadow-lg"
              >
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <ImageWithFallback
                    src={action.image}
                    alt={action.title}
                    aspectClassName="h-full w-full"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${action.badgeColor}`}>
                      {action.badge}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#24342E] group-hover:text-[#427A65] transition">
                      {action.title}
                    </h3>
                    <p className="text-xs text-[#6F7D76] mt-0.5">
                      {action.subtitle}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8FAF9] text-[#6F7D76] group-hover:bg-[#EDF5EF] group-hover:text-[#427A65] transition">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            SECTION 3: BLOOD EMERGENCY (Image-Driven Split Section)
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#F2D5D8] bg-gradient-to-br from-white via-[#FCF7F7] to-[#FBEAEC]/40 p-6 sm:p-10 lg:p-12 shadow-sm">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            
            {/* Visual Medical Image Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-[#F2D5D8] aspect-4/3 shadow-md">
              <ImageWithFallback
                src="/images/blood/blood-hero.jpg"
                alt="Medical blood donation facility"
                aspectClassName="h-full w-full"
                overlay
                overlayClassName="bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              >
                <div className="space-y-1">
                  <span className="inline-block rounded-full bg-[#C94C55] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Emergency Blood Grid
                  </span>
                  <p className="text-lg font-bold text-white">Every Drop Saves Lives</p>
                  <p className="text-xs text-white/80">Connecting voluntary donors, hospitals & blood banks directly.</p>
                </div>
              </ImageWithFallback>
            </div>

            {/* Content & Live Interactive Blood Chips */}
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBEAEC] px-3 py-1 text-xs font-bold text-[#C94C55]">
                  <Droplets className="h-3.5 w-3.5" />
                  Emergency Response
                </span>
                <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#24342E]">
                  Blood when it matters.
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#6F7D76]">
                  Select your group to search verified stock in regional centers or match with nearby voluntary donors.
                </p>
              </div>

              {/* 8 Blood Group Visual Chips */}
              <div>
                <p className="text-xs font-bold text-[#24342E] mb-2.5">
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
                        className={`flex flex-col items-center justify-center rounded-2xl py-2.5 px-2 border transition-all ${
                          isSelected
                            ? "bg-[#C94C55] text-white border-[#C94C55] shadow-xs scale-105"
                            : "bg-white text-[#24342E] border-[#E2E9E4] hover:border-[#C94C55]/40"
                        }`}
                      >
                        <span className="font-extrabold text-sm">{group}</span>
                        <span className={`text-[9px] font-medium mt-0.5 ${
                          isSelected ? "text-white/80" : isAvailable ? "text-emerald-700 font-bold" : "text-[#8C9892]"
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
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#C94C55] px-6 py-3.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#B53D46]"
                >
                  <Search className="h-4 w-4" />
                  <span>Find {selectedBloodGroup} Blood</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/blood/donor")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#F2D5D8] bg-white px-6 py-3.5 text-xs font-bold text-[#C94C55] shadow-2xs transition hover:bg-[#FBEAEC]"
                >
                  <HeartHandshake className="h-4 w-4" />
                  <span>Donate Blood</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            SECTION 4: EVERYDAY SUPPORT (Services Grid)
        ========================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4B78A8]">
                Everyday Support
              </span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#24342E] sm:text-3xl">
                Everyday help, nearby.
              </h2>
            </div>
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {["ALL", "Cleaning", "Repair", "Food", "Care", "Education"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setServiceCategoryTab(tab)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                    serviceCategoryTab === tab
                      ? "bg-[#4B78A8] text-white shadow-2xs"
                      : "border border-[#E2E9E4] bg-white text-[#6F7D76] hover:bg-[#F8FAF9]"
                  }`}
                >
                  {tab === "ALL" ? "All Services" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFeaturedServices.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onRequest={() => navigate(`/services?search=${encodeURIComponent(service.category)}`)}
              />
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#D8E4F2] bg-white px-6 py-3 text-xs font-bold text-[#4B78A8] shadow-2xs transition hover:bg-[#EAF1FA]"
            >
              <span>Explore All Community Services</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: SERVICE CATEGORY SHOWCASE (Alternating Blocks)
        ========================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#427A65]">
              Featured Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24342E]">
              Made for your everyday life
            </h2>
          </div>

          {/* Block A: Image Left, Content Right */}
          <div className="overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-white shadow-xs">
            <div className="grid items-center lg:grid-cols-2">
              <div className="relative aspect-16/10 lg:aspect-auto lg:h-full">
                <ImageWithFallback
                  src="/images/services/service-cleaning.jpg"
                  alt="Home help and cleaning"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 sm:p-12 space-y-4">
                <span className="inline-block rounded-full bg-[#EAF1FA] px-3 py-1 text-xs font-bold text-[#4B78A8] uppercase tracking-wider">
                  Home Help
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#24342E]">
                  Find someone who can help.
                </h3>
                <p className="text-sm leading-relaxed text-[#6F7D76]">
                  From deep kitchen cleaning to daily housekeeping and laundry, discover verified local helpers ready to lend a hand in your neighborhood.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/services?category=Cleaning")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#4B78A8] px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#3D638D] transition"
                  >
                    <span>Explore Home Help</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Block B: Content Left, Image Right */}
          <div className="overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-white shadow-xs">
            <div className="grid items-center lg:grid-cols-2">
              <div className="p-8 sm:p-12 space-y-4 order-2 lg:order-1">
                <span className="inline-block rounded-full bg-[#EDF5EF] px-3 py-1 text-xs font-bold text-[#427A65] uppercase tracking-wider">
                  Homemade Food
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#24342E]">
                  Home-cooked meals around you.
                </h3>
                <p className="text-sm leading-relaxed text-[#6F7D76]">
                  Craving fresh home food or need regular dietary tiffins? Connect directly with trusted home cooks and neighborhood kitchens.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/services?category=Food")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#427A65] px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#356651] transition"
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
          <div className="overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-white shadow-xs">
            <div className="grid items-center lg:grid-cols-2">
              <div className="relative aspect-16/10 lg:aspect-auto lg:h-full">
                <ImageWithFallback
                  src="/images/services/service-eldercare.jpg"
                  alt="Compassionate elder care and support"
                  aspectClassName="h-full w-full"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-8 sm:p-12 space-y-4">
                <span className="inline-block rounded-full bg-[#FBEAEC] px-3 py-1 text-xs font-bold text-[#C94C55] uppercase tracking-wider">
                  Care & Support
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#24342E]">
                  Find support when you need it.
                </h3>
                <p className="text-sm leading-relaxed text-[#6F7D76]">
                  Compassionate caregiving, companionship for elderly relatives, mobility assistance, and patient support from trusted community members.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/services?category=Care")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#C94C55] px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-[#B53D46] transition"
                  >
                    <span>Explore Care Services</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 6: HOW IT WORKS (Ultra-Concise 4 Steps)
        ========================================================= */}
        <section className="rounded-[2.5rem] border border-[#E2E9E4] bg-white p-6 sm:p-10 lg:p-12 shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#427A65]">
              Simple & Direct
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24342E]">
              How it works
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Choose",
                desc: "Select blood or service.",
                icon: Search,
                accent: "text-[#427A65] bg-[#E5F1EA]"
              },
              {
                step: "02",
                title: "Connect",
                desc: "Find verified neighbors nearby.",
                icon: MapPin,
                accent: "text-[#C94C55] bg-[#FBEAEC]"
              },
              {
                step: "03",
                title: "Request",
                desc: "Submit your details securely.",
                icon: HeartHandshake,
                accent: "text-[#4B78A8] bg-[#EAF1FA]"
              },
              {
                step: "04",
                title: "Help",
                desc: "Coordinate and get assisted.",
                icon: CheckCircle2,
                accent: "text-[#427A65] bg-[#E5F1EA]"
              }
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="flex flex-col justify-between rounded-3xl border border-[#EEF2EF] bg-[#FBFCFB] p-6 hover:border-[#427A65]/30 transition"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-extrabold text-[#8C9892]">
                        {s.step}
                      </span>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.accent}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-[#24342E]">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#6F7D76]">
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            SECTION 7: WHY COMMUNITYCONNECT (4 Trust Cards)
        ========================================================= */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-[#D8E4F2] bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#24342E]">VERIFIED</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6F7D76]">
              Trusted profiles & reviewed providers.
            </p>
          </div>

          <div className="rounded-3xl border border-[#D5E7DB] bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#24342E]">LOCAL</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6F7D76]">
              Community right around your block.
            </p>
          </div>

          <div className="rounded-3xl border border-[#F2D5D8] bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FBEAEC] text-[#C94C55]">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#24342E]">DIRECT</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6F7D76]">
              Connect directly with zero middlemen.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F8FAF9] text-[#24342E]">
              <Heart className="h-5 w-5 text-[#427A65]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#24342E]">SIMPLE</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#6F7D76]">
              Easy requests and quick response.
            </p>
          </div>
        </section>

        {/* =========================================================
            SECTION 8: COMMUNITY VISUAL (Full-Width Emotional Banner)
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] aspect-16/9 sm:aspect-21/8 shadow-md">
          <ImageWithFallback
            src="/images/cta/cta-community.jpg"
            alt="Community volunteers uniting"
            aspectClassName="h-full w-full"
            overlay
            overlayClassName="bg-gradient-to-r from-black/80 via-black/55 to-black/75"
          >
            <div className="max-w-xl text-white space-y-4 p-4 sm:p-8">
              <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                Neighborhood Solidarity
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Someone nearby can help.
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                A neighbor with the right blood group. A cook with warm food. An electrician on your street.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="rounded-2xl bg-white px-6 py-3 text-xs font-bold text-[#24342E] shadow-xs hover:bg-white/90 transition"
                >
                  Find Help Nearby
                </button>
              </div>
            </div>
          </ImageWithFallback>
        </section>

        {/* =========================================================
            SECTION 9: FINAL CTA BANNER
        ========================================================= */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-[#E2E9E4] bg-gradient-to-br from-[#24342E] to-[#1B2822] p-8 sm:p-12 text-white shadow-lg">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#8AD4B2] uppercase tracking-wider">
              Get Involved
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Be the help someone needs.
            </h2>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg">
              Sign up as a voluntary blood donor or list your everyday skills. It costs nothing and directly supports those around you.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => navigate("/blood/donor")}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#C94C55] px-6 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#B53D46] transition"
              >
                <Droplets className="h-4 w-4" />
                <span>Donate Blood</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/services/provider")}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-bold text-[#24342E] shadow-xs hover:bg-white/90 transition"
              >
                <Wrench className="h-4 w-4 text-[#427A65]" />
                <span>Provide Service</span>
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
