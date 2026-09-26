"use client";

import React from "react";
import { Venue } from "@/lib/types";
import { Sparkles, Users, Compass, CheckCircle2 } from "lucide-react";

interface VenueExperienceSectionProps {
  venue: Venue;
}

export function VenueExperienceSection({ venue }: VenueExperienceSectionProps) {
  const vibeTags = venue.vibe_tags || [];
  const audienceTags = venue.audience_tags || [];
  const activityTags = venue.activity_tags || [];

  const minGroup = venue.group_suitability_min || 1;
  const maxGroup = venue.group_suitability_max || 8;

  const highlights: string[] = [];
  if (venue.description) highlights.push(venue.description);
  if (venue.date_suitability) highlights.push("Ideal setting for date nights and romantic dinners");
  if (venue.group_suitability_max && venue.group_suitability_max >= 6) {
    highlights.push("Spacious seating for squads and celebratory groups");
  }

  return (
    <section id="overview" className="scroll-mt-32">
      <div className="bg-white rounded-[28px] border border-[#EAE4DC] p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE4DC] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#008751]/10 text-[#008751] text-[10px] font-black uppercase tracking-wider mb-1">
              <Compass className="w-3 h-3" />
              <span>Vibe &amp; Fit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
              Experience &amp; Outing Fit
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
              Atmosphere, squad suitability, and what makes this spot unique.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Squad & Occasion Matching */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-midnight-lagoon">
              <Users className="w-4 h-4 text-[#008751]" />
              <span>Optimal Group Fit</span>
            </div>

            <div>
              <p className="text-2xl font-black text-midnight-lagoon tracking-tight">
                {minGroup} – {maxGroup} People
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Comfortable for pairs, small circles, and medium dinner squads.
              </p>
            </div>

            {audienceTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {audienceTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#EAE4DC] text-midnight-lagoon capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Vibe & Atmosphere Tags */}
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-midnight-lagoon">
              <Sparkles className="w-4 h-4 text-[#FCC630]" />
              <span>Atmosphere &amp; Ambience</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {vibeTags.length > 0 ? (
                vibeTags.map((vibe) => (
                  <span
                    key={vibe}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-[#EAE4DC] text-midnight-lagoon shadow-xs capitalize"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FCC630]" />
                    <span>{vibe}</span>
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-[#EAE4DC] text-midnight-lagoon">
                  <Sparkles className="w-3.5 h-3.5 text-[#FCC630]" />
                  <span>Chill Hangout</span>
                </span>
              )}

              {activityTags.map((act) => (
                <span
                  key={act}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EAFDF3] text-[#008751] border border-[#A3F3C6] capitalize"
                >
                  {act}
                </span>
              ))}
            </div>

            {highlights.length > 0 && (
              <div className="pt-2 border-t border-border-default/60 space-y-1.5 text-xs text-text-secondary">
                {highlights.map((h, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#008751] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
