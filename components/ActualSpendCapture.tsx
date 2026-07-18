"use client";

import { useState } from "react";
import { submitActualSpend } from "@/lib/actions/submitActualSpend";
import { CheckCircle, Loader2 } from "lucide-react";

interface ActualSpendCaptureProps {
  sharedPlanId: string;
  spotId: string | null;
  estimatedTotal: number;
  spotName: string;
}

/**
 * ActualSpendCapture
 *
 * Appears on the shared plan page after the primary CTA.
 * One question: "How much did you actually spend?"
 * One input. One submit button. Feeds the pricing flywheel.
 *
 * Design rule: reuses existing typography and spacing. No new design patterns.
 */
export default function ActualSpendCapture({
  sharedPlanId,
  spotId,
  estimatedTotal,
  spotName,
}: ActualSpendCaptureProps) {
  const [actualTotal, setActualTotal] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseInt(actualTotal.replace(/[^0-9]/g, ""), 10);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid amount in Naira.");
      return;
    }
    if (parsed > 10_000_000) {
      setError("Amount seems too high. Please check.");
      return;
    }

    setLoading(true);
    const result = await submitActualSpend({
      sharedPlanId,
      spotId,
      estimatedTotal,
      actualTotal: parsed,
    });
    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong. Try again.");
    }
  };

  if (submitted) {
    const diff = parseInt(actualTotal.replace(/[^0-9]/g, ""), 10) - estimatedTotal;
    const overUnder = diff > 0 ? "over" : "under";
    const absDiff = Math.abs(diff);

    return (
      <div className="px-8 py-6 border-t border-border-default space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-brand-green shrink-0" />
          <p className="type-label text-brand-green font-[700]">
            Thanks — that helps us improve estimates.
          </p>
        </div>
        {absDiff > 500 && (
          <p className="type-caption text-text-muted pl-6">
            You spent ₦{absDiff.toLocaleString()} {overUnder} our estimate for {spotName}.
            We&apos;ll factor this in.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="px-8 py-6 border-t border-border-default">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <p className="type-label text-text-secondary font-[700]">
            How much did you actually spend?
          </p>
          <p className="type-caption text-text-muted">
            We estimated ₦{estimatedTotal.toLocaleString()}. Your real spend improves future estimates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency prefix — matches existing cost display pattern */}
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 type-label text-text-muted pointer-events-none">
              ₦
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 28,000"
              value={actualTotal}
              onChange={(e) => {
                // Allow only digits and commas for formatting
                const raw = e.target.value.replace(/[^0-9,]/g, "");
                setActualTotal(raw);
              }}
              className="w-full h-12 pl-8 pr-4 bg-surface-grey border border-border-default rounded-[10px] type-body text-text-primary focus:outline-none focus:border-brand-green focus:bg-white transition-[colors,border-color,background-color]"
              aria-label="Actual total spend in Naira"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !actualTotal}
            className="h-12 px-6 bg-brand-green hover:bg-brand-green-70 disabled:opacity-40 disabled:cursor-not-allowed text-white type-label rounded-[10px] transition-colors flex items-center gap-2 shrink-0 tap-feedback"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Submit"
            )}
          </button>
        </div>

        {error && (
          <p className="type-caption text-red-600 animate-in fade-in">{error}</p>
        )}

        <p className="type-caption text-text-muted opacity-60">
          Anonymous. We only store the amount, not your identity.
        </p>
      </form>
    </div>
  );
}
