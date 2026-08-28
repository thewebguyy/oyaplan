"use client";

import React, { useState } from "react";
import { DataQualityIssue } from "@/lib/admin/types";
import { verifySpotAction } from "@/lib/actions/adminEvidenceActions";
import { X, ShieldCheck, Link as LinkIcon, CheckCircle2, Camera, Receipt, UserCheck, Building } from "lucide-react";

interface EvidenceModalProps {
  issue: DataQualityIssue | null;
  onClose: () => void;
}

const SOURCES = [
  { id: "official_website", label: "Official Website", icon: Building, desc: "Website or verified link" },
  { id: "menu_photo", label: "Menu Photo", icon: Camera, desc: "Photo of bill or physical menu" },
  { id: "receipt", label: "Receipt", icon: Receipt, desc: "Customer paid receipt" },
  { id: "scout_verified", label: "Scout On-Ground", icon: UserCheck, desc: "Scout visited in person" },
  { id: "owner_confirmation", label: "Owner Direct", icon: CheckCircle2, desc: "Manager confirmed" },
];

export default function EvidenceModal({ issue, onClose }: EvidenceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceType, setSourceType] = useState("official_website");
  const [price, setPrice] = useState<number>(issue?.price_per_person || 15000);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!issue || !issue.venue_id) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (price <= 0) {
      setError("Please enter a valid price amount greater than ₦0.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("id", issue.venue_id!);
    formData.append("price_per_person", price.toString());
    formData.append("price_source", sourceType);
    if (evidenceUrl.trim()) formData.append("evidence_url", evidenceUrl.trim());
    if (notes.trim()) formData.append("notes", notes.trim());

    try {
      await verifySpotAction(formData);
      onClose();
    } catch (err: unknown) {
      console.error("Failed to verify evidence:", err);
      setError(err instanceof Error ? err.message : "Failed to record verified price evidence.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#111827] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#008751] flex items-center justify-center text-white font-black text-sm shadow-inner">
              🛡️
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#FCC630] font-bold">
                Trust Operations • Price Verification
              </div>
              <h3 className="text-base font-black tracking-tight text-white truncate max-w-[300px]">
                {issue.venue_name}
              </h3>
              <p className="text-xs text-white/70">
                {issue.area_name} • Current Estimate: <strong className="text-white font-bold">₦{(issue.price_per_person || price).toLocaleString()}</strong> / person
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Price Verification & Adjustment */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Verified Typical Spend Per Person (₦)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-extrabold text-sm">
                ₦
              </div>
              <input
                type="number"
                required
                min={500}
                max={50000000}
                step={500}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-base font-black text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Adjust if the verified evidence proves a different typical cost per person.
            </p>
          </div>

          {/* Source Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
              What supports this price?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SOURCES.map((s) => {
                const Icon = s.icon;
                const isSelected = sourceType === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSourceType(s.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-[#008751] bg-[#008751]/5 ring-1 ring-[#008751]"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-[#008751]" : "text-gray-400"}`} />
                    <div className="min-w-0">
                      <div className={`text-xs font-bold ${isSelected ? "text-[#008751]" : "text-gray-800"}`}>
                        {s.label}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {s.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence URL / Document */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Evidence Link or Document URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <LinkIcon className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="https://instagram.com/p/... or menu image link"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Verification Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
              Verification Context & Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Verified 2-course meal & drinks pricing from active August 2026 menu."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#008751] focus:border-transparent outline-none resize-none transition-all"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || price <= 0}
                className="px-6 py-2.5 rounded-xl text-xs font-black text-white bg-[#008751] hover:bg-[#007043] shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? "Recording Audit..." : `Verify ₦${price.toLocaleString()}`}</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center">
              Attaches verified evidence to the venue record and logs immutable audit trail.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
