import React from "react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { AdminSettings } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings: AdminSettings = {
    betaMode: true,
    inviteOnlyMode: true,
    maintenanceMode: false,
    publicLaunch: false,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Control Center Settings"
        description="System mode flags and release controls."
      />

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Operational System Flags</h3>

        <div className="space-y-4 text-xs font-medium text-gray-700">
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <div className="font-bold text-gray-900 text-sm">Founding Beta Mode</div>
              <div className="text-gray-500 mt-0.5">Enforces Founding Beta badge assignment and onboarding flow for approved emails.</div>
            </div>
            <StatusBadge status={settings.betaMode ? "Active" : "Disabled"} type={settings.betaMode ? "success" : "warning"} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <div className="font-bold text-gray-900 text-sm">Invite Only Mode</div>
              <div className="text-gray-500 mt-0.5">Requires email verification against approved_beta_users table.</div>
            </div>
            <StatusBadge status={settings.inviteOnlyMode ? "Active" : "Disabled"} type={settings.inviteOnlyMode ? "success" : "warning"} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <div className="font-bold text-gray-900 text-sm">Maintenance Mode</div>
              <div className="text-gray-500 mt-0.5">Temporarily pauses new plan requests for database maintenance.</div>
            </div>
            <StatusBadge status={settings.maintenanceMode ? "Active" : "Disabled"} type={settings.maintenanceMode ? "warning" : "info"} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <div className="font-bold text-gray-900 text-sm">Public Launch Mode</div>
              <div className="text-gray-500 mt-0.5">Public September release mode with open account registration.</div>
            </div>
            <StatusBadge status={settings.publicLaunch ? "Active" : "Off"} type={settings.publicLaunch ? "success" : "info"} />
          </div>

        </div>
      </div>
    </div>
  );
}
