import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export function StatusBadge({ status, type, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let colorClasses = "bg-[#111111]/5 text-[#111111]/80 border-[#111111]/20";

  if (type === "success" || ["published", "accepted", "active", "approved", "beta active"].includes(normalized)) {
    colorClasses = "bg-[#008751]/10 text-[#008751] border-[#008751]/30";
  } else if (type === "warning" || ["draft", "pending", "scheduled", "medium"].includes(normalized)) {
    colorClasses = "bg-[#F6C642]/20 text-[#92400E] border-[#F6C642]/60";
  } else if (type === "error" || ["rejected", "ended", "paused", "high", "gated (deactivated)"].includes(normalized)) {
    colorClasses = "bg-[#D72638]/10 text-[#D72638] border-[#D72638]/30";
  } else if (type === "info" || ["not registered", "low"].includes(normalized)) {
    colorClasses = "bg-[#004B8E]/10 text-[#004B8E] border-[#004B8E]/30";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider select-none ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current shrink-0" />
      {status}
    </span>
  );
}

export default StatusBadge;
