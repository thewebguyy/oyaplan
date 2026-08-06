import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export function StatusBadge({ status, type, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let colorClasses = "bg-gray-100 text-gray-700 border-gray-200";

  if (type === "success" || ["published", "accepted", "active", "approved"].includes(normalized)) {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (type === "warning" || ["draft", "pending", "scheduled", "medium"].includes(normalized)) {
    colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (type === "error" || ["rejected", "ended", "paused", "high"].includes(normalized)) {
    colorClasses = "bg-red-50 text-red-700 border-red-200";
  } else if (type === "info" || ["not registered", "low"].includes(normalized)) {
    colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${colorClasses} ${className}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
