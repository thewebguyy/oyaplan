import React from "react";
import { QualityService } from "@/lib/admin/services/qualityService";
import PageHeader from "@/components/admin/PageHeader";
import MetricCard from "@/components/admin/MetricCard";
import QualityTable from "./QualityTable";
import { ShieldCheck, Database, CheckCircle2, Navigation } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminQualityPage() {
  const [metrics, issues] = await Promise.all([
    QualityService.getTrustHealthMetrics(),
    QualityService.getChecklist(),
  ]);

  const trustRiskCount = issues.filter((i) => i.category === "trust_risk").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trust Operations Queue"
        description="Monitoring decision reliability, pricing provenance, and catalog data completeness."
      />

      {/* Trust Health Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Price Coverage"
          value={`${metrics.priceCoveragePct}%`}
          subtext={`${metrics.totalSpots} spots with prices`}
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <MetricCard
          label="Price Provenance"
          value={`${metrics.priceProvenancePct}%`}
          subtext="Documented price sources"
          icon={<Database className="w-5 h-5" />}
        />
        <MetricCard
          label="Owner Verified"
          value={`${metrics.verifiedPct}%`}
          subtext="Verified by venue owner"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <MetricCard
          label="Transport Coverage"
          value={`${metrics.transportCoveragePct}%`}
          subtext="Valid fare matrices"
          icon={<Navigation className="w-5 h-5" />}
        />
      </div>

      {/* Actionable Trust Operations Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Actionable Trust Queue ({issues.length} items • {trustRiskCount} Trust Risks)
          </h2>
        </div>

        <QualityTable issues={issues} />
      </div>
    </div>
  );
}
