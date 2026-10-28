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
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/venues/claims"
              className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-[#FAF8F8] text-[#111111] rounded border-2 border-[#111111]/20 shadow-[2px_2px_0px_rgba(1,5,40,0.06)] hover:border-[#111111] active:translate-x-[1px] active:translate-y-[1px] text-xs font-mono font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008751]"
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
