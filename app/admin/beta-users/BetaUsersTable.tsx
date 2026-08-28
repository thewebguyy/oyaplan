"use client";

import React, { useState, useMemo } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { ApprovedBetaUser } from "@/lib/admin/types";
import { removeBetaEmailAction } from "@/lib/actions/adminBetaActions";
import { ShieldCheck } from "lucide-react";

interface BetaUsersTableProps {
  betaUsers: ApprovedBetaUser[];
}

type FilterTab = "Active" | "Accepted" | "Registered" | "Invited" | "All";

export default function BetaUsersTable({ betaUsers }: BetaUsersTableProps) {
  const [selectedTab, setSelectedTab] = useState<FilterTab>("Active");

  const counts = useMemo(() => {
    return {
      Active: betaUsers.filter((u) => u.status === "Active").length,
      Accepted: betaUsers.filter((u) => u.status === "Accepted").length,
      Registered: betaUsers.filter((u) => u.status === "Registered").length,
      Invited: betaUsers.filter((u) => u.status === "Invited").length,
      All: betaUsers.length,
    };
  }, [betaUsers]);

  const filteredUsers = useMemo(() => {
    if (selectedTab === "All") return betaUsers;
    return betaUsers.filter((u) => u.status === selectedTab);
  }, [betaUsers, selectedTab]);

  const columns: Column<ApprovedBetaUser>[] = [
    {
      header: "Tester Email",
      cell: (row) => (
        <div>
          <div className="font-bold text-gray-900 flex items-center gap-1.5">
            <span>{row.email}</span>
            {row.has_badge && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#008751]/10 text-[#008751]">
                <ShieldCheck className="w-3 h-3" /> Badge Active
              </span>
            )}
          </div>
          {row.notes && <div className="text-[11px] text-gray-400">{row.notes}</div>}
        </div>
      ),
    },
    {
      header: "Lifecycle State",
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
    <div className="space-y-4">
      {/* Lifecycle Filter Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {(["Active", "Accepted", "Registered", "Invited", "All"] as FilterTab[]).map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                isActive
                  ? "bg-[#008751] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{tab === "Active" ? "Active Founding Beta" : tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-white text-gray-700"
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        searchPlaceholder="Search approved emails..."
        emptyTitle={
          selectedTab === "Active"
            ? "No Active Founding Beta Members"
            : `No ${selectedTab} Beta Users`
        }
        emptyDescription="Approve applicant email addresses to grant Founding Beta Tester badges."
      />
    </div>
  );
}
