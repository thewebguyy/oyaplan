import React from 'react';
import { VenueDemandActivity } from '@/lib/types';
import { TrendingUp, Share2, CheckCheck, Sparkles } from 'lucide-react';

interface DemandActivityCardProps {
  activity: VenueDemandActivity;
}

export function DemandActivityCard({ activity }: DemandActivityCardProps) {
  if (!activity.hasEnoughData) {
    return (
      <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border-default/60 pb-3">
          <TrendingUp className="w-5 h-5 text-brand-green" />
          <h3 className="text-base sm:text-lg font-black text-midnight-lagoon uppercase tracking-tight">
            Your OyaPlan Activity
          </h3>
        </div>

        <div className="py-6 text-center space-y-2 bg-[#FAFAF8] rounded-2xl p-6">
          <Sparkles className="w-8 h-8 text-lasgidi-yellow mx-auto" />
          <h4 className="font-black text-midnight-lagoon text-sm uppercase">Not enough activity yet</h4>
          <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
            Your venue is listed. Once squads start generating and sharing plans featuring your venue, you&apos;ll see verified activity numbers here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-green" />
          <h3 className="text-base sm:text-lg font-black text-midnight-lagoon uppercase tracking-tight">
            Your OyaPlan Activity
          </h3>
        </div>
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-surface-grey px-2.5 py-1 rounded-full">
          Verified Signals
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Plans featuring you */}
        <div className="p-4 bg-surface-grey rounded-2xl space-y-1">
          <span className="text-3xl font-black text-[#008751] block">
            {activity.plansFeaturingCount}
          </span>
          <p className="font-bold text-text-primary text-xs">Plans featuring your venue</p>
          <span className="text-[10px] text-text-muted leading-tight block">
            Squads whose budget and vibe fit your venue.
          </span>
        </div>

        {/* Plans shared */}
        <div className="p-4 bg-surface-grey rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <Share2 className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-[11px] font-bold">WhatsApp Shares</span>
          </div>
          <span className="text-3xl font-black text-midnight-lagoon block">
            {activity.plansSharedCount}
          </span>
          <p className="font-bold text-text-primary text-xs">Plans shared with squads</p>
          <span className="text-[10px] text-text-muted leading-tight block">
            Direct squad chat links generated.
          </span>
        </div>

        {/* Reported Outings */}
        <div className="p-4 bg-surface-grey rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <CheckCheck className="w-3.5 h-3.5 text-[#008751]" />
            <span className="text-[11px] font-bold">Post-Outing</span>
          </div>
          <span className="text-3xl font-black text-midnight-lagoon block">
            {activity.reportedOutingsCount}
          </span>
          <p className="font-bold text-text-primary text-xs">Reported squad outings</p>
          <span className="text-[10px] text-text-muted leading-tight block">
            Confirmed visits with spend feedback.
          </span>
        </div>
      </div>
    </div>
  );
}
