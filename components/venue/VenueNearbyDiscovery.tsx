"use client";

import React from "react";
import Link from "next/link";
import { Venue } from "@/lib/types";
import { VenueImage } from "@/components/ui/VenueImage";
import { Compass, ArrowRight, MapPin } from "lucide-react";

interface VenueNearbyDiscoveryProps {
  currentVenue: Venue;
  nearbyVenues: Venue[];
  areaName?: string;
}

export function VenueNearbyDiscovery({
  currentVenue,
  nearbyVenues = [],
  areaName = "Lagos",
}: VenueNearbyDiscoveryProps) {
  if (nearbyVenues.length === 0) return null;

  return (
    <section className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight">
            More Places Around {areaName}
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary">
            Explore other popular Lagos spots in this neighborhood.
          </p>
        </div>

        <Link
          href={`/explore?area=${currentVenue.districts?.slug || "all"}`}
          className="text-xs font-bold text-[#008751] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>See all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {nearbyVenues.slice(0, 3).map((v) => {
          const spend = v.derived_typical_cost > 0 ? `~₦${v.derived_typical_cost.toLocaleString("en-NG")} / person` : "Estimated";
          return (
            <Link
              key={v.id}
              href={`/venue/${v.id}`}
              className="group bg-white rounded-[24px] border border-[#EAE4DC] hover:border-[#008751] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between tap-feedback"
            >
              <div className="relative h-40 w-full bg-surface-grey overflow-hidden">
                <VenueImage
                  src={v.cover_url || v.gallery_urls?.[0]}
                  alt={v.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  fallbackCategory={v.category}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-midnight-lagoon backdrop-blur-sm shadow-xs">
                    {v.category || "Spot"}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div>
                  <h3 className="text-sm font-black text-midnight-lagoon group-hover:text-[#008751] transition-colors line-clamp-1 uppercase">
                    {v.name}
                  </h3>
                  <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5 line-clamp-1">
                    <MapPin className="w-3 h-3 text-[#008751] shrink-0" />
                    <span>{v.address}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EAE4DC] flex items-center justify-between text-xs font-bold">
                  <span className="text-[#008751] font-black">{spend}</span>
                  <span className="text-text-muted text-[11px] group-hover:translate-x-0.5 transition-transform">
                    Plan →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
