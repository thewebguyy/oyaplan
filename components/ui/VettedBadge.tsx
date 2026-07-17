import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Shield, TrendingUp, Clock } from "lucide-react"

export type VettedVariant = "verified" | "vetted" | "confidence" | "recent"

export interface VettedBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: VettedVariant
  size?: "sm" | "md"
}

const VARIANT_CONFIG = {
  verified: {
    bg: "bg-brand-green text-white",
    icon: Check,
    label: "Verified",
  },
  vetted: {
    bg: "bg-midnight-lagoon text-white",
    icon: Shield,
    label: "Vetted by Forge",
  },
  confidence: {
    bg: "bg-lasgidi-yellow/20 text-midnight-lagoon border border-lasgidi-yellow/30",
    icon: TrendingUp,
    label: "Budget Confidence",
  },
  recent: {
    bg: "bg-surface-grey text-text-secondary border border-border-default",
    icon: Clock,
    label: "Updated recently",
  },
} as const

export function VettedBadge({ variant, size = "md", className, ...props }: VettedBadgeProps) {
  const isSm = size === "sm"
  const config = VARIANT_CONFIG[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "vetted-badge",
        isSm ? "px-2 py-1 text-[9px]" : "px-3 py-1.5 text-[10px]",
        config.bg,
        className
      )}
      {...props}
    >
      <Icon className={cn(isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={isSm ? 3 : 2.5} />
      <span>{config.label}</span>
    </div>
  )
}
