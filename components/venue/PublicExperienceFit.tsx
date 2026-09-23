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
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="border-b border-border-default/60 pb-3">
        <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
          Experience &amp; Outing Fit
        </h2>
        <p className="text-xs sm:text-sm text-text-muted mt-0.5">
          How OyaPlan matches this venue to squad occasions and budgets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Squad Size & Dynamics */}
        <div className="p-5 bg-surface-grey rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-midnight-lagoon uppercase tracking-wider">
            <Users className="w-4 h-4 text-brand-green" />
            <span>Optimal Squad Size</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-midnight-lagoon">{groupText}</span>
            <span className="text-xs text-text-muted font-medium">per booking / plan</span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Comfortably accommodates both intimate outings and medium squads.
            {venue.date_suitability && " Highlighted for date nights and anniversaries."}
          </p>

          {audienceTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {audienceTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white border border-border-default text-text-primary capitalize"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Suitable Vibes & Occasions */}
        <div className="p-5 bg-surface-grey rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-midnight-lagoon uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-lasgidi-yellow" />
            <span>Occasion Fit</span>
          </div>

          <p className="text-xs text-text-muted">
            Frequently recommended for these planning intents:
          </p>

          <div className="flex flex-wrap gap-2">
            {vibeTags.length > 0 ? (
              vibeTags.map((vibe) => (
                <span
                  key={vibe}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-border-default text-midnight-lagoon shadow-xs capitalize"
                >
                  ✨ {vibe}
                </span>
              ))
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-border-default text-midnight-lagoon">
                ✨ Chill Outing
              </span>
            )}

            {activityTags.map((act) => (
              <span
                key={act}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-brand-green/10 text-brand-green border border-brand-green/20 capitalize"
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
