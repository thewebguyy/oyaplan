import React from "react";
import Link from "next/link";
import { VenueService } from "@/lib/admin/services/venueService";
import PageHeader from "@/components/admin/PageHeader";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { AdminVenue } from "@/lib/admin/types";
import { Edit2, ExternalLink, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminVenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { venues, total } = await VenueService.getVenues({
    search: params.search,
    status: params.status,
  });

  const columns: Column<AdminVenue>[] = [
    {
      header: "Venue",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.image_url ? (
            <img
              src={row.image_url}
              alt={row.name}
              className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200">
              No IMG
            </div>
          )}
          <div>
            <div className="font-bold text-gray-900 leading-tight">{row.name}</div>
            <div className="text-[11px] text-gray-400 font-mono">/{row.slug}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Area",
      accessorKey: "area_name",
    },
    {
      header: "Category",
      accessorKey: "category",
    },
    {
      header: "Price Level",
      cell: (row) => (
        <span className="font-mono font-bold text-gray-700">
          {row.price_level || "₦₦"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/venues/${row.id}`}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#008751] hover:text-white transition-colors text-gray-700"
            title="Edit Venue"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/explore/ikeja`}
            target="_blank"
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500"
            title="View on site"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Venues Catalog"
        description={`Managing ${total} Lagos outing spots and venues.`}
      />

      <DataTable
        columns={columns}
        data={venues}
        searchPlaceholder="Search venue by name..."
        emptyTitle="No venues found"
        emptyDescription="Try adjusting your search query or filters."
      />
    </div>
  );
}
