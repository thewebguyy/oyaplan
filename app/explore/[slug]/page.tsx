import { captureServerException } from "@/lib/sentry";
import { getZoneBySlug, getZoneNameBySlug } from "@/lib/queries/zones";
import { getAreasByZone, getAreaWithSpots, getAreaNameBySlug } from "@/lib/queries/areas";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PageError from "@/components/PageError";
import AreaLayout from "@/components/explore/AreaLayout";
import ScrubbablePhotos from "@/components/explore/ScrubbablePhotos";
import { TrustBadge } from "@/components/ui/trust-badge";
import { Spot } from "@/lib/types";
import SaveForLater from "@/components/SaveForLater";

export const dynamic = "force-dynamic";

interface FilteredSpot extends Spot {
  fitsBudget?: boolean;
  fitsVibe?: boolean;
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ budget?: string; vibe?: string; squad?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data: zone } = await getZoneNameBySlug(slug);
    if (zone) {
      return {
        title: `Explore ${zone.name} — OyaPlan`,
        description: `Discover spots in ${zone.name} Lagos.`,
      };
    }
    const { data: area } = await getAreaNameBySlug(slug);
    if (area) {
      return {
        title: `${area.name} Outing Spots — OyaPlan`,
        description: `Restaurants, activities, and experiences in ${area.name}, Lagos. Budget-friendly squad planning.`,
      };
    }
  } catch (e) {
    captureServerException(e);
  }
  return { title: "Explore — OyaPlan" };
}

export default async function ExploreSlug({ params, searchParams }: Props) {
  const { slug } = await params;
  const urlParams = await searchParams;
  const budget = urlParams.budget ? parseInt(urlParams.budget) : null;
  const vibe = urlParams.vibe || null;

  // 1. Try Zone View
  let zoneData: { id: string; name: string; slug: string; description: string } | null = null;
  let zoneQueryError = false;
  try {
    const { data, error } = await getZoneBySlug(slug);
    if (error) zoneQueryError = true;
    else zoneData = data;
  } catch (e) {
    captureServerException(e);
    zoneQueryError = true;
  }

  if (zoneQueryError) {
    return <PageError message="We could not load this zone. Please try again." href="/explore" linkLabel="Back to Explore" />;
  }

  if (zoneData) {
    let areas: Array<{ id: string; name: string; slug: string; activeSpotCount: number }> = [];
    let zoneAreasError = false;
    try {
      const { data, error } = await getAreasByZone(slug);
      if (error) {
        zoneAreasError = true;
      } else {
        areas = data || [];
      }
    } catch (e) {
      captureServerException(e);
      zoneAreasError = true;
    }

    if (zoneAreasError) {
      return <PageError message="We could not load areas for this zone. Please try again." href="/explore" linkLabel="Back to Explore" />;
    }

    return (
      <main className="min-h-screen bg-white text-text-primary pb-20 antialiased">
        {budget && vibe && (
          <div className="bg-brand-green text-white py-3 px-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <p className="type-label">Showing spots for your ₦{budget.toLocaleString('en-NG')} {vibe} outing</p>
              <Link href={`/explore/${slug}`} className="type-label text-white/80 hover:text-white underline">Clear</Link>
            </div>
          </div>
        )}

        <div className="bg-surface-grey border-b border-border-default py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/explore" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-6 tap-feedback">
              <ArrowLeft className="w-4 h-4" />
              Back to Zones
            </Link>
            <h1 className="type-display text-text-primary capitalize">{zoneData.name}</h1>
            <p className="type-body text-text-muted mt-2">{zoneData.description}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {areas?.map((area) => {
              const areaParams = new URLSearchParams();
              if (urlParams.budget) areaParams.append("budget", urlParams.budget);
              if (urlParams.vibe) areaParams.append("vibe", urlParams.vibe);
              const href = areaParams.toString() ? `/explore/${area.slug}?${areaParams.toString()}` : `/explore/${area.slug}`;

              return (
                <Link 
                  key={area.id} 
                  href={href}
                  className="group p-8 bg-white border border-border-default rounded-[20px] hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)] transition-all text-left tap-feedback"
                >
                  <h3 className="type-heading text-text-primary group-hover:text-brand-green transition-colors lowercase first-letter:uppercase">{area.name}</h3>
                  <p className="type-caption text-text-muted mt-2">{area.activeSpotCount} spots to discover</p>
                </Link>
              );
            })}
            
            {areas.length === 0 && (
              <div className="col-span-full text-center py-20 bg-surface-grey rounded-[24px] border border-border-default space-y-4">
                <p className="type-body text-text-muted">No active areas found in this zone yet.</p>
                <Link href="/suggest-a-spot" className="type-label text-brand-green hover:underline inline-block">
                  Know a hidden gem here? Suggest it &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 mt-20 pt-12 border-t border-border-default text-center">
          <Link href="/suggest-a-spot" className="type-label text-text-muted hover:text-text-secondary hover:underline transition-all">
            Know a spot that should be here? Suggest it &rarr;
          </Link>
        </div>
      </main>
    );
  }

  // 2. Try Area View
  let area: { id: string; name: string; slug: string; spots: Spot[] } | null = null;
  let areaFetchError = false;
  try {
    const { data, error, notFound: isNotFound } = await getAreaWithSpots(slug);
    if (isNotFound) notFound();
    if (error) {
      areaFetchError = true;
    } else {
      area = data as { id: string; name: string; slug: string; spots: Spot[] };
    }
  } catch (e) {
    captureServerException(e);
    areaFetchError = true;
  }

  if (areaFetchError) {
    return <PageError message="We could not load this area. Please try again." href="/explore" linkLabel="Back to Explore" />;
  }

  if (!area) notFound();

  // Process spots with budget and vibe filters resolved server-side
  const squadCount = urlParams.squad ? parseInt(urlParams.squad) : 2;
  const spots: FilteredSpot[] = (area.spots || []).filter((s) => s.active !== false).map((spot) => {
    const estimatedTotal = spot.price_per_person * squadCount * 1.1;
    const fitsBudget = budget ? estimatedTotal <= budget : true;
    
    // Vibe filter logic
    let fitsVibe = true;
    if (vibe) {
      const cat = (spot.category || "").toLowerCase();
      const tags = Array.isArray(spot.vibe_tags) ? spot.vibe_tags.map((t: string) => t.toLowerCase()) : [];
      const vibeLower = vibe.toLowerCase();
      
      fitsVibe = cat.includes(vibeLower) || 
                 tags.includes(vibeLower) ||
                 (vibeLower === "date-night" && (cat.includes("restaurant") || cat.includes("lounge"))) ||
                 (vibeLower === "brunch" && (cat.includes("cafe") || cat.includes("restaurant"))) ||
                 (vibeLower === "party" && (cat.includes("nightclub") || cat.includes("bar") || cat.includes("lounge")));
    }

    return { ...spot, fitsBudget, fitsVibe };
  }).filter((s) => s.fitsVibe).sort((a, b) => {
    if (a.fitsBudget && !b.fitsBudget) return -1;
    if (!a.fitsBudget && b.fitsBudget) return 1;
    return 0;
  });

  return (
    <main className="min-h-screen bg-white text-text-primary pb-20 antialiased">
      {/* Header Context Banner */}
      {budget && vibe && (
        <div className="bg-brand-green text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="type-label">
              Showing spots in <span className="lowercase first-letter:uppercase">{area.name}</span> for a squad of {squadCount} &bull; ₦{budget.toLocaleString('en-NG')} max budget
            </p>
            <Link href={`/explore/${slug}`} className="type-label text-white/80 hover:text-white underline">Clear filters</Link>
          </div>
        </div>
      )}

      {/* Header back button */}
      <div className="pt-8 px-6 max-w-5xl mx-auto">
        <Link href="/explore" className="inline-flex items-center gap-2 type-ui-label text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors">
          &larr; Back to Map
        </Link>
      </div>

      <AreaLayout
        slug={slug}
        areaName={area.name}
        description={`Outing venue listings for ${area.name}, Lagos.`}
        spotsCount={spots.length}
      >
        {spots.length > 0 ? (
          spots.map((spot) => {
            const prefillParams = new URLSearchParams();
            prefillParams.append("startArea", slug);
            prefillParams.append("pinnedSpotId", spot.id);
            if (budget) prefillParams.append("budget", budget.toString());
            if (vibe) prefillParams.append("vibe", vibe);
            prefillParams.append("squad", squadCount.toString());

            return (
              <div 
                key={spot.id} 
                className={`bg-white border rounded-[20px] flex flex-col overflow-hidden dossier-card h-full transition-all duration-200 ${
                  spot.fitsBudget 
                    ? "border-border-default hover:border-black" 
                    : "border-border-default opacity-50"
                }`}
              >
                {/* Scrubbable Photo Container */}
                <div className="w-full aspect-[4/3] relative border-b border-border-default bg-surface-grey">
                  <ScrubbablePhotos venueName={spot.name} />
                  
                  {/* Category overlay */}
                  <div className="absolute top-3 inset-x-3 flex justify-between items-start z-40 pointer-events-none">
                    <span className="bg-black text-white text-[9px] font-extrabold tracking-widest uppercase px-2 py-1 rounded-[4px] shadow-sm select-none">
                      {spot.category}
                    </span>
                    <div className="pointer-events-auto flex items-center gap-2">
                      <SaveForLater spot={spot} />
                      <TrustBadge status="verified" freshnessText="today" />
                    </div>
                  </div>
                </div>

                {/* Listing information */}
                <div className="p-6 flex flex-col flex-grow text-left">
                  <h3 className="type-heading text-text-primary mb-2 uppercase leading-tight font-black">{spot.name}</h3>
                  <p className="type-caption text-text-muted mb-4 line-clamp-1">{spot.address}</p>

                  <div className="mt-auto pt-4 border-t border-border-default flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-sans font-black text-text-primary text-lg">₦{spot.price_per_person.toLocaleString('en-NG')}</span>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-0.5">/ person</span>
                    </div>
                    
                    <Link href={`/?${prefillParams.toString()}`}>
                      <Button className="bg-[#0A0A0A] text-white type-ui-label text-xs uppercase font-extrabold px-5 py-2.5 rounded-[8px] btn-intent-snaps cursor-pointer">
                        Forge Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 px-6 bg-surface-grey rounded-[24px] border border-border-default space-y-4">
            <p className="type-body text-text-muted">
              {budget 
                ? `To protect your budget, we've filtered out spots that exceed your ₦${budget.toLocaleString('en-NG')} limit. We only show venues with verified pricing so your squad never gets stranded.`
                : "No spots match your active vibe or budget filters."}
            </p>
            <Link href={`/explore/${slug}`} className="type-label text-brand-green hover:underline inline-block mt-2">
              Clear filters and view all verified spots &rarr;
            </Link>
          </div>
        )}
      </AreaLayout>
    </main>
  );
}
