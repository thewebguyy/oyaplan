import React from "react";
import { QualityService } from "@/lib/admin/services/qualityService";
import MetricCard from "@/components/admin/MetricCard";
import QualityTable from "./QualityTable";
import { ShieldCheck, Database, CheckCircle2, Navigation, AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminQualityPage() {
  const [metrics, issues] = await Promise.all([
    QualityService.getTrustHealthMetrics(),
    QualityService.getChecklist(),
  ]);

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const highCount = issues.filter((i) => i.severity === "high").length;
  const mediumCount = issues.filter((i) => i.severity === "medium").length;

  return (
    <div className="space-y-6">
      {/* Cockpit Header Banner */}
      <div className="bg-[#111827] text-white p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#008751] flex items-center justify-center text-white font-black text-sm">
                🛡️
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Trust Operations Cockpit
              </h1>
            </div>
            <p className="text-xs text-white/70">
              Operational control surface for OyaPlan’s core promise: <em className="text-white font-medium">“Can I trust what OyaPlan says I’ll spend?”</em>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-white/90">
                {metrics.totalSpots} venues scanned
              </div>
              <div className="text-[10px] text-white/50">
                Live Trust Rules Active
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Triage Summary Status Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>{criticalCount} Critical</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{highCount} High</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{mediumCount} Medium</span>
          </div>
          <span className="text-[11px] text-white/40 ml-2">
            Priority: Customer exposure × Trust risk
          </span>
        </div>
      </div>

      {/* Trust Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Price Evidence Provenance"
          value={`${metrics.evidenceCoveragePct}%`}
          subtext="Verified evidence records"
          icon={<ShieldCheck className="w-5 h-5 text-[#008751]" />}
        />
        <MetricCard
          label="Price Baseline Coverage"
          value={`${metrics.priceCoveragePct}%`}
          subtext={`${metrics.totalSpots} venues with prices`}
          icon={<Database className="w-5 h-5" />}
        />
        <MetricCard
          label="Owner Direct Verified"
          value={`${metrics.verifiedPct}%`}
          subtext="Verified by venue manager"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <MetricCard
          label="Transport Matrix Coverage"
          value={`${metrics.transportCoveragePct}%`}
          subtext="Direct calibrated fare tables"
          icon={<Navigation className="w-5 h-5" />}
        />
      </div>

      {/* Trust Operations Queue Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
            Operational Risk Queue ({issues.length} Detected Issues)
          </h2>
        </div>

        <QualityTable issues={issues} />
      </div>
    </div>
  );
}
