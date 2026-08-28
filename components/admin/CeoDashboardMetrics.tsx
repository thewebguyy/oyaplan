import React from 'react';
import { CeoFunnelMetrics } from '@/lib/admin/services/ceoAnalyticsService';
import { 
  Users, 
  Flame, 
  BookmarkCheck, 
  Share2, 
  Eye, 
  RotateCw, 
  AlertTriangle, 
  Compass
} from 'lucide-react';

interface CeoDashboardMetricsProps {
  metrics: CeoFunnelMetrics;
}

export default function CeoDashboardMetrics({ metrics }: CeoDashboardMetricsProps) {
  return (
    <div className="space-y-6">
      {/* 1. Primary Conversion Funnel Banner */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#008751]" /> Core Activation & Virality Funnel
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Activation is strictly defined as completing a viable Lagos plan.
            </p>
          </div>
          <span className="text-xs bg-[#EAFDF3] text-[#008751] font-bold px-3 py-1 rounded-full">
            Launch Health: Monitored
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Step 1: Users */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">1. Users</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{metrics.totalAccounts}</div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                +{metrics.newAccounts7d} in last 7d
              </div>
            </div>
          </div>

          {/* Step 2: Activated (First Plan) */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">2. Activated</span>
              <Flame className="w-4 h-4 text-[#008751]" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#008751]">{metrics.activatedUsersCount}</div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                {metrics.activationRatePct}% conversion
              </div>
            </div>
          </div>

          {/* Step 3: Saved */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">3. Saved</span>
              <BookmarkCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{metrics.savedPlansCount}</div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                {metrics.saveRatePct}% save rate
              </div>
            </div>
          </div>

          {/* Step 4: Shared */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">4. Shared</span>
              <Share2 className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{metrics.sharedPlansCount}</div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                {metrics.shareRatePct}% share rate
              </div>
            </div>
          </div>

          {/* Step 5: Recipient Engaged */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">5. Viral Reach</span>
              <Eye className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{metrics.sharedPlansOpenedCount}</div>
              <div className="text-[11px] text-gray-500 font-semibold mt-0.5">
                {metrics.recipientEngagementRatePct}% open rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Secondary Health & Attribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Retention & Intensity */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <RotateCw className="w-4 h-4 text-[#008751]" /> User Retention & Intensity
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Second-Plan Repeat Rate</span>
              <span className="font-bold text-gray-900">{metrics.secondPlanRatePct}% ({metrics.secondPlanUsersCount} users)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Plans Per Active User</span>
              <span className="font-bold text-gray-900">{metrics.plansPerActiveUser}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Feedback & Actual Spend</span>
              <span className="font-bold text-blue-600">{metrics.feedbackSubmissionsCount} submissions</span>
            </div>
          </div>
        </div>

        {/* Reliability & Failure Rate */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Reliability & Error Rate
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Plan Gen Failure Rate</span>
              <span className={`font-bold ${metrics.planFailureRatePct > 5 ? 'text-red-600' : 'text-[#008751]'}`}>
                {metrics.planFailureRatePct}% ({metrics.planGenerationFailuresCount} fails)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Total Generated Plans</span>
              <span className="font-bold text-gray-900">{metrics.totalPlansGenerated}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Plans in Last 7 Days</span>
              <span className="font-bold text-gray-900">{metrics.plansGenerated7d}</span>
            </div>
          </div>
        </div>

        {/* Acquisition Attribution */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600" /> Top Acquisition Sources
          </h3>
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {metrics.acquisitionBreakdown.map((src, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl text-xs">
                <span className="font-semibold text-gray-800 truncate max-w-[170px]">{src.source}</span>
                <span className="font-mono font-bold text-gray-900">{src.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
