"use client";

import { useState, useTransition } from "react";
import { moderateEvidenceAction } from "@/lib/actions/moderateEvidence";
import { Loader2, Check, X, FileText } from "lucide-react";

export interface PendingEvidenceItem {
  id: string;
  source_type: string;
  recorded_price: number;
  evidence_url: string | null;
  created_at: string;
  submitted_by: string;
  venues: { name: string } | null;
  menu_items: { name: string } | null;
}

interface ModerationTableProps {
  pendingEvidence: PendingEvidenceItem[];
}

export default function ModerationTable({ pendingEvidence }: ModerationTableProps) {
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAction = (evidenceId: string, action: "approve" | "reject") => {
    setProcessingId(evidenceId);
    setErrorMsg(null);
    startTransition(async () => {
      const res = await moderateEvidenceAction(evidenceId, action);
      setProcessingId(null);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to process request.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900">Pending Ingestion Moderation Queue</h2>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black uppercase rounded-full">
          {pendingEvidence.length} items require review
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] uppercase text-gray-400 bg-gray-50 font-black tracking-widest border-b border-gray-100">
              <th className="px-6 py-3">Submission Details</th>
              <th className="px-6 py-3">Venue / Item</th>
              <th className="px-6 py-3">Source</th>
              <th className="px-6 py-3 text-right">Proposed Price</th>
              <th className="px-6 py-3 text-center">Attachments</th>
              <th className="px-6 py-3 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pendingEvidence.map((ev) => (
              <tr key={ev.id} className="text-sm font-medium">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{ev.submitted_by}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {new Date(ev.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-[#008751]">{ev.venues?.name || "Unknown Venue"}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{ev.menu_items?.name || "Unknown Item"}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase">
                    {ev.source_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-mono font-bold text-gray-900">
                  ₦{ev.recorded_price.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  {ev.evidence_url ? (
                    <a
                      href={ev.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition text-xs font-bold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Proof
                    </a>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      disabled={isPending && processingId === ev.id}
                      onClick={() => handleAction(ev.id, "approve")}
                      className="inline-flex items-center justify-center p-1.5 bg-green-50 text-[#008751] border border-green-100 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                      title="Approve Submission"
                    >
                      {isPending && processingId === ev.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      disabled={isPending && processingId === ev.id}
                      onClick={() => handleAction(ev.id, "reject")}
                      className="inline-flex items-center justify-center p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                      title="Reject Submission"
                    >
                      {isPending && processingId === ev.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingEvidence.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                  Ingestion queue is clear. No pending price evidence uploads require moderation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
