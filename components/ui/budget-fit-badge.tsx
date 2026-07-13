import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, CheckCircle2, AlertTriangle, XOctagon } from "lucide-react"

export type BudgetFitStatus = "comfortable" | "within" | "stretch" | "over"

export interface BudgetFitBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: BudgetFitStatus
  size?: "sm" | "md"
}

export function BudgetFitBadge({ status, size = "md", className, ...props }: BudgetFitBadgeProps) {
  const isSm = size === "sm"
  
  const getStatusStyles = () => {
    switch (status) {
      case "comfortable":
        return "bg-brand-green-15 text-brand-green" // Soft green background, bold green text
      case "within":
        return "bg-surface-grey text-text-primary" // Neutral
      case "stretch":
        return "bg-trust-warning-15 text-trust-warning" // Soft amber background, amber text
      case "over":
        return "bg-red-100 text-error" // Soft red background
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case "comfortable": return "Comfortably within budget"
      case "within": return "Within budget"
      case "stretch": return "Slight stretch"
      case "over": return "Over budget"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "comfortable":
        return <CheckCircle2 className={cn(isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2.5} />
      case "within":
        return <Check className={cn(isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2.5} />
      case "stretch":
        return <AlertTriangle className={cn(isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2.5} />
      case "over":
        return <XOctagon className={cn(isSm ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2.5} />
    }
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[8px] font-medium",
        isSm ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        getStatusStyles(),
        className
      )}
      {...props}
    >
      {getStatusIcon()}
      <span>{getStatusLabel()}</span>
    </div>
  )
}
