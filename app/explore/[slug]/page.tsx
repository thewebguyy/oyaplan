import { captureServerException } from "@/lib/sentry";
import { getZoneBySlug, getZoneNameBySlug } from "@/lib/queries/zones";
import { getAreasByZone, getAreaWithSpots, getAreaNameBySlug } from "@/lib/queries/areas";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import PageError from "@/components/PageError";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ budget?: string; vibe?: string }>;
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
  let area: { id: string; name: string; slug: string; spots: Array<{ id: string; name: string; active: boolean; category: string; address: string; price_per_person: number; fitsBudget?: boolean }> } | null = null;
  let areaFetchError = false;
  try {
    const { data, error, notFound: isNotFound } = await getAreaWithSpots(slug);
    if (isNotFound) notFound();
    if (error) {
      areaFetchError = true;
    } else {
      area = data as { id: string; name: string; slug: string; spots: Array<{ id: string; name: string; active: boolean; category: string; address: string; price_per_person: number; fitsBudget?: boolean }> };
    }
  } catch (e) {
    captureServerException(e);
    areaFetchError = true;
  }

  if (areaFetchError) {
    return <PageError message="We could not load this area. Please try again." href="/explore" linkLabel="Back to Explore" />;
  }

  if (!area) notFound();

  // Process spots with budget awareness
  const spots = (area.spots || []).filter((s) => s.active !== false).map((spot) => {
    const estimatedTotal = spot.price_per_person * 2 * 1.1;
    const fitsBudget = budget ? estimatedTotal <= budget : true;
    return { ...spot, fitsBudget };
  }).sort((a, b) => {
    if (a.fitsBudget && !b.fitsBudget) return -1;
    if (!a.fitsBudget && b.fitsBudget) return 1;
    return 0;
  });

  return (
    <main className="min-h-screen bg-white text-text-primary pb-20 antialiased">
      {budget && vibe && (
        <div className="bg-brand-green text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="type-label">Showing spots in <span className="lowercase first-letter:uppercase">{area.name}</span> for your ₦{budget.toLocaleString('en-NG')} outing</p>
            <Link href={`/explore/${slug}`} className="type-label text-white/80 hover:text-white underline">Clear</Link>
          </div>
        </div>
      )}

      <div className="bg-surface-grey border-b border-border-default py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* We determine back path dynamically. If we don't know the zone, we just link to explore. But spots have zone! */}
          <Link href={`/explore`} className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-6 tap-feedback">
            <ArrowLeft className="w-4 h-4" />
            Back to Zones
          </Link>
          <h1 className="type-display text-text-primary lowercase first-letter:uppercase">{area.name}</h1>
          <p className="type-body text-text-muted mt-2">Found {spots.length} spots in this area.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-6">
        {spots.length > 0 ? (
          spots.map((spot) => {
            const prefillParams = new URLSearchParams();
            prefillParams.append("startArea", slug);
            prefillParams.append("pinnedSpotId", spot.id);
            if (budget) prefillParams.append("budget", budget.toString());
            if (vibe) prefillParams.append("vibe", vibe);

            return (
              <div 
                key={spot.id} 
                className={`p-4 sm:p-8 border rounded-[16px] sm:rounded-[20px] transition-all duration-200 ${
                  spot.fitsBudget 
                    ? "bg-white border-border-default hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)]" 
                    : "bg-surface-grey border-border-default opacity-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-4 text-left flex-1">
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <h3 className="type-subheading sm:type-heading text-text-primary">{spot.name}</h3>
                        <div className="bg-surface-grey text-text-muted px-2 py-0.5 rounded-[4px] text-[10px] font-[700] uppercase tracking-tighter border border-border-default">
                          {spot.category}
                        </div>
                        {budget && spot.fitsBudget && (
                          <div className="bg-brand-green text-white px-2 py-0.5 rounded-[4px] text-[10px] font-[700] uppercase tracking-tighter">
                            Fits budget
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 type-caption text-text-muted">
                        <MapPin className="w-[14px] h-[14px] shrink-0" />
                        <span className="truncate">{spot.address}</span>
                      </div>
                    </div>
                    
                    <p className="type-label sm:type-subheading text-brand-green">
                      Avg ₦{spot.price_per_person.toLocaleString('en-NG')} <span className="type-caption text-text-muted">/ person</span>
                    </p>
                  </div>
                  
                  <Link href={`/?${prefillParams.toString()}`} className="w-full sm:w-auto mt-2 sm:mt-0">
                    <Button className="bg-brand-green hover:bg-brand-green-70 text-white type-label h-[44px] sm:h-[48px] px-6 sm:px-8 rounded-[10px] tap-feedback w-full shadow-none border-none">
                      Plan around this
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-surface-grey rounded-[24px] border border-border-default space-y-4">
            <p className="type-body text-text-muted">No spots found in this area yet.</p>
            <Link href="/suggest-a-spot" className="type-label text-brand-green hover:underline inline-block">
              Know a hidden gem here? Suggest it &rarr;
            </Link>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-20 pt-12 border-t border-border-default text-center">
        <Link href="/suggest-a-spot" className="type-label text-text-muted hover:text-text-secondary hover:underline transition-all">
          Know a spot that should be here? Suggest it &rarr;
        </Link>
      </div>
    </main>
  );
}
