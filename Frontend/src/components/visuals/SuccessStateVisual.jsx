import { motion } from "motion/react";
import { Check } from "lucide-react";

export function AnimatedSuccessCheck({
  title = "Connected successfully!",
  subtitle,
  accent = "green",
}) {
  const isRed = accent === "red";
  const isBlue = accent === "blue";

  const color = isRed ? "#C94C55" : isBlue ? "#4B78A8" : "#427A65";
  const bg = isRed ? "#FBEAEC" : isBlue ? "#EAF1FA" : "#E5F1EA";

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-4 flex h-20 w-20 items-center justify-center">
        {/* Pulsing ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full blur-xs"
          style={{ backgroundColor: `${color}30` }}
        />

        {/* Center check circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm"
          style={{ backgroundColor: bg, color: color }}
        >
          <Check className="h-8 w-8 stroke-[2.5]" />
        </motion.div>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-lg font-semibold text-[#24342E]"
      >
        {title}
      </motion.h3>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-1 text-xs text-[#6F7D76]"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
