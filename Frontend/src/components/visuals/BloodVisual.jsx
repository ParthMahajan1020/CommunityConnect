import { motion } from "motion/react";
import { Activity } from "lucide-react";

export function AnimatedBloodDrop({ size = "md", pulse = true }) {
  const sizeMap = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeMap[size] || sizeMap.md}`}>
      {pulse && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-[#C94C55]/20 blur-md"
        />
      )}

      <motion.div
        animate={pulse ? { y: [0, -4, 0] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex h-full w-full items-center justify-center rounded-3xl border border-[#F2D0D4] bg-gradient-to-b from-[#FFF2F4] to-[#FBEAEC] shadow-[0_10px_25px_rgba(201,76,85,0.18)]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-1/2 w-1/2 text-[#C94C55]"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
            fill="#C94C55"
            fillOpacity="0.85"
          />
          <path
            d="M9.5 12.5a3.5 3.5 0 0 0 3.5 3.5"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </div>
  );
}

export function BloodCompatibilityIndicator({ selectedGroup = "" }) {
  const compatibility = {
    "A+": { give: ["A+", "AB+"], receive: ["A+", "A-", "O+", "O-"] },
    "O+": { give: ["O+", "A+", "B+", "AB+"], receive: ["O+", "O-"] },
    "B+": { give: ["B+", "AB+"], receive: ["B+", "B-", "O+", "O-"] },
    "AB+": { give: ["AB+"], receive: ["All Types (Universal)"] },
    "A-": { give: ["A+", "A-", "AB+", "AB-"], receive: ["A-", "O-"] },
    "O-": { give: ["All Types (Universal)"], receive: ["O-"] },
    "B-": { give: ["B+", "B-", "AB+", "AB-"], receive: ["B-", "O-"] },
    "AB-": { give: ["AB+", "AB-"], receive: ["AB-", "A-", "B-", "O-"] },
  };

  const info = compatibility[selectedGroup];
  if (!info) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F2D5D8] bg-[#FFF5F6] px-4 py-2.5 text-xs text-[#24342E]"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C94C55] text-[10px] font-bold text-white">
          {selectedGroup}
        </span>
        <span className="font-semibold text-[#8B2C34]">Compatibility:</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px]">
        <span>
          <strong className="text-[#8B2C34]">Can receive:</strong>{" "}
          {info.receive.join(", ")}
        </span>
        <span className="text-[#E0B0B5]">•</span>
        <span>
          <strong className="text-[#8B2C34]">Can donate to:</strong>{" "}
          {info.give.join(", ")}
        </span>
      </div>
    </motion.div>
  );
}

export function ScanningRadar({ label = "Scanning nearby donors..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
        {/* Radar Rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-[#C94C55]"
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

        {/* Center Node */}
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#C94C55] text-white shadow-[0_8px_20px_rgba(201,76,85,0.35)]">
          <Activity className="h-7 w-7 animate-pulse" />
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold text-[#24342E]">{label}</p>
      <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#7B8880]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C94C55] animate-ping" />
        Matching blood group & neighborhood radius
      </div>
    </div>
  );
}
