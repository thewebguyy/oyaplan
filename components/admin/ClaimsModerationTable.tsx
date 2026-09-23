'use client';

import React, { useState } from 'react';
import { VenueClaim } from '@/lib/types';
import { reviewVenueClaimAction } from '@/lib/actions/venueClaimActions';
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
  AlertCircle 
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
}

export function ClaimsModerationTable({ claims }: ClaimsModerationTableProps) {
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'reject' | 'request_info' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedClaim = claims.find(c => c.id === activeClaimId);

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
      <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500">
        <Building2 className="w-12 h-12 stroke-[1.5] text-stone-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-stone-800">No claims found</h3>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          No venue operator claims match the selected filter criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Venue & Category</th>
                <th className="px-5 py-3.5">Claimant Contact</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Notes & Evidence</th>
                <th className="px-5 py-3.5">Submitted</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {claims.map((claim) => {
                const dateStr = new Date(claim.claimed_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={claim.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Venue info */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-stone-900 text-sm">
                        {claim.venue_name}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <span className="capitalize">{claim.venue_category}</span>
                        <span>·</span>
                        <Link
                          href={`/venue/${claim.venue_id}`}
                          target="_blank"
                          className="text-[#008751] hover:underline inline-flex items-center gap-0.5"
                        >
                          View Listing <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </td>

                    {/* Claimant Contact */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-stone-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {claim.claimant_name || 'Anonymous User'}
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {claim.claimant_phone && (
                          <a
                            href={`tel:${claim.claimant_phone}`}
                            className="text-[11px] text-stone-600 hover:text-[#008751] flex items-center gap-1"
                          >
                            <Phone className="w-2.5 h-2.5 text-stone-400" />
                            {claim.claimant_phone}
                          </a>
                        )}
                        {claim.claimant_email && (
                          <a
                            href={`mailto:${claim.claimant_email}`}
                            className="text-[11px] text-stone-600 hover:text-[#008751] flex items-center gap-1"
                          >
                            <Mail className="w-2.5 h-2.5 text-stone-400" />
                            {claim.claimant_email}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 capitalize">
                        {claim.claimant_role || 'Owner'}
                      </span>
                    </td>

                    {/* Notes & Evidence */}
                    <td className="px-5 py-4 max-w-xs">
                      {claim.relationship_notes ? (
                        <p className="text-stone-700 line-clamp-2 italic text-[11px]">
                          "{claim.relationship_notes}"
                        </p>
                      ) : (
                        <span className="text-stone-400 text-[11px]">No additional note</span>
                      )}
                      {claim.admin_notes && (
                        <div className="mt-1 text-[10px] text-amber-800 bg-amber-50 rounded px-1.5 py-0.5 border border-amber-200">
                          <span className="font-semibold">Internal:</span> {claim.admin_notes}
                        </div>
                      )}
                    </td>

                    {/* Submission Date */}
                    <td className="px-5 py-4 whitespace-nowrap text-stone-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {dateStr}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {claim.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                        </span>
                      )}
                      {claim.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                        </span>
                      )}
                      {claim.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3 text-rose-600" /> Rejected
                        </span>
                      )}
                      {claim.status === 'needs_more_information' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                          <HelpCircle className="w-3 h-3 text-blue-600" /> Needs Info
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {claim.status === 'pending' || claim.status === 'needs_more_information' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAction(claim.id, 'approve')}
                            className="bg-[#008751] hover:bg-[#007043] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAction(claim.id, 'request_info')}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Request Info
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAction(claim.id, 'reject')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenAction(claim.id, 'approve')}
                          className="text-stone-400 hover:text-stone-700 text-xs font-medium"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base capitalize">
                  {modalMode === 'approve' && 'Approve Venue Claim'}
                  {modalMode === 'reject' && 'Reject Venue Claim'}
                  {modalMode === 'request_info' && 'Request More Information'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {selectedClaim.venue_name} · Claimant: {selectedClaim.claimant_name}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-stone-400 hover:text-stone-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleSubmitAction} className="space-y-4">
              {modalMode === 'approve' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#008751]" /> Confirm Partner Grant
                  </div>
                  <p>
                    Approving this claim links <strong>{selectedClaim.claimant_name}</strong> ({selectedClaim.claimant_email}) as an authorized partner for <strong>{selectedClaim.venue_name}</strong> and elevates their role to venue operator.
                  </p>
                </div>
              )}

              {modalMode === 'reject' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Could not verify business affiliation with provided phone number"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  {modalMode === 'request_info' ? 'Questions / Information Needed' : 'Internal Admin Notes'}
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    modalMode === 'request_info'
                      ? 'Specify what documentation or verification is needed from the manager...'
                      : 'Audit notes visible to OyaPlan staff...'
                  }
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#008751]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-colors ${
                    modalMode === 'reject'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-[#008751] hover:bg-[#007043]'
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
    </>
  );
}
