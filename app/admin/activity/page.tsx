import React from "react";
import { ActivityService } from "@/lib/admin/services/activityService";
import PageHeader from "@/components/admin/PageHeader";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { AdminActivityItem } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const activities = await ActivityService.getRecentActivity(50);

  const columns: Column<AdminActivityItem>[] = [
    {
      header: "Timestamp",
      cell: (row) => (
        <span className="font-mono text-gray-500 text-[11px]">
          {new Date(row.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Admin User",
      accessorKey: "actor_email",
    },
    {
      header: "Action Performed",
      cell: (row) => <span className="font-bold text-gray-900">{row.action}</span>,
    },
    {
      header: "Target Type",
      cell: (row) => <StatusBadge status={row.target_type} type="info" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Activity Log"
        description="Audit trail of all actions performed by CTO and COO within the Control Center."
      />

      <DataTable
        columns={columns}
        data={activities}
        searchPlaceholder="Search activity log..."
        emptyTitle="No activity recorded"
        emptyDescription="Admin activity will appear here automatically when actions are performed."
      />
    </div>
  );
}
