import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Clock, XCircle } from "lucide-react"

export type TrustStatus = "verified" | "estimated" | "pending" | "unavailable"

export interface TrustBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: TrustStatus
  freshnessText?: string
  size?: "sm" | "md"
}

export function TrustBadge({ status, freshnessText, size = "md", className, ...props }: TrustBadgeProps) {
  const isSm = size === "sm"
  
  const getStatusStyles = () => {
    switch (status) {
      case "verified":
        return "bg-brand-green text-white"
      case "estimated":
        return "bg-surface-grey text-text-primary"
      case "pending":
        return "bg-trust-warning text-text-primary"
      case "unavailable":
        return "bg-error text-white"
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case "verified": return "Verified"
      case "estimated": return "Estimated"
      case "pending": return "Pending Verification"
      case "unavailable": return "Unavailable"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "verified":
        return <Check className={cn(isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={3} />
      case "estimated":
        return <Clock className={cn(isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2.5} />
      case "pending":
        return <div className={cn("rounded-full bg-current", isSm ? "w-1.5 h-1.5" : "w-2 h-2")} />
      case "unavailable":
        return <XCircle className={cn(isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2.5} />
    }
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold tracking-widest uppercase shadow-sm",
        isSm ? "px-2 py-1 text-[9px]" : "px-3 py-1.5 text-[10px]",
        getStatusStyles(),
        className
      )}
      {...props}
    >
      {getStatusIcon()}
      <span>
        {getStatusLabel()}
        {freshnessText && <span className="opacity-90 font-medium"> • {freshnessText}</span>}
      </span>
    </div>
  )
}
