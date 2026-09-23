'use client';

import React from 'react';
import Link from 'next/link';
import { ProfileHealth } from '@/lib/types';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface ProfileHealthCardProps {
  health: ProfileHealth;
  venueId: string;
}

export function ProfileHealthCard({ health, venueId }: ProfileHealthCardProps) {
  const isComplete = health.percentage === 100;

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="type-ui-label text-xs font-black text-text-muted uppercase tracking-wider block">
            Profile Health
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h2 className="text-3xl font-black text-midnight-lagoon">
              {health.percentage}%
            </h2>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              health.percentage >= 90 ? 'bg-emerald-50 text-emerald-700' :
              health.percentage >= 70 ? 'bg-blue-50 text-blue-700' :
              'bg-amber-50 text-amber-700'
            }`}>
              {health.label}
            </span>
          </div>
        </div>

        {!isComplete && (
          <Link
            href={`/partner/${venueId}/onboarding`}
            className="self-start sm:self-auto h-10 px-4 bg-midnight-lagoon hover:bg-[#00041f] text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center gap-1.5 transition-all tap-feedback cursor-pointer"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-[#008751] h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${health.percentage}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
        {/* Completed */}
        {health.completedItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2 text-text-secondary font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#008751] shrink-0" />
            <span className="truncate">{item.label}</span>
          </div>
        ))}

        {/* Missing / Needs Attention */}
        {health.missingItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 text-text-muted">
            <div className="flex items-center gap-2 min-w-0">
              <Circle className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate text-amber-800 font-semibold">{item.label}</span>
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
