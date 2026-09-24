import * as React from "react";
import { cn } from "@/lib/utils";

export interface OyaSectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function OyaSectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  className,
  ...props
}: OyaSectionHeaderProps) {
  return (
    <div
      className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6", className)}
      {...props}
    >
      <div className="flex flex-col gap-1 max-w-2xl">
        {eyebrow && (
          <span className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#7A3E1D] font-mono">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base text-text-muted leading-relaxed font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default OyaSectionHeader;
