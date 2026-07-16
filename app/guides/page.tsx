import { Metadata } from "next";
import { PLANNING_GUIDES } from "@/lib/config/guides";
import EditorialGuideCard from "@/components/EditorialGuideCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Outing Planning Guides — OyaPlan",
  description: "Curated planning outlines to jumpstart your next Lagos squad outing. Zero guesswork.",
};

export default function GuidesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 bg-white min-h-screen">
      <div className="space-y-4">
        <Link href="/">
          <button className="type-label text-text-secondary hover:text-brand-green transition-colors flex items-center gap-2 tap-feedback py-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Planner
          </button>
        </Link>
        <h1 className="type-display-product text-text-primary text-3xl sm:text-4xl font-black">
          Planning Guides
        </h1>
        <p className="type-body text-text-muted max-w-xl">
          Curated combinations and presets designed to solve the math of going out around Lagos. Select a guide to pre-fill your budget, squad size, and vibe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLANNING_GUIDES.map((guide) => (
          <EditorialGuideCard key={guide.slug} guide={guide} />
        ))}
      </div>
    </div>
  );
}
