import React from "react";
import { BetaService } from "@/lib/admin/services/betaService";
import PageHeader from "@/components/admin/PageHeader";
import { approveBetaEmailAction, approveBulkBetaEmailsAction } from "@/lib/actions/adminBetaActions";
import BetaUsersTable from "./BetaUsersTable";

export const dynamic = "force-dynamic";

export default async function AdminBetaUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const betaUsers = await BetaService.getApprovedBetaUsers(params.search);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Beta Users Management"
        description="Approve email addresses for Founding Beta Tester badges and track invitation statuses."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Email Approval Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Single Email Approval</h3>
          
          <form action={approveBetaEmailAction} className="space-y-4 text-xs font-medium text-gray-700">
            <div className="space-y-1">
              <label className="font-bold text-gray-600">Email Address</label>
              <input name="email" type="email" required placeholder="tester@example.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]" />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Notes / Cohort</label>
              <input name="notes" placeholder="e.g. Batch 1 - Google Form" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]" />
            </div>

            <button type="submit" className="w-full py-2.5 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-xs rounded-lg transition-colors">
              Approve Single Email
            </button>
          </form>
        </div>

        {/* Bulk Batch Import Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Bulk Batch Import from Google Sheets</h3>
          
          <form action={approveBulkBetaEmailsAction} className="space-y-3 text-xs font-medium text-gray-700">
            <div className="space-y-1">
              <label className="font-bold text-gray-600">Paste Emails (Comma or Newline Separated)</label>
              <textarea
                name="rawEmails"
                required
                rows={3}
                placeholder={"tester1@gmail.com\ntester2@gmail.com"}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:border-[#008751]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Cohort Tag</label>
              <input name="notes" defaultValue="Google Sheets Form Responses" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]" />
            </div>

            <button type="submit" className="w-full py-2.5 bg-midnight-lagoon hover:bg-[#010528] text-white font-extrabold text-xs rounded-lg transition-colors">
              Approve All Batch Emails
            </button>
          </form>
        </div>
      </div>

      <BetaUsersTable betaUsers={betaUsers} />
    </div>
  );
}
