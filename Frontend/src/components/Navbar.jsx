import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Droplets,
  HeartHandshake,
  LogOut,
  Menu,
  MessageSquareText,
  Sparkles,
  User,
  Wrench,
  X,
  Home as HomeIcon,
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { logoutUser } from "../services/api";

const navItems = [
  { label: "Home", to: "/home", icon: HomeIcon },
  { label: "Find Blood", to: "/blood", icon: Droplets, badge: "Blood" },
  { label: "Donate Blood", to: "/blood/donor", icon: HeartHandshake },
  { label: "Find Services", to: "/services", icon: Wrench, badge: "Services" },
  { label: "Provide Help", to: "/services/provider", icon: Sparkles },
  { label: "My Requests", to: "/requests", icon: Sparkles },
  { label: "Feedback", to: "/feedback", icon: MessageSquareText },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const mobileDialogRef = useRef(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previouslyFocused = document.activeElement;
    mobileDialogRef.current?.querySelector("button, a[href]")?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [mobileOpen]);

  useEffect(() => {
    const closeMenuAtDesktopWidth = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", closeMenuAtDesktopWidth);
    return () => window.removeEventListener("resize", closeMenuAtDesktopWidth);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/login");
  };

  const handleNavClick = () => {
    setMobileOpen(false);
    setProfileOpen(false);
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
    <>
      <header className="sticky top-0 z-50 border-b border-[#E2E9E4] bg-white/85 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          {/* Brand */}
          <button
            type="button"
            onClick={() => {
              handleNavClick();
              navigate("/home");
            }}
            className="group flex min-w-0 items-center gap-2.5 rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427A65]"
            aria-label="Go to home"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65] shadow-xs transition-transform group-hover:scale-105">
              <HeartHandshake className="h-5 w-5" />
            </div>

            <div className="flex flex-col text-left leading-tight">
              <span className="text-sm font-bold tracking-tight text-[#24342E] sm:text-base">
                CommunityConnect
              </span>
              <span className="text-[10px] font-medium tracking-wider text-[#6F7D76] uppercase">
                Peer Network
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-1 rounded-full border border-[#E2E9E4] bg-[#F8FAF9]/80 p-1 lg:flex"
            aria-label="Main navigation"
          >
            {navItems.map(({ label, to, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 xl:px-3.5 xl:text-sm ${
                    isActive
                      ? "bg-[#427A65] text-white shadow-xs"
                      : "text-[#24342E] hover:bg-white hover:text-[#427A65]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Account Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-[#E2E9E4] bg-white px-2.5 py-1.5 pr-3 shadow-xs transition hover:border-[#C9D8CF] hover:bg-[#F8FAF9]"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="Open account menu"
                >
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#E5F1EA] text-xs font-bold text-[#427A65]">
                    {initials}
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-[#427A65]" />
                  </span>

                  <span className="max-w-28 truncate text-xs font-semibold text-[#24342E]">
                    {user.name || "Account"}
                  </span>

                  <ChevronDown
                    className={`h-3.5 w-3.5 text-[#6F7D76] transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-40 cursor-default"
                        aria-label="Close account menu"
                        onClick={() => setProfileOpen(false)}
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-[#E2E9E4] bg-white p-1.5 shadow-[0_16px_32px_rgba(36,52,46,0.1)]"
                      >
                        <div className="border-b border-[#E2E9E4] px-3 py-2.5">
                          <p className="truncate text-xs font-semibold text-[#24342E]">
                            {user.name || "Account"}
                          </p>
                          {user.email && (
                            <p className="truncate text-[11px] text-[#6F7D76]">
                              {user.email}
                            </p>
                          )}
                        </div>

                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              navigate("/profile");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#24342E] transition hover:bg-[#F4F8F6]"
                          >
                            <User className="h-3.5 w-3.5 text-[#6F7D76]" />
                            Profile
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileOpen(false);
                              navigate("/requests");
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#24342E] transition hover:bg-[#F4F8F6]"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-[#6F7D76]" />
                            My Requests
                          </button>
                        </div>

                        <div className="border-t border-[#E2E9E4] pt-1">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#C94C55] transition hover:bg-[#FBEAEC]"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#24342E] transition hover:bg-[#F4F8F6]"
                >
                  Log In
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="rounded-full bg-[#427A65] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651]"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E9E4] bg-white text-[#24342E] transition hover:bg-[#F4F8F6] lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-[#24342E]/30 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.section
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              ref={mobileDialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="absolute right-0 top-0 flex h-full w-[min(85vw,22rem)] flex-col border-l border-[#E2E9E4] bg-white p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#E2E9E4] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-[#24342E]">
                      CommunityConnect
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-[#6F7D76]">
                      Peer Network
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-1.5 text-[#24342E] transition hover:bg-[#F4F8F6]"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile User Tag */}
              {user && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#F4F8F6] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E5F1EA] text-xs font-bold text-[#427A65]">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#24342E]">
                      {user.name || "Account"}
                    </p>
                    <p className="truncate text-[11px] text-[#6F7D76]">
                      {user.email || "Community Member"}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation list */}
              <nav className="mt-5 space-y-1 overflow-y-auto" aria-label="Mobile navigation links">
                {navItems.map(({ label, to, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-[#E5F1EA] text-[#427A65] font-semibold"
                          : "text-[#24342E] hover:bg-[#F4F8F6]"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </NavLink>
                ))}
              </nav>

              {/* Bottom Actions */}
              <div className="mt-auto border-t border-[#E2E9E4] pt-4 space-y-2">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick();
                        navigate("/profile");
                      }}
                      className="flex w-full items-center justify-between rounded-xl bg-[#F4F8F6] px-3.5 py-2.5 text-xs font-semibold text-[#24342E] transition hover:bg-[#E5F1EA]"
                    >
                      <span>Profile</span>
                      <User className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between rounded-xl bg-[#FBEAEC] px-3.5 py-2.5 text-xs font-semibold text-[#C94C55] transition hover:bg-[#F8DDE0]"
                    >
                      <span>Logout</span>
                      <LogOut className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick();
                        navigate("/login");
                      }}
                      className="flex items-center justify-center rounded-xl bg-[#F4F8F6] py-2.5 text-xs font-semibold text-[#24342E]"
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick();
                        navigate("/register");
                      }}
                      className="flex items-center justify-center rounded-xl bg-[#427A65] py-2.5 text-xs font-semibold text-white"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </motion.section>
          </div>,
          document.body
        )}
    </>
  );
}