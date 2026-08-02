import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-warm-shimmer rounded-[min(var(--radius-md),12px)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
