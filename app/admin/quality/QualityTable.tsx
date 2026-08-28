"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { DataQualityIssue, QualityCategory } from "@/lib/admin/types";
import { 
  ShieldAlert, 
  Sparkles, 
  Navigation, 
  DollarSign, 
  PlusCircle, 
  ImageIcon, 
  ExternalLink,
  SlidersHorizontal,
  CheckCircle2
} from "lucide-react";
import EvidenceModal from "./EvidenceModal";
import SetImageModal from "./SetImageModal";

interface QualityTableProps {
  issues: DataQualityIssue[];
}

type FilterCategory = "all" | "trust_risk" | "transport_risk" | "spend_discrepancy" | "experience_quality";

export default function QualityTable({ issues }: QualityTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [evidenceIssue, setEvidenceIssue] = useState<DataQualityIssue | null>(null);
  const [imageIssue, setImageIssue] = useState<DataQualityIssue | null>(null);

  const counts = useMemo(() => {
    return {
      all: issues.length,
      trust_risk: issues.filter((i) => i.category === "trust_risk").length,
      transport_risk: issues.filter((i) => i.category === "transport_risk").length,
      spend_discrepancy: issues.filter((i) => i.category === "spend_discrepancy").length,
      experience_quality: issues.filter((i) => i.category === "experience_quality").length,
    };
  }, [issues]);

  const filteredIssues = useMemo(() => {
    if (selectedCategory === "all") return issues;
    return issues.filter((i) => i.category === selectedCategory);
  }, [issues, selectedCategory]);

  const columns: Column<DataQualityIssue>[] = [
    {
      header: "Priority",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <StatusBadge
            status={row.severity}
            type={
              row.severity === "critical"
                ? "error"
                : row.severity === "high"
                ? "warning"
                : row.severity === "medium"
                ? "info"
                : "default"
            }
          />
        </div>
      ),
    },
    {
      header: "Issue",
      cell: (row) => (
        <div className="flex items-start gap-2.5">
          {row.category === "trust_risk" ? (
            <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          ) : row.category === "transport_risk" ? (
            <Navigation className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          ) : row.category === "spend_discrepancy" ? (
            <DollarSign className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          )}
          <div>
            <div className="font-bold text-gray-900 leading-tight">
              {row.issue_type === "NO_PRICE_EVIDENCE"
                ? "Price has no evidence"
                : row.issue_type === "TRANSPORT_GAP"
                ? "Transport matrix missing"
                : row.issue_type === "ACTUAL_SPEND_MISMATCH"
                ? "Actual spend differs"
                : row.issue_type === "MISSING_HERO"
                ? "Hero image missing"
                : row.issue_type.replace(/_/g, " ")}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mt-0.5">
              {row.category === "trust_risk"
                ? "Price Trust (P0)"
                : row.category === "transport_risk"
                ? "Transport Trust (P1)"
                : row.category === "spend_discrepancy"
                ? "Actual Spend (P1)"
                : "Experience Quality (P2)"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Customer Trust Impact",
      cell: (row) => (
        <div className="max-w-sm">
          <div className="text-xs font-semibold text-gray-800 leading-snug">
            {row.impact_description}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5 truncate">
            {row.reason}
          </div>
        </div>
      ),
    },
    {
      header: "Venue & Area",
      cell: (row) => (
        <div>
          <div className="font-bold text-gray-900">
            {row.venue_id ? (
              <Link 
                href={`/admin/venues/${row.venue_id}`}
                className="hover:text-[#008751] hover:underline inline-flex items-center gap-1"
              >
                <span>{row.venue_name || "System"}</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </Link>
            ) : (
              row.venue_name || "System"
            )}
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            {row.area_name || "Lagos"}
            {row.price_per_person ? ` • ₦${row.price_per_person.toLocaleString()}` : ""}
          </div>
        </div>
      ),
    },
    {
      header: "Action",
      cell: (row) =>
        row.venue_id ? (
          <div className="flex items-center gap-2">
            {row.issue_type === "NO_PRICE_EVIDENCE" || row.issue_type === "UNVERIFIED_PRICE_SOURCE" || row.issue_type === "LOW_CONFIDENCE" ? (
              <button
                type="button"
                onClick={() => setEvidenceIssue(row)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#008751] hover:bg-[#007043] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Evidence</span>
              </button>
            ) : row.issue_type === "MISSING_HERO" ? (
              <button
                type="button"
                onClick={() => setImageIssue(row)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Set Image</span>
              </button>
            ) : row.issue_type === "TRANSPORT_GAP" ? (
              <Link
                href={`/admin/venues/${row.venue_id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Fix Transport</span>
              </Link>
            ) : (
              <Link
                href={`/admin/venues/${row.venue_id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                <span>Inspect</span>
              </Link>
            )}
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: "all", label: "All Issues", count: counts.all },
          { id: "trust_risk", label: "Price Trust (P0)", count: counts.trust_risk },
          { id: "transport_risk", label: "Transport Trust (P1)", count: counts.transport_risk },
          { id: "spend_discrepancy", label: "Actual Spend (P1)", count: counts.spend_discrepancy },
          { id: "experience_quality", label: "Media Quality (P2)", count: counts.experience_quality },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id as FilterCategory)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none shrink-0 ${
                isActive
                  ? "bg-[#008751] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-white text-gray-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={filteredIssues}
        searchPlaceholder="Search detected trust issues or venues..."
        emptyTitle="100% Data Trust Verified!"
        emptyDescription="All published venues meet decision reliability benchmarks."
      />

      {/* Evidence Verification Modal */}
      {evidenceIssue && (
        <EvidenceModal
          issue={evidenceIssue}
          onClose={() => setEvidenceIssue(null)}
        />
      )}

      {/* Hero Image Modal */}
      {imageIssue && (
        <SetImageModal
          issue={imageIssue}
          onClose={() => setImageIssue(null)}
        />
      )}
    </div>
  );
}
