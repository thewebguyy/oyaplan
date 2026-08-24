"use client";

import React from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { AccountUsageRow } from "@/lib/admin/types";

interface UsageTableProps {
  accounts: AccountUsageRow[];
}

export default function UsageTable({ accounts }: UsageTableProps) {
  const columns: Column<AccountUsageRow>[] = [
    {
      header: "User",
      cell: (row) => (
        <div>
          <div className="font-bold text-gray-900 truncate max-w-[200px]">{row.email}</div>
          {row.display_name !== row.email && (
            <div className="text-[11px] text-gray-400">{row.display_name}</div>
          )}
        </div>
      ),
    },
    {
      header: "Badge",
      cell: (row) =>
        row.profile_badge ? (
          <StatusBadge status={row.profile_badge.replace(/_/g, " ")} type="info" />
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      header: "Account Created",
      cell: (row) => (
        <span className="text-gray-500 font-mono text-[11px]">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Plans Generated",
      cell: (row) => (
        <span
          className={`font-extrabold text-sm ${
            row.plan_count === 0
              ? "text-gray-300"
              : row.plan_count >= 5
              ? "text-[#008751]"
              : "text-gray-900"
          }`}
        >
          {row.plan_count}
        </span>
      ),
    },
    {
      header: "Last Plan",
      cell: (row) => (
        <span className="text-gray-500 font-mono text-[11px]">
          {row.last_plan_at ? new Date(row.last_plan_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={accounts}
      searchPlaceholder="Search by email or display name..."
      emptyTitle="No accounts found"
      emptyDescription="No registered accounts to display."
    />
  );
}
