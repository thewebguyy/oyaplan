import React from "react";
import { UsageService } from "@/lib/admin/services/usageService";
import { CeoAnalyticsService } from "@/lib/admin/services/ceoAnalyticsService";
import PageHeader from "@/components/admin/PageHeader";
import MetricCard from "@/components/admin/MetricCard";
import CeoDashboardMetrics from "@/components/admin/CeoDashboardMetrics";
import UsageTable from "./UsageTable";
import { Users, BarChart3, UserX, Ghost, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const [usage, executiveMetrics] = await Promise.all([
    UsageService.getAccountUsage(params.search),
    CeoAnalyticsService.getExecutiveMetrics()
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="CEO Control & Usage Report"
        description="Core launch funnel conversion, virality metrics, and account usage breakdown."
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

      {/* CEO Executive Funnel */}
      <CeoDashboardMetrics metrics={executiveMetrics} />

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
      <UsageTable accounts={usage.accounts} />
    </div>
  );
}
