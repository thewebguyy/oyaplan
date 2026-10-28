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
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white border-2 border-[#111111]/15 text-xs font-mono font-bold text-[#111111] hover:border-[#008751] hover:text-[#008751] active:translate-x-[1px] active:translate-y-[1px] shadow-[1px_1px_0px_rgba(0,0,0,0.05)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008751]"
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
        <div className="bg-white border-2 border-[#111111]/20 rounded-lg p-4 shadow-[2px_2px_0px_rgba(1,5,40,0.06)] hover:border-[#111111] transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#F6C642]" />
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[10px] font-bold text-[#111111]/70 uppercase tracking-wider">Pending Claims</span>
            <Clock className="w-4 h-4 text-[#B45309]" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#111111] tabular-nums mt-2">{stats.pendingClaims}</div>
          <span className="text-[10px] font-mono text-[#111111]/60 mt-2 pt-1.5 border-t border-[#111111]/10 block">Requires operator review</span>
        </div>

        <div className="bg-white border-2 border-[#111111]/20 rounded-lg p-4 shadow-[2px_2px_0px_rgba(1,5,40,0.06)] hover:border-[#111111] transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#008751]" />
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[10px] font-bold text-[#008751] uppercase tracking-wider">Verified Partners</span>
            <ShieldCheck className="w-4 h-4 text-[#008751]" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#111111] tabular-nums mt-2">{stats.verifiedPartners}</div>
          <span className="text-[10px] font-mono text-[#111111]/60 mt-2 pt-1.5 border-t border-[#111111]/10 block">Fully verified listings</span>
        </div>

        <div className="bg-white border-2 border-[#111111]/20 rounded-lg p-4 shadow-[2px_2px_0px_rgba(1,5,40,0.06)] hover:border-[#111111] transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#004B8E]" />
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[10px] font-bold text-[#004B8E] uppercase tracking-wider">Awaiting Verification</span>
            <FileText className="w-4 h-4 text-[#004B8E]" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#111111] tabular-nums mt-2">{stats.verificationPendingVenues}</div>
          <span className="text-[10px] font-mono text-[#111111]/60 mt-2 pt-1.5 border-t border-[#111111]/10 block">Submitted by partners</span>
        </div>

        <div className="bg-white border-2 border-[#111111]/20 rounded-lg p-4 shadow-[2px_2px_0px_rgba(1,5,40,0.06)] hover:border-[#111111] transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#6D28D9]" />
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[10px] font-bold text-[#6D28D9] uppercase tracking-wider">In Onboarding</span>
            <Building2 className="w-4 h-4 text-[#6D28D9]" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#111111] tabular-nums mt-2">{stats.onboardingVenues}</div>
          <span className="text-[10px] font-mono text-[#111111]/60 mt-2 pt-1.5 border-t border-[#111111]/10 block">Claimed but incomplete</span>
        </div>

        <div className="bg-white border-2 border-[#111111]/20 rounded-lg p-4 shadow-[2px_2px_0px_rgba(1,5,40,0.06)] hover:border-[#111111] transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#D72638]" />
          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[10px] font-bold text-[#D72638] uppercase tracking-wider">Open Corrections</span>
            <AlertCircle className="w-4 h-4 text-[#D72638]" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-[#111111] tabular-nums mt-2">{stats.pendingChangeRequests}</div>
          <span className="text-[10px] font-mono text-[#111111]/60 mt-2 pt-1.5 border-t border-[#111111]/10 block">&quot;Something incorrect?&quot;</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-[#111111]/15 pb-3 overflow-x-auto">
        {filterTabs.map((tab: { key: string; label: string; badge?: number }) => {
          const isActive = status === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/admin/venues/claims?status=${tab.key}`}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008751] ${
                isActive
                  ? 'bg-[#010528] text-white border-2 border-[#010528] shadow-[2px_2px_0px_#111111]'
                  : 'bg-white text-[#111111]/70 hover:text-[#111111] hover:bg-[#FAF8F8] border-2 border-[#111111]/15'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-black font-mono ${
                    isActive ? 'bg-[#F6C642] text-[#010528] border border-[#E5B535]' : 'bg-[#111111]/10 text-[#111111]'
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
