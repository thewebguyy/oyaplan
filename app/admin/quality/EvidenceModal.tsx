"use client";

import React, { useState } from "react";
import { DataQualityIssue } from "@/lib/admin/types";
import { verifySpotAction } from "@/lib/actions/adminEvidenceActions";
import { X, ShieldCheck, FileText, Link as LinkIcon, DollarSign } from "lucide-react";

interface EvidenceModalProps {
  issue: DataQualityIssue | null;
  onClose: () => void;
}

export default function EvidenceModal({ issue, onClose }: EvidenceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceType, setSourceType] = useState("official_website");
  const [price, setPrice] = useState<number>(issue?.price_per_person || 15000);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [notes, setNotes] = useState("");

  if (!issue || !issue.venue_id) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("id", issue.venue_id!);
    formData.append("price_per_person", price.toString());
    formData.append("price_source", sourceType);
    formData.append("evidence_url", evidenceUrl);
    formData.append("verified_by", "owner_verified");
    if (notes) formData.append("notes", notes);

    try {
      await verifySpotAction(formData);
      onClose();
    } catch (err) {
      console.error("Failed to verify evidence:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#111827] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#008751] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Add Price Evidence
              </h3>
              <p className="text-xs text-white/70 truncate max-w-[280px]">
                {issue.venue_name} • {issue.area_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <strong className="font-bold">Trust Risk:</strong> {issue.impact_description}. Submitting verified evidence establishes pricing provenance and clears this critical queue item.
            </div>
          </div>

          {/* Typical Price Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Typical Price Per Person (₦)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold text-xs">
                ₦
              </div>
              <input
                type="number"
                required
                min={500}
                step={500}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Source Type Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Evidence Source Type
            </label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none bg-white"
            >
              <option value="official_website">Official Website / Online Menu</option>
              <option value="menu_photo">Menu Photo (Physical / Social)</option>
              <option value="receipt">Customer Receipt</option>
              <option value="scout_verified">On-Ground Scout Verification</option>
              <option value="owner_confirmation">Direct Venue Confirmation</option>
            </select>
          </div>

          {/* Evidence URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Evidence URL or Document Link
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <LinkIcon className="w-3.5 h-3.5" />
              </div>
              <input
                type="url"
                placeholder="https://instagram.com/... or https://menu.pdf"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Verification Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Menu price checked on official Instagram highlight on Aug 2026"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#008751] hover:bg-[#007043] shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Verifying..." : "Confirm & Mark Verified"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
