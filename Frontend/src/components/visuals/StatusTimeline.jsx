import { motion } from "motion/react";
import { Check, XCircle } from "lucide-react";

export function RequestTimeline({ status = "PENDING" }) {
  const normStatus = String(status || "PENDING").toUpperCase();

  const steps = [
    { key: "SENT", label: "Sent" },
    { key: "PENDING", label: "Awaiting" },
    { key: "ACCEPTED", label: "Accepted" },
    { key: "COMPLETED", label: "Completed" },
  ];

  let activeIndex = 0;
  if (normStatus === "PENDING") activeIndex = 1;
  else if (normStatus === "ACCEPTED") activeIndex = 2;
  else if (normStatus === "COMPLETED") activeIndex = 3;
  else if (normStatus === "REJECTED" || normStatus === "INCOMPLETED") activeIndex = 1;

  const isFailed = normStatus === "REJECTED" || normStatus === "INCOMPLETED";

  return (
    <div className="w-full py-2">
      <div className="relative flex items-center justify-between">
        {/* Background Track Line */}
        <div className="absolute left-2 right-2 top-3 h-0.5 bg-[#E8EDE9]" />

        {/* Active Track Line */}
        <motion.div
          className={`absolute left-2 top-3 h-0.5 ${isFailed ? "bg-[#C94C55]" : "bg-[#427A65]"}`}
          initial={{ width: "0%" }}
          animate={{
            width: `${(activeIndex / (steps.length - 1)) * 96}%`,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all duration-300 ${
                  isCurrent && isFailed
                    ? "border-[#C94C55] bg-[#FBEAEC] text-[#C94C55]"
                    : isCurrent
                      ? "border-[#427A65] bg-[#E5F1EA] text-[#427A65] ring-4 ring-[#427A65]/10"
                      : isDone
                        ? "border-[#427A65] bg-[#427A65] text-white"
                        : "border-[#D6DFDA] bg-white text-[#98A49D]"
                }`}
              >
                {isDone ? (
                  <Check size={11} strokeWidth={3} />
                ) : isCurrent && isFailed ? (
                  <XCircle size={12} strokeWidth={2.5} />
                ) : isCurrent ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#427A65]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span
                className={`mt-1.5 text-[10px] font-medium tracking-tight ${
                  isCurrent
                    ? isFailed
                      ? "font-semibold text-[#C94C55]"
                      : "font-semibold text-[#427A65]"
                    : isDone
                      ? "text-[#24342E]"
                      : "text-[#98A49D]"
                }`}
              >
                {isCurrent && normStatus === "REJECTED"
                  ? "Declined"
                  : isCurrent && normStatus === "INCOMPLETED"
                    ? "Incomplete"
                    : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
