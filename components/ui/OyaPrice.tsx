"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface OyaPriceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The monetary amount in Naira */
  amount?: number;
  /** Optional range values (e.g. transport range or price window) */
  range?: {
    low: number;
    high: number;
  };
  /** If true, format large amounts compactly (e.g. ₦35k) */
  compact?: boolean;
  /** Display label underneath or beside (e.g. "estimated total", "per person") */
  label?: string;
  /** Whether this price is per person */
  perPerson?: boolean;
  /** Squad size for per-person context calculation */
  squadSize?: number;
  /** Size scale: sm (card meta), md (default/breakdown), lg (plan card title), hero (dossier header) */
  size?: "sm" | "md" | "lg" | "hero";
  /** Trend or budget status coloring */
  trend?: "within" | "stretch" | "over" | "neutral";
  /** Optional inline layout instead of stacked */
  inline?: boolean;
}

export function formatNaira(value: number, compact = false): string {
  if (isNaN(value)) return "₦0";
  if (compact && Math.abs(value) >= 1000) {
    const inK = Math.round(value / 1000);
    return `₦${inK}k`;
  }
  return `₦${Math.round(value).toLocaleString("en-NG")}`;
}

export function OyaPrice({
  amount,
  range,
  compact = false,
  label,
  perPerson = false,
  squadSize,
  size = "md",
  trend = "neutral",
  inline = false,
  className,
  ...props
}: OyaPriceProps) {
  const formattedDisplay = React.useMemo(() => {
    if (range) {
      const lowFormatted = formatNaira(range.low, true);
      const highFormatted = formatNaira(range.high, true);
      return `${lowFormatted}–${highFormatted}`;
    }
    if (amount !== undefined) {
      return formatNaira(amount, compact);
    }
    return "₦0";
  }, [amount, range, compact]);

  // Size styling variants
  const sizeStyles = {
    sm: "text-sm font-bold tracking-tight",
    md: "text-lg font-bold tracking-tight",
    lg: "text-2xl sm:text-3xl font-extrabold tracking-tight",
    hero: "text-3xl sm:text-4xl md:text-5xl font-black tracking-tight",
  };

  // Trend / Fit colors
  const trendColor = {
    neutral: "text-text-primary",
    within: "text-brand-green",
    stretch: "text-amber-600",
    over: "text-red-600",
  }[trend];

  const perPersonText = React.useMemo(() => {
    if (!perPerson && squadSize && squadSize > 1 && amount) {
      const each = Math.round(amount / squadSize);
      return `(${formatNaira(each)} / person · ${squadSize} people)`;
    }
    if (perPerson) {
      return "/ person";
    }
    return null;
  }, [perPerson, squadSize, amount]);

  return (
    <div
      className={cn(
        "flex",
        inline ? "items-baseline gap-2 flex-wrap" : "flex-col gap-0.5",
        className
      )}
      {...props}
    >
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span
          className={cn(
            "tabular-nums select-all font-sans leading-none",
            sizeStyles[size],
            trendColor
          )}
        >
          {formattedDisplay}
        </span>
        {perPersonText && (
          <span className="text-xs font-medium text-text-muted">
            {perPersonText}
          </span>
        )}
      </div>
      {label && (
        <span className="text-[11px] sm:text-xs font-semibold text-text-muted uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}

export default OyaPrice;
