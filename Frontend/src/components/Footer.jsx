import { HeartHandshake, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative border-t border-[#E2E9E4] bg-white"
    >
      {/* Subtle top organic accent line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#427A65]/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {/* Main Multi-Column Grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {/* Column 1: Brand & Tagline */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 pr-0 lg:pr-6">
            <Link to="/home" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65] shadow-2xs">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight text-[#24342E]">
                CommunityConnect
              </span>
            </Link>

            <p className="mt-2.5 max-w-sm text-xs leading-relaxed text-[#6F7D76]">
              Direct peer-to-peer network connecting communities for urgent blood needs and everyday local services with zero middleman markup.
            </p>

            {/* Live Network Beacon */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#D5E7DB] bg-[#F2F8F4] px-3 py-1 text-[11px] font-semibold text-[#356651]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#427A65] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#427A65]" />
              </span>
              <span>All networks operational · Live peer matching</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#24342E]">
              Quick Links
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs font-medium text-[#6F7D76]">
              <li>
                <Link
                  to="/home"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/blood"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  Find Blood
                </Link>
              </li>
              <li>
                <Link
                  to="/blood/donor"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  Donate Blood
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  Find Service
                </Link>
              </li>
              <li>
                <Link
                  to="/services/provider"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  Provide Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#24342E]">
              Community
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs font-medium text-[#6F7D76]">
              <li>
                <Link
                  to="/requests"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  My Requests
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  Profile & Settings
                </Link>
              </li>
              <li>
                <Link
                  to="/feedback"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  Feedback & Support
                </Link>
              </li>
            </ul>

            <div className="mt-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E5F1EA] px-2 py-0.5 text-[10px] font-semibold text-[#427A65]">
                <ShieldCheck className="h-3 w-3" />
                Verified Community
              </span>
            </div>
          </div>

          {/* Column 4: Account & Connect */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#24342E]">
              Account & Links
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs font-medium text-[#6F7D76]">
              <li>
                <Link
                  to="/login"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  Member Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  to="/forgot-password"
                  className="inline-block transition-transform hover:translate-x-0.5 hover:text-[#427A65]"
                >
                  Password Recovery
                </Link>
              </li>
              <li className="pt-1.5">
                <a
                  href="https://github.com/ParthMahajan1020/CommunityConnect"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#24342E]"
                >
                  <svg
                    className="h-3.5 w-3.5 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="h-3 w-3 text-[#8C9892]" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#EEF2EF] pt-6 sm:flex-row">
          <p className="text-xs text-[#8C9892]">
            © {new Date().getFullYear()} CommunityConnect. Peer-to-peer neighborhood resilience.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-[#8C9892]">
            <span>Decentralized</span>
            <span>·</span>
            <span>Privacy Preserved</span>
            <span>·</span>
            <span>Direct Community</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
