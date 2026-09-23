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
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-border-default p-6 sm:p-7 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider">
              Operational Status
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-text-muted">Real-Time Reliability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight">
            Availability &amp; Operational Updates
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-xl leading-relaxed">
            Keep Lagos planners informed so squads never arrive at locked gates or during private buyouts.
          </p>
        </div>

        <div className="shrink-0">
          {isClosed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Temporarily Closed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#EAFDF3] text-[#0A7C3F] border border-[#A3F3C6]">
              <CheckCircle2 className="w-4 h-4 text-[#008751]" />
              Open for Planning
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-700 font-medium">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-[#EAFDF3] border border-[#A3F3C6] p-4 rounded-2xl text-xs text-[#064E26] font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#008751] shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Current Status Card */}
      {isClosed ? (
        <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-base font-black text-amber-950 uppercase">
                Your venue is currently marked as temporarily unavailable
              </h2>
              <p className="text-xs text-amber-900 leading-relaxed max-w-xl">
                Reason on file: <strong className="font-bold">{venue.temporary_closure_reason || selectedReason}</strong>.
                {venue.temporary_closure_end ? ` Expected reopening: ${venue.temporary_closure_end}.` : ' No reopening date set.'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleReopen}
              disabled={isSubmitting}
              className="h-11 px-5 bg-midnight-lagoon hover:bg-[#00041f] text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer tap-feedback shadow-xs disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Reopen Venue for Planning</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Closure Reporting Form */}
      <form onSubmit={handleSubmitClosure} className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-5 shadow-xs">
        <div className="border-b border-border-default/60 pb-3">
          <h2 className="text-base font-black text-midnight-lagoon uppercase tracking-tight">
            Report Scheduled Closure or Private Buyout
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Set expected closure dates so planners booking ahead can plan around your schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary uppercase">Closure Start Date *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-bold text-midnight-lagoon focus:bg-white focus:outline-none focus:border-brand-green"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary uppercase">Estimated Reopening Date (Optional)</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-bold text-midnight-lagoon focus:bg-white focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-text-secondary uppercase">Reason for Closure *</label>
          <select
            value={selectedReason}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedReason(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-bold text-midnight-lagoon focus:bg-white focus:outline-none focus:border-brand-green"
          >
            {CLOSURE_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {selectedReason === 'Other Operational Reason' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-text-secondary uppercase">Custom Reason Description *</label>
            <input
              type="text"
              required
              value={customReason}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomReason(e.target.value)}
              placeholder="e.g. Electrical maintenance on power generators"
              className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-bold text-midnight-lagoon focus:bg-white focus:outline-none focus:border-brand-green"
            />
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold uppercase tracking-wider rounded-xl inline-flex items-center gap-2 transition-all cursor-pointer tap-feedback shadow-xs disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Update Availability Status</span>
          </button>
        </div>
      </form>

      {/* Explainer Card */}
      <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-3 shadow-xs">
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
