import { useEffect, useMemo, useRef, useState } from "react";
import {
  Droplets,
  HeartHandshake,
  LogOut,
  Menu,
  Sparkles,
  User,
  Wrench,
  X,
  Building2,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { logoutUser } from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [giveHelpOpen, setGiveHelpOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileMenuRef = useRef(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isOrg = ["BLOOD_BANK", "HOSPITAL", "SERVICE_PROVIDER"].includes(user?.role);
  const isAdmin = user?.role === "ADMIN";

  // Detect scroll for dynamic navbar glass styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setProfileOpen(false);
    setExploreOpen(false);
    setGiveHelpOpen(false);
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
        setExploreOpen(false);
        setGiveHelpOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll on mobile menu open
  useEffect(() => {
    if (!mobileOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logoutUser();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "CC";

  const isHome = location.pathname === "/" || location.pathname === "/home";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#E2E9E4]/80 bg-white/95 backdrop-blur-xl shadow-xs"
          : isHome
          ? "border-b border-white/10 bg-[#121815]/80 backdrop-blur-lg text-white"
          : "border-b border-[#E2E9E4] bg-white/90 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================
            BRAND LOGO
        ========================================================= */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427A65]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#427A65] text-white shadow-xs transition-transform duration-300 group-hover:scale-105">
            <HeartHandshake className="h-5 w-5" />
          </div>

          <div className="flex flex-col text-left leading-tight">
            <span
              className={`text-base font-extrabold tracking-tight transition-colors ${
                !scrolled && isHome ? "text-white" : "text-[#18231E]"
              }`}
            >
              Community<span className="text-[#427A65]">Connect</span>
            </span>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                !scrolled && isHome ? "text-white/60" : "text-[#6F7D76]"
              }`}
            >
              Local Help Network
            </span>
          </div>
        </Link>

        {/* =========================================================
            DESKTOP NAVIGATION
        ========================================================= */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-[#427A65] text-white shadow-2xs"
                  : !scrolled && isHome
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-[#55645E] hover:bg-[#F2F6FA] hover:text-[#24342E]"
              }`
            }
          >
            Home
          </NavLink>

          {/* EXPLORE HELP DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setExploreOpen(!exploreOpen);
                setGiveHelpOpen(false);
              }}
              onMouseEnter={() => setExploreOpen(true)}
              className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                (location.pathname.startsWith("/blood") && !location.pathname.includes("/donor")) ||
                (location.pathname.startsWith("/services") && !location.pathname.includes("/provider"))
                  ? "text-[#427A65] bg-[#E5F1EA]/60 font-bold"
                  : !scrolled && isHome
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-[#55645E] hover:bg-[#F2F6FA] hover:text-[#24342E]"
              }`}
            >
              <span>Find Help</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${exploreOpen ? "rotate-180" : ""}`} />
            </button>

            {exploreOpen && (
              <div
                onMouseLeave={() => setExploreOpen(false)}
                className="absolute top-full left-0 mt-1.5 w-60 rounded-3xl border border-[#E2E9E4] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-[#24342E]"
              >
                <Link
                  to="/blood"
                  onClick={() => setExploreOpen(false)}
                  className="flex items-center gap-3 rounded-2xl p-2.5 text-xs text-[#24342E] hover:bg-[#FBEAEC] transition group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBEAEC] text-[#C94C55]">
                    <Droplets className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#C94C55]">Find Blood</p>
                    <p className="text-[11px] text-[#6F7D76]">Donors & Hospital stock</p>
                  </div>
                </Link>

                <Link
                  to="/services"
                  onClick={() => setExploreOpen(false)}
                  className="flex items-center gap-3 rounded-2xl p-2.5 text-xs text-[#24342E] hover:bg-[#EAF1FA] transition group mt-1"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8]">
                    <Wrench className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#4B78A8]">Find Services</p>
                    <p className="text-[11px] text-[#6F7D76]">Home help, care, repairs</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* GIVE HELP DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setGiveHelpOpen(!giveHelpOpen);
                setExploreOpen(false);
              }}
              onMouseEnter={() => setGiveHelpOpen(true)}
              className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                location.pathname.includes("/donor") || location.pathname.includes("/provider")
                  ? "text-[#427A65] bg-[#E5F1EA]/60 font-bold"
                  : !scrolled && isHome
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-[#55645E] hover:bg-[#F2F6FA] hover:text-[#24342E]"
              }`}
            >
              <span>Offer Help</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${giveHelpOpen ? "rotate-180" : ""}`} />
            </button>

            {giveHelpOpen && (
              <div
                onMouseLeave={() => setGiveHelpOpen(false)}
                className="absolute top-full left-0 mt-1.5 w-60 rounded-3xl border border-[#E2E9E4] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-[#24342E]"
              >
                <Link
                  to="/blood/donor"
                  onClick={() => setGiveHelpOpen(false)}
                  className="flex items-center gap-3 rounded-2xl p-2.5 text-xs text-[#24342E] hover:bg-[#FBEAEC] transition group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBEAEC] text-[#C94C55]">
                    <HeartHandshake className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#C94C55]">Donate Blood</p>
                    <p className="text-[11px] text-[#6F7D76]">Register as a donor</p>
                  </div>
                </Link>

                <Link
                  to="/services/provider"
                  onClick={() => setGiveHelpOpen(false)}
                  className="flex items-center gap-3 rounded-2xl p-2.5 text-xs text-[#24342E] hover:bg-[#EDF5EF] transition group mt-1"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF5EF] text-[#427A65]">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#427A65]">Provide Service</p>
                    <p className="text-[11px] text-[#6F7D76]">Share local skills</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <NavLink
            to="/requests"
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-[#427A65] text-white shadow-2xs"
                  : !scrolled && isHome
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-[#55645E] hover:bg-[#F2F6FA] hover:text-[#24342E]"
              }`
            }
          >
            My Requests
          </NavLink>
        </nav>

        {/* =========================================================
            RIGHT: PORTALS & USER ACTIONS
        ========================================================= */}
        <div className="flex items-center gap-3">
          {/* Organization Switcher Link */}
          <Link
            to={isOrg ? "/private/dashboard" : "/private/login"}
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition ${
              !scrolled && isHome
                ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                : "border-[#D8E4F2] bg-[#EAF1FA] text-[#4B78A8] hover:bg-[#DEEAF7]"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{isOrg ? "Org Dashboard" : "For Organizations"}</span>
          </Link>

          {/* Admin link if logged in as Admin */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold bg-[#24342E] text-white hover:bg-[#18231E] transition"
            >
              <span>Admin</span>
            </Link>
          )}

          {/* Auth State / Profile Menu */}
          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full p-1 transition hover:opacity-90 focus:outline-none"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#427A65] text-xs font-bold text-white shadow-xs ring-2 ring-[#427A65]/20">
                  {initials}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-[#E2E9E4] bg-white p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-[#24342E]">
                  <div className="px-3 py-2 border-b border-[#EEF2EF]">
                    <p className="text-xs font-bold text-[#24342E] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#6F7D76] truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-semibold text-[#24342E] hover:bg-[#F8FAF9] transition"
                    >
                      <User className="h-4 w-4 text-[#427A65]" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/requests"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-semibold text-[#24342E] hover:bg-[#F8FAF9] transition"
                    >
                      <HeartHandshake className="h-4 w-4 text-[#4B78A8]" />
                      <span>My Requests</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-[#EEF2EF]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className={`rounded-full px-5 py-2 text-xs font-bold shadow-xs transition active:scale-95 ${
                  !scrolled && isHome
                    ? "bg-white text-[#121815] hover:bg-white/90"
                    : "bg-[#427A65] text-white hover:bg-[#356651]"
                }`}
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden rounded-2xl p-2.5 transition focus:outline-none ${
              !scrolled && isHome
                ? "text-white hover:bg-white/10"
                : "text-[#24342E] hover:bg-[#F2F6FA]"
            }`}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* =========================================================
          MOBILE MENU DRAWER
      ========================================================= */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-[68px] bottom-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div className="h-full max-h-[calc(100vh-68px)] overflow-y-auto bg-white p-6 shadow-2xl space-y-6">
            
            {/* User Quick Info if logged in */}
            {user ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[#E2E9E4] bg-[#F8FAF9] p-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#427A65] text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#24342E] truncate">{user.name}</p>
                  <p className="text-xs text-[#6F7D76] truncate">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-12 w-full items-center justify-center rounded-2xl bg-[#427A65] text-xs font-bold text-white shadow-xs"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-12 w-full items-center justify-center rounded-2xl border border-[#E2E9E4] bg-white text-xs font-bold text-[#24342E]"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C9892]">
                Explore Services
              </span>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/blood"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col rounded-2xl border border-[#F2D5D8] bg-[#FDF8F9] p-3 text-xs"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FBEAEC] text-[#C94C55] mb-2">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-[#C94C55]">Find Blood</span>
                  <span className="text-[10px] text-[#6F7D76]">Local stock</span>
                </Link>

                <Link
                  to="/services"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col rounded-2xl border border-[#D8E4F2] bg-[#F7FAFD] p-3 text-xs"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8] mb-2">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-[#4B78A8]">Find Services</span>
                  <span className="text-[10px] text-[#6F7D76]">Home & repair</span>
                </Link>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C9892]">
                Offer Assistance
              </span>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/blood/donor"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col rounded-2xl border border-[#E2E9E4] bg-white p-3 text-xs"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FBEAEC] text-[#C94C55] mb-2">
                    <HeartHandshake className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-[#24342E]">Donate Blood</span>
                  <span className="text-[10px] text-[#6F7D76]">Volunteer donor</span>
                </Link>

                <Link
                  to="/services/provider"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col rounded-2xl border border-[#E2E9E4] bg-white p-3 text-xs"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EDF5EF] text-[#427A65] mb-2">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-[#24342E]">Provide Service</span>
                  <span className="text-[10px] text-[#6F7D76]">List your skills</span>
                </Link>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#EEF2EF]">
              <Link
                to="/requests"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-2xl p-3 text-xs font-bold text-[#24342E] hover:bg-[#F8FAF9]"
              >
                <span>My Requests</span>
                <ArrowRight className="h-4 w-4 text-[#8C9892]" />
              </Link>

              {user && (
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-2xl p-3 text-xs font-bold text-[#24342E] hover:bg-[#F8FAF9]"
                >
                  <span>My Profile</span>
                  <ArrowRight className="h-4 w-4 text-[#8C9892]" />
                </Link>
              )}

              <Link
                to={isOrg ? "/private/dashboard" : "/private/login"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-2xl p-3 text-xs font-bold text-[#4B78A8] bg-[#EAF1FA]/60"
              >
                <span>Organization Portal</span>
                <Building2 className="h-4 w-4 text-[#4B78A8]" />
              </Link>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
