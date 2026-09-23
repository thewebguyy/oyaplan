'use client';

import React from 'react';
import Link from 'next/link';
import { ProfileHealth } from '@/lib/types';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface ProfileHealthCardProps {
  health: ProfileHealth;
  venueId: string;
  baseRoute?: 'partner' | 'business';
}

export function ProfileHealthCard({ health, venueId, baseRoute = 'partner' }: ProfileHealthCardProps) {
  const isComplete = health.percentage === 100;
  const completeProfileHref = baseRoute === 'business'
    ? `/business/${venueId}/venue`
    : `/partner/${venueId}/onboarding`;

  return (
    <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
            Profile Completeness
          </span>
          <div className="flex items-baseline gap-2.5 mt-0.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight-lagoon">
              {health.percentage}%
            </h2>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              health.percentage >= 90 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              health.percentage >= 70 ? 'bg-blue-50 text-blue-800 border border-blue-200' :
              'bg-[#FAF7F2] text-[#7A3E1D] border border-[#EAE4DC]'
            }`}>
              {health.label}
            </span>
          </div>
        </div>

        {!isComplete && (
          <Link
            href={completeProfileHref}
            className="self-start sm:self-auto h-9 px-4 bg-midnight-lagoon hover:bg-[#00041f] text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5 transition-all tap-feedback cursor-pointer"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#FAF7F2] border border-[#EAE4DC]/60 rounded-full h-2 overflow-hidden">
        <div
          className="bg-brand-green h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${health.percentage}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        {/* Completed */}
        {health.completedItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2 text-text-secondary font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
            <span className="truncate">{item.label}</span>
          </div>
        ))}

        {/* Missing / Needs Attention */}
        {health.missingItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 text-text-muted">
            <div className="flex items-center gap-2 min-w-0">
              <Circle className="w-3.5 h-3.5 text-[#7A3E1D] shrink-0" />
              <span className="truncate text-[#7A3E1D] font-medium">{item.label}</span>
            </div>
            {item.actionHref && (
              <Link
                href={item.actionHref}
                className="text-[11px] font-bold text-brand-green hover:underline shrink-0"
              >
                {item.actionLabel || 'Fix'}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
