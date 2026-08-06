"use client";

import React, { useState } from "react";
import { Info } from "lucide-react";

export type ProfileBadgeType = "founding_beta" | "founding_contributor" | "ambassador" | "staff";

interface BetaBadgeProps {
  badgeType?: ProfileBadgeType | string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

const BADGE_CONFIG: Record<
  string,
  { label: string; tooltip: string; bg: string; text: string; icon: string }
> = {
  founding_beta: {
    label: "Founding Beta Tester",
    tooltip: "One of the first testers who helped shape OyaPlan before public launch.",
    bg: "bg-[#FCC630]",
    text: "text-[#00603A]",
    icon: "🏅",
  },
  founding_contributor: {
    label: "Founding Contributor",
    tooltip: "Contributed venue data, scout reviews, or pricing intelligence during early release.",
    bg: "bg-[#008751]",
    text: "text-white",
    icon: "⭐",
  },
  ambassador: {
    label: "OyaPlan Ambassador",
    tooltip: "Community leader bringing Lagos outing squads together.",
    bg: "bg-purple-600",
    text: "text-white",
    icon: "🚀",
  },
  staff: {
    label: "Core Team",
    tooltip: "OyaPlan engineering and product team member.",
    bg: "bg-midnight-lagoon",
    text: "text-white",
    icon: "🛡️",
  },
};

export function BetaBadge({
  badgeType = "founding_beta",
  size = "md",
  className = "",
  showTooltip = true,
}: BetaBadgeProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (!badgeType) return null;

  const config = BADGE_CONFIG[badgeType] || BADGE_CONFIG.founding_beta;

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[10px]",
    md: "px-3.5 py-1 text-[11px]",
    lg: "px-4 py-1.5 text-xs",
  }[size];

  return (
    <div className="relative inline-flex items-center group">
      <button
        type="button"
        onClick={() => setTooltipOpen(!tooltipOpen)}
        onMouseEnter={() => setTooltipOpen(true)}
        onMouseLeave={() => setTooltipOpen(false)}
        aria-label={`${config.label}: ${config.tooltip}`}
        className={`inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-wider shadow-sm transition-all transform active:scale-95 cursor-pointer ${config.bg} ${config.text} ${sizeClasses} ${className}`}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
        {showTooltip && <Info className="w-3 h-3 opacity-60 ml-0.5 shrink-0" />}
      </button>

      {/* Tooltip Popup */}
      {showTooltip && tooltipOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-gray-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 text-center font-medium leading-tight">
          {config.tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export default BetaBadge;
