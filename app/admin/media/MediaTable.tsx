"use client";

import React from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { MediaItem } from "@/lib/admin/types";

interface MediaTableProps {
  mediaItems: MediaItem[];
}

export default function MediaTable({ mediaItems }: MediaTableProps) {
  const columns: Column<MediaItem>[] = [
    {
      header: "Preview",
      cell: (row) => (
        <img
          src={row.url}
          alt={row.filename}
          className="w-16 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200"
        />
      ),
    },
    {
      header: "Venue",
      accessorKey: "venue_name",
    },
    {
      header: "Filename",
      accessorKey: "filename",
      className: "font-mono text-gray-500",
    },
    {
      header: "Role",
      cell: (row) => <StatusBadge status={row.is_hero ? "Hero Image" : "Gallery"} type={row.is_hero ? "success" : "info"} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={mediaItems}
      searchPlaceholder="Search media by venue name..."
      emptyTitle="No media items found"
      emptyDescription="Upload images or assign photos to your venue catalog."
    />
  );
}
