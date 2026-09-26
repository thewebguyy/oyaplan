import { captureServerException } from "@/lib/sentry";
import { getZoneBySlug, getZoneNameBySlug } from "@/lib/queries/zones";
import { getAreasByZone, getAreaWithSpots, getAreaNameBySlug, getAreasWithSpotCounts } from "@/lib/queries/areas";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PageError from "@/components/PageError";
import { Spot } from "@/lib/types";
import { ExploreClient } from "@/components/explore/ExploreClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ 
    budget?: string; 
    vibe?: string; 
    squad?: string; 
    category?: string;
    pinned?: string; 
    spot?: string;
    q?: string;
    sort?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data: zone } = await getZoneNameBySlug(slug);
    if (zone) {
      return {
        title: `Explore ${zone.name} Lagos — OyaPlan Outing Guide`,
        description: `Discover verified dining, nightlife, and activities in ${zone.name} Lagos with complete budget confidence.`,
      };
    }
    const { data: area } = await getAreaNameBySlug(slug);
    if (area) {
      return {
        title: `${area.name} Outing Spots & Prices — OyaPlan`,
        description: `Verified restaurant menus, lounges, and activities in ${area.name}, Lagos. Know what you'll spend before you leave home.`,
      };
    }
  } catch (e) {
    captureServerException(e);
  }
  return { title: "Explore Lagos Spots — OyaPlan" };
}

export default async function ExploreSlug({ params, searchParams }: Props) {
  const { slug } = await params;
  const urlParams = await searchParams;

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
    return <PageError message="We couldn't load this zone right now." href="/explore" linkLabel="Back to All Spots" />;
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
      return <PageError message="We couldn't load this right now." href="/explore" linkLabel="Back to All Spots" />;
    }

    return (
      <main className="min-h-[100dvh] bg-[#FAFAF8] text-text-primary pb-20 antialiased pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/explore" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-midnight-lagoon transition-colors mb-6 tap-feedback">
            <ArrowLeft className="w-4 h-4" />
            Back to All Spots
          </Link>
          <h1 className="text-3xl md:text-5xl font-black text-midnight-lagoon tracking-tight mb-3 capitalize">{zoneData.name}</h1>
          <p className="text-base md:text-lg text-text-muted">{zoneData.description}</p>
        </div>

        <div className="max-w-4xl mx-auto mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {areas?.map((area) => (
              <Link 
                key={area.id} 
                href={`/explore/${area.slug}`}
                className="group p-6 bg-white border border-[#E5E7EB] rounded-3xl hover:border-[#008751] hover:shadow-md transition-all text-left tap-feedback block"
              >
                <h3 className="text-xl font-black text-midnight-lagoon group-hover:text-[#008751] transition-colors">{area.name}</h3>
                <p className="text-xs text-text-muted mt-2 font-bold">{area.activeSpotCount} verified spots to discover</p>
              </Link>
            ))}
            
            {areas.length === 0 && (
              <div className="col-span-full text-center py-20 bg-surface-grey rounded-3xl border border-[#E5E7EB] space-y-4">
                <p className="text-sm text-text-muted font-bold">No active areas found in this zone yet.</p>
                <Link href="/suggest-a-spot" className="text-xs font-black text-[#008751] hover:underline inline-block">
                  Know a hidden gem here? Suggest it &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // 2. Area View
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
    return <PageError message="We couldn't load this area right now." href="/explore" linkLabel="Back to All Spots" />;
  }

  if (!area) notFound();

  // Load all available areas for switching
  const { data: allAreas } = await getAreasWithSpotCounts();
  const validAreas = (allAreas || []).filter((a) => a.activeSpotCount > 0);

  // If a pinned spot is requested in query params, prioritize it at the top
  const targetId = urlParams.pinned || urlParams.spot;
  let areaSpots = [...area.spots];
  if (targetId && areaSpots.length > 0) {
    const pinnedIndex = areaSpots.findIndex(
      (s) =>
        s.id === targetId ||
        s.address_slug === targetId ||
        s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === targetId.toLowerCase()
    );
    if (pinnedIndex > 0) {
      const [pinnedSpot] = areaSpots.splice(pinnedIndex, 1);
      areaSpots.unshift(pinnedSpot);
    }
  }

  return (
    <div className="relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-20">
        <Link 
          href="/explore" 
          className="inline-flex items-center gap-1.5 text-xs font-black text-text-muted hover:text-midnight-lagoon transition-colors py-1.5 px-3 rounded-xl bg-white border border-[#E5E7EB] hover:bg-surface-grey tap-feedback w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Lagos Spots</span>
        </Link>
      </div>

      <ExploreClient
        initialSpots={areaSpots}
        availableAreas={validAreas}
        preselectedAreaSlug={area.slug}
        preselectedAreaName={area.name}
        title={`${area.name} Outing Spots`}
        subtitle={`Verified restaurants, bars, cafes, and activities in ${area.name}. Compare spend and plan with confidence.`}
      />
    </div>
  );
}
