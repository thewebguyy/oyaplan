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
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-gray-400 group-hover:text-[#008751] transition-colors">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-black text-gray-900 tracking-tight">{value}</span>
        {href && <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />}
      </div>

      {subtext && <span className="text-[11px] font-semibold text-gray-400 mt-2">{subtext}</span>}
    </div>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}

export default MetricCard;
