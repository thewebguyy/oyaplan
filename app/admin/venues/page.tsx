import React from "react";
import { VenueService } from "@/lib/admin/services/venueService";
import PageHeader from "@/components/admin/PageHeader";
import VenuesTable from "./VenuesTable";
import BulkMediaUploadButton from "./BulkMediaUploadButton";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

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
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/venues/claims"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold border border-stone-200 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#008751]" />
              Claims Pipeline
            </Link>
            <BulkMediaUploadButton />
          </div>
        }
      />

      <VenuesTable venues={venues} />
    </div>
  );
}
