"use client";

import Link from "next/link";
import { PlanningGuide } from "@/lib/config/guides";
import { ArrowRight } from "lucide-react";

export default function EditorialGuideCard({ guide }: { guide: PlanningGuide }) {
  return (
    <div className="bg-white border border-border-default rounded-[24px] overflow-hidden p-6 sm:p-8 flex flex-col justify-between hover:shadow-md transition-all h-full">
      <div className="space-y-4">
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
          {guide.title}
        </h3>
        <p className="type-body text-text-muted">
          {guide.description}
        </p>
      </div>

      <div className="pt-6 mt-6 border-t border-border-default/50 flex items-center justify-between">
        <Link href={`/guides/${guide.slug}`}>
          <button className="type-label text-brand-green hover:underline flex items-center gap-2 tap-feedback">
            Read Guide
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}
