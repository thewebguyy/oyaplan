import React from 'react';
import { VenueDemandActivity } from '@/lib/types';
import { TrendingUp, Share2, CheckCheck, Compass } from 'lucide-react';

interface DemandActivityCardProps {
  activity: VenueDemandActivity;
}

export function DemandActivityCard({ activity }: DemandActivityCardProps) {
  if (!activity.hasEnoughData) {
    return (
      <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-green" />
            <h3 className="text-base font-bold text-midnight-lagoon">
              OyaPlan Demand Signals
            </h3>
          </div>
          <span className="text-[11px] font-medium text-text-muted">Early stage</span>
        </div>

        <div className="py-6 px-4 text-center space-y-2 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60">
          <h4 className="font-bold text-midnight-lagoon text-xs uppercase tracking-wider">
            We&apos;re gathering verified squad planning activity
          </h4>
          <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
            Your venue is active on OyaPlan. When squads generate and share itineraries featuring your business, verified demand counts will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-green" />
          <h3 className="text-base font-bold text-midnight-lagoon">
            OyaPlan Demand Signals
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-[#0A7C3F] bg-[#EAFDF3] px-2.5 py-0.5 rounded-full border border-[#A3F3C6]">
          Real Squad Signals
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Plans featuring you */}
        <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-1">
          <span className="text-3xl font-extrabold text-brand-green block">
            {activity.plansFeaturingCount}
          </span>
          <p className="font-bold text-midnight-lagoon text-xs">Plans featuring your venue</p>
          <span className="text-[11px] text-text-muted leading-relaxed block">
            Squad itineraries matching your budget tier and vibe.
          </span>
        </div>

        {/* Plans shared */}
        <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <Share2 className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-[11px] font-semibold">WhatsApp Shares</span>
          </div>
          <span className="text-3xl font-extrabold text-midnight-lagoon block">
            {activity.plansSharedCount}
          </span>
          <p className="font-bold text-midnight-lagoon text-xs">Plans shared with squads</p>
          <span className="text-[11px] text-text-muted leading-relaxed block">
            Direct chat links generated for squad review.
          </span>
        </div>

        {/* Reported Outings */}
        <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EAE4DC]/60 space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <CheckCheck className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-[11px] font-semibold">Post-Outing</span>
          </div>
          <span className="text-3xl font-extrabold text-midnight-lagoon block">
            {activity.reportedOutingsCount}
          </span>
          <p className="font-bold text-midnight-lagoon text-xs">Reported squad outings</p>
          <span className="text-[11px] text-text-muted leading-relaxed block">
            Confirmed visits with actual spend feedback.
          </span>
        </div>
      </div>
    </div>
  );
}
