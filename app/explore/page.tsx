import { captureServerException } from "@/lib/sentry";
import { getAreasWithSpotCounts } from "@/lib/queries/areas";
import { getAllZones, getActiveSpotsByZone } from "@/lib/queries/zones";
import PageError from "@/components/PageError";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Lagos Outings by Zone — OyaPlan",
  description: "Browse spots, restaurants, activities, and hidden gems across all Lagos zones. Find your next squad outing.",
  openGraph: {
    images: ["/og"],
  }
};

export default async function ExploreIndex({
  searchParams
}: {
  searchParams: Promise<{ budget?: string; vibe?: string }>
}) {
  const params = await searchParams;

  let zones: Array<{ id: string; name: string; slug: string; description: string; activeSpotCount: number; areaCount: number }> = [];
  let areas: Array<{ id: string; name: string; slug: string; activeSpotCount: number }> = [];

  let fetchError = false;
  try {
    const [zonesResult, spotsResult, areasResult] = await Promise.all([
      getAllZones(),
      getActiveSpotsByZone(),
      getAreasWithSpotCounts(),
    ]);

    if (zonesResult.error || spotsResult.error || areasResult.error) {
      fetchError = true;
    } else {
      const spotsData = spotsResult.data || [];
      zones = (zonesResult.data || []).map((zone) => {
        const zoneSpots = spotsData.filter((s) => s.zone === zone.slug);
        const uniqueAreas = new Set(zoneSpots.map((s) => s.area_id));
        return {
          ...zone,
          activeSpotCount: zoneSpots.length,
          areaCount: uniqueAreas.size,
        };
      }).filter((zone) => zone.activeSpotCount > 0);

      areas = (areasResult.data || []).filter((area) => area.activeSpotCount > 0);
    }
  } catch (e) {
    captureServerException(e);
    fetchError = true;
  }

  if (fetchError) {
    return (
      <PageError
        message="We could not load zone data. Please try again."
        href="/"
        linkLabel="Back to planner"
      />
    );
  }

  return (
    <main className="min-h-screen bg-white text-text-primary pb-20 antialiased">
      {/* Context Banner */}
      {params.budget && params.vibe && (
        <div className="bg-brand-green text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="type-label">Showing spots for your ₦{parseInt(params.budget).toLocaleString()} {params.vibe} outing</p>
            <Link href="/explore" className="type-label text-white/80 hover:text-white underline">Clear</Link>
          </div>
        </div>
      )}

      <div className="bg-surface-grey border-b border-border-default py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-6 tap-feedback">
            <ArrowLeft className="w-4 h-4" />
            Back to Planner
          </Link>
          <h1 className="type-display text-text-primary">Explore Lagos</h1>
          <p className="type-body text-text-muted mt-2">Select a zone to see what&apos;s happening.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zones.map((zone) => {
            const zoneParams = new URLSearchParams();
            if (params.budget) zoneParams.append("budget", params.budget);
            if (params.vibe) zoneParams.append("vibe", params.vibe);
            const href = zoneParams.toString() ? `/explore/${zone.slug}?${zoneParams.toString()}` : `/explore/${zone.slug}`;

            return (
              <Link
                key={zone.id}
                href={href}
                className="group p-8 bg-white border border-border-default rounded-[20px] hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)] transition-all text-left tap-feedback flex flex-col justify-between"
              >
                <div>
                  <h3 className="type-heading text-text-primary group-hover:text-brand-green transition-colors">{zone.name}</h3>
                  <p className="type-caption text-text-muted mt-1">{zone.areaCount} areas</p>
                  <p className="type-body text-text-muted mt-4">{zone.description}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-border-default">
                  <span className="type-label text-brand-green">{zone.activeSpotCount} active spots</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 border-t border-border-default pt-8">
          <details className="group">
            <summary className="list-none cursor-pointer flex items-center gap-2 type-label text-text-primary hover:text-brand-green transition-colors tap-feedback outline-none select-none">
              Browse by specific area <span className="text-text-muted group-open:rotate-90 transition-transform duration-300">→</span>
            </summary>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
              {areas.map((area) => {
                const areaParams = new URLSearchParams();
                if (params.budget) areaParams.append("budget", params.budget);
                if (params.vibe) areaParams.append("vibe", params.vibe);
                const href = areaParams.toString() ? `/explore/${area.slug}?${areaParams.toString()}` : `/explore/${area.slug}`;

                return (
                  <Link
                    key={area.id}
                    href={href}
                    className="group p-6 bg-surface-grey border border-border-default rounded-[16px] hover:border-brand-green hover:shadow-[0px_4px_12px_rgba(0,135,81,0.05)] transition-all text-left tap-feedback"
                  >
                    <h3 className="type-subheading text-text-primary group-hover:text-brand-green transition-colors lowercase first-letter:uppercase">{area.name}</h3>
                    <p className="type-caption text-text-muted mt-1">{area.activeSpotCount} spots</p>
                  </Link>
                );
              })}
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}
