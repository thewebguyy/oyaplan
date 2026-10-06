'use client';

import React, { useState } from 'react';
import { Venue } from '@/lib/types';
import { reportTemporaryClosureAction, reopenVenueAction } from '@/lib/actions/partnerClosureActions';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Calendar,
  Info,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BusinessUpdatesClientProps {
  venue: Venue;
}

const CLOSURE_REASONS = [
  'Renovation / Remodeling',
  'Private Buyout / Exclusive Event',
  'Public Holiday / Festive Break',
  'Scheduled Maintenance / Fumigation',
  'Seasonal Break',
  'Other Operational Reason',
];

export function BusinessUpdatesClient({ venue }: BusinessUpdatesClientProps) {
  const router = useRouter();
  const [isClosed, setIsClosed] = useState(Boolean(venue.is_temporarily_closed));
  const [startDate, setStartDate] = useState(
    venue.temporary_closure_start || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(venue.temporary_closure_end || '');
  const [selectedReason, setSelectedReason] = useState(
    venue.temporary_closure_reason || CLOSURE_REASONS[0]
  );
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmitClosure = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const reasonToSubmit =
      selectedReason === 'Other Operational Reason' && customReason.trim()
        ? customReason.trim()
        : selectedReason;

    const res = await reportTemporaryClosureAction({
      venueId: venue.id,
      startDate,
      endDate: endDate || undefined,
      reason: reasonToSubmit,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsClosed(true);
      setSuccessMessage('Temporary closure updated. Planners will be warned if attempting to plan during these dates.');
      router.refresh();
    } else {
      setErrorMessage(res.error || 'Failed to report closure');
    }
  };

  const handleReopen = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await reopenVenueAction(venue.id);
    setIsSubmitting(false);

    if (res.success) {
      setIsClosed(false);
      setEndDate('');
      setSuccessMessage('Venue status updated: Your venue is now open and actively accepting plans.');
      router.refresh();
    } else {
      setErrorMessage(res.error || 'Failed to reopen venue');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111111] text-[#F7F5EE] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#00E575] uppercase tracking-widest px-2 py-0.5 rounded bg-[#008751]/15 border border-[#008751]/30">
              OPERATIONAL STATUS
            </span>
            <span className="text-white/30">·</span>
            <span className="text-xs text-white/60 font-mono">REAL-TIME RELIABILITY</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Availability &amp; Operational Updates
          </h1>

          <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed">
            Keep Lagos planners informed so squads never arrive at locked gates or during private buyouts.
          </p>
        </div>

        <div className="shrink-0">
          {isClosed ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-red-950/40 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              TEMPORARILY CLOSED
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-[#008751]/15 text-[#00E575] border border-[#008751]/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E575]" />
              OPEN FOR PLANNING
            </span>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs text-red-700 font-medium">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-[#EAFDF3] border border-[#A3F3C6] p-4 rounded-xl text-xs text-[#064E26] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Active Closure Card */}
      {isClosed && (
        <div className="bg-[#FAF7F2] border border-[#EAE4DC] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#7A3E1D] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-midnight-lagoon">
                Your venue is currently marked as temporarily unavailable
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                Reason on file: <strong className="text-text-primary">{venue.temporary_closure_reason || selectedReason}</strong>.
                {venue.temporary_closure_end ? ` Expected reopening: ${venue.temporary_closure_end}.` : ' No reopening date set.'}
              </p>
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={handleReopen}
              disabled={isSubmitting}
              className="h-10 px-5 bg-midnight-lagoon hover:bg-[#00041f] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer tap-feedback shadow-xs disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Reopen Venue for Planning</span>
            </button>
          </div>
        </div>
      )}

      {/* Closure Reporting Form */}
      <form onSubmit={handleSubmitClosure} className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="border-b border-border-default pb-3">
          <h2 className="text-base font-bold text-midnight-lagoon">
            Report Scheduled Closure or Private Buyout
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Set closure dates so squads building advance plans are guided to available dates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary">Closure Start Date *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAF7F2] text-xs font-bold text-midnight-lagoon focus:bg-white focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary">Estimated Reopening Date (Optional)</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAF7F2] text-xs font-bold text-midnight-lagoon focus:bg-white focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-secondary">Reason for Closure *</label>
          <select
            value={selectedReason}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedReason(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAF7F2] text-xs font-bold text-midnight-lagoon focus:bg-white focus:outline-none focus:border-brand-green"
          >
            {CLOSURE_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {selectedReason === 'Other Operational Reason' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary">Custom Reason Description *</label>
            <input
              type="text"
              required
              value={customReason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomReason(e.target.value)}
              placeholder="e.g. Electrical maintenance on power generators"
              className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAF7F2] text-xs font-medium text-midnight-lagoon focus:bg-white focus:outline-none focus:border-brand-green"
            />
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-6 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer tap-feedback shadow-xs disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Update Availability Status</span>
          </button>
        </div>
      </form>

      {/* Explainer */}
      <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-2 shadow-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-green" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-midnight-lagoon">
            Why reporting closures protects your reputation
          </h3>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Nothing damages customer confidence more than a group arriving in an Uber to find locked doors. When you report closures on OyaPlan, our plan generator automatically diverts squad recommendations during those dates and informs users who already have your venue saved in their draft itineraries.
        </p>
      </div>
    </div>
  );
}
