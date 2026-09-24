"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Info, AlertCircle, Sparkles } from "lucide-react";

export type OyaTrustLevel = "verified" | "estimated" | "limited" | "partner" | "warning";

export interface OyaTrustIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: OyaTrustLevel;
  /** Explicit statement, e.g. "Prices verified 3 days ago" */
  label?: string;
  /** Relative freshness or last verified text, e.g. "3 days ago" */
  freshness?: string;
  /** Method or source notes, e.g. "Menu verified" or "Receipt crowd-verified" */
  source?: string;
  /** Size variant */
  size?: "sm" | "md";
  /** Optional clickable tooltip or drawer trigger */
  onShowDetails?: () => void;
}

export function OyaTrustIndicator({
  level = "verified",
  label,
  freshness,
  source,
  size = "md",
  className,
  onShowDetails,
  ...props
}: OyaTrustIndicatorProps) {
  const isSm = size === "sm";

  // Derive human-first text
  const displayLabel = React.useMemo(() => {
    if (label) return label;
    switch (level) {
      case "verified":
        return freshness ? `Verified ${freshness}` : "Prices verified";
      case "partner":
        return "Menu verified by venue";
      case "estimated":
        return source || "Estimated · based on recent menu data";
      case "limited":
        return "Estimated · limited price data";
      case "warning":
        return "Prices may have changed recently";
    }
  }, [label, level, freshness, source]);

  // Subtle, calm styling
  const config = React.useMemo(() => {
    switch (level) {
      case "verified":
        return {
          icon: <Check className={cn("text-brand-green shrink-0", isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2.5} />,
          textClass: "text-[#010528]/85",
          dotClass: "bg-brand-green",
        };
      case "partner":
        return {
          icon: <Sparkles className={cn("text-brand-green shrink-0", isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2} />,
          textClass: "text-brand-green font-semibold",
          dotClass: "bg-brand-green",
        };
      case "estimated":
        return {
          icon: <Info className={cn("text-text-muted shrink-0", isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2} />,
          textClass: "text-text-muted",
          dotClass: "bg-text-muted/60",
        };
      case "limited":
      case "warning":
        return {
          icon: <AlertCircle className={cn("text-amber-600 shrink-0", isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2} />,
          textClass: "text-amber-800",
          dotClass: "bg-amber-500",
        };
    }
  }, [level, isSm]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors",
        isSm ? "text-xs" : "text-sm",
        config.textClass,
        onShowDetails && "cursor-pointer hover:underline",
        className
      )}
      onClick={onShowDetails}
      {...props}
    >
      {config.icon}
      <span className="font-medium tracking-tight">
        {displayLabel}
      </span>
      {source && !label && level === "verified" && (
        <span className="text-text-muted font-normal">
          · {source}
        </span>
      )}
    </div>
  );
}

export default OyaTrustIndicator;
