import React from 'react';
import { Venue } from '@/lib/types';
import { Users, Heart, Sparkles, Compass } from 'lucide-react';

interface PublicExperienceFitProps {
  venue: Venue;
}

export function PublicExperienceFit({ venue }: PublicExperienceFitProps) {
  const vibeTags = venue.vibe_tags || [];
  const audienceTags = venue.audience_tags || [];
  const activityTags = venue.activity_tags || [];

  const minGroup = venue.group_suitability_min || 1;
  const maxGroup = venue.group_suitability_max || 8;
  const groupText = `${minGroup} – ${maxGroup} people`;

  return (
    <div className="bg-white rounded-3xl border border-[#E5E5DE] p-6 sm:p-8 space-y-6 shadow-xs font-sans">
      <div className="border-b border-[#E5E5DE] pb-3">
        <h2 className="text-xl sm:text-2xl font-black text-[#111111] font-display uppercase tracking-tight">
          Experience &amp; Outing Fit
        </h2>
        <p className="text-xs sm:text-sm text-[#555555] mt-0.5 font-medium">
          How OyaPlan matches this venue to squad occasions and budgets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Squad Size & Dynamics */}
        <div className="p-5 bg-[#F6F6F2] rounded-2xl space-y-3 border border-[#E5E5DE]">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#111111] uppercase tracking-wider">
            <Users className="w-4 h-4 text-[#111111]" />
            <span>Optimal Squad Size</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#111111] font-mono">{groupText}</span>
            <span className="text-xs text-[#6B7280] font-medium">per booking / plan</span>
          </div>

          <p className="text-xs text-[#555555] leading-relaxed">
            Comfortably accommodates both intimate outings and medium squads.
            {venue.date_suitability && " Highlighted for date nights and anniversaries."}
          </p>

          {audienceTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {audienceTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white border border-[#E5E5DE] text-[#111111] capitalize font-mono"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Suitable Vibes & Occasions */}
        <div className="p-5 bg-[#F6F6F2] rounded-2xl space-y-3 border border-[#E5E5DE]">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#111111] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#111111]" />
            <span>Occasion Fit</span>
          </div>

          <p className="text-xs text-[#555555]">
            Frequently recommended for these planning intents:
          </p>

          <div className="flex flex-wrap gap-2">
            {vibeTags.length > 0 ? (
              vibeTags.map((vibe) => (
                <span
                  key={vibe}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-[#E5E5DE] text-[#111111] shadow-2xs capitalize font-mono"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F9E828] fill-[#F9E828]" />
                  <span>{vibe}</span>
                </span>
              ))
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-[#E5E5DE] text-[#111111] font-mono">
                <Sparkles className="w-3.5 h-3.5 text-[#F9E828] fill-[#F9E828]" />
                <span>Chill Outing</span>
              </span>
            )}

            {activityTags.map((act) => (
              <span
                key={act}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#111111] text-[#F9E828] capitalize font-mono"
              >
                {act}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
