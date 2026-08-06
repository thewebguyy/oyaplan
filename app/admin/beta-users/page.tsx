import React from "react";
import { BetaService } from "@/lib/admin/services/betaService";
import PageHeader from "@/components/admin/PageHeader";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { ApprovedBetaUser } from "@/lib/admin/types";
import { approveBetaEmailAction, removeBetaEmailAction } from "@/lib/actions/adminBetaActions";

export const dynamic = "force-dynamic";

export default async function AdminBetaUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const betaUsers = await BetaService.getApprovedBetaUsers(params.search);

  const columns: Column<ApprovedBetaUser>[] = [
    {
      header: "Tester Email",
      cell: (row) => (
        <div>
          <div className="font-bold text-gray-900">{row.email}</div>
          {row.notes && <div className="text-[11px] text-gray-400">{row.notes}</div>}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Approved Date",
      cell: (row) => (
        <span className="text-gray-500 font-mono text-[11px]">
          {new Date(row.approved_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Accepted Date",
      cell: (row) => (
        <span className="text-gray-500 font-mono text-[11px]">
          {row.accepted_at ? new Date(row.accepted_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <form action={removeBetaEmailAction} className="inline">
          <input type="hidden" name="email" value={row.email} />
          <button
            type="submit"
            className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer"
          >
            Remove
          </button>
        </form>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Beta Users Management"
        description="Approve email addresses for Founding Beta Tester badges and track invitation statuses."
      />

      {/* Approve Email Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Approve Beta Email</h3>
        
        <form action={approveBetaEmailAction} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-gray-700">
          <div className="space-y-1">
            <label className="font-bold text-gray-600">Email Address</label>
            <input name="email" type="email" required placeholder="tester@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]" />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-600">Notes / Cohort</label>
            <input name="notes" placeholder="e.g. Batch 1 - Google Form" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]" />
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full py-2.5 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-xs rounded-lg transition-colors">
              Approve Email
            </button>
          </div>
        </form>
      </div>

      <DataTable
        columns={columns}
        data={betaUsers}
        searchPlaceholder="Search approved emails..."
        emptyTitle="No approved beta emails"
        emptyDescription="Approve applicant email addresses to grant Founding Beta Tester badges."
      />
    </div>
  );
}
