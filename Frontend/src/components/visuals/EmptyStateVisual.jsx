import { motion } from "motion/react";
import { Droplet, Search, Send, Inbox, ArrowRight } from "lucide-react";

export function EmptyStateVisual({
  type = "blood", // "blood" | "service" | "sent" | "received" | "general"
  title = "No results found",
  actionLabel,
  onAction,
}) {
  const configs = {
    blood: {
      color: "#C94C55",
      bg: "#FBEAEC",
      borderColor: "#F0D5D8",
      icon: Droplet,
      accentPulse: "bg-[#C94C55]/15",
    },
    service: {
      color: "#4B78A8",
      bg: "#EAF1FA",
      borderColor: "#D3E2F4",
      icon: Search,
      accentPulse: "bg-[#4B78A8]/15",
    },
    sent: {
      color: "#427A65",
      bg: "#E5F1EA",
      borderColor: "#CFE2D6",
      icon: Send,
      accentPulse: "bg-[#427A65]/15",
    },
    received: {
      color: "#427A65",
      bg: "#E5F1EA",
      borderColor: "#CFE2D6",
      icon: Inbox,
      accentPulse: "bg-[#427A65]/15",
    },
    general: {
      color: "#6F7D76",
      bg: "#F2F5F3",
      borderColor: "#E2E9E4",
      icon: Search,
      accentPulse: "bg-[#6F7D76]/15",
    },
  };

  const config = configs[type] || configs.general;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-[#E2E9E4] bg-white px-6 py-12 text-center shadow-xs"
    >
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
        {/* Soft pulse behind icon */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-0 rounded-full ${config.accentPulse} blur-sm`}
        />

        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl border"
          style={{
            backgroundColor: config.bg,
            borderColor: config.borderColor,
            color: config.color,
          }}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>

      <h3 className="text-base font-semibold text-[#24342E]">{title}</h3>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#24342E] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#34463D]"
        >
          {actionLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}
