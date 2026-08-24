"use client";

import React from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { SponsoredCampaign } from "@/lib/admin/types";

interface CampaignsTableProps {
  campaigns: SponsoredCampaign[];
}

export default function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const columns: Column<SponsoredCampaign>[] = [
    {
      header: "Venue",
      accessorKey: "venue_name",
    },
    {
      header: "Subscription Tier",
      cell: (row) => <StatusBadge status={row.tier} type={row.tier === "premium" ? "success" : "warning"} />,
    },
    {
      header: "Placement Target",
      cell: (row) => <span className="font-mono text-xs font-bold text-gray-700 capitalize">{row.placement}</span>,
    },
    {
      header: "Campaign Dates",
      cell: (row) => (
        <span className="text-gray-500 font-mono text-[11px]">
          {row.start_date} to {row.end_date}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={campaigns}
      searchPlaceholder="Search campaigns by venue name..."
      emptyTitle="No active campaigns"
      emptyDescription="Create a campaign to grant algorithmic placement boosts to operator partners."
    />
  );
}
