import { captureServerException } from "@/lib/sentry";
import { getAllZones, getActiveSpotsByZone } from "@/lib/queries/zones";
import PageError from "@/components/PageError";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import GuidedDiscoveryClient from "@/components/explore/GuidedDiscoveryClient";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Lagos Outings — OyaPlan",
  description: "Find your next squad outing across all Lagos zones.",
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
  const targetBudget = params.budget ? parseInt(params.budget) : null;
  const targetVibe = params.vibe || null;

  let zones: Array<{ id: string; name: string; slug: string; description: string; activeSpotCount: number; areaCount: number }> = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recommendedSpots: Array<any> = [];

  let fetchError = false;
  try {
    const [zonesResult, spotsResult] = await Promise.all([
      getAllZones(),
      getActiveSpotsByZone(),
    ]);

    if (zonesResult.error || spotsResult.error) {
      fetchError = true;
    } else {
      const allSpots = spotsResult.data || [];
      
      // Calculate zone metrics
      zones = (zonesResult.data || []).map((zone) => {
        const zoneSpots = allSpots.filter((s) => s.zone === zone.slug);
        const uniqueAreas = new Set(zoneSpots.map((s) => s.area_id));
        return {
          ...zone,
          activeSpotCount: zoneSpots.length,
          areaCount: uniqueAreas.size,
        };
      }).filter((zone) => zone.activeSpotCount > 0);

      // If budget is specified, find matching spots
      if (targetBudget) {
        recommendedSpots = allSpots.filter((spot) => {
          if (spot.active === false) return false;
          // Approximate total for a group of 2 with 10% buffer
          const estimatedTotal = spot.price_per_person * 2 * 1.1;
          return estimatedTotal <= targetBudget;
        });

        // Simple string matching for vibe if selected
        if (targetVibe) {
           // For MVP, we'll softly sort them based on vibe string match.
           // A real implementation would have explicit vibe mappings on spots.
           recommendedSpots.sort((a, b) => {
             const aMatch = (a.category || "").toLowerCase().includes(targetVibe.toLowerCase());
             const bMatch = (b.category || "").toLowerCase().includes(targetVibe.toLowerCase());
             if (aMatch && !bMatch) return -1;
             if (!aMatch && bMatch) return 1;
             return 0;
           });
        }

        // Limit to 6 recommendations for UX
        recommendedSpots = recommendedSpots.slice(0, 6);
      }
    }
  } catch (e) {
    captureServerException(e);
    fetchError = true;
  }

  if (fetchError) {
    return (
      <PageError
        message="We could not load explore data. Please try again."
        href="/"
        linkLabel="Back to planner"
      />
    );
  }

  return (
    <main className="min-h-screen bg-white text-text-primary pb-20 antialiased">
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <Link href="/" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-8 tap-feedback">
          <ArrowLeft className="w-4 h-4" />
          Back to Planner
        </Link>
        <h1 className="type-display text-text-primary">What feels right today?</h1>
        <p className="type-body text-text-muted mt-2">Let&apos;s find something you&apos;ll actually enjoy.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        <GuidedDiscoveryClient />
      </div>

      {targetBudget && (
        <div className="max-w-4xl mx-auto px-4 mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-end justify-between mb-8">
            <h2 className="type-heading text-text-primary">Ready-to-go plans for ₦{targetBudget.toLocaleString('en-NG')}</h2>
          </div>

          <div className="space-y-4">
            {recommendedSpots.length > 0 ? (
              recommendedSpots.map((spot) => {
                const prefillParams = new URLSearchParams();
                prefillParams.append("pinnedSpotId", spot.id);
                if (spot.zone) prefillParams.append("startArea", spot.zone);
                if (targetBudget) prefillParams.append("budget", targetBudget.toString());
                if (targetVibe) prefillParams.append("vibe", targetVibe);

                return (
                  <div 
                    key={spot.id} 
                    className="p-5 sm:p-6 bg-white border border-border-default rounded-[20px] hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)] transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="type-subheading text-text-primary">{spot.name}</h3>
                          <div className="bg-surface-grey text-text-muted px-2 py-0.5 rounded-[4px] text-[10px] font-[700] uppercase tracking-tighter border border-border-default">
                            {spot.category || 'Spot'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 type-caption text-text-muted flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[200px]">{spot.address}</span>
                          </div>
                          
                          {/* Trust Context Badges */}
                          <div className="flex items-center gap-1.5 text-brand-green">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Typical total spend: ₦{((spot.price_per_person || 0) * 2 * 1.1).toLocaleString('en-NG')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Updated this week</span>
                          </div>
                        </div>
                      </div>
                      
                      <Link href={`/?${prefillParams.toString()}`} className="w-full sm:w-auto">
                        <Button className="bg-brand-green hover:bg-brand-green-70 text-white type-label h-[44px] px-6 rounded-[10px] tap-feedback w-full shadow-none border-none">
                          Build a plan around {spot.name}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-surface-grey rounded-[24px] border border-border-default space-y-4">
                <p className="type-body text-text-muted">We haven&apos;t mapped this exact scenario yet.</p>
                <Link href="/" className="type-label text-brand-green hover:underline inline-block">
                  Let&apos;s build a custom plan from scratch &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 mt-24">
        <h2 className="type-subheading text-text-primary mb-6">Know where you&apos;re heading?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {zones.map((zone) => {
            return (
              <Link
                key={zone.id}
                href={`/explore/${zone.slug}`}
                className="group p-5 bg-surface-grey border border-border-default rounded-[16px] hover:border-brand-green hover:bg-white hover:shadow-[0px_4px_12px_rgba(0,135,81,0.05)] transition-all text-left tap-feedback flex items-center justify-between"
              >
                <div>
                  <h3 className="type-label text-text-primary group-hover:text-brand-green transition-colors">{zone.name}</h3>
                </div>
                <div className="text-text-muted group-hover:text-brand-green transition-colors">
                  &rarr;
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 mt-20 pt-12 border-t border-border-default text-center">
        <Link href="/" className="type-label text-text-muted hover:text-text-secondary hover:underline transition-all">
          Skip exploration and go straight to the Forge &rarr;
        </Link>
      </div>
    </main>
  );
}
