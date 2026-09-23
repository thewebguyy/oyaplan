'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/lib/types';
import { updateMenuItemPriceAction } from '@/lib/actions/partnerPricingActions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tag, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface PriceUpdateModalProps {
  venueId: string;
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onPriceUpdated?: (item: MenuItem) => void;
}

const REASONS = [
  'Price update',
  'New menu',
  'Seasonal pricing',
  'Inflation adjustment',
  'Promotional pricing',
  'Other',
];

export function PriceUpdateModal({
  venueId,
  item,
  isOpen,
  onClose,
  onSuccess,
  onPriceUpdated,
}: PriceUpdateModalProps) {
  const [newPrice, setNewPrice] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Synchronize when item changes
  React.useEffect(() => {
    if (item) {
      setNewPrice(item.price.toString());
      setSubmitted(false);
      setError(null);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!item) return;

    const parsedPrice = parseInt(newPrice.replace(/[^0-9]/g, ''), 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid price in Naira.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await updateMenuItemPriceAction({
        venueId,
        menuItemId: item.id,
        newPrice: parsedPrice,
        reason,
        notes,
      });

      if (res.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
        if (onPriceUpdated && item) {
          onPriceUpdated({
            ...item,
            price: parsedPrice,
            last_updated_at: new Date().toISOString(),
          });
        }
      } else {
        setError(res.error || 'Failed to update price');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-3xl p-6 sm:p-8">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#008751] flex items-center justify-center">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <DialogTitle className="text-xl font-black text-midnight-lagoon uppercase tracking-tight">
              Update Price
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-text-muted">
            Updating <span className="font-bold text-midnight-lagoon">{item.name}</span>. Historical pricing evidence is preserved.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 bg-[#EAFDF3] text-[#008751] rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-midnight-lagoon text-base uppercase">Update Submitted</h4>
              <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                We&apos;ve recorded the new price of <span className="font-bold font-mono text-midnight-lagoon">₦{parseInt(newPrice, 10).toLocaleString('en-NG')}</span>. Our data team reviews updates to maintain high trust.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-midnight-lagoon text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
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

            {/* Current Price vs New Price */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-grey rounded-xl border border-border-default/60 space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-bold block">Current Price</span>
                <span className="text-base font-black text-midnight-lagoon font-mono">
                  ₦{item.price.toLocaleString('en-NG')}
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-text-secondary uppercase tracking-wider font-bold text-[10px]">
                  New Price (₦) *
                </label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPrice(e.target.value)}
                  placeholder="e.g. 9500"
                  className="w-full h-12 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-sm font-mono font-bold focus:bg-white focus:outline-none focus:border-brand-green"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="block text-text-secondary uppercase tracking-wider font-bold text-[10px]">
                What changed? *
              </label>
              <select
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReason(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:border-brand-green"
              >
                {REASONS.map((r: string) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <label className="block text-text-muted uppercase tracking-wider font-bold text-[10px]">
                Optional Note / Context
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                placeholder="e.g. Updated menu rolled out this Friday"
                className="w-full h-10 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:border-brand-green"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Price Update'}
              </button>
            </div>

            <p className="text-[10px] text-text-muted text-center leading-normal">
              Submissions write to the audit log and trigger an automatic recalculation of typical spend.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
