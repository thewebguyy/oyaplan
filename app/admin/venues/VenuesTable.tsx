"use client";

import React from "react";
import Link from "next/link";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { AdminVenue } from "@/lib/admin/types";
import { Edit2, ExternalLink, ImageOff } from "lucide-react";
import { getSpotPublicUrl } from "@/lib/admin/url";

interface VenuesTableProps {
  venues: AdminVenue[];
}

export default function VenuesTable({ venues }: VenuesTableProps) {
  const columns: Column<AdminVenue>[] = [
    {
      header: "Venue",
      cell: (row) => (
        <div className="flex items-center gap-3 py-0.5">
          {row.image_url ? (
            <img
              src={row.image_url}
              alt={row.name}
              className="w-11 h-11 rounded border-2 border-[#111111]/20 object-cover bg-[#FAF8F8] shrink-0"
            />
          ) : (
            <div
              className="w-11 h-11 rounded border-2 border-dashed border-[#D72638]/40 bg-red-50/60 text-[#D72638] flex flex-col items-center justify-center font-mono font-bold text-[9px] shrink-0 uppercase tracking-tighter"
              title="Missing Hero Image"
            >
              <ImageOff className="w-3.5 h-3.5 opacity-80 mb-0.5" />
              <span>NO IMG</span>
            </div>
          )}
          <div className="min-w-0">
            <div className="font-display font-bold text-sm text-[#111111] leading-tight truncate">
              {row.name}
            </div>
            <div className="text-[10px] text-[#111111]/50 font-mono tracking-tight mt-0.5">
              /{row.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Area",
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-[#111111]/80">
          {row.area_name || "—"}
        </span>
      ),
    },
    {
      header: "Category",
      cell: (row) => (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111111]/5 text-[#111111]/70 border border-[#111111]/10">
          {row.category || "General"}
        </span>
      ),
    },
    {
      header: "Price Level",
      cell: (row) => (
        <span className="font-mono font-black text-xs text-[#111111] tabular-nums tracking-wider px-2 py-0.5 bg-[#FAF8F8] border border-[#111111]/15 rounded inline-block">
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
        <div className="flex items-center gap-1.5">
          <Link
            href={`/admin/venues/${row.id}`}
            className="p-1.5 rounded border border-[#111111]/20 bg-white hover:bg-[#008751] hover:text-white hover:border-[#008751] active:translate-x-[1px] active:translate-y-[1px] transition-all text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#008751]"
            title="Edit Venue"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={getSpotPublicUrl(row)}
            target="_blank"
            className="p-1.5 rounded border border-[#111111]/20 bg-white hover:bg-[#111111] hover:text-white hover:border-[#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all text-[#111111]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            title="View on site"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={venues}
      searchPlaceholder="Search venue by name..."
      emptyTitle="No venues found"
      emptyDescription="Try adjusting your search query or filters."
    />
  );
}
