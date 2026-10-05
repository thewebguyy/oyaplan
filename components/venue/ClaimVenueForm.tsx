'use client';

import React, { useState, useEffect } from 'react';
import { Venue, ClaimantRole } from '@/lib/types';
import { submitVenueClaimAction } from '@/lib/actions/venueClaimActions';
import { trackEvent } from '@/lib/analytics/trackClient';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Store,
  AlertCircle,
  UserCheck,
  Lock,
  Building,
  Phone,
  FileText,
  AtSign,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';

interface ClaimVenueFormProps {
  venue: Venue;
  initialUser?: {
    id: string;
    email?: string;
    name?: string;
  } | null;
}

function sanitizePersonName(rawName?: string | null): string {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  // An email address or string containing @ is never a valid person full name
  if (trimmed.includes('@')) return '';
  return trimmed;
}

export function ClaimVenueForm({ venue, initialUser }: ClaimVenueFormProps) {
  const router = useRouter();
  const { session, isLoading: isAuthLoading } = useAuth();

  const rawMetaName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || initialUser?.name;
  const sanitizedInitialName = sanitizePersonName(rawMetaName);

  // Active user can come from session or initial server identity
  const currentUser = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        name: sanitizedInitialName,
      }
    : initialUser
    ? {
        ...initialUser,
        name: sanitizePersonName(initialUser.name),
      }
    : null;

  // Step State: 1 = Account, 2 = Role & Contact, 3 = Verification Proof
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(currentUser?.id ? 2 : 1);

  // If user signs in mid-flow, automatically advance from step 1 to 2
  useEffect(() => {
    if (currentUser?.id && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [currentUser?.id, currentStep]);

  // Form State
  const [claimantName, setClaimantName] = useState(currentUser?.name || '');
  const [claimantRole, setClaimantRole] = useState<ClaimantRole>('owner');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [claimantEmail, setClaimantEmail] = useState(currentUser?.email || '');
  
  // Verification Proof
  const [proofType, setProofType] = useState<'cac' | 'instagram' | 'email_domain' | 'other'>('cac');
  const [proofValue, setProofValue] = useState('');
  const [relationshipNotes, setRelationshipNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Sync email/name if currentUser changes
  useEffect(() => {
    if (currentUser?.email && !claimantEmail) {
      setClaimantEmail(currentUser.email);
    }
    if (currentUser?.name && !claimantName) {
      setClaimantName(currentUser.name);
    }
  }, [currentUser, claimantEmail, claimantName]);

  const handleStep1Continue = () => {
    if (!currentUser?.id) {
      router.push(`/login/business?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = claimantName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Please provide your full name.');
      return;
    }

    if (trimmedName.includes('@')) {
      setError('Please provide your full name (e.g. Babatunde Adeleke), not an email address.');
      return;
    }

    if (!claimantPhone.trim() || claimantPhone.trim().length < 7) {
      setError('Please provide a valid WhatsApp/Phone number so our team can reach you.');
      return;
    }

    if (!claimantEmail.trim() || !claimantEmail.includes('@')) {
      setError('Please provide a valid business email.');
      return;
    }

    setCurrentStep(3);
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.id) {
      router.push(`/login/business?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    const trimmedName = claimantName.trim();
    if (trimmedName.includes('@')) {
      setError('Please enter your actual full name, not your email address.');
      setCurrentStep(2);
      return;
    }

    setLoading(true);

    try {
      const combinedNotes = [
        proofValue ? `[Verification ${proofType.toUpperCase()}]: ${proofValue}` : null,
        relationshipNotes ? `[Context]: ${relationshipNotes}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const res = await submitVenueClaimAction({
        venueId: venue.id,
        claimantName: trimmedName,
        claimantRole,
        claimantPhone,
        claimantEmail,
        relationshipNotes: combinedNotes,
        verificationMethod: proofType === 'cac' ? 'business_document' : proofType === 'email_domain' ? 'email_domain' : 'manual',
      });

      if (res.success) {
        setSubmitted(true);
        trackEvent('venue_claim_submitted', {
          category: 'Operations',
          venue_id: venue.id,
          claim_id: res.claimId,
          role: claimantRole,
          proof_type: proofType,
          version: '1.0',
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

  // Submitted Success State
  if (submitted) {
    const waUrl = getBusinessWhatsAppUrl('claim_support', { venueName: venue.name });

    return (
      <div className="bg-white rounded-3xl border border-[#EAE4DC] p-8 sm:p-10 space-y-6 shadow-md text-center max-w-xl mx-auto animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-[#EAFDF3] text-[#008751] rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#008751] block">
            Step 3 of 3 Complete
          </span>
          <h2 className="text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
            Claim Under Verification
          </h2>
          <p className="type-body text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
            Thanks, <span className="font-bold">{claimantName}</span>. Your claim for <span className="font-bold">{venue.name}</span> has been received and is routed to our Lagos operations desk.
          </p>
        </div>

        <div className="p-5 bg-surface-grey rounded-2xl text-left space-y-3 border border-[#EAE4DC]/60">
          <h3 className="text-xs font-black text-midnight-lagoon uppercase tracking-wider">
            Verification Protocol
          </h3>
          <ol className="text-xs text-text-secondary space-y-2.5 list-decimal list-inside leading-relaxed">
            <li>
              <strong>Direct WhatsApp/Email Confirmation:</strong> We verify operator authority (typical turnaround under 4 hours).
            </li>
            <li>
              <strong>Partner Portal Activation:</strong> You gain instant dashboard access to sync live menu prices, celebration fees (corkage, cake), and house rules.
            </li>
            <li>
              <strong>Verified Partner Shield:</strong> Your listing receives the emerald trust badge on OyaPlan.
            </li>
          </ol>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/venue/${venue.id}`}>
            <button className="w-full sm:w-auto h-12 px-6 bg-midnight-lagoon hover:bg-[#00041f] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer">
              Return to Public Page
            </button>
          </Link>
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto h-12 px-6 bg-[#EAFDF3] hover:bg-[#d6f9e4] text-[#008751] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Fast-Track via WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  const venueThumbnail = venue.cover_url || (venue.gallery_urls && venue.gallery_urls[0]);

  return (
    <div className="bg-white rounded-3xl border border-[#EAE4DC] p-6 sm:p-10 space-y-8 shadow-sm max-w-xl mx-auto">
      {/* Venue Header with Thumbnail */}
      <div className="flex items-start gap-4 border-b border-[#EAE4DC] pb-5">
        {venueThumbnail ? (
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-grey shrink-0 border border-[#EAE4DC] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={venueThumbnail} alt={venue.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-[#008751]/10 text-[#008751] flex items-center justify-center shrink-0 border border-[#008751]/20">
            <Store className="w-6 h-6" />
          </div>
        )}

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full">
              Venue Partner Program
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight leading-tight truncate">
            Claim {venue.name}
          </h1>
          <p className="text-xs text-text-muted truncate">
            {venue.address ? `${venue.address} · ` : ''}Manage verified pricing &amp; policies on OyaPlan.
          </p>
        </div>
      </div>

      {/* 3-Step Progress Header with Accessible Contrast */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className={`p-2.5 rounded-xl border text-center transition-all ${
            currentStep === 1
              ? 'bg-[#EAFDF3] border-[#008751] text-[#008751] ring-1 ring-[#008751]/20'
              : currentStep > 1
              ? 'bg-white border-[#EAE4DC] text-midnight-lagoon'
              : 'bg-surface-grey border-[#EAE4DC]/60 text-text-secondary'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider block">Step 1</span>
          <span className="text-xs font-bold truncate block">Account</span>
        </div>

        <div
          className={`p-2.5 rounded-xl border text-center transition-all ${
            currentStep === 2
              ? 'bg-[#EAFDF3] border-[#008751] text-[#008751] ring-1 ring-[#008751]/20'
              : currentStep > 2
              ? 'bg-white border-[#EAE4DC] text-midnight-lagoon'
              : 'bg-surface-grey border-[#EAE4DC]/60 text-text-secondary'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider block">Step 2</span>
          <span className="text-xs font-bold truncate block">Role &amp; Contact</span>
        </div>

        <div
          className={`p-2.5 rounded-xl border text-center transition-all ${
            currentStep === 3
              ? 'bg-[#EAFDF3] border-[#008751] text-[#008751] ring-1 ring-[#008751]/20'
              : 'bg-surface-grey border-[#EAE4DC]/60 text-text-secondary'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider block">Step 3</span>
          <span className="text-xs font-bold truncate block">Verification</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Account Connection */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2">
            <div className="flex items-center gap-2 text-midnight-lagoon">
              <Lock className="w-4 h-4 text-[#7A3E1D]" />
              <h3 className="font-black text-sm uppercase tracking-tight">
                Let&apos;s connect your account first
              </h3>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Sign in or create a quick account so we can link {venue.name} directly to your dashboard once verified.
            </p>
          </div>

          {currentUser?.id ? (
            <div className="p-4 rounded-2xl bg-[#EAFDF3] border border-[#A3F3C6] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-[#008751]" />
                <div>
                  <span className="text-xs font-black text-midnight-lagoon block">
                    Signed in as {currentUser.name || currentUser.email}
                  </span>
                  <span className="text-[11px] text-[#0A7C3F] font-medium">
                    {currentUser.email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStep1Continue}
                className="h-10 px-4 bg-[#008751] hover:bg-[#007043] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                disabled={isAuthLoading}
                onClick={() => router.push(`/login/business?returnTo=${encodeURIComponent(window.location.pathname)}`)}
                className="w-full h-14 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Continue with Email or Google</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-text-muted text-center leading-normal">
                Takes 5 seconds. No password hassle.
              </p>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Role & Direct Contact with Proper Autocomplete */}
      {currentStep === 2 && (
        <form onSubmit={handleStep2Continue} className="space-y-5 animate-in fade-in duration-200">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="claimant-name" className="block text-midnight-lagoon uppercase tracking-wider font-bold text-[11px]">
              Your Full Name *
            </label>
            <input
              id="claimant-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              spellCheck={false}
              value={claimantName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimantName(e.target.value)}
              placeholder="e.g. Babatunde Adeleke"
              className="w-full h-12 px-4 rounded-xl border border-[#EAE4DC] bg-[#FAFAF8] text-sm text-midnight-lagoon focus:bg-white focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 transition-all"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="block text-midnight-lagoon uppercase tracking-wider font-bold text-[11px]">
              Your Role at {venue.name} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['owner', 'manager', 'marketing', 'operations'] as ClaimantRole[]).map((role: ClaimantRole) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setClaimantRole(role)}
                  className={`h-11 rounded-xl text-xs font-bold capitalize transition-all border cursor-pointer ${
                    claimantRole === role
                      ? 'bg-midnight-lagoon text-white border-midnight-lagoon shadow-xs'
                      : 'bg-[#FAFAF8] text-text-secondary border-[#EAE4DC] hover:border-gray-400'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp / Phone */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="claimant-phone" className="block text-midnight-lagoon uppercase tracking-wider font-bold text-[11px]">
                WhatsApp / Phone Number *
              </label>
              <span className="text-[10px] font-bold text-[#008751]">For fast verification</span>
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="claimant-phone"
                name="tel"
                type="tel"
                required
                autoComplete="tel"
                value={claimantPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimantPhone(e.target.value)}
                placeholder="e.g. 0803 123 4567"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#EAE4DC] bg-[#FAFAF8] text-sm text-midnight-lagoon focus:bg-white focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 transition-all"
              />
            </div>
          </div>

          {/* Business Email */}
          <div className="space-y-1.5">
            <label htmlFor="claimant-email" className="block text-midnight-lagoon uppercase tracking-wider font-bold text-[11px]">
              Work / Business Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="claimant-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={claimantEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimantEmail(e.target.value)}
                placeholder="e.g. manager@thehouselagos.com"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-[#EAE4DC] bg-[#FAFAF8] text-sm text-midnight-lagoon focus:bg-white focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 transition-all"
              />
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="pt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="h-12 px-4 text-text-secondary hover:text-midnight-lagoon font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              className="h-12 px-6 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Continue to Step 3</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Verification Proof & Submit */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmitFinal} className="space-y-5 animate-in fade-in duration-200">
          <div className="space-y-2">
            <label className="block text-midnight-lagoon uppercase tracking-wider font-bold text-[11px]">
              Verification Method *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProofType('cac')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  proofType === 'cac'
                    ? 'border-[#008751] bg-[#EAFDF3] text-[#008751]'
                    : 'border-[#EAE4DC] bg-[#FAFAF8] text-text-secondary hover:border-gray-400'
                }`}
              >
                <Building className="w-4 h-4" />
                <span className="text-xs font-bold leading-tight">CAC Number / RC #</span>
              </button>

              <button
                type="button"
                onClick={() => setProofType('instagram')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  proofType === 'instagram'
                    ? 'border-[#008751] bg-[#EAFDF3] text-[#008751]'
                    : 'border-[#EAE4DC] bg-[#FAFAF8] text-text-secondary hover:border-gray-400'
                }`}
              >
                <AtSign className="w-4 h-4" />
                <span className="text-xs font-bold leading-tight">Official Instagram</span>
              </button>

              <button
                type="button"
                onClick={() => setProofType('email_domain')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                  proofType === 'email_domain'
                    ? 'border-[#008751] bg-[#EAFDF3] text-[#008751]'
                    : 'border-[#EAE4DC] bg-[#FAFAF8] text-text-secondary hover:border-gray-400'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-xs font-bold leading-tight">Domain Match</span>
              </button>
            </div>
          </div>

          {/* Proof Input */}
          <div className="space-y-1.5">
            <label htmlFor="proof-value" className="block text-midnight-lagoon uppercase tracking-wider font-bold text-[11px]">
              {proofType === 'cac'
                ? 'CAC Business Registration Number (RC / BN)'
                : proofType === 'instagram'
                ? 'Official Instagram Handle for Fast DM Check'
                : 'Official Business Domain / Website'}
            </label>
            <input
              id="proof-value"
              type="text"
              value={proofValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProofValue(e.target.value)}
              placeholder={
                proofType === 'cac'
                  ? 'e.g. RC-1849202'
                  : proofType === 'instagram'
                  ? 'e.g. @thehouselagos'
                  : 'e.g. thehouselagos.com'
              }
              className="w-full h-12 px-4 rounded-xl border border-[#EAE4DC] bg-[#FAFAF8] text-sm text-midnight-lagoon focus:bg-white focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 transition-all"
            />
          </div>

          {/* Context / Notes */}
          <div className="space-y-1.5">
            <label htmlFor="relationship-notes" className="block text-midnight-lagoon uppercase tracking-wider font-bold text-[11px]">
              Additional Context (Optional)
            </label>
            <textarea
              id="relationship-notes"
              rows={2}
              value={relationshipNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRelationshipNotes(e.target.value)}
              placeholder="e.g. General Manager overseeing reservations, menu updates, and pricing"
              className="w-full p-4 rounded-xl border border-[#EAE4DC] bg-[#FAFAF8] text-sm text-midnight-lagoon focus:bg-white focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 transition-all"
            />
          </div>

          {/* Nav & Submit */}
          <div className="pt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="h-12 px-4 text-text-secondary hover:text-midnight-lagoon font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-14 px-8 bg-[#008751] hover:bg-[#007043] disabled:opacity-50 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Submit Claim</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-text-muted text-center leading-normal pt-1">
            By submitting, you confirm you are authorized to manage operational and pricing data for {venue.name}.
          </p>
        </form>
      )}

    </div>
  );
}
