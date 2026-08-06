import React from "react";
import { CampaignService } from "@/lib/admin/services/campaignService";
import { VenueService } from "@/lib/admin/services/venueService";
import PageHeader from "@/components/admin/PageHeader";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { SponsoredCampaign } from "@/lib/admin/types";
import { createCampaignAction } from "@/lib/actions/adminCampaignActions";

export const dynamic = "force-dynamic";

export default async function AdminSponsoredPage() {
  const [campaigns, { venues }] = await Promise.all([
    CampaignService.getCampaigns(),
    VenueService.getVenues({ limit: 100 }),
  ]);

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
    <div className="space-y-8">
      <PageHeader
        title="Sponsored Campaigns"
        description="Manage paid operator listings and algorithmic placement boosts."
      />

      {/* Create Campaign Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Launch Operator Campaign</h3>
        
        <form action={createCampaignAction} className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs font-medium text-gray-700">
          <div className="space-y-1">
            <label className="font-bold text-gray-600">Venue</label>
            <select name="venueId" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]">
              {venues.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-600">Tier</label>
            <select name="tier" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]">
              <option value="featured">Featured (+30 pts)</option>
              <option value="premium">Premium (+50 pts)</option>
              <option value="basic">Basic</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-600">Placement</label>
            <select name="placement" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]">
              <option value="explore">Explore Page</option>
              <option value="homepage">Homepage</option>
              <option value="search">Search Results</option>
              <option value="category">Category Filter</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-600">End Date</label>
            <input name="endDate" type="date" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#008751]" />
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full py-2.5 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-xs rounded-lg transition-colors">
              Start Campaign
            </button>
          </div>
        </form>
      </div>

      <DataTable
        columns={columns}
        data={campaigns}
        searchPlaceholder="Search campaigns by venue name..."
        emptyTitle="No active campaigns"
        emptyDescription="Create a campaign to grant algorithmic placement boosts to operator partners."
      />
    </div>
  );
}
