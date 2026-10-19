import { motion } from "motion/react";
import { Search } from "lucide-react";
import { renderServiceIcon } from "./serviceIcons";

export function ServiceCategoryBadge({
  service,
  selected = false,
  onClick,
  compact = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-2xl border transition-all duration-200 text-left ${
        compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"
      } ${
        selected
          ? "border-[#4B78A8] bg-[#4B78A8] text-white shadow-sm"
          : "border-[#E2E9E4] bg-white text-[#24342E] hover:border-[#BED2E8] hover:bg-[#F4F8FC]"
      }`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors ${
          selected
            ? "bg-white/20 text-white"
            : "bg-[#EAF1FA] text-[#4B78A8] group-hover:bg-[#DEEAF7]"
        }`}
      >
        {renderServiceIcon(service, "h-3.5 w-3.5")}
      </div>
      <span className="font-medium whitespace-nowrap">{service}</span>
    </button>
  );
}

export function ServiceScanningRadar({
  label = "Locating available helpers...",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-[#4B78A8]"
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeOut",
            }}
          />
        ))}

        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4B78A8] text-white shadow-[0_8px_20px_rgba(75,120,168,0.35)]">
          <Search className="h-7 w-7 animate-pulse" />
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold text-[#24342E]">{label}</p>
      <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#7B8880]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#4B78A8] animate-ping" />
        Scanning local verified service network
      </div>
    </div>
  );
}
