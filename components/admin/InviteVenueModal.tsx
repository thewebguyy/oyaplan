'use client';

import React, { useState, useMemo } from 'react';
import { generateVenueInvitationAction } from '@/lib/actions/businessInvitationActions';
import { ClaimantRole } from '@/lib/types';
import {
  Building2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Clock,
  Loader2,
  X,
  Search,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export interface VenueOption {
  id: string;
  name: string;
  category?: string;
  address?: string;
  partner_state?: string;
}

interface InviteVenueModalProps {
  venues: VenueOption[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteVenueModal({
  venues,
  isOpen,
  onClose,
  onSuccess,
}: InviteVenueModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [claimantRole, setClaimantRole] = useState<ClaimantRole>('owner');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [generatedResult, setGeneratedResult] = useState<{
    venueName: string;
    rawToken: string;
    invitationUrl: string;
    expiresAt: string;
  } | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return venues.slice(0, 15);
    const q = searchQuery.toLowerCase();
    return venues
      .filter((v: VenueOption) => v.name.toLowerCase().includes(q) || (v.address && v.address.toLowerCase().includes(q)))
      .slice(0, 20);
  }, [venues, searchQuery]);

  const selectedVenue = useMemo(() => {
    return venues.find((v: VenueOption) => v.id === selectedVenueId);
  }, [venues, selectedVenueId]);

  if (!isOpen) return null;

  const handleReset = () => {
    setSelectedVenueId('');
    setClaimantEmail('');
    setClaimantRole('owner');
    setError(null);
    setGeneratedResult(null);
    setCopiedLink(false);
    setCopiedWhatsApp(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenueId) {
      setError('Please select a venue to invite.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await generateVenueInvitationAction(
      selectedVenueId,
      claimantEmail.trim() || undefined,
      claimantRole
    );

    setIsSubmitting(false);

    if (res.success && res.rawToken && res.invitationUrl) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oyaplan.com';
      const fullUrl = `${origin}${res.invitationUrl}`;

      setGeneratedResult({
        venueName: selectedVenue?.name || 'Venue',
        rawToken: res.rawToken,
        invitationUrl: fullUrl,
        expiresAt: res.expiresAt || new Date(Date.now() + 7 * 86400000).toISOString(),
      });

      if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(res.error || 'Failed to generate invitation link.');
    }
  };

  const getWhatsAppMessage = (venueName: string, link: string) => {
    return `Hi ${venueName} team, OyaPlan has created a listing for your business to help Lagos squads plan realistic outings. Review what customers see and claim your presence here: ${link}`;
  };

  const copyToClipboard = async (text: string, type: 'link' | 'whatsapp') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'link') {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedWhatsApp(true);
        setTimeout(() => setCopiedWhatsApp(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Invite Venue to OyaPlan</h3>
              <p className="text-xs text-stone-500">
                Generate a single-use claim link to send via WhatsApp or email.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-700 text-lg leading-none p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* View 1: Form to Generate */}
        {!generatedResult ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Venue Selector */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Select Venue <span className="text-rose-500">*</span>
              </label>

              {/* Venue Search Bar */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search venue by name or area..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              {/* Venue Options List */}
              <div className="border border-stone-200 rounded-xl max-h-44 overflow-y-auto divide-y divide-stone-100 bg-stone-50/50">
                {filteredVenues.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400">
                    No venues found matching "{searchQuery}"
                  </div>
                ) : (
                  filteredVenues.map((venue: VenueOption) => {
                    const isSelected = selectedVenueId === venue.id;
                    return (
                      <button
                        key={venue.id}
                        type="button"
                        onClick={() => setSelectedVenueId(venue.id)}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-purple-50 text-purple-900 font-semibold'
                            : 'hover:bg-white text-stone-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{venue.name}</span>
                            {venue.category && (
                              <span className="text-[10px] text-stone-400 capitalize">
                                · {venue.category}
                              </span>
                            )}
                          </div>
                          {venue.address && (
                            <p className="text-[10px] text-stone-500 truncate max-w-xs">
                              {venue.address}
                            </p>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Claimant Role */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Expected Recipient Role
              </label>
              <select
                value={claimantRole}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClaimantRole(e.target.value as ClaimantRole)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="owner">Business Owner / Founder</option>
                <option value="general_manager">General Manager</option>
                <option value="marketing_lead">Marketing / Brand Lead</option>
                <option value="operations">Operations Manager</option>
                <option value="event_coordinator">Event Coordinator</option>
              </select>
            </div>

            {/* Optional Contact Email */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Recipient Email <span className="text-stone-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="email"
                placeholder="manager@venue.com"
                value={claimantEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimantEmail(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                If provided, pre-populates their email on the verification form.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedVenueId || isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Claim Link
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* View 2: Generated Result & WhatsApp Template */
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 text-xs text-purple-900">
              <div className="font-semibold flex items-center gap-1.5 text-purple-800 mb-1">
                <Check className="w-4 h-4 text-purple-600" />
                Invitation Created for {generatedResult.venueName}
              </div>
              <p className="text-[11px] text-purple-700">
                This link is valid for 7 days and can only be used once. Send it directly to the venue manager or owner.
              </p>
            </div>

            {/* Generated Link Box */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Invitation URL
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={generatedResult.invitationUrl}
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-800 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedResult.invitationUrl, 'link')}
                  className="px-3 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* WhatsApp Message Template */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Ready-to-Send WhatsApp Pitch
                </label>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      getWhatsAppMessage(generatedResult.venueName, generatedResult.invitationUrl),
                      'whatsapp'
                    )
                  }
                  className="text-xs font-semibold text-[#008751] hover:underline flex items-center gap-1"
                >
                  {copiedWhatsApp ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedWhatsApp ? 'Copied Message' : 'Copy Message'}
                </button>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">
                {getWhatsAppMessage(generatedResult.venueName, generatedResult.invitationUrl)}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  getWhatsAppMessage(generatedResult.venueName, generatedResult.invitationUrl)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Open WhatsApp
              </a>

              <a
                href={generatedResult.invitationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Preview Flow
              </a>
            </div>

            {/* Expiry note and footer */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-100 text-stone-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Expires {new Date(generatedResult.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-purple-600 font-semibold hover:underline"
              >
                Invite Another Venue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
