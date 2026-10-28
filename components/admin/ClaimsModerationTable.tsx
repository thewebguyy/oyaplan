'use client';

import React, { useState } from 'react';
import { VenueClaim } from '@/lib/types';
import { reviewVenueClaimAction } from '@/lib/actions/venueClaimActions';
import { revokeVenueInvitationAction } from '@/lib/actions/businessInvitationActions';
import { InviteVenueModal, VenueOption } from '@/components/admin/InviteVenueModal';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  User,
  Building2,
  Loader2,
  AlertCircle,
  Send,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface ClaimWithVenue extends VenueClaim {
  venue_name?: string;
  venue_category?: string;
  venue_address?: string;
  venue_partner_state?: string;
}

interface ClaimsModerationTableProps {
  claims: ClaimWithVenue[];
  venues?: VenueOption[];
}

export function ClaimsModerationTable({ claims, venues = [] }: ClaimsModerationTableProps) {
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [revokingClaimId, setRevokingClaimId] = useState<string | null>(null);

  const selectedClaim = claims.find((c: ClaimWithVenue) => c.id === activeClaimId);

  const handleRevokeInvitation = async (claimId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation? The recipient will no longer be able to use the link.')) {
      return;
    }
    setRevokingClaimId(claimId);
    const res = await revokeVenueInvitationAction(claimId);
    setRevokingClaimId(null);
    if (!res.success) {
      alert(res.error || 'Failed to revoke invitation');
    }
  };

  const handleOpenAction = (claimId: string, mode: 'approve' | 'reject' | 'request_info') => {
    setActiveClaimId(claimId);
    setModalMode(mode);
    setAdminNotes('');
    setRejectionReason('');
    setFeedback(null);
  };

  const handleCloseModal = () => {
    setActiveClaimId(null);
    setModalMode(null);
    setIsProcessing(false);
  };

  const handleSubmitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaimId || !modalMode) return;

    setIsProcessing(true);
    setFeedback(null);

    let decision: 'approved' | 'rejected' | 'needs_more_information' = 'approved';
    if (modalMode === 'reject') decision = 'rejected';
    if (modalMode === 'request_info') decision = 'needs_more_information';

    const res = await reviewVenueClaimAction({
      claimId: activeClaimId,
      decision,
      adminNotes: adminNotes.trim() || undefined,
      rejectionReason: rejectionReason.trim() || undefined,
    });

    setIsProcessing(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        text: `Claim successfully ${decision.replace(/_/g, ' ')}. Page is refreshed.`
      });
      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } else {
      setFeedback({
        type: 'error',
        text: res.error || 'Failed to update claim'
      });
    }
  };

  if (claims.length === 0) {
    return (
      <>
        <div className="bg-[#FAF8F8] border-2 border-dashed border-[#111111]/20 rounded-lg p-12 text-center text-[#111111]/60 space-y-3">
          <div className="w-12 h-12 rounded border-2 border-[#111111]/20 bg-white text-[#111111]/50 flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_#111111]">
            <Building2 className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-display font-black text-[#111111]">No claims found</h3>
          <p className="text-xs font-mono text-[#111111]/60 max-w-sm mx-auto">
            No venue operator claims match the selected filter criteria.
          </p>
          {venues && venues.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#008751] hover:bg-[#007345] border border-[#006e42] shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Invite a Venue
              </button>
            </div>
          )}
        </div>

        <InviteVenueModal
          venues={venues}
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-xs font-mono text-[#111111]/60">
          Showing <span className="font-bold text-[#111111] font-mono">{claims.length}</span> record{claims.length === 1 ? '' : 's'}
        </div>
        {venues && venues.length > 0 && (
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#008751] hover:bg-[#007345] border border-[#006e42] shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008751]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Invite Venue
          </button>
        )}
      </div>

      <div className="bg-white border-2 border-[#111111]/20 rounded-lg shadow-[2px_2px_0px_rgba(1,5,40,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F1ECE1]/50 text-[#111111]/70 font-mono font-bold text-[10px] uppercase tracking-wider border-b border-[#111111]/15">
              <tr>
                <th className="px-4 py-3">Venue & Category</th>
                <th className="px-4 py-3">Claimant Contact</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Notes & Evidence</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/10">
              {claims.map((claim: ClaimWithVenue) => {
                const dateStr = new Date(claim.claimed_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={claim.id} className="hover:bg-[#FAF8F8] transition-colors">
                    {/* Venue info */}
                    <td className="px-4 py-3.5">
                      <div className="font-display font-bold text-sm text-[#111111]">
                        {claim.venue_name}
                      </div>
                      <div className="text-[11px] font-mono text-[#111111]/60 flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize">{claim.venue_category}</span>
                        <span>·</span>
                        <Link
                          href={`/venue/${claim.venue_id}`}
                          target="_blank"
                          className="text-[#008751] hover:underline inline-flex items-center gap-0.5 font-bold"
                        >
                          View Listing <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </td>

                    {/* Claimant Contact */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-[#111111] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#111111]/40" />
                        {claim.claimant_name || 'Anonymous User'}
                      </div>
                      <div className="space-y-0.5 mt-1 font-mono text-[11px]">
                        {claim.claimant_phone && (
                          <a
                            href={`tel:${claim.claimant_phone}`}
                            className="text-[#111111]/70 hover:text-[#008751] flex items-center gap-1"
                          >
                            <Phone className="w-2.5 h-2.5 text-[#111111]/40" />
                            {claim.claimant_phone}
                          </a>
                        )}
                        {claim.claimant_email && (
                          <a
                            href={`mailto:${claim.claimant_email}`}
                            className="text-[#111111]/70 hover:text-[#008751] flex items-center gap-1"
                          >
                            <Mail className="w-2.5 h-2.5 text-[#111111]/40" />
                            {claim.claimant_email}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111111]/5 border border-[#111111]/15 text-[#111111] capitalize">
                        {claim.claimant_role || 'Owner'}
                      </span>
                    </td>

                    {/* Notes & Evidence */}
                    <td className="px-4 py-3.5 max-w-xs">
                      {claim.relationship_notes ? (
                        <p className="text-[#111111]/80 line-clamp-2 italic text-xs">
                          &quot;{claim.relationship_notes}&quot;
                        </p>
                      ) : (
                        <span className="text-[#111111]/40 font-mono text-[11px]">No additional note</span>
                      )}
                      {claim.admin_notes && (
                        <div className="mt-1 text-[10px] font-mono text-amber-900 bg-amber-50 rounded px-2 py-0.5 border border-amber-300">
                          <span className="font-bold">Internal:</span> {claim.admin_notes}
                        </div>
                      )}
                    </td>

                    {/* Submission Date / Invitation Funnel */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-[#111111]/60 font-mono text-xs">
                      {['invited', 'opened', 'authenticated'].includes(claim.status) ? (
                        <div className="space-y-1 text-[11px]">
                          <div className="flex items-center gap-1 text-[#111111]/80">
                            <Send className="w-3 h-3 text-purple-600" />
                            <span>
                              Sent:{' '}
                              {claim.invitation_sent_at
                                ? new Date(claim.invitation_sent_at).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                  })
                                : dateStr}
                            </span>
                          </div>
                          {claim.invitation_opened_at && (
                            <div className="flex items-center gap-1 text-indigo-700 font-bold">
                              <ExternalLink className="w-3 h-3 text-indigo-600" />
                              <span>
                                Opened:{' '}
                                {new Date(claim.invitation_opened_at).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          )}
                          {claim.token_expires_at && (
                            <div className="flex items-center gap-1 text-[#111111]/40">
                              <Clock className="w-3 h-3" />
                              <span>
                                Expires:{' '}
                                {new Date(claim.token_expires_at).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#111111]/40" />
                          {dateStr}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {claim.status === 'approved' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#008751]/10 text-[#008751] border border-[#008751]/30">
                          <CheckCircle2 className="w-3 h-3 text-[#008751]" /> Approved
                        </span>
                      )}
                      {claim.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F6C642]/20 text-[#92400E] border border-[#F6C642]/60">
                          <Clock className="w-3 h-3 text-[#92400E]" /> Pending Review
                        </span>
                      )}
                      {claim.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#D72638]/10 text-[#D72638] border border-[#D72638]/30">
                          <XCircle className="w-3 h-3 text-[#D72638]" /> Rejected
                        </span>
                      )}
                      {claim.status === 'needs_more_information' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#004B8E]/10 text-[#004B8E] border border-[#004B8E]/30">
                          <HelpCircle className="w-3 h-3 text-[#004B8E]" /> Needs Info
                        </span>
                      )}
                      {claim.status === 'invited' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                          <Send className="w-3 h-3 text-purple-600" /> Invited
                        </span>
                      )}
                      {claim.status === 'opened' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <ExternalLink className="w-3 h-3 text-indigo-600" /> Link Opened
                        </span>
                      )}
                      {claim.status === 'authenticated' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 border border-cyan-200">
                          <CheckCircle2 className="w-3 h-3 text-cyan-600" /> Authenticated
                        </span>
                      )}
                      {claim.status === 'revoked' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111111]/5 text-[#111111]/60 border border-[#111111]/15">
                          Revoked
                        </span>
                      )}
                      {claim.status === 'expired' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111111]/5 text-[#111111]/60 border border-[#111111]/15">
                          Expired
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {['invited', 'opened', 'authenticated'].includes(claim.status) ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeInvitation(claim.id)}
                          disabled={revokingClaimId === claim.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider text-[#D72638] bg-red-50 hover:bg-red-100 border border-[#D72638]/30 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {revokingClaimId === claim.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <XCircle className="w-3 h-3 text-[#D72638]" />
                          )}
                          Revoke Invite
                        </button>
                      ) : claim.status === 'pending' || claim.status === 'needs_more_information' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAction(claim.id, 'approve')}
                            className="bg-[#008751] hover:bg-[#007043] text-white px-2.5 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider border border-[#006e42] shadow-[1px_1px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAction(claim.id, 'request_info')}
                            className="bg-white hover:bg-[#FAF8F8] text-[#111111] px-2.5 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider border border-[#111111]/20 shadow-[1px_1px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
                          >
                            Request Info
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAction(claim.id, 'reject')}
                            className="bg-red-50 hover:bg-red-100 text-[#D72638] px-2.5 py-1.5 rounded text-xs font-mono font-bold uppercase tracking-wider border border-[#D72638]/30 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAction(claim.id, 'approve')}
                          className="text-[#111111]/50 hover:text-[#111111] text-xs font-mono font-bold underline transition-colors cursor-pointer"
                        >
                          Modify
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Action Modal */}
      {modalMode && selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#111111] rounded-lg max-w-lg w-full p-6 shadow-[8px_8px_0px_#111111] space-y-4">
            <div className="flex items-start justify-between border-b border-[#111111]/10 pb-3">
              <div>
                <h3 className="font-display font-black text-[#111111] text-base uppercase tracking-wider">
                  {modalMode === 'approve' && 'Approve Venue Claim'}
                  {modalMode === 'reject' && 'Reject Venue Claim'}
                  {modalMode === 'request_info' && 'Request More Information'}
                </h3>
                <p className="text-xs font-mono text-[#111111]/60 mt-0.5">
                  {selectedClaim.venue_name} · Claimant: {selectedClaim.claimant_name}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-[#111111]/50 hover:text-[#111111] text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div className={`p-3 rounded text-xs font-mono font-bold flex items-center gap-2 border ${
                feedback.type === 'success' ? 'bg-[#008751]/10 text-[#008751] border-[#008751]/30' : 'bg-red-50 text-[#D72638] border-[#D72638]/30'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleSubmitAction} className="space-y-4">
              {modalMode === 'approve' && (
                <div className="bg-[#008751]/10 border border-[#008751]/30 rounded p-3.5 text-xs text-[#008751] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#008751]" /> Confirm Partner Grant
                  </div>
                  <p className="font-medium text-[#111111]/80">
                    Approving this claim links <strong>{selectedClaim.claimant_name}</strong> ({selectedClaim.claimant_email}) as an authorized partner for <strong>{selectedClaim.venue_name}</strong> and elevates their role to venue operator.
                  </p>
                </div>
              )}

              {modalMode === 'reject' && (
                <div>
                  <label className="block text-[11px] font-mono font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Could not verify business affiliation with provided phone number"
                    className="w-full px-3 py-2 bg-[#FAF8F8] border-2 border-[#111111]/20 rounded text-xs font-mono text-[#111111] focus:outline-none focus:border-[#D72638] focus:ring-1 focus:ring-[#D72638]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono font-bold text-[#111111] uppercase tracking-wider mb-1">
                  {modalMode === 'request_info' ? 'Questions / Information Needed' : 'Internal Admin Notes'}
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                  placeholder={
                    modalMode === 'request_info'
                      ? 'Specify what documentation or verification is needed from the manager...'
                      : 'Audit notes visible to OyaPlan staff...'
                  }
                  className="w-full px-3 py-2 bg-[#FAF8F8] border-2 border-[#111111]/20 rounded text-xs font-mono text-[#111111] focus:outline-none focus:border-[#008751] focus:ring-1 focus:ring-[#008751]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded text-xs font-mono font-bold text-[#111111]/70 hover:bg-[#FAF8F8] border border-[#111111]/20 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`px-5 py-2.5 rounded text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5 shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer ${
                    modalMode === 'reject'
                      ? 'bg-[#D72638] hover:bg-[#b51f2e] border border-[#b51f2e]'
                      : 'bg-[#008751] hover:bg-[#007043] border border-[#006e42]'
                  }`}
                >
                  {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Invite Venue Modal */}
      <InviteVenueModal
        venues={venues}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </>
  );
}
