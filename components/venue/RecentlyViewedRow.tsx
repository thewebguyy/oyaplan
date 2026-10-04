"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { History, MapPin, ArrowRight, Trash2 } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { VenueImage } from "@/components/ui/VenueImage";

interface RecentlyViewedRowProps {
  title?: string;
  subtitle?: string;
  showClearButton?: boolean;
  className?: string;
}

export function RecentlyViewedRow({
  title = "Recently Viewed",
  subtitle = "Spots you looked at recently on this device.",
  showClearButton = true,
  className = "",
}: RecentlyViewedRowProps) {
  const { recentVenues, isLoaded, clearRecent } = useRecentlyViewed();

  if (!isLoaded || recentVenues.length === 0) {
    return null;
  }

  return (
    <section aria-label="Recently viewed spots" className={`space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] flex items-center justify-center shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-midnight-lagoon tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-text-muted">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {showClearButton && (
          <button
            type="button"
            onClick={clearRecent}
            aria-label="Clear recently viewed history"
            className="text-[11px] font-bold text-text-muted hover:text-red-500 transition-colors flex items-center gap-1 py-1 px-2 rounded-md hover:bg-red-50 tap-feedback cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Horizontal Scroll Shelf */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none snap-x snap-mandatory focus-visible:outline-none">
        {recentVenues.map((venue) => {
          const areaDisplay = venue.areaName || venue.areaSlug || "Lagos";
          const formattedPrice = venue.pricePerPerson > 0 
            ? `₦${venue.pricePerPerson.toLocaleString("en-NG")}` 
            : "₦15,000";

          return (
            <div
              key={venue.id}
              className="w-[240px] sm:w-[260px] shrink-0 snap-start bg-white rounded-[20px] border border-[#EAE4DC] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image & Category */}
              <Link 
                href={`/venue/${venue.id}`} 
                className="relative aspect-[16/10] w-full bg-surface-grey block overflow-hidden"
              >
                <VenueImage
                  src={venue.imageUrl || venue.coverUrl}
                  alt={`${venue.name} photo`}
                  fill
                  fallbackCategory={venue.category}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white">
                  {venue.category || "Spot"}
                </span>
              </Link>

              {/* Card Body */}
              <div className="p-3.5 flex flex-col flex-grow justify-between space-y-3">
                <div className="space-y-1">
                  <Link href={`/venue/${venue.id}`} className="block">
                    <h3 className="font-black text-sm text-[#111111] line-clamp-1 group-hover:text-black transition-colors font-display uppercase tracking-tight">
                      {venue.name}
                    </h3>
                  </Link>
                  <p className="text-[11px] text-[#6B7280] flex items-center gap-1 line-clamp-1 font-mono">
                    <MapPin className="w-3 h-3 text-[#111111] shrink-0" />
                    <span>{areaDisplay}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-dashed border-[#E5E5DE] flex items-center justify-between font-mono">
                  <div>
                    <span className="font-black text-xs text-[#111111] tabular-nums">
                      {formattedPrice}
                    </span>
                    <span className="text-[9px] text-[#6B7280] font-bold ml-1 font-sans">/ person</span>
                  </div>

                  <Link
                    href={`/venue/${venue.id}`}
                    aria-label={`View ${venue.name} details`}
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#111111] hover:text-black transition-colors tap-feedback"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
