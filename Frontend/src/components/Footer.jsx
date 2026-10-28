import { HeartHandshake, Building2, KeyRound, Droplets, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative bg-[#111714] text-white overflow-hidden border-t border-white/10">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-[#427A65]/15 to-transparent blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        
        {/* Top: Large Statement & Wordmark */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b border-white/10">
          <div className="space-y-4 max-w-xl">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#427A65] text-white shadow-xs transition group-hover:scale-105">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Community<span className="text-[#8AD4B2]">Connect</span>
              </span>
            </Link>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Help starts <span className="text-[#8AD4B2]">nearby.</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/blood"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-white transition backdrop-blur-sm"
            >
              <Droplets className="h-3.5 w-3.5 text-[#C94C55]" />
              <span>Find Blood</span>
            </Link>

            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-white transition backdrop-blur-sm"
            >
              <Wrench className="h-3.5 w-3.5 text-[#8EB8E5]" />
              <span>Find Services</span>
            </Link>

            <Link
              to="/private/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-3 text-xs font-bold text-white transition backdrop-blur-sm"
            >
              <Building2 className="h-3.5 w-3.5 text-[#8AD4B2]" />
              <span>Organizations</span>
            </Link>
          </div>
        </div>

        {/* Center: Minimal Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10 text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider text-white/40 block mb-3">
              Explore
            </span>
            <ul className="space-y-2.5 text-white/70">
              <li>
                <Link to="/blood" className="hover:text-white transition">
                  Emergency Blood
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition">
                  Local Services
                </Link>
              </li>
              <li>
                <Link to="/services?category=Cleaning" className="hover:text-white transition">
                  Home Help
                </Link>
              </li>
              <li>
                <Link to="/services/provider" className="hover:text-white transition">
                  Provide Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-white/40 block mb-3">
              Offer Aid
            </span>
            <ul className="space-y-2.5 text-white/70">
              <li>
                <Link to="/blood/donor" className="hover:text-white transition">
                  Volunteer Blood Donor
                </Link>
              </li>
              <li>
                <Link to="/services/provider" className="hover:text-white transition">
                  List Provider Skills
                </Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-white transition">
                  Connection Requests
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-[#8EB8E5] block mb-3">
              Organizations
            </span>
            <ul className="space-y-2.5 text-white/70">
              <li>
                <Link to="/private/login" className="hover:text-white transition">
                  Hospital & Blood Bank Login
                </Link>
              </li>
              <li>
                <Link to="/private/register" className="hover:text-white transition">
                  Register Facility
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="font-bold uppercase tracking-wider text-white/40 block mb-3">
              Platform
            </span>
            <ul className="space-y-2.5 text-white/70">
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Member Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="inline-flex items-center gap-1 hover:text-white transition">
                  <KeyRound className="h-3 w-3" />
                  <span>Admin Access</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Ecosystem Pill */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-xs text-white/50">
          <p>© {new Date().getFullYear()} CommunityConnect. Connecting neighbors with direct transparency.</p>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Community Network Active</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
