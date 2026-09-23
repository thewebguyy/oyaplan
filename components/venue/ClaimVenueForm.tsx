'use client';

import React, { useState } from 'react';
import { Venue, ClaimantRole } from '@/lib/types';
import { submitVenueClaimAction } from '@/lib/actions/venueClaimActions';
import { trackEvent } from '@/lib/analytics/trackClient';
import { useAuth } from '@/components/providers/AuthProvider';
import { ShieldCheck, CheckCircle2, Loader2, ArrowRight, Store, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ClaimVenueFormProps {
  venue: Venue;
  initialUser?: {
    id: string;
    email?: string;
    name?: string;
  } | null;
}

export function ClaimVenueForm({ venue, initialUser }: ClaimVenueFormProps) {
  const { openModal } = useAuth();
  const [claimantName, setClaimantName] = useState(initialUser?.name || '');
  const [claimantRole, setClaimantRole] = useState<ClaimantRole>('owner');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [claimantEmail, setClaimantEmail] = useState(initialUser?.email || '');
  const [relationshipNotes, setRelationshipNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // If user is not authenticated, prompt auth first
    if (!initialUser?.id) {
      openModal('Sign in to submit your venue claim', window.location.pathname);
      return;
    }

    setLoading(true);

    try {
      const res = await submitVenueClaimAction({
        venueId: venue.id,
        claimantName,
        claimantRole,
        claimantPhone,
        claimantEmail,
        relationshipNotes,
      });

      if (res.success) {
        setSubmitted(true);
        trackEvent('venue_claim_submitted', {
          category: 'Operations',
          venue_id: venue.id,
          claim_id: res.claimId,
          role: claimantRole,
          version: '1.0'
        });
      } else {
        setError(res.error || 'Failed to submit claim. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-border-default p-8 sm:p-10 space-y-6 shadow-md text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-[#EAFDF3] text-[#008751] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
            Claim Submitted
          </h2>
          <p className="type-body text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            Thanks, <span className="font-bold">{claimantName}</span>. Our operations team is reviewing your claim for <span className="font-bold">{venue.name}</span>.
          </p>
        </div>

        <div className="p-5 bg-surface-grey rounded-2xl text-left space-y-3 border border-border-default/60">
          <h3 className="text-xs font-black text-midnight-lagoon uppercase tracking-wider">
            What happens next?
          </h3>
          <ol className="text-xs text-text-secondary space-y-2 list-decimal list-inside leading-relaxed">
            <li>We confirm your representation of the business (usually within 24 hours).</li>
            <li>You receive access to your <span className="font-bold text-midnight-lagoon">Partner Home</span> to confirm pricing, opening hours, and photos.</li>
            <li>Your verified details directly empower Lagos squads planning outings around your budget.</li>
          </ol>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/venue/${venue.id}`}>
            <button className="w-full sm:w-auto h-12 px-6 bg-midnight-lagoon hover:bg-[#00041f] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all">
              Return to Venue Page
            </button>
          </Link>
          <a
            href="https://wa.me/2348000000000?text=Hi%20OyaPlan,%20I%20just%20claimed%20my%20venue"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto h-12 px-6 bg-[#EAFDF3] hover:bg-[#d6f9e4] text-[#008751] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Message on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-10 space-y-8 shadow-md max-w-xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider">
            Supply Partnership
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight leading-tight">
          Is this your venue?
        </h1>
        <p className="type-body text-xs sm:text-sm text-text-muted leading-relaxed">
          Claim your OyaPlan listing for <span className="font-bold text-midnight-lagoon">{venue.name}</span> so you can keep your business information accurate and understand how people are planning around your venue.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 text-xs font-semibold text-text-primary">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-text-secondary uppercase tracking-wider font-bold text-[11px]">
            Your Full Name *
          </label>
          <input
            type="text"
            required
            value={claimantName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimantName(e.target.value)}
            placeholder="e.g. Babatunde Adeleke"
            className="w-full h-12 px-4 rounded-xl border border-border-default bg-[#FAFAF8] text-sm focus:bg-white focus:outline-none focus:border-brand-green transition-all"
          />
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <label className="block text-text-secondary uppercase tracking-wider font-bold text-[11px]">
            Your Role at {venue.name} *
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {(['owner', 'manager', 'marketing', 'operations', 'other'] as ClaimantRole[]).map((role: ClaimantRole) => (
              <button
                type="button"
                key={role}
                onClick={() => setClaimantRole(role)}
                className={`h-11 rounded-xl text-xs font-bold capitalize transition-all border ${
                  claimantRole === role
                    ? 'bg-midnight-lagoon text-white border-midnight-lagoon shadow-sm'
                    : 'bg-[#FAFAF8] text-text-muted border-border-default hover:border-gray-400'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Phone / WhatsApp */}
        <div className="space-y-1.5">
          <label className="block text-text-secondary uppercase tracking-wider font-bold text-[11px]">
            Phone Number (WhatsApp Preferred) *
          </label>
          <input
            type="tel"
            required
            value={claimantPhone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimantPhone(e.target.value)}
            placeholder="e.g. 0803 123 4567"
            className="w-full h-12 px-4 rounded-xl border border-border-default bg-[#FAFAF8] text-sm focus:bg-white focus:outline-none focus:border-brand-green transition-all"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-text-secondary uppercase tracking-wider font-bold text-[11px]">
            Work / Business Email *
          </label>
          <input
            type="email"
            required
            value={claimantEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimantEmail(e.target.value)}
            placeholder="e.g. manager@thehouselagos.com"
            className="w-full h-12 px-4 rounded-xl border border-border-default bg-[#FAFAF8] text-sm focus:bg-white focus:outline-none focus:border-brand-green transition-all"
          />
        </div>

        {/* Context / Notes */}
        <div className="space-y-1.5">
          <label className="block text-text-secondary uppercase tracking-wider font-bold text-[11px]">
            Venue Relationship Context (Optional)
          </label>
          <textarea
            rows={2}
            value={relationshipNotes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRelationshipNotes(e.target.value)}
            placeholder="e.g. Co-founder, handling restaurant reservations and pricing updates"
            className="w-full p-4 rounded-xl border border-border-default bg-[#FAFAF8] text-sm focus:bg-white focus:outline-none focus:border-brand-green transition-all"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#008751] hover:bg-[#007043] disabled:opacity-50 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Submit Venue Claim</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-text-muted text-center leading-normal">
          Submitting a claim initiates verification. OyaPlan verifies all claims to ensure only authorized operators manage venue data.
        </p>
      </form>
    </div>
  );
}
