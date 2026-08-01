import * as React from "react"
import { getInitials } from "@/lib/utils/avatar"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ name, size = "md", className = "", ...props }: AvatarProps) {
  const initials = getInitials(name);
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-3xl",
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full font-black uppercase tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/20 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <span>{initials}</span>
    </div>
  )
}
