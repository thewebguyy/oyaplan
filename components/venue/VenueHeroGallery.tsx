"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Venue, VenuePhoto } from "@/lib/types";
import { VenueImage } from "@/components/ui/VenueImage";
import { TrustBadge } from "@/components/ui/trust-badge";
import { useSavedSpots } from "@/hooks/useSavedSpots";
import { 
  Heart, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Flag, 
  Camera,
  Navigation,
  ChevronRight,
  X
} from "lucide-react";
import { getVerificationText } from "@/lib/planning/presentation/decisionCardMapper";
import { toast } from "sonner";

interface VenueHeroGalleryProps {
  venue: Venue;
  photos: VenuePhoto[];
  areaName?: string;
  areaSlug?: string;
  onOpenCorrection?: () => void;
}

export function VenueHeroGallery({
  venue,
  photos = [],
  areaName = "Lagos",
  areaSlug = "ikeja",
  onOpenCorrection,
}: VenueHeroGalleryProps) {
  const { isSaved, saveSpot, removeSpot } = useSavedSpots();
  const saved = isSaved(venue.id);

  const [activePhotoModal, setActivePhotoModal] = useState<number | null>(null);

  // Aggregate all distinct photo URLs
  const allPhotos: string[] = [];
  if (venue.cover_url) allPhotos.push(venue.cover_url);
  if (venue.gallery_urls) {
    for (const url of venue.gallery_urls) {
      if (!allPhotos.includes(url)) allPhotos.push(url);
    }
  }
  for (const p of photos.filter((p) => p.status === "approved")) {
    if (!allPhotos.includes(p.url)) allPhotos.push(p.url);
  }

  const isPartnerVerified = venue.partner_state === "verified_partner";
  const isVerified = isPartnerVerified || venue.operational_status === "verified" || venue.operational_status === "fresh";
  const trustStatus = isVerified ? "verified" : venue.operational_status === "needs_review" ? "pending" : "estimated";
  const freshnessText = getVerificationText(venue.last_price_updated_at);

  const lowSpend = venue.derived_typical_cost > 0 ? Math.round((venue.derived_typical_cost * 1.8) / 1000) * 1000 : 25000;
  const highSpend = Math.round((lowSpend * 1.5) / 1000) * 1000;

  const handleToggleSave = () => {
    if (saved) {
      removeSpot(venue.id);
      toast.success(`${venue.name} removed from Saved Spots`);
    } else {
      saveSpot({
        id: venue.id,
        name: venue.name,
        price_per_person: venue.derived_typical_cost || 15000,
        image_url: allPhotos[0] || venue.cover_url || "",
        vibe_tags: venue.vibe_tags || ["Chill"],
        address: venue.address,
        address_slug: areaSlug,
        confidence_score: venue.computed_confidence_score || 0.8,
        price_confidence: trustStatus,
      });
      toast.success(`${venue.name} saved to your spots!`);
    }
  };

  // Derive operating status
  const currentDayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const todayHours = venue.opening_hours ? (venue.opening_hours as Record<string, string>)[currentDayName] : null;

  const forgeUrl = `/forge?pinned=${venue.id}&area=${areaSlug}&squad=2&budget=${lowSpend}&vibe=${encodeURIComponent(venue.vibe_tags?.[0] || "chill")}&fresh=true`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${venue.name}, ${venue.address}, Lagos`)}`;

  return (
    <div className="w-full bg-white border-b border-[#EAE4DC] pt-4 pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Breadcrumb Context */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-text-muted">
          <Link href="/" className="hover:text-midnight-lagoon transition-colors">Home</Link>
          <span>/</span>
          <Link href="/explore" className="hover:text-midnight-lagoon transition-colors">Explore</Link>
          <span>/</span>
          <span className="text-midnight-lagoon capitalize truncate max-w-[180px]">{venue.name}</span>
        </nav>

        {/* Gallery Section */}
        {allPhotos.length > 0 ? (
          <div className="space-y-3">
            {/* Desktop Asymmetric 3-Pane Gallery */}
            <div className="hidden md:grid grid-cols-3 gap-3 h-[380px] rounded-[28px] overflow-hidden bg-surface-grey border border-[#EAE4DC] shadow-xs relative">
              {/* Main 2-column image */}
              <div 
                onClick={() => setActivePhotoModal(0)}
                className="col-span-2 relative h-full cursor-pointer group overflow-hidden"
              >
                <VenueImage
                  src={allPhotos[0]}
                  alt={`${venue.name} main view`}
                  fill
                  sizes="(max-width: 1024px) 66vw, 700px"
                  fallbackCategory={venue.category}
                  className="object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />
              </div>

              {/* Right stacked column */}
              <div className="col-span-1 grid grid-rows-2 gap-3 h-full">
                <div 
                  onClick={() => setActivePhotoModal(1)}
                  className="relative h-full cursor-pointer group overflow-hidden"
                >
                  <VenueImage
                    src={allPhotos[1] || allPhotos[0]}
                    alt={`${venue.name} photo 2`}
                    fill
                    sizes="33vw"
                    fallbackCategory={venue.category}
                    className="object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                </div>

                <div 
                  onClick={() => setActivePhotoModal(allPhotos.length > 2 ? 2 : 0)}
                  className="relative h-full cursor-pointer group overflow-hidden"
                >
                  <VenueImage
                    src={allPhotos[2] || allPhotos[0]}
                    alt={`${venue.name} photo 3`}
                    fill
                    sizes="33vw"
                    fallbackCategory={venue.category}
                    className="object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  
                  {allPhotos.length > 3 && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white font-black text-sm gap-1.5 transition-all group-hover:bg-black/60">
                      <Camera className="w-4 h-4" />
                      <span>+{allPhotos.length - 3} Photos</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Touch Swipe Gallery */}
            <div className="md:hidden relative h-64 sm:h-80 rounded-[24px] overflow-hidden bg-surface-grey border border-[#EAE4DC] shadow-xs">
              <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
                {allPhotos.map((url, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActivePhotoModal(idx)}
                    className="relative w-full h-full shrink-0 snap-center cursor-pointer"
                  >
                    <VenueImage
                      src={url}
                      alt={`${venue.name} photo ${idx + 1}`}
                      fill
                      sizes="100vw"
                      fallbackCategory={venue.category}
                      className="object-cover"
                      priority={idx === 0}
                    />
                  </div>
                ))}
              </div>

              {/* Mobile photo count badge */}
              <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>{allPhotos.length} Photos</span>
              </div>
            </div>
          </div>
        ) : (
          /* Graceful Empty Photo State */
          <div className="w-full h-48 sm:h-64 rounded-[28px] bg-[#FAF7F2] border-2 border-dashed border-[#EAE4DC] flex flex-col items-center justify-center text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE4DC] flex items-center justify-center text-text-muted shadow-xs">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-sm font-black text-midnight-lagoon">Photos coming soon</p>
            <p className="text-xs text-text-secondary max-w-sm">
              We&apos;re still gathering verified atmosphere and menu photos for {venue.name}.
            </p>
          </div>
        )}

        {/* Venue Identity & Action Block */}
        <div className="space-y-4 pt-2">
          
          {/* Category & Status Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-midnight-lagoon text-white">
                {venue.category || "Spot"}
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold text-midnight-lagoon bg-surface-grey border border-[#EAE4DC]">
                📍 {areaName}
              </span>

              {isPartnerVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#EAFDF3] text-[#0A7C3F] border border-[#A3F3C6]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Partner</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <TrustBadge
                status={trustStatus}
                freshnessText={freshnessText}
                size="md"
              />
            </div>
          </div>

          {/* Title & Save Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-midnight-lagoon uppercase tracking-tight">
                {venue.name}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#008751] shrink-0" />
                <span>{venue.address}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleSave}
                aria-label={saved ? "Remove from saved spots" : "Save this spot"}
                className={`h-11 px-4 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all tap-feedback cursor-pointer ${
                  saved
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "bg-white border-[#EAE4DC] hover:border-midnight-lagoon text-midnight-lagoon"
                }`}
              >
                <Heart className={`w-4 h-4 ${saved ? "fill-red-600 text-red-600" : ""}`} />
                <span>{saved ? "Saved" : "Save Spot"}</span>
              </button>

              <Link
                href={forgeUrl}
                className="h-11 px-5 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all tap-feedback"
              >
                <span>Plan This Venue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Sub-bar: Operating Hours & Direct Map link */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAE4DC] text-xs text-text-secondary">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-[#008751]" />
              {todayHours ? (
                <span>
                  Today ({currentDayName}): <strong className="text-midnight-lagoon">{todayHours}</strong>
                </span>
              ) : (
                <span>Opening hours verification in progress</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-[#008751] hover:underline"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get directions ↗</span>
              </a>

              {onOpenCorrection && (
                <button
                  type="button"
                  onClick={onOpenCorrection}
                  className="inline-flex items-center gap-1 text-text-muted hover:text-midnight-lagoon transition-colors text-[11px]"
                >
                  <Flag className="w-3 h-3" />
                  <span>Report update</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Full-Screen Photo Modal */}
      {activePhotoModal !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setActivePhotoModal(null)}
        >
          <div className="flex items-center justify-between text-white">
            <p className="text-xs font-bold">
              {venue.name} ({activePhotoModal + 1} of {allPhotos.length})
            </p>
            <button
              type="button"
              onClick={() => setActivePhotoModal(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            className="relative w-full max-w-4xl max-h-[75vh] h-full mx-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <VenueImage
              src={allPhotos[activePhotoModal]}
              alt={`${venue.name} preview`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-3 text-white pb-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              disabled={activePhotoModal === 0}
              onClick={() => setActivePhotoModal((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={activePhotoModal === allPhotos.length - 1}
              onClick={() => setActivePhotoModal((prev) => (prev !== null && prev < allPhotos.length - 1 ? prev + 1 : prev))}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-xs font-bold transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
