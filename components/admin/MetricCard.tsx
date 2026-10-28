"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  href?: string;
  icon?: React.ReactNode;
  variant?: "default" | "warning" | "success" | "danger";
}

export function MetricCard({ label, value, subtext, href, icon, variant = "default" }: MetricCardProps) {
  const cardContent = (
    <div className="bg-white border-2 border-[#111111]/20 rounded-lg p-5 shadow-[2px_2px_0px_rgba(1,5,40,0.06)] hover:border-[#111111] hover:shadow-[4px_4px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all flex flex-col justify-between group cursor-pointer h-full relative overflow-hidden">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#111111]/10 group-hover:bg-[#008751] transition-colors" />

      <div className="flex items-center justify-between mb-3 pt-1">
        <span className="font-mono text-[11px] font-bold text-[#111111]/70 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-[#111111]/40 group-hover:text-[#008751] transition-colors">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-3xl sm:text-4xl font-mono font-black text-[#111111] tracking-tight tabular-nums">{value}</span>
        {href && <ChevronRight className="w-4 h-4 text-[#111111]/40 group-hover:text-[#111111] group-hover:translate-x-1 transition-all" />}
      </div>

      {subtext && <span className="text-[11px] font-mono font-medium text-[#111111]/60 mt-3 pt-2 border-t border-[#111111]/10">{subtext}</span>}
    </div>
  );

  if (href) {
    return <Link href={href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008751] rounded-lg block h-full">{cardContent}</Link>;
  }

  return cardContent;
}

export default MetricCard;
