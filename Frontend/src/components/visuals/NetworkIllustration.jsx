import { useState } from "react";
import { motion } from "motion/react";
import { Droplets, HeartHandshake, ShieldCheck, Wrench, User, Sparkles } from "lucide-react";

export default function NetworkIllustration({ interactive = true, compact = false }) {
  const [activeNode, setActiveNode] = useState(null);

  const nodes = [
    {
      id: "blood",
      label: "Blood Donor",
      tag: "O+ Available",
      icon: Droplets,
      color: "#C94C55",
      bg: "#FBEAEC",
      borderColor: "#F0D5D8",
      x: 18,
      y: 28,
    },
    {
      id: "service",
      label: "Local Service",
      tag: "Verified Helper",
      icon: Wrench,
      color: "#4B78A8",
      bg: "#EAF1FA",
      borderColor: "#D3E2F4",
      x: 82,
      y: 26,
    },
    {
      id: "requester",
      label: "Need Support",
      tag: "Connecting now",
      icon: User,
      color: "#427A65",
      bg: "#E5F1EA",
      borderColor: "#CFE2D6",
      x: 24,
      y: 78,
    },
    {
      id: "trust",
      label: "Safe Community",
      tag: "Verified Members",
      icon: ShieldCheck,
      color: "#D97706",
      bg: "#FEF3C7",
      borderColor: "#FDE68A",
      x: 76,
      y: 80,
    },
  ];

  return (
    <div
      className={`relative select-none overflow-hidden rounded-3xl border border-[#E2E9E4] bg-gradient-to-b from-white via-[#FAFBF9] to-[#F3F7F4] p-4 shadow-[0_18px_45px_rgba(36,52,46,0.06)] ${
        compact ? "h-[320px]" : "h-[380px] sm:h-[440px]"
      }`}
    >
      {/* Background ambient mesh */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(66,122,101,0.08),transparent_70%)]" />

      {/* SVG Connecting Lines with animated dashes */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="grad-blood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C94C55" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#427A65" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="grad-service" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4B78A8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#427A65" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="grad-requester" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#427A65" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#427A65" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="grad-trust" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#427A65" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Lines connecting each node to center (50, 52) */}
        {nodes.map((node) => {
          const isActive = activeNode === node.id || activeNode === null;
          return (
            <g key={node.id}>
              {/* Outer soft glow line */}
              <path
                d={`M 50 52 Q ${(node.x + 50) / 2} ${(node.y + 52) / 2 + (node.y > 50 ? 5 : -5)} ${node.x} ${node.y}`}
                fill="none"
                stroke={node.color}
                strokeWidth={isActive ? "0.8" : "0.3"}
                strokeOpacity={isActive ? "0.4" : "0.15"}
              />
              {/* Animated pulse line */}
              <motion.path
                d={`M 50 52 Q ${(node.x + 50) / 2} ${(node.y + 52) / 2 + (node.y > 50 ? 5 : -5)} ${node.x} ${node.y}`}
                fill="none"
                stroke={node.color}
                strokeWidth={isActive ? "0.7" : "0.3"}
                strokeDasharray="2 3"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -20 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                strokeOpacity={isActive ? "0.8" : "0.2"}
              />
            </g>
          );
        })}
      </svg>

      {/* Central Hub Node */}
      <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex flex-col items-center justify-center"
        >
          {/* Subtle outer pulsing ring */}
          <div className="absolute -inset-3 animate-ping rounded-full bg-[#427A65]/10 duration-1000" />
          <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl border-2 border-[#427A65]/30 bg-white shadow-[0_12px_28px_rgba(66,122,101,0.18)]">
            <HeartHandshake className="h-8 w-8 text-[#427A65]" />
          </div>
          <span className="mt-2 rounded-full border border-[#DCE9E0] bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#427A65] shadow-xs backdrop-blur-xs">
            Connected
          </span>
        </motion.div>
      </div>

      {/* Interactive Periphery Nodes */}
      {nodes.map((node) => {
        const Icon = node.icon;
        const isActive = activeNode === node.id;

        return (
          <motion.div
            key={node.id}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10"
            onMouseEnter={() => interactive && setActiveNode(node.id)}
            onMouseLeave={() => interactive && setActiveNode(null)}
            onClick={() => interactive && setActiveNode(activeNode === node.id ? null : node.id)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`flex items-center gap-2 rounded-2xl border bg-white p-2 sm:p-2.5 shadow-sm transition-all duration-300 ${
                isActive
                  ? "ring-4 shadow-md"
                  : "hover:shadow-md"
              }`}
              style={{
                borderColor: node.borderColor,
                boxShadow: isActive ? `0 10px 25px -4px ${node.color}33` : undefined,
              }}
            >
              <div
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: node.bg, color: node.color }}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <div className="hidden sm:block text-left pr-1.5">
                <p className="text-xs font-semibold leading-tight text-[#24342E]">
                  {node.label}
                </p>
                <p className="text-[10px] text-[#6F7D76] font-medium leading-tight">
                  {node.tag}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Floating Micro-Indicators */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-medium text-[#7A8881]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#427A65] animate-pulse" />
          Live Community Graph
        </span>
        <span className="hidden sm:inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-[#427A65]" /> Real-time peer connections
        </span>
      </div>
    </div>
  );
}
