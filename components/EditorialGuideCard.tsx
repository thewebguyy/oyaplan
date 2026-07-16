"use client";

import Link from "next/link";
import { PlanningGuide } from "@/lib/config/guides";
import { ArrowRight } from "lucide-react";

export default function EditorialGuideCard({ guide }: { guide: PlanningGuide }) {
  return (
    <div className="bg-white-sand border border-border-default/60 rounded-[32px] overflow-hidden p-6 sm:p-8 flex flex-col justify-between card-lift shadow-lagoon hover:shadow-lift-lagoon h-full relative group">
      {/* Bottom accent — animates to Lasgidi Yellow on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border-default/30 group-hover:bg-lasgidi-yellow transition-colors duration-[350ms]" />

      <div className="space-y-4">
        <h3 className="text-xl sm:text-2xl font-black tracking-[-0.02em] text-midnight-lagoon">
          {guide.title}
        </h3>
        <p className="type-body text-text-muted">
          {guide.description}
        </p>
      </div>

      <div className="pt-6 mt-6 border-t border-border-default/40 flex items-center justify-between">
        <Link href={`/guides/${guide.slug}`}>
          <button className="type-label text-midnight-lagoon hover:underline decoration-lasgidi-yellow underline-offset-4 flex items-center gap-2 tap-feedback transition-all duration-[250ms]">
            Read Guide
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-[250ms]" />
          </button>
        </Link>
      </div>
    </div>
  );
}
