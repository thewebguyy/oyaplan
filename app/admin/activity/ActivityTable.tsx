"use client";

import React from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { AdminActivityItem } from "@/lib/admin/types";

interface ActivityTableProps {
  activities: AdminActivityItem[];
}

export default function ActivityTable({ activities }: ActivityTableProps) {
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
    <DataTable
      columns={columns}
      data={activities}
      searchPlaceholder="Search activity log..."
      emptyTitle="No activity recorded"
      emptyDescription="Admin activity will appear here automatically when actions are performed."
    />
  );
}
