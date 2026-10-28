import { HeartHandshake, Building2, KeyRound, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative border-t border-[#E2E9E4] bg-white">
      {/* Top subtle emerald gradient accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#427A65]/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 pr-0 lg:pr-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65] shadow-2xs">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <span className="text-base font-bold tracking-tight text-[#24342E]">
                Community<span className="text-[#427A65]">Connect</span>
              </span>
            </Link>

            <p className="mt-3 max-w-sm text-xs leading-relaxed text-[#6F7D76]">
              A modern peer-to-peer community platform bridging emergency blood needs, home help, food assistance, caregiving, and professional repairs with verified oversight.
            </p>

            {/* Live Ecosystem Status */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#D5E7DB] bg-[#F2F8F4] px-3.5 py-1 text-[11px] font-semibold text-[#356651]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#427A65] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#427A65]" />
              </span>
              <span>All 3 Portals Live & Verified</span>
            </div>
          </div>

          {/* Column 1: Explore Help */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#24342E]">
              Explore Help
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-[#6F7D76]">
              <li>
                <Link to="/blood" className="transition hover:text-[#C94C55]">
                  Find Blood
                </Link>
              </li>
              <li>
                <Link to="/services" className="transition hover:text-[#4B78A8]">
                  Find Services
                </Link>
              </li>
              <li>
                <Link to="/blood/donor" className="transition hover:text-[#427A65]">
                  Become a Donor
                </Link>
              </li>
              <li>
                <Link to="/services/provider" className="transition hover:text-[#427A65]">
                  Offer Skills
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Organizations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B78A8]">
              Organizations
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-[#6F7D76]">
              <li>
                <Link to="/private/login" className="inline-flex items-center gap-1.5 transition hover:text-[#4B78A8]">
                  <Building2 className="h-3 w-3 text-[#4B78A8]" />
                  <span>Org Portal Sign In</span>
                </Link>
              </li>
              <li>
                <Link to="/private/register" className="transition hover:text-[#4B78A8]">
                  Register Blood Bank / Hospital
                </Link>
              </li>
              <li>
                <Link to="/private/register" className="transition hover:text-[#4B78A8]">
                  Register Service Provider
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance & Safety */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#24342E]">
              Governance
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-[#6F7D76]">
              <li>
                <Link to="/admin/login" className="inline-flex items-center gap-1.5 transition hover:text-slate-900">
                  <KeyRound className="h-3 w-3 text-slate-700" />
                  <span>Admin Workspace</span>
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="transition hover:text-[#427A65]">
                  Community Feedback
                </Link>
              </li>
              <li className="inline-flex items-center gap-1 text-[11px] text-[#8C9892]">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Verified Ecosystem</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EEF2EF] pt-6 text-xs text-[#8C9892]">
          <p>© {new Date().getFullYear()} CommunityConnect. Empowering local communities across India.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[#24342E]">Privacy & Safety</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#24342E]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
