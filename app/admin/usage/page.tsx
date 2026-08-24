import React from "react";
import { UsageService } from "@/lib/admin/services/usageService";
import PageHeader from "@/components/admin/PageHeader";
import MetricCard from "@/components/admin/MetricCard";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { AccountUsageRow } from "@/lib/admin/types";
import { Users, BarChart3, UserX, Ghost, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const usage = await UsageService.getAccountUsage(params.search);

  const columns: Column<AccountUsageRow>[] = [
    {
      header: "User",
      cell: (row) => (
        <div>
          <div className="font-bold text-gray-900 truncate max-w-[200px]">{row.email}</div>
          {row.display_name !== row.email && (
            <div className="text-[11px] text-gray-400">{row.display_name}</div>
          )}
        </div>
      ),
    },
    {
      header: "Badge",
      cell: (row) =>
        row.profile_badge ? (
          <StatusBadge status={row.profile_badge.replace(/_/g, " ")} type="info" />
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      header: "Account Created",
      cell: (row) => (
        <span className="text-gray-500 font-mono text-[11px]">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Plans Generated",
      cell: (row) => (
        <span
          className={`font-extrabold text-sm ${
            row.plan_count === 0
              ? "text-gray-300"
              : row.plan_count >= 5
              ? "text-[#008751]"
              : "text-gray-900"
          }`}
        >
          {row.plan_count}
        </span>
      ),
    },
    {
      header: "Last Plan",
      cell: (row) => (
        <span className="text-gray-500 font-mono text-[11px]">
          {row.last_plan_at ? new Date(row.last_plan_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Usage Report"
        description="Accounts created and plans generated per account. Download as CSV for offline analysis."
        action={
          <a
            href="/api/v1/admin/usage-export"
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-xs rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </a>
        }
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Accounts"
          value={usage.totalAccounts}
          subtext="Registered users"
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          label="Total Plans Generated"
          value={usage.totalPlans}
          subtext="All-time (incl. anonymous)"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <MetricCard
          label="Accounts with 0 Plans"
          value={usage.accountsWithZeroPlans}
          subtext="Registered but never planned"
          icon={<UserX className="w-5 h-5" />}
        />
        <MetricCard
          label="Anonymous Plans"
          value={usage.anonymousPlansCount}
          subtext="Plans without an account"
          icon={<Ghost className="w-5 h-5" />}
        />
      </div>

      {/* Accounts × Plans Table */}
      <DataTable
        columns={columns}
        data={usage.accounts}
        searchPlaceholder="Search by email or display name..."
        emptyTitle="No accounts found"
        emptyDescription="No registered accounts to display."
      />
    </div>
  );
}
