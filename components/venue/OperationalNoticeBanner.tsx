'use client';

import React from 'react';
import { Venue } from '@/lib/types';
import { AlertTriangle, Calendar, Info, Clock } from 'lucide-react';

interface OperationalNoticeBannerProps {
  venue: Venue;
}

export function OperationalNoticeBanner({ venue }: OperationalNoticeBannerProps) {
  if (!venue.is_temporarily_closed) return null;

  const startDateFormatted = venue.temporary_closure_start
    ? new Date(venue.temporary_closure_start).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const endDateFormatted = venue.temporary_closure_end
    ? new Date(venue.temporary_closure_end).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="w-full bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-amber-950 space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
              Operational Notice
            </span>
            <h3 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
              Venue Temporarily Unavailable
            </h3>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100/80 text-amber-900 border border-amber-300/60 self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 text-amber-700" />
          <span>Notice from Management</span>
        </span>
      </div>

      <div className="space-y-2 text-xs sm:text-sm text-amber-900">
        <p className="font-semibold leading-relaxed">
          {venue.temporary_closure_reason ||
            'This venue is currently unavailable due to a scheduled private buyout, renovation, or seasonal maintenance.'}
        </p>

        {(startDateFormatted || endDateFormatted) && (
          <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-amber-950">
            {startDateFormatted && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>From: <strong>{startDateFormatted}</strong></span>
              </span>
            )}
            {endDateFormatted && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Expected Reopening: <strong>{endDateFormatted}</strong></span>
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-amber-800/80 italic pt-1">
        Please check back soon or select an alternative venue for this weekend&apos;s itinerary.
      </p>
    </div>
  );
}
