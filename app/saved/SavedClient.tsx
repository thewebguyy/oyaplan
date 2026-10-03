"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Trash2, 
  Bookmark, 
  Calendar, 
  MapPin, 
  Users, 
  ArrowRight,
  Sparkles,
  Compass
} from "lucide-react";
import { useSavedSpots } from "@/hooks/useSavedSpots";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { buildVenuePlanUrl } from "@/lib/planning/buildVenuePlanUrl";
import ScrubbablePhotos from "@/components/explore/ScrubbablePhotos";
import { RecentlyViewedRow } from "@/components/venue/RecentlyViewedRow";
import { toast } from "sonner";

interface SavedPlanSpot {
  name: string;
  category?: string;
  address?: string;
}

interface SavedPlanEntry {
  id: string;
  total_cost: number;
  squad_size: number;
  vibe: string;
  created_at?: string;
  spot: SavedPlanSpot | SavedPlanSpot[] | null;
}

interface SavedPlanItem {
  saved_at: string;
  shared_plans: SavedPlanEntry | SavedPlanEntry[];
}

interface SavedClientProps {
  serverSavedPlans: SavedPlanItem[];
  isAuthenticated: boolean;
}

import { useSearchParams } from "next/navigation";

export default function SavedClient({
  serverSavedPlans,
  isAuthenticated,
}: SavedClientProps) {
  const { savedSpots, isLoaded, removeSpot } = useSavedSpots();
  const { openModal } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "plans" ? "plans" : "spots";
  const [activeTab, setActiveTab] = useState<"spots" | "plans">(initialTab);

  const handleRemoveSpot = (id: string, name: string) => {
    removeSpot(id);
    toast.success(`${name} removed from Saved Spots`);
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-2 border-[#008751] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="type-body text-text-muted text-sm">Loading your saved spots...</p>
      </div>
    );
  }

  const STARTER_PACKS = [
    {
      title: "Island Rooftops",
      description: "Sunset drinks, breezy skyline vibes in VI & Lekki.",
      href: "/explore?category=bar&area=vi",
      badge: "Vibe Pack",
    },
    {
      title: "Mainland Weekends",
      description: "Affordable squad turnups and chops in Yaba & Ikeja.",
      href: "/explore?area=ikeja&budget=40000",
      badge: "Budget Saver",
    },
    {
      title: "Date Night Under ₦30k",
      description: "Intimate dinners and romantic corners that don't sting.",
      href: "/forge?vibe=date-night&budget=30000&squad=2&fresh=true",
      badge: "Date Pack",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 bg-[#F6F6F2] min-h-[100dvh] text-[#111111] antialiased font-sans">
      {/* Header & Navigation Context */}
      <div className="space-y-4">
        <Link href="/">
          <button className="type-label text-[#555555] hover:text-[#111111] transition-colors flex items-center gap-1.5 tap-feedback py-1 text-xs font-mono font-bold cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Planner</span>
          </button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5DE] pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#F9E828] bg-[#111111] px-3 py-1 rounded-full shadow-xs mb-2">
              <span>RESIDENT SHORTLIST</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111] font-display uppercase tracking-tight">
              The Shortlist
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] mt-1 font-medium">
              Your vetted Lagos spots and saved outing plans. Ready when you move.
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#E5E5DE] w-fit self-start sm:self-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("spots")}
              aria-label={`Show saved spots (${savedSpots.length})`}
              className={`px-4 py-1.5 font-bold text-xs rounded-full transition-all tap-feedback cursor-pointer font-mono ${
                activeTab === "spots"
                  ? "bg-[#111111] text-[#F9E828] shadow-xs"
                  : "text-[#555555] hover:text-[#111111]"
              }`}
            >
              Saved Spots ({savedSpots.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("plans")}
              aria-label={`Show saved plans (${serverSavedPlans.length})`}
              className={`px-4 py-1.5 font-bold text-xs rounded-full transition-all tap-feedback cursor-pointer font-mono ${
                activeTab === "plans"
                  ? "bg-[#111111] text-[#F9E828] shadow-xs"
                  : "text-[#555555] hover:text-[#111111]"
              }`}
            >
              Saved Plans ({serverSavedPlans.length})
            </button>
          </div>
        </div>

        {/* Starter Packs Rail */}
        <div className="space-y-2.5 pt-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#6B7280]">
            Starter Packs &amp; Curated Filters
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {STARTER_PACKS.map((pack) => (
              <Link
                key={pack.title}
                href={pack.href}
                className="p-3.5 bg-white rounded-xl border border-[#E5E5DE] hover:border-[#111111] transition-all shadow-xs hover:shadow-sm flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F6F6F2] text-[#111111] border border-[#E5E5DE]">
                      {pack.badge}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#111111] opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-sm font-black text-[#111111] group-hover:text-[#111111] font-display uppercase tracking-tight pt-1">
                    {pack.title}
                  </h4>
                  <p className="text-[11px] text-[#6B7280] leading-snug">
                    {pack.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#111111] flex items-center gap-1 pt-2">
                  <span>Explore Pack</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 1: SAVED SPOTS */}
      {activeTab === "spots" && (
        <section aria-label="Saved spots list" className="space-y-6">
          {savedSpots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
              {savedSpots.map((spot) => {
                const firstVibe = spot.vibe_tags?.[0] || "Chill";
                const estimatedBudget = Math.round((spot.price_per_person || 15000) * 2 * 1.1);

                const planUrl = buildVenuePlanUrl({
                  venueId: spot.id,
                  area: spot.address_slug || spot.areas?.slug,
                  squad: 2,
                  budget: estimatedBudget,
                  vibe: firstVibe,
                  source: "saved_spots",
                });

                return (
                  <div
                    key={spot.id}
                    className="bg-white border border-[#EAE4DC] rounded-[24px] flex flex-col overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 h-full group"
                  >
                    <div className="w-full aspect-[16/10] relative bg-surface-grey overflow-hidden">
                      <ScrubbablePhotos 
                        venueName={spot.name} 
                        imageUrl={spot.cover_url || spot.image_url || (spot.gallery_urls && spot.gallery_urls[0])} 
                        images={spot.gallery_urls && spot.gallery_urls.length > 0 ? spot.gallery_urls : undefined}
                      />
                      <div className="absolute top-3 right-3 z-30">
                        <button
                          type="button"
                          onClick={() => handleRemoveSpot(spot.id, spot.name)}
                          aria-label={`Remove ${spot.name} from Saved Spots`}
                          className="p-2 bg-white/95 backdrop-blur-md rounded-full border border-[#EAE4DC] text-red-500 hover:bg-red-50 transition-all tap-feedback cursor-pointer shadow-xs"
                          title="Remove from Saved Spots"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {spot.category && (
                        <div className="absolute bottom-3 left-3 z-30">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                            {spot.category}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-grow text-left justify-between space-y-4">
                      <div className="space-y-1">
                        <Link href={`/venue/${spot.id}`}>
                          <h3 className="font-black text-base sm:text-lg text-midnight-lagoon uppercase leading-tight group-hover:text-[#008751] transition-colors">
                            {spot.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-[#6B7280] font-mono flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                          <span>{spot.address || spot.areas?.name || 'Lagos'}</span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E5E5DE] flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-black text-[#111111] text-base sm:text-lg font-mono tabular-nums">
                            ₦{(spot.price_per_person || 0).toLocaleString("en-NG")}
                          </span>
                          <span className="text-[9px] text-[#6B7280] font-mono font-bold uppercase tracking-wider">
                            / person
                          </span>
                        </div>

                        <Link href={planUrl}>
                          <Button className="bg-[#111111] hover:bg-black text-[#F9E828] text-xs uppercase font-black px-4 py-2 rounded-xl tap-feedback cursor-pointer shadow-xs">
                            Plan Outing
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-[20px] border border-[#E5E5DE] space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-[#111111] text-[#F9E828] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Bookmark className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h2 className="font-black text-lg text-[#111111] font-display uppercase tracking-tight">
                  No saved spots yet.
                </h2>
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                  Bookmark places as you explore to easily pre-fill budget outing plans later.
                </p>
              </div>
              <Link href="/explore" className="inline-block pt-2">
                <Button className="bg-[#111111] hover:bg-black text-[#F9E828] font-bold text-xs px-6 py-2.5 rounded-full shadow-xs tap-feedback">
                  Explore Lagos Spots
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* TAB 2: SAVED PLANS */}
      {activeTab === "plans" && (
        <section aria-label="Saved plans list" className="space-y-6">
          {!isAuthenticated ? (
            <div className="bg-white rounded-[20px] border border-[#E5E5DE] p-8 text-center space-y-4 shadow-xs max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#F9E828] flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-base text-[#111111] font-display uppercase tracking-tight">
                  Sign in to view saved plans
                </h3>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Your outings and damage slips sync across devices when signed in.
                </p>
              </div>
              <Button
                onClick={() => openModal("Sign in to view saved plans", "/saved")}
                className="w-full bg-[#111111] hover:bg-black text-[#F9E828] font-bold text-xs py-2.5 rounded-xl tap-feedback"
              >
                Sign In
              </Button>
            </div>
          ) : serverSavedPlans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {serverSavedPlans.map((item, index) => {
                const plan = Array.isArray(item.shared_plans)
                  ? item.shared_plans[0]
                  : item.shared_plans;
                if (!plan) return null;

                const spot = Array.isArray(plan.spot) ? plan.spot[0] : plan.spot;
                const spotName = spot?.name || "Lagos Outing";
                const dateText = item.saved_at
                  ? new Date(item.saved_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Recent";

                return (
                  <div
                    key={plan.id || index}
                    className="bg-white border border-[#E5E5DE] rounded-[20px] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 font-sans"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111111] text-[#F9E828]">
                          {plan.vibe || "Outing"}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#6B7280]">
                          Saved {dateText}
                        </span>
                      </div>

                      <h3 className="font-black text-base sm:text-lg text-[#111111] font-display uppercase tracking-tight leading-snug">
                        {spotName}
                      </h3>

                      {spot?.address && (
                        <p className="text-xs text-[#6B7280] font-mono flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-[#111111] shrink-0" />
                          <span>{spot.address}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E5E5DE] flex items-center justify-between font-mono">
                      <div>
                        <div className="font-black text-[#111111] text-base sm:text-lg">
                          ₦{plan.total_cost.toLocaleString("en-NG")}
                        </div>
                        <div className="text-[10px] text-[#6B7280] font-bold flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#111111]" />
                          <span>Squad of {plan.squad_size || 2}</span>
                        </div>
                      </div>

                      <Link href={`/plan/${plan.id}`}>
                        <Button className="bg-[#111111] hover:bg-black text-[#F9E828] text-xs font-black px-4 py-2 rounded-xl tap-feedback flex items-center gap-1.5 cursor-pointer">
                          <span>View Slip</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-[20px] border border-[#E5E5DE] space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-[#111111] text-[#F9E828] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h2 className="font-black text-lg text-[#111111] font-display uppercase tracking-tight">
                  No saved plans yet.
                </h2>
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
                  When you plan an outing for you and your squad, save it to access the damage slip anytime.
                </p>
              </div>
              <Link href="/" className="inline-block pt-2">
                <Button className="bg-[#111111] hover:bg-black text-[#F9E828] font-bold text-xs px-6 py-2.5 rounded-full shadow-xs tap-feedback">
                  Plan an Outing
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}

      {/* RECENTLY VIEWED SHELF (Strictly Factual History) */}
      <RecentlyViewedRow
        className="pt-8 border-t border-[#EAE4DC]"
        title="Recently Viewed Spots"
        subtitle="Places you looked at recently on this device. Not saved."
      />
    </div>
  );
}
