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
import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";

const desktopLinks = [
  { label: "Home", to: "/home", icon: HomeIcon },
  { label: "Find Blood", to: "/blood", icon: Droplets },
  { label: "Donate Blood", to: "/blood/donor", icon: HeartHandshake },
  { label: "Find Services", to: "/services", icon: Wrench },
  { label: "Provide Help", to: "/services/provider", icon: Sparkles },
  { label: "Feedback", to: "/feedback", icon: MessageSquareText },
];

function Navbar() {
  const navigate = useNavigate();

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

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previouslyFocused = document.activeElement;
    mobileDialogRef.current
      ?.querySelector("button, a[href]")
      ?.focus();

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
    return () => {
      window.removeEventListener("resize", closeMenuAtDesktopWidth);
    };
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
    <header className="sticky top-0 z-50 border-b border-[#E2E9E4] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <button
          type="button"
          onClick={() => {
            handleNavClick();
            navigate("/home");
          }}
          className="flex min-w-0 shrink items-center gap-2 rounded-full transition hover:bg-[#F4F8F6] sm:gap-3 sm:p-1.5 sm:pr-3"
          aria-label="Go to home"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65] shadow-sm sm:h-11 sm:w-11">
            <HeartHandshake className="h-5 w-5" />
          </div>

          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-sm font-bold tracking-[-0.04em] text-[#24342E] sm:text-base">
              CommunityConnect
            </span>

            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#6F7D76]">
              Together
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-0.5 rounded-full border border-[#E2E9E4] bg-[#F8FAF9] p-1 lg:flex"
          aria-label="Main navigation"
        >
          {desktopLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-medium transition-colors duration-200 xl:px-3 xl:text-sm ${
                  isActive
                    ? "bg-[#427A65] text-white shadow-sm"
                    : "text-[#24342E] hover:bg-white hover:text-[#427A65]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Account Actions */}
        <div className="hidden items-center gap-2 lg:flex xl:gap-3">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-[#E2E9E4] bg-white px-2 py-1.5 pr-3 shadow-sm transition hover:border-[#C9D8CF] hover:bg-[#F8FAF9]"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label="Open account menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5F1EA] text-xs font-semibold text-[#427A65]">
                  {initials}
                </span>

                <span className="max-w-32 truncate text-sm font-medium text-[#24342E]">
                  {user.name || "Account"}
                </span>

                <ChevronDown
                  className={`h-4 w-4 text-[#6F7D76] transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close account menu"
                    onClick={() => setProfileOpen(false)}
                  />

                  <div className="absolute right-0 z-50 mt-3 w-56 rounded-2xl border border-[#E2E9E4] bg-white p-2 shadow-[0_18px_32px_rgba(36,52,46,0.12)]">
                    <div className="border-b border-[#E2E9E4] px-3 py-3">
                      <p className="truncate text-sm font-semibold text-[#24342E]">
                        {user.name || "Account"}
                      </p>

                      {user.email && (
                        <p className="mt-1 truncate text-xs text-[#6F7D76]">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/profile");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#24342E] transition hover:bg-[#F4F8F6]"
                    >
                      <User className="h-4 w-4 text-[#6F7D76]" />
                      Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/requests");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#24342E] transition hover:bg-[#F4F8F6]"
                    >
                      <Sparkles className="h-4 w-4 text-[#6F7D76]" />
                      My Requests
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#C94C55] transition hover:bg-[#FBEAEC]"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-full px-4 py-2 text-sm font-medium text-[#24342E] transition hover:bg-[#F4F8F6]"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="rounded-full bg-[#427A65] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#396A5A]"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E2E9E4] bg-white text-[#24342E] transition hover:bg-[#F4F8F6] lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation-dialog"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

    </header>

      {/* Render outside the sticky, backdrop-filtered header so the drawer
          covers the viewport rather than becoming a nested scrolling panel. */}
      {mobileOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] bg-[#24342E]/25 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
          <section
            ref={mobileDialogRef}
            id="mobile-navigation-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute right-0 top-0 flex h-full min-h-[100dvh] w-[min(88vw,24rem)] flex-col overflow-y-auto overscroll-contain border-l border-[#E2E9E4] bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;

              const focusableItems = mobileDialogRef.current?.querySelectorAll(
                'a[href], button:not([disabled])'
              );
              if (!focusableItems?.length) return;

              const firstItem = focusableItems[0];
              const lastItem = focusableItems[focusableItems.length - 1];

              if (event.shiftKey && document.activeElement === firstItem) {
                event.preventDefault();
                lastItem.focus();
              } else if (!event.shiftKey && document.activeElement === lastItem) {
                event.preventDefault();
                firstItem.focus();
              }
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#E2E9E4] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                  <HeartHandshake className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-base font-bold tracking-[-0.04em] text-[#24342E]">
                    CommunityConnect
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[#6F7D76]">
                    Together
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full p-2 text-[#24342E] transition hover:bg-[#F4F8F6]"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile User Info */}
            {user && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#F4F8F6] p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5F1EA] text-sm font-semibold text-[#427A65]">
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#24342E]">
                    {user.name || "Account"}
                  </p>

                  <p className="truncate text-xs text-[#6F7D76]">
                    {user.email || "Community member"}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Links */}
            <nav className="mt-6 space-y-2" aria-label="Community">
              {desktopLinks.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-[#E5F1EA] text-[#427A65]"
                        : "text-[#24342E] hover:bg-[#F4F8F6]"
                    }`
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Account Actions */}
            <div className="mt-8 space-y-2 border-t border-[#E2E9E4] pt-5">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick();
                      navigate("/profile");
                    }}
                    className="flex w-full items-center justify-between rounded-2xl bg-[#F4F8F6] px-4 py-3.5 text-left text-sm font-medium text-[#24342E] transition hover:bg-[#E5F1EA]"
                  >
                    <span>Profile</span>
                    <User className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick();
                      navigate("/requests");
                    }}
                    className="flex w-full items-center justify-between rounded-2xl bg-[#F4F8F6] px-4 py-3.5 text-left text-sm font-medium text-[#24342E] transition hover:bg-[#E5F1EA]"
                  >
                    <span>My Requests</span>
                    <Sparkles className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between rounded-2xl bg-[#FBEAEC] px-4 py-3.5 text-left text-sm font-medium text-[#C94C55] transition hover:bg-[#F8DDE0]"
                  >
                    <span>Logout</span>
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick();
                      navigate("/login");
                    }}
                    className="flex w-full items-center justify-between rounded-2xl bg-[#F4F8F6] px-4 py-3.5 text-left text-sm font-medium text-[#24342E] transition hover:bg-[#E5F1EA]"
                  >
                    <span>Login</span>
                    <User className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick();
                      navigate("/register");
                    }}
                    className="flex w-full items-center justify-between rounded-2xl bg-[#427A65] px-4 py-3.5 text-left text-sm font-semibold text-white transition hover:bg-[#396A5A]"
                  >
                    <span>Get Started</span>
                    <HeartHandshake className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            <p className="mt-auto pt-8 text-center text-xs text-[#8A9690]">
              A little help can make a big difference.
            </p>
          </section>
          </div>,
          document.body
        )}
    </>
  );
}

export default Navbar;