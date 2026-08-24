"use client";

import React from "react";
import Link from "next/link";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { DataQualityIssue } from "@/lib/admin/types";
import { Edit2, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";
import { quickVerifySpotAction } from "@/lib/actions/adminEvidenceActions";

interface QualityTableProps {
  issues: DataQualityIssue[];
}

export default function QualityTable({ issues }: QualityTableProps) {
  const columns: Column<DataQualityIssue>[] = [
    {
      header: "Category & Issue",
      cell: (row) => (
        <div className="flex items-start gap-2.5">
          {row.category === "trust_risk" ? (
            <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          )}
          <div>
            <div className="font-bold text-gray-900 leading-tight">
              {row.issue_type.replace(/_/g, " ")}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">
              {row.category === "trust_risk" ? "Trust Risk" : "Experience Quality"}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Venue & Area",
      cell: (row) => (
        <div>
          <div className="font-bold text-gray-900">{row.venue_name || "System"}</div>
          <div className="text-[11px] text-gray-400">{row.area_name || "Lagos"}</div>
        </div>
      ),
    },
    {
      header: "Provenance / Details",
      cell: (row) => (
        <div className="max-w-xs">
          <div className="text-xs text-gray-700 leading-snug truncate">{row.reason}</div>
          {row.price_source && (
            <div className="text-[10px] font-mono text-gray-400 mt-0.5">
              source: {row.price_source} ({row.verified_by || "seed"})
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Severity",
      cell: (row) => (
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
      ),
    },
    {
      header: "Action",
      cell: (row) =>
        row.venue_id ? (
          <div className="flex items-center gap-2">
            {row.issue_type === "UNVERIFIED_PRICE_SOURCE" && (
              <form action={quickVerifySpotAction}>
                <input type="hidden" name="id" value={row.venue_id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#008751] hover:bg-[#007043] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                  title="Quick Verify Spot"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verify</span>
                </button>
              </form>
            )}
            <Link
              href={`/admin/venues/${row.venue_id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              <span>Fix Spot</span>
            </Link>
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={issues}
      searchPlaceholder="Search trust issues or venues..."
      emptyTitle="100% Data Trust Verified!"
      emptyDescription="All published venues meet decision reliability benchmarks."
    />
  );
}
