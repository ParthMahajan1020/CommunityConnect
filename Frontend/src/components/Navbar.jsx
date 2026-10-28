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
  const mobileDialogRef = useRef(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isOrg = ["BLOOD_BANK", "HOSPITAL", "SERVICE_PROVIDER"].includes(user?.role);
  const isAdmin = user?.role === "ADMIN";

  // Close menus on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setProfileOpen(false);
    setExploreOpen(false);
    setGiveHelpOpen(false);
  }, [location.pathname]);

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

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E9E4] bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* =========================================================
            LEFT: BRAND LOGO
        ========================================================= */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427A65]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65] shadow-xs transition-transform duration-300 group-hover:scale-105">
            <HeartHandshake className="h-5 w-5" />
          </div>

          <div className="flex flex-col text-left leading-tight">
            <span className="text-base font-bold tracking-tight text-[#24342E]">
              Community<span className="text-[#427A65]">Connect</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6F7D76]">
              Community Network
            </span>
          </div>
        </Link>

        {/* =========================================================
            CENTER: DESKTOP NAVIGATION
        ========================================================= */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-[#427A65] text-white shadow-2xs"
                  : "text-[#55645E] hover:bg-[#F2F6FA] hover:text-[#24342E]"
              }`
            }
          >
            Home
          </NavLink>

          {/* EXPLORE DROPDOWN */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setExploreOpen(!exploreOpen);
                setGiveHelpOpen(false);
              }}
              onMouseEnter={() => setExploreOpen(true)}
              className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold transition ${
                location.pathname.startsWith("/blood") && !location.pathname.includes("/donor") || location.pathname.startsWith("/services") && !location.pathname.includes("/provider")
                  ? "text-[#427A65] bg-[#E5F1EA]/60 font-bold"
                  : "text-[#55645E] hover:bg-[#F2F6FA] hover:text-[#24342E]"
              }`}
            >
              <span>Explore Help</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${exploreOpen ? "rotate-180" : ""}`} />
            </button>

            {exploreOpen && (
              <div
                onMouseLeave={() => setExploreOpen(false)}
                className="absolute top-full left-0 mt-1 w-56 rounded-2xl border border-[#E2E9E4] bg-white p-2 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <Link
                  to="/blood"
                  onClick={() => setExploreOpen(false)}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-xs text-[#24342E] hover:bg-[#FBEAEC] transition group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBEAEC] text-[#C94C55]">
                    <Droplets className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#C94C55]">Find Blood</p>
                    <p className="text-[11px] text-[#6F7D76]">Donors & Hospital stock</p>
                  </div>
                </Link>

                <Link
                  to="/services"
                  onClick={() => setExploreOpen(false)}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-xs text-[#24342E] hover:bg-[#EAF1FA] transition group mt-1"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF1FA] text-[#4B78A8]">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#4B78A8]">Find Services</p>
                    <p className="text-[11px] text-[#6F7D76]">Home help, repair, food</p>
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
                  : "text-[#55645E] hover:bg-[#F2F6FA] hover:text-[#24342E]"
              }`}
            >
              <span>Give Help</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${giveHelpOpen ? "rotate-180" : ""}`} />
            </button>

            {giveHelpOpen && (
              <div
                onMouseLeave={() => setGiveHelpOpen(false)}
                className="absolute top-full left-0 mt-1 w-56 rounded-2xl border border-[#E2E9E4] bg-white p-2 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <Link
                  to="/blood/donor"
                  onClick={() => setGiveHelpOpen(false)}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-xs text-[#24342E] hover:bg-[#FBEAEC] transition group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBEAEC] text-[#C94C55]">
                    <HeartHandshake className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#C94C55]">Donate Blood</p>
                    <p className="text-[11px] text-[#6F7D76]">Register as a donor</p>
                  </div>
                </Link>

                <Link
                  to="/services/provider"
                  onClick={() => setGiveHelpOpen(false)}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-xs text-[#24342E] hover:bg-[#EDF5EF] transition group mt-1"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF5EF] text-[#427A65]">
                    <Sparkles className="h-4 w-4" />
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
        <div className="flex items-center gap-2.5">
          {/* Quick Portal Switcher (Clean & Discrete) */}
          <Link
            to={isOrg ? "/private/dashboard" : "/private/login"}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#D8E4F2] bg-[#F7FAFD] px-3.5 py-1.5 text-xs font-semibold text-[#4B78A8] transition hover:bg-[#EAF1FA]"
          >
            <Building2 className="h-3.5 w-3.5 text-[#4B78A8]" />
            <span>Organization</span>
          </Link>

          {user ? (
            /* Logged in Profile Menu */
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full border border-[#E2E9E4] bg-[#F8FAF9] p-1.5 pr-3 text-xs font-semibold text-[#24342E] transition hover:bg-white hover:shadow-2xs"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#427A65] text-xs font-bold text-white">
                  {initials}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
                <ChevronDown className="h-3 w-3 text-[#6F7D76]" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#E2E9E4] bg-white p-2 shadow-xl z-50 animate-in fade-in duration-150">
                  <div className="border-b border-[#EEF2EF] px-3 py-2 text-xs">
                    <p className="font-bold text-[#24342E] truncate">{user.name}</p>
                    <p className="text-[11px] text-[#6F7D76] truncate">{user.email}</p>
                    <span className="mt-1 inline-block rounded-md bg-[#EDF5EF] px-2 py-0.5 text-[10px] font-bold text-[#427A65]">
                      {user.role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#24342E] hover:bg-[#F8FAF9]"
                    >
                      <User className="h-3.5 w-3.5 text-[#427A65]" />
                      My Profile
                    </Link>

                    <Link
                      to="/requests"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#24342E] hover:bg-[#F8FAF9]"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#4B78A8]" />
                      Connection Requests
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[#24342E] hover:bg-slate-100"
                      >
                        <Building2 className="h-3.5 w-3.5 text-slate-700" />
                        Admin Workspace
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-[#EEF2EF] pt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#C94C55] hover:bg-[#FBEAEC]"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Logged out: Sign In & CTA */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full px-3.5 py-2 text-xs font-semibold text-[#24342E] transition hover:bg-[#F8FAF9]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#427A65] px-4 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#356651]"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E2E9E4] text-[#24342E] hover:bg-[#F8FAF9] lg:hidden"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* =========================================================
          MOBILE SLIDE-OUT DRAWER
      ========================================================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          <div
            ref={mobileDialogRef}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250"
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#EEF2EF] pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                    <HeartHandshake className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm text-[#24342E]">CommunityConnect</span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl p-1.5 text-[#6F7D76] hover:bg-[#F8FAF9]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="mt-6 space-y-1.5">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-semibold ${
                    location.pathname === "/" || location.pathname === "/home"
                      ? "bg-[#427A65] text-white"
                      : "text-[#24342E] hover:bg-[#F8FAF9]"
                  }`}
                >
                  Home
                </Link>

                <div className="pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#8C9892] px-4">
                  Emergency & Help
                </div>

                <Link
                  to="/blood"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#24342E] hover:bg-[#FBEAEC]"
                >
                  <div className="flex items-center gap-3 text-[#C94C55]">
                    <Droplets className="h-4 w-4" />
                    <span>Find Blood</span>
                  </div>
                  <span className="rounded-full bg-[#FBEAEC] px-2 py-0.5 text-[10px] font-bold text-[#C94C55]">
                    Urgent
                  </span>
                </Link>

                <Link
                  to="/blood/donor"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#24342E] hover:bg-[#FBEAEC]"
                >
                  <HeartHandshake className="h-4 w-4 text-[#C94C55]" />
                  <span>Donate Blood</span>
                </Link>

                <div className="pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#8C9892] px-4">
                  Community Services
                </div>

                <Link
                  to="/services"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#24342E] hover:bg-[#EAF1FA]"
                >
                  <Wrench className="h-4 w-4 text-[#4B78A8]" />
                  <span>Find Services</span>
                </Link>

                <Link
                  to="/services/provider"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#24342E] hover:bg-[#EAF1FA]"
                >
                  <Sparkles className="h-4 w-4 text-[#4B78A8]" />
                  <span>Offer Services</span>
                </Link>

                <Link
                  to="/requests"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-xs font-semibold text-[#24342E] hover:bg-[#F8FAF9]"
                >
                  <Sparkles className="h-4 w-4 text-[#427A65]" />
                  <span>My Connection Requests</span>
                </Link>
              </div>
            </div>

            {/* Drawer Bottom Portal & Auth */}
            <div className="mt-8 border-t border-[#EEF2EF] pt-4 space-y-2">
              <Link
                to="/private/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-[#D8E4F2] bg-[#F7FAFD] px-4 py-3 text-xs font-semibold text-[#4B78A8]"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organization Portal
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#F2D5D8] py-2.5 text-xs font-semibold text-[#C94C55]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-[#E2E9E4] py-2.5 text-xs font-semibold text-[#24342E]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-[#427A65] py-2.5 text-xs font-semibold text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
