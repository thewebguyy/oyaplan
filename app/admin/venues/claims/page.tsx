import React from 'react';
import { isAuthorizedAdmin } from '@/lib/admin/permissions';
import { redirect } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import { getAdminVenueClaims, getAdminVenuePipelineStats, getVenuesForInvitation } from '@/lib/queries/partner';
import { ClaimsModerationTable } from '@/components/admin/ClaimsModerationTable';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AdminClaimsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminVenueClaimsPage({ searchParams }: AdminClaimsPageProps) {
  const auth = await isAuthorizedAdmin();
  if (!auth.authorized) {
    redirect('/admin/login');
    return null;
  }

  const { status = 'all' } = await searchParams;

  const [stats, claims, venues] = await Promise.all([
    getAdminVenuePipelineStats(),
    getAdminVenueClaims(status),
    getVenuesForInvitation(),
  ]);

  const filterTabs = [
    { key: 'all', label: 'All Claims' },
    { key: 'invited', label: 'Invitations', badge: stats.activeInvitations },
    { key: 'pending', label: 'Pending Review', badge: stats.pendingClaims },
    { key: 'needs_more_information', label: 'Needs Info' },
    { key: 'approved', label: 'Approved', badge: stats.approvedClaims },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/venues"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Venues Catalog
        </Link>
      </div>

      <PageHeader
        title="Partner Claims Pipeline"
        description="Review operator claims, audit business authorization, and manage verified venue partnerships."
      />

      {/* Pipeline Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Claims</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">{stats.pendingClaims}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Requires operator review</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#008751] uppercase tracking-wider">Verified Partners</span>
            <ShieldCheck className="w-4 h-4 text-[#008751]" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">{stats.verifiedPartners}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Fully verified listings</span>
        </div>

        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Awaiting Verification</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">{stats.verificationPendingVenues}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Submitted by partners</span>
        </div>

        <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">In Onboarding</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">{stats.onboardingVenues}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">Claimed but incomplete</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Open Corrections</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">{stats.pendingChangeRequests}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">"Something incorrect?"</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 overflow-x-auto">
        {filterTabs.map((tab: { key: string; label: string; badge?: number }) => {
          const isActive = status === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/admin/venues/claims?status=${tab.key}`}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${isActive
                  ? 'bg-[#010528] text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-[#FCC630] text-[#010528]' : 'bg-stone-200 text-stone-700'
                    }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Moderation Table */}
      <ClaimsModerationTable claims={claims} venues={venues} />
    </div>
  );
}
