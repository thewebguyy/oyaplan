"use client";

import * as React from "react";
import { getInitials } from "@/lib/utils/avatar";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string | null;
  src?: string | null;
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

export function Avatar({ name, src, size = "md", className = "", ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const initials = getInitials(name);
  
  // Deterministic seed based on name
  const seed = (name || "planner").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const style = AVATAR_PALETTES[seed % AVATAR_PALETTES.length];

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  if (src && !imageError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full shadow-sm border border-black/10 select-none bg-surface-grey ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name || "User avatar"}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: style.bg, color: style.text }}
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full font-black uppercase tracking-wider shadow-sm border border-black/10 select-none ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-0.5">
        <span>{initials}</span>
        <span className="text-[0.7em] leading-none opacity-90">{style.emoji}</span>
      </span>
    </div>
  );
}
