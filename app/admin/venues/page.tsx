import React from "react";
import { VenueService } from "@/lib/admin/services/venueService";
import PageHeader from "@/components/admin/PageHeader";
import VenuesTable from "./VenuesTable";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Venues Catalog"
        description={`Managing ${total} Lagos outing spots and venues.`}
      />

      <VenuesTable venues={venues} />
    </div>
  );
}
