import * as React from "react"
import { getInitials } from "@/lib/utils/avatar"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const AVATAR_PALETTES = [
  { bg: "#FCC630", text: "#00603A", emoji: "🎒" },
  { bg: "#008751", text: "#FFFFFF", emoji: "🕶️" },
  { bg: "#00BCD4", text: "#00363A", emoji: "⚡" },
  { bg: "#E91E63", text: "#FFFFFF", emoji: "🍹" },
  { bg: "#FF8F00", text: "#3E1A00", emoji: "🌶️" },
  { bg: "#AB47BC", text: "#FFFFFF", emoji: "🎧" },
  { bg: "#4CAF50", text: "#FFFFFF", emoji: "🌴" },
  { bg: "#FF5722", text: "#FFFFFF", emoji: "🍕" },
];

export function Avatar({ name, size = "md", className = "", ...props }: AvatarProps) {
  const initials = getInitials(name);
  
  // Deterministic seed based on name
  const seed = (name || "planner").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const style = AVATAR_PALETTES[seed % AVATAR_PALETTES.length];

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-20 h-20 text-2xl",
  };

  return (
    <div
      style={{ backgroundColor: style.bg, color: style.text }}
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full font-black uppercase tracking-wider shadow-sm border-2 border-white/40 select-none ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-0.5">
        <span>{initials}</span>
        <span className="text-[0.7em] leading-none opacity-90">{style.emoji}</span>
      </span>
    </div>
  )
}
