import { Metadata } from "next";
import { PLANNING_GUIDES } from "@/lib/config/guides";
import EditorialGuideCard from "@/components/EditorialGuideCard";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Outing Planning Guides — OyaPlan",
  description: "Curated planning outlines to jumpstart your next Lagos squad outing. Zero guesswork.",
};

export default function GuidesPage() {
  const [featured, ...rest] = PLANNING_GUIDES;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12 section-guides min-h-screen">
      <div className="space-y-4">
        <Link href="/">
          <button className="type-label text-text-secondary hover:text-midnight-lagoon transition-colors flex items-center gap-2 tap-feedback py-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Planner
          </button>
        </Link>
        <h1 className="type-display-product text-midnight-lagoon text-3xl sm:text-4xl font-black">
          Planning Guides
        </h1>
        <p className="type-body text-text-muted max-w-xl">
          Curated combinations and presets designed to solve the math of going out around Lagos. Select a guide to pre-fill your budget, squad size, and vibe.
        </p>
      </div>

      {/* Featured Guide — Full Width Hero */}
      <Link href={`/guides/${featured.slug}`} className="block group">
        <div className="relative bg-midnight-lagoon text-white rounded-[32px] overflow-hidden p-8 sm:p-12 card-lift shadow-lift-lagoon border-none flex flex-col sm:flex-row sm:items-end justify-between gap-8 min-h-[260px]">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[60%] h-[100%] bg-gradient-to-bl from-[#F6C642]/10 via-transparent to-transparent" />
          </div>

          {/* Palm Green accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#008751]" />

          <div className="space-y-3 relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#F6C642]/90 bg-[#F6C642]/10 border border-[#F6C642]/20 px-3 py-1 rounded-full">
              ✦ Editor&apos;s Pick
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-[-0.03em] leading-tight">
              {featured.title}
            </h2>
            <p className="type-body text-white/70">
              {featured.description}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <span className="inline-flex items-center gap-2 bg-[#F6C642] text-midnight-lagoon text-sm font-black px-6 py-3 rounded-[12px] btn-press-tactile group-hover:scale-[1.03] transition-transform duration-[220ms]">
              Read Guide
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-[220ms]" />
            </span>
          </div>
        </div>
      </Link>

      {/* Secondary Guides — 3-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 stagger-children">
        {rest.map((guide) => (
          <EditorialGuideCard key={guide.slug} guide={guide} />
        ))}
      </div>
    </div>
  );
}

