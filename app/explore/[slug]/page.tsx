import { captureServerException } from "@/lib/sentry";
import { getZoneBySlug, getZoneNameBySlug } from "@/lib/queries/zones";
import { getAreasByZone, getAreaWithSpots, getAreaNameBySlug } from "@/lib/queries/areas";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PageError from "@/components/PageError";
import { Spot } from "@/lib/types";
import { VenueCardStack } from "@/components/explore/VenueCardStack";

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
  const squadCount = urlParams.squad ? parseInt(urlParams.squad) : 2;

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
      <main className="min-h-[100dvh] bg-[#FAFAF8] text-text-primary pb-20 antialiased pt-8">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/explore" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-6 tap-feedback">
            <ArrowLeft className="w-4 h-4" />
            Back to All Zones
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-midnight-lagoon tracking-tight mb-3 capitalize">{zoneData.name}</h1>
          <p className="text-lg text-text-muted">{zoneData.description}</p>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {areas?.map((area) => {
              const areaParams = new URLSearchParams();
              if (urlParams.budget) areaParams.append("budget", urlParams.budget);
              if (urlParams.vibe) areaParams.append("vibe", urlParams.vibe);
              if (urlParams.squad) areaParams.append("squad", urlParams.squad);
              const href = areaParams.toString() ? `/explore/${area.slug}?${areaParams.toString()}` : `/explore/${area.slug}`;

              return (
                <Link 
                  key={area.id} 
                  href={href}
                  className="group p-8 bg-white border border-border-default rounded-[20px] hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)] transition-all text-left tap-feedback block"
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

  // Process spots with budget and vibe filters
  let filteredSpots: FilteredSpot[] = (area.spots || []).filter((s) => s.active !== false).map((spot) => {
    // No 1.1× buffer — derived_typical_cost already includes VAT (Phase 3A parity with Forge)
    const estimatedTotal = spot.price_per_person * squadCount;
    const fitsBudget = budget ? estimatedTotal <= budget : true;
    const fitsVibe = vibe && spot.vibe_tags ? spot.vibe_tags.includes(vibe) : true;
    
    return {
      ...spot,
      fitsBudget,
      fitsVibe
    };
  });

  // Filter out spots that don't match (unlike before where we just grayed them out, 
  // in a Tinder stack we want to only show valid options)
  filteredSpots = filteredSpots.filter(s => s.fitsBudget && s.fitsVibe);
  
  // Shuffle or sort based on trending score
  filteredSpots.sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0));

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] pt-8 flex flex-col relative overflow-hidden">
      <div className="w-full max-w-lg mx-auto px-6 mb-6 flex flex-col z-10 relative pointer-events-none">
        <Link href="/explore" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-2 w-fit pointer-events-auto tap-feedback">
          <ArrowLeft className="w-4 h-4" />
          All Areas
        </Link>
        <div className="flex items-end justify-between">
          <h1 className="text-3xl font-black text-midnight-lagoon capitalize">{area.name}</h1>
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{filteredSpots.length} venues</span>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center pb-12 z-10">
        <VenueCardStack 
          spots={filteredSpots} 
          slug={slug} 
          budget={budget || undefined} 
          vibe={vibe || undefined} 
          squadCount={squadCount} 
        />
      </div>
      
      {/* Background decoration to replace map feel */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #008751 0%, transparent 60%)',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
      }} />
    </div>
  );
}
