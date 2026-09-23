'use client';

import React, { useState } from 'react';
import { ChangeRequestCategory } from '@/lib/types';
import { submitChangeRequestAction } from '@/lib/actions/venueChangeRequestActions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Flag, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface ChangeRequestModalProps {
  venueId: string;
  venueName: string;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: Array<{ id: ChangeRequestCategory; label: string }> = [
  { id: 'wrong_price', label: 'Wrong price / Outdated menu' },
  { id: 'wrong_hours', label: 'Wrong opening hours' },
  { id: 'wrong_location', label: 'Wrong address or location' },
  { id: 'wrong_photo', label: 'Incorrect photo' },
  { id: 'wrong_category', label: 'Wrong category or vibe' },
  { id: 'wrong_description', label: 'Inaccurate description' },
  { id: 'closed_temporarily', label: 'Temporarily closed' },
  { id: 'permanently_closed', label: 'Permanently closed' },
  { id: 'other', label: 'Other correction' },
];

export function ChangeRequestModal({
  venueId,
  venueName,
  isOpen,
  onClose,
}: ChangeRequestModalProps) {
  const [category, setCategory] = useState<ChangeRequestCategory>('wrong_price');
  const [details, setDetails] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterContact, setSubmitterContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await submitChangeRequestAction({
        venueId,
        category,
        details,
        submitterName,
        submitterEmail: submitterContact.includes('@') ? submitterContact : undefined,
        submitterPhone: !submitterContact.includes('@') ? submitterContact : undefined,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to submit correction');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setError(null);
    setDetails('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleReset()}>
      <DialogContent className="sm:max-w-lg bg-white border-none shadow-2xl rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Flag className="w-3.5 h-3.5" />
            </div>
            <DialogTitle className="text-xl font-black text-midnight-lagoon uppercase tracking-tight">
              Report Correction
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-text-muted">
            Notice something incorrect about <span className="font-bold text-midnight-lagoon">{venueName}</span>? Let us know so our team can update it.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 bg-[#EAFDF3] text-[#008751] rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-midnight-lagoon text-base uppercase">Thank You</h4>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                We received your report. Our data moderation team verifies community corrections promptly.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-midnight-lagoon text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 text-xs font-semibold text-text-primary">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-text-secondary uppercase tracking-wider font-bold text-[10px]">
                What needs attention? *
              </label>
              <select
                value={category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value as ChangeRequestCategory)}
                className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:border-brand-green"
              >
                {CATEGORIES.map((c: { id: ChangeRequestCategory; label: string }) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Details */}
            <div className="space-y-1.5">
              <label className="block text-text-secondary uppercase tracking-wider font-bold text-[10px]">
                Details of what is incorrect *
              </label>
              <textarea
                required
                rows={3}
                value={details}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDetails(e.target.value)}
                placeholder="e.g. Cocktail price is now ₦8,000, and they open at 2pm on Sundays instead of 12pm."
                className="w-full p-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:border-brand-green"
              />
            </div>

            {/* Optional Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-text-muted uppercase tracking-wider font-bold text-[10px]">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={submitterName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubmitterName(e.target.value)}
                  placeholder="e.g. Tunde"
                  className="w-full h-10 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-text-muted uppercase tracking-wider font-bold text-[10px]">
                  Email or Phone (Optional)
                </label>
                <input
                  type="text"
                  value={submitterContact}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubmitterContact(e.target.value)}
                  placeholder="e.g. 0803... or tunde@gmail.com"
                  className="w-full h-10 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-midnight-lagoon hover:bg-[#00041f] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Correction'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
