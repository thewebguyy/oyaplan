import React from "react";
import { DashboardService } from "@/lib/admin/services/dashboardService";
import PageHeader from "@/components/admin/PageHeader";
import MetricCard from "@/components/admin/MetricCard";
import { ActivityService } from "@/lib/admin/services/activityService";
import StatusBadge from "@/components/admin/StatusBadge";
import { createServerClient } from "@/lib/supabase-server";
import { MapPin, Award, ImageIcon, FileSpreadsheet, Clock, ShieldCheck, Compass } from "lucide-react";

export const dynamic = "force-dynamic";

const BETA_AREA_SLUGS = ["ikeja", "yaba", "vi", "lekki-phase-1"];

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();

  const [metrics, recentActivity, { data: areas }] = await Promise.all([
    DashboardService.getMetrics(),
    ActivityService.getRecentActivity(5),
    supabase.from("areas").select("id, name, slug, active").order("name"),
  ]);

  const activeAreas = (areas || []).map((area) => {
    const isBetaLive = BETA_AREA_SLUGS.includes(area.slug);
    return {
      ...area,
      isBetaLive,
    };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="OyaPlan Control Center"
        description="Live operational numbers and system health overview."
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Venues"
          value={metrics.totalVenues}
          subtext={`${metrics.publishedVenues} Published • ${metrics.draftVenues} Draft`}
          href="/admin/venues"
          icon={<MapPin className="w-5 h-5" />}
        />
        <MetricCard
          label="Beta Users"
          value={metrics.betaUsersCount}
          subtext={`${metrics.pendingBetaApprovalsCount} Pending Approvals`}
          href="/admin/beta-users"
          icon={<Award className="w-5 h-5" />}
        />
        <MetricCard
          label="Pending Submissions"
          value={metrics.pendingSubmissionsCount}
          subtext="Scout & User submissions queue"
          href="/admin/submissions"
          icon={<FileSpreadsheet className="w-5 h-5" />}
        />
        <MetricCard
          label="Missing Images"
          value={metrics.venuesMissingImagesCount}
          subtext="Venues without hero images"
          href="/admin/media"
          icon={<ImageIcon className="w-5 h-5" />}
        />
      </div>

      {/* Primary Operational Checklist & Beta Coverage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quality Checklist */}
        <div className="bg-white border-2 border-[#111111]/20 rounded-lg p-6 shadow-[2px_2px_0px_rgba(1,5,40,0.06)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#111111]/10 pb-3">
            <h2 className="font-display font-black text-sm text-[#111111] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#008751]" /> Operational Checklist
            </h2>
            <span className="font-mono text-[10px] font-bold text-[#008751] px-2 py-0.5 bg-[#008751]/10 border border-[#008751]/30 rounded uppercase tracking-wider">
              Auto-Monitored
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 bg-[#FAF8F8] border border-[#111111]/10 rounded hover:bg-white hover:border-[#111111]/20 transition-all">
              <span className="font-mono text-xs font-bold text-[#111111]/80">Venues Missing Hero Image</span>
              <span className="font-mono font-black text-base text-[#D72638] tabular-nums">{metrics.venuesMissingImagesCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FAF8F8] border border-[#111111]/10 rounded hover:bg-white hover:border-[#111111]/20 transition-all">
              <span className="font-mono text-xs font-bold text-[#111111]/80">Venues Missing Price Range</span>
              <span className="font-mono font-black text-base text-[#B45309] tabular-nums">{metrics.venuesMissingPricesCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#FAF8F8] border border-[#111111]/10 rounded hover:bg-white hover:border-[#111111]/20 transition-all">
              <span className="font-mono text-xs font-bold text-[#111111]/80">Pending Scout Submissions</span>
              <span className="font-mono font-black text-base text-[#004B8E] tabular-nums">{metrics.pendingSubmissionsCount}</span>
            </div>
          </div>
        </div>

        {/* Beta Launch Coverage Gating */}
        <div className="bg-white border-2 border-[#111111]/20 rounded-lg p-6 shadow-[2px_2px_0px_rgba(1,5,40,0.06)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#111111]/10 pb-3">
            <h2 className="font-display font-black text-sm text-[#111111] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#008751]" /> Beta Launch Coverage
            </h2>
            <span className="font-mono text-[10px] font-bold text-[#111111]/60 px-2 py-0.5 bg-[#111111]/5 border border-[#111111]/10 rounded uppercase tracking-wider">
              Active Gate
            </span>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {activeAreas.map((area) => (
              <div key={area.id} className="flex items-center justify-between p-2.5 bg-[#FAF8F8] border border-[#111111]/10 rounded hover:bg-white hover:border-[#111111]/20 transition-all text-xs font-mono">
                <span className="font-bold text-[#111111]">{area.name}</span>
                <StatusBadge 
                  status={area.isBetaLive ? "Beta Active" : "Gated (Deactivated)"} 
                  type={area.isBetaLive ? "success" : "default"} 
                />
              </div>
            ))}
            {activeAreas.length === 0 && (
              <p className="font-mono text-gray-400 py-4 text-center text-xs">No coverage areas found in database.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Operational Activity Feed */}
      <div className="bg-white border-2 border-[#111111]/20 rounded-lg p-6 shadow-[2px_2px_0px_rgba(1,5,40,0.06)] space-y-4 max-w-4xl">
        <div className="flex items-center justify-between border-b border-[#111111]/10 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#008751]" />
            <h2 className="font-display font-black text-sm text-[#111111]">Recent Operational Activity Feed</h2>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#111111]/40">AUDIT LOG</span>
        </div>

        <div className="space-y-2">
          {recentActivity.length === 0 ? (
            <p className="font-mono text-gray-400 py-4 text-center text-xs">No recent admin activity logged.</p>
          ) : (
            recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-[#FAF8F8] border border-[#111111]/10 rounded hover:bg-white hover:border-[#111111]/20 transition-all text-xs">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="font-mono font-bold text-[#111111]">{item.actor_email.split("@")[0]}</span>
                  <span className="text-[#111111]/30 font-mono">::</span>
                  <span className="font-mono text-[#111111]/80 truncate">{item.action}</span>
                </div>
                <StatusBadge status={item.target_type} type="info" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
