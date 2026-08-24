import React from "react";
import { ActivityService } from "@/lib/admin/services/activityService";
import PageHeader from "@/components/admin/PageHeader";
import ActivityTable from "./ActivityTable";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const activities = await ActivityService.getRecentActivity(50);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Activity Log"
        description="Audit trail of all actions performed by CTO and COO within the Control Center."
      />

      <ActivityTable activities={activities} />
    </div>
  );
}
