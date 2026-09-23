'use client';

import React, { useState } from 'react';
import { Venue } from '@/lib/types';
import { reportTemporaryClosureAction, reopenVenueAction } from '@/lib/actions/partnerClosureActions';
import { ArrowLeft, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ClosureClientProps {
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

export function ClosureClient({ venue }: ClosureClientProps) {
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
      setSuccessMessage('Temporary closure updated. OyaPlan has noted your unavailable dates.');
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
      setSuccessMessage('Venue status updated: Your venue is now marked open for planning.');
    } else {
      setErrorMessage(res.error || 'Failed to reopen venue');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-16">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Link
          href={`/partner/${venue.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#010528] mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Partner Home
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#010528] tracking-tight">
            Temporary Availability
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Keep Lagos planners informed so no one arrives at locked gates.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Error updating status</div>
              <div>{errorMessage}</div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#008751] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Status Updated</div>
              <div>{successMessage}</div>
            </div>
          </div>
        )}

        {isClosed ? (
          <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-md text-xs font-semibold mb-1">
                  Temporarily Closed
                </span>
                <h2 className="text-lg font-bold text-stone-900">
                  {venue.temporary_closure_reason || 'Under scheduled downtime'}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  From <span className="font-semibold">{venue.temporary_closure_start}</span>
                  {venue.temporary_closure_end ? (
                    <> to <span className="font-semibold">{venue.temporary_closure_end}</span></>
                  ) : (
                    ' until further notice'
                  )}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 leading-relaxed">
              While marked closed, OyaPlan temporarily deprioritizes your venue in immediate outing itineraries to protect customer trust. Your listing data and photos remain intact.
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={handleReopen}
                disabled={isSubmitting}
                className="bg-[#008751] hover:bg-[#007043] text-white py-3 px-6 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Reopen Venue Now
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitClosure} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-bold text-stone-900 text-base">
                Are you temporarily unavailable?
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Reporting short-term closures protects your venue from disappointed diners.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Expected Reopening Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Leave blank if indefinite
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Reason for Closure
                </label>
                <select
                  value={selectedReason}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                >
                  {CLOSURE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {selectedReason === 'Other Operational Reason' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Specify Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={customReason}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomReason(e.target.value)}
                    placeholder="e.g. Electrical upgrades"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#008751]"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !startDate}
                className="bg-[#010528] hover:bg-[#D72638] text-white py-3 px-6 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit Temporary Closure
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
