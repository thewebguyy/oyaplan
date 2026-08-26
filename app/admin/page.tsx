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
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#008751]" /> Operational Checklist
            </h3>
            <span className="text-xs text-[#008751] font-bold">Auto-Monitored</span>
          </div>

          <div className="space-y-3 text-xs font-medium text-gray-600">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span>Venues Missing Hero Image</span>
              <span className="font-bold text-red-600">{metrics.venuesMissingImagesCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span>Venues Missing Price Range</span>
              <span className="font-bold text-amber-600">{metrics.venuesMissingPricesCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span>Pending Scout Submissions</span>
              <span className="font-bold text-blue-600">{metrics.pendingSubmissionsCount}</span>
            </div>
          </div>
        </div>

        {/* Beta Launch Coverage Gating */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#008751]" /> Beta Launch Coverage
            </h3>
            <span className="text-xs text-text-muted font-semibold">Active Gate</span>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {activeAreas.map((area) => (
              <div key={area.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl text-xs font-medium">
                <span className="font-bold text-gray-900">{area.name}</span>
                <StatusBadge 
                  status={area.isBetaLive ? "Beta Active" : "Gated (Deactivated)"} 
                  type={area.isBetaLive ? "success" : "default"} 
                />
              </div>
            ))}
            {activeAreas.length === 0 && (
              <p className="text-gray-400 py-4 text-center text-xs">No coverage areas found in database.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Operational Activity Feed */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4 max-w-4xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Recent Operational Activity Feed</h3>
          <Clock className="w-4 h-4 text-gray-400" />
        </div>

        <div className="space-y-3 text-xs font-medium text-gray-600">
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 py-4 text-center">No recent admin activity logged.</p>
          ) : (
            recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <div className="truncate">
                  <span className="font-bold text-gray-900">{item.actor_email.split("@")[0]}</span>
                  <span className="mx-1 text-gray-400">•</span>
                  <span>{item.action}</span>
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
