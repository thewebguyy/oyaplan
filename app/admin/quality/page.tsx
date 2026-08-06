import React from "react";
import Link from "next/link";
import { QualityService } from "@/lib/admin/services/qualityService";
import PageHeader from "@/components/admin/PageHeader";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { QualityCheckItem } from "@/lib/admin/types";
import { Edit2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminQualityPage() {
  const issues = await QualityService.getChecklist();

  const columns: Column<QualityCheckItem>[] = [
    {
      header: "Issue Type",
      cell: (row) => (
        <span className="font-bold text-gray-900 flex items-center gap-2">
          <span>⚠️</span>
          <span>{row.issue_type}</span>
        </span>
      ),
    },
    {
      header: "Venue",
      accessorKey: "venue_name",
    },
    {
      header: "Area",
      accessorKey: "area_name",
    },
    {
      header: "Severity",
      cell: (row) => <StatusBadge status={row.severity} type={row.severity === "high" ? "error" : "warning"} />,
    },
    {
      header: "Action",
      cell: (row) => (
        <Link
          href={`/admin/venues/${row.venue_id}`}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-[#008751] hover:text-white rounded-lg text-xs font-bold transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          <span>Fix Issue</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Quality Checklist"
        description={`Surfacing ${issues.length} operational health issues across the catalog.`}
      />

      <DataTable
        columns={columns}
        data={issues}
        searchPlaceholder="Search quality issues..."
        emptyTitle="100% Data Quality Verified!"
        emptyDescription="All published venues meet data quality benchmarks."
      />
    </div>
  );
}
