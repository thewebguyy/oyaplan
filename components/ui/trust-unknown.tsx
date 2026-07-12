import * as React from "react"
import { cn } from "@/lib/utils"
import { HelpCircle } from "lucide-react"

export interface TrustUnknownProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string
}

export function TrustUnknown({ message, className, ...props }: TrustUnknownProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-[8px] bg-surface-grey border border-border-default px-3 py-2 text-text-muted",
        className
      )}
      {...props}
    >
      <HelpCircle className="w-4 h-4 shrink-0 opacity-70" />
      <span className="type-ui-label text-xs normal-case tracking-normal">{message}</span>
    </div>
  )
}
