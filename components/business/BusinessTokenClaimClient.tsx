'use client';

import React, { useState, useEffect } from 'react';
import { InvitationPreview, ClaimantRole } from '@/lib/types';
import { 
  claimWithInvitationAction, 
  markInvitationAuthenticatedAction 
} from '@/lib/actions/businessInvitationActions';
import { useAuth } from '@/components/providers/AuthProvider';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Receipt, 
  Camera, 
  Sparkles, 
  Loader2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';

interface BusinessTokenClaimClientProps {
  preview: InvitationPreview;
  rawToken: string;
  initialUser: {
    id: string;
    email?: string;
    name?: string;
  } | null;
}

export function BusinessTokenClaimClient({
  preview,
  rawToken,
  initialUser,
}: BusinessTokenClaimClientProps) {
  const { openModal } = useAuth();
  const [currentUser, setCurrentUser] = useState(initialUser);

  const [claimantName, setClaimantName] = useState(initialUser?.name || '');
  const [claimantRole, setClaimantRole] = useState<ClaimantRole>(preview.claimantRole || 'owner');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [claimantEmail, setClaimantEmail] = useState(preview.claimantEmail || initialUser?.email || '');
  const [relationshipNotes, setRelationshipNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedClaimId, setSubmittedClaimId] = useState<string | null>(null);

  // If user just logged in and we have a token, mark as authenticated
  useEffect(() => {
    if (initialUser && preview.status === 'opened') {
      markInvitationAuthenticatedAction(rawToken).catch(() => {});
    }
  }, [initialUser, preview.status, rawToken]);

  // Expiration calculation
  const expiresDate = preview.tokenExpiresAt ? new Date(preview.tokenExpiresAt) : null;
  const daysLeft = expiresDate 
    ? Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 7;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // If user is unauthenticated, trigger auth modal first
    if (!currentUser?.id) {
      openModal(`Sign in to claim ${preview.venueName}`, window.location.pathname);
      return;
    }

    if (!claimantName.trim() || claimantName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!claimantPhone.trim() || claimantPhone.trim().length < 7) {
      setErrorMessage('Please enter a valid phone number (WhatsApp preferred).');
      return;
    }

    if (!claimantEmail.trim() || !claimantEmail.includes('@')) {
      setErrorMessage('Please enter a valid business email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await claimWithInvitationAction(rawToken, {
        claimantName: claimantName.trim(),
        claimantRole,
        claimantPhone: claimantPhone.trim(),
        claimantEmail: claimantEmail.trim(),
        relationshipNotes: relationshipNotes.trim() || undefined,
      });

      if (res.success && res.claimId) {
        setSubmittedClaimId(res.claimId);
      } else {
        setErrorMessage(res.error || 'Failed to submit claim. Please try again.');
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (submittedClaimId) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-border-default p-8 sm:p-10 space-y-6 shadow-md text-center">
        <div className="w-16 h-16 bg-[#EAFDF3] text-[#008751] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="type-ui-label text-xs font-black text-[#008751] uppercase tracking-wider block">
            Claim Under Review
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight">
            Claim Submitted for {preview.venueName}
          </h1>
          <p className="type-body text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            Thanks, <span className="font-bold">{claimantName}</span>. We&apos;ve linked your business to your account. Our operations team reviews all business claims to protect venue data.
          </p>
        </div>

        <div className="p-5 bg-surface-grey rounded-2xl text-left space-y-3 border border-border-default/60">
          <h3 className="text-xs font-black text-midnight-lagoon uppercase tracking-wider">
            What happens next?
          </h3>
          <ol className="text-xs text-text-secondary space-y-2 list-decimal list-inside leading-relaxed">
            <li>We confirm your representation of the business (typically within 24 hours).</li>
            <li>You receive immediate access to your <span className="font-bold text-midnight-lagoon">OyaPlan for Business</span> portal to update menu prices and hours.</li>
            <li>Your accurate prices build cost confidence for Lagos squads planning outings around your venue.</li>
          </ol>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/venue/${preview.venueId}`}>
            <button className="w-full sm:w-auto h-12 px-6 bg-midnight-lagoon hover:bg-[#00041f] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer">
              View Public Listing
            </button>
          </Link>
          {(() => {
            const waUrl = getBusinessWhatsAppUrl('claim_support', { venueName: preview.venueName });
            if (!waUrl) return null;
            return (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-12 px-6 bg-[#EAFDF3] hover:bg-[#d5f9e3] text-[#008751] border border-[#A3F3C6] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            );
          })()}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Invitation Header Card */}
      <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-[#008751] text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Business Invitation</span>
          </div>

          <span className="text-[11px] font-bold text-text-muted bg-surface-grey px-2.5 py-1 rounded-lg">
            Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight">
            {preview.venueName}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">
            {preview.venueAddress} · <span className="capitalize">{preview.venueCategory}</span>
          </p>
        </div>

        <p className="type-body text-xs sm:text-sm text-text-secondary leading-relaxed">
          OyaPlan has created a listing for your business to help Lagos squads plan realistic outings before leaving home. Review what customers see and claim your presence so your pricing and hours stay accurate.
        </p>
      </div>

      {/* Pre-Claim Readiness Checklist (Demonstrates Value BEFORE Auth) */}
      <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="space-y-1">
          <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider block">
            Listing Readiness Check
          </span>
          <h2 className="text-lg font-black text-midnight-lagoon uppercase tracking-tight">
            What OyaPlan currently has on file
          </h2>
          <p className="text-xs text-text-muted">
            Here is what customers will use when planning outings to your venue.
          </p>
        </div>

        <div className="divide-y divide-gray-100 rounded-2xl border border-border-default overflow-hidden text-xs">
          {/* Business Details */}
          <div className="p-4 flex items-center justify-between gap-3 bg-emerald-50/50">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#008751] shrink-0" />
              <div>
                <span className="font-bold text-midnight-lagoon block">Business details</span>
                <span className="text-[11px] text-text-muted">Name, address, and category on file</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-[#008751] bg-[#EAFDF3] px-2 py-0.5 rounded border border-[#A3F3C6]">
              Ready
            </span>
          </div>

          {/* Opening Hours */}
          <div className="p-4 flex items-center justify-between gap-3 bg-[#FAFAF8]">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-midnight-lagoon block">Opening hours</span>
                <span className="text-[11px] text-text-muted">Requires verification by management</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Needs Review
            </span>
          </div>

          {/* Pricing */}
          <div className="p-4 flex items-center justify-between gap-3 bg-[#FAFAF8]">
            <div className="flex items-center gap-2.5">
              <Receipt className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-midnight-lagoon block">Pricing &amp; Mandatory Fees</span>
                <span className="text-[11px] text-text-muted">
                  {preview.menuItemCount > 0 
                    ? `${preview.menuItemCount} menu items on file; VAT and service charge confirmation needed` 
                    : 'Menu items and structured charges need confirmation'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Needs Review
            </span>
          </div>

          {/* Photos */}
          <div className={`p-4 flex items-center justify-between gap-3 ${preview.hasCover ? 'bg-emerald-50/50' : 'bg-[#FAFAF8]'}`}>
            <div className="flex items-center gap-2.5">
              {preview.hasCover ? (
                <CheckCircle2 className="w-4 h-4 text-[#008751] shrink-0" />
              ) : (
                <Camera className="w-4 h-4 text-gray-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-midnight-lagoon block">Photos &amp; Atmosphere</span>
                <span className="text-[11px] text-text-muted">
                  {preview.hasCover ? 'Cover photo added; interior photos recommended' : 'Cover and atmosphere photos needed'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
              preview.hasCover 
                ? 'text-[#008751] bg-[#EAFDF3] border-[#A3F3C6]' 
                : 'text-gray-500 bg-gray-100 border-gray-200'
            }`}>
              {preview.hasCover ? 'Added' : 'Incomplete'}
            </span>
          </div>

          {/* Experience */}
          <div className="p-4 flex items-center justify-between gap-3 bg-[#FAFAF8]">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-midnight-lagoon block">Experience &amp; Squad Suitability</span>
                <span className="text-[11px] text-text-muted">Suitable group sizes, vibes, and parking details</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Needs Review
            </span>
          </div>
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed">
          Claiming this listing connects your account to {preview.venueName}. You will be able to confirm or edit all of the above once verified.
        </p>
      </div>

      {/* Claim Form */}
      <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider block">
            Step 2 of 2
          </span>
          <h2 className="text-xl font-black text-midnight-lagoon uppercase tracking-tight">
            Confirm your representation
          </h2>
          <p className="text-xs text-text-muted">
            Tell us who you are at {preview.venueName} so our operations team can reach you.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

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
              Your Role at {preview.venueName} *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['owner', 'manager', 'marketing', 'operations', 'other'] as ClaimantRole[]).map((role: ClaimantRole) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setClaimantRole(role)}
                  className={`h-11 rounded-xl text-xs font-bold capitalize transition-all border ${
                    claimantRole === role
                      ? 'bg-midnight-lagoon text-white border-midnight-lagoon shadow-xs'
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
              WhatsApp Phone Number *
            </label>
            <input
              type="tel"
              required
              value={claimantPhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimantPhone(e.target.value)}
              placeholder="e.g. 0803 123 4567"
              className="w-full h-12 px-4 rounded-xl border border-border-default bg-[#FAFAF8] text-sm focus:bg-white focus:outline-none focus:border-brand-green transition-all"
            />
            <span className="text-[10px] text-text-muted">
              Used strictly for verification and operational alerts. Never shared with diners.
            </span>
          </div>

          {/* Business Email */}
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

          {/* Relationship Context */}
          <div className="space-y-1.5">
            <label className="block text-text-secondary uppercase tracking-wider font-bold text-[11px]">
              Additional Relationship Context (Optional)
            </label>
            <textarea
              rows={2}
              value={relationshipNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRelationshipNotes(e.target.value)}
              placeholder="e.g. Co-founder managing reservations and weekly events"
              className="w-full p-3.5 rounded-xl border border-border-default bg-[#FAFAF8] text-sm focus:bg-white focus:outline-none focus:border-brand-green transition-all"
            />
          </div>

          {/* Auth Reassurance Notice */}
          {!currentUser?.id && (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-[#008751] shrink-0 mt-0.5" />
              <span>
                Clicking <span className="font-bold">Claim Business</span> will prompt you to confirm your email via a secure magic link or OTP to link this venue to your account.
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-[#008751] hover:bg-[#007043] disabled:opacity-50 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {currentUser?.id ? 'Confirm & Submit Claim' : 'Continue to Claim Business'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-text-muted text-center leading-normal">
            This invitation link is single-use and assigned to {preview.venueName}. By claiming, you verify that you represent this business.
          </p>
        </form>
      </div>
    </div>
  );
}
