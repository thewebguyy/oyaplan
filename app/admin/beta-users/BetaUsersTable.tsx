"use client";

import React from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { ApprovedBetaUser } from "@/lib/admin/types";
import { removeBetaEmailAction } from "@/lib/actions/adminBetaActions";

interface BetaUsersTableProps {
  betaUsers: ApprovedBetaUser[];
}

export default function BetaUsersTable({ betaUsers }: BetaUsersTableProps) {
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
    <DataTable
      columns={columns}
      data={betaUsers}
      searchPlaceholder="Search approved emails..."
      emptyTitle="No approved beta emails"
      emptyDescription="Approve applicant email addresses to grant Founding Beta Tester badges."
    />
  );
}
