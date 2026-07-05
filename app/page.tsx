import ForgeForm from "@/components/ForgeForm";
import ErrorBanner from "@/components/ErrorBanner";
import PageError from "@/components/PageError";
import { captureServerException } from "@/lib/sentry";
import { getActiveAreas } from "@/lib/queries/areas";
import { getPlanCount, getRecentSharedPlans } from "@/lib/queries/plans";
import { getTrendingSpots } from "@/lib/queries/spots";
import { Area } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";

export const revalidate = 300;

export default async function LandingPage() {
  // Areas are critical — the form cannot render without them.
  // Supplementary data (plan count, recent plans, trending) degrades to empty.
  let areas: Area[] = [];
  let planCount = 0;
  let recentPlans: Array<{ total_cost: number; spots: { name: string; areas: { name: string } } }> = [];
  let trendingSpots: Array<{ id: string; name: string; zone: string }> = [];

  let landingFetchError = false;
  try {
    const [areasResult, planCountResult, recentPlansResult, trendingResult] = await Promise.all([
      getActiveAreas(),
      getPlanCount(),
      getRecentSharedPlans(4),
      getTrendingSpots(5),
    ]);

    if (areasResult.error) {
      landingFetchError = true;
    } else {
      areas = (areasResult.data || []) as Area[];
      planCount = planCountResult.data;
      recentPlans = recentPlansResult.data || [];
      trendingSpots = (trendingResult.data || []) as typeof trendingSpots;
    }
  } catch (e) {
    captureServerException(e);
    landingFetchError = true;
  }

  if (landingFetchError) {
    return (
      <PageError
        message="We could not load the planner right now. Please try again in a moment."
        href="/"
        linkLabel="Try again"
      />
    );
  }

  return (
    <main className="min-h-screen bg-brand-green text-white antialiased">
      <Suspense fallback={null}>
        <ErrorBanner />
      </Suspense>
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 px-4 overflow-visible">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="type-display text-white">
            Know exactly where to go—<br />
            <span className="text-white underline decoration-brand-yellow decoration-4 underline-offset-8">and what it'll really cost.</span>
          </h1>
          <p className="type-body text-white/80 max-w-2xl mx-auto">
            Plan your next outing with real prices, transport costs, and trusted recommendations.
          </p>

          <div className="flex items-center justify-center gap-3 type-caption text-white/80 mt-6">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-green bg-surface-grey flex items-center justify-center overflow-hidden">
                  <span className="text-xs">👤</span>
                </div>
              ))}
            </div>
            <span>Over <strong className="text-white">10,000+</strong> verified prices in Lagos</span>
          </div>

          {/* Form Card Container */}
          <div className="mt-12 px-4 w-full relative z-10">
            <div className="bg-white rounded-[20px] shadow-[0px_24px_48px_rgba(0,0,0,0.15)] overflow-hidden">
              <Suspense fallback={<div className="h-96 shimmer-bg opacity-10 rounded-[20px]" />}>
                <ForgeForm areas={areas} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Spots Section */}
      {trendingSpots.length > 0 && (
        <div className="bg-white py-16 px-4 border-b border-border-default">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <h2 className="type-subheading text-text-primary">Trending in Lagos this week</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
              {trendingSpots.map((spot) => (
                <Link
                  key={spot.id}
                  href={`/explore/${spot.zone}?pinnedSpotId=${spot.id}`}
                  className="min-w-[200px] p-5 border border-border-default rounded-[16px] bg-surface-grey hover:border-brand-green hover:shadow-[0px_4px_12px_rgba(0,135,81,0.08)] transition-all tap-feedback shrink-0 flex flex-col justify-between snap-start"
                >
                  <h3 className="type-label text-text-primary mb-1 truncate">{spot.name}</h3>
                  <p className="type-caption text-text-muted capitalize">{spot.zone}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Social Proof Section */}
      <div className="relative bg-brand-green text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black/25 z-0" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
          {recentPlans.length > 0 && (
            <div className="space-y-6">
              <h2 className="type-label text-white/60">Recently planned outings</h2>
              <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-3 overflow-x-auto pb-4 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
                {recentPlans.map((plan, i) => (
                  <div key={i} className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 flex items-center gap-2 shrink-0 snap-start">
                    <span className="type-label text-white/90 lowercase first-letter:uppercase">{plan.spots.name}</span>
                    <span className="text-white/20">&bull;</span>
                    <span className="type-label text-brand-yellow">₦{plan.total_cost.toLocaleString('en-NG')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="type-display text-white md:text-[48px] leading-tight">
              {planCount > 0 ? (
                <>
                  Join <span className="text-brand-yellow">{planCount.toLocaleString('en-NG')}</span> Lagos squads who have already planned their outing.
                </>
              ) : (
                "Be the first Lagos squad to plan your outing today."
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 text-center text-white/60 space-y-3">
        <p className="type-body text-white/50">&copy; 2026 OyaPlan.com &middot; Built in Lagos.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <Link href="/list-your-spot" className="type-label text-white/40 hover:text-white transition-colors">
            Own a Lagos spot? Get listed &rarr;
          </Link>
          <Link href="/suggest-a-spot" className="type-label text-white/40 hover:text-white transition-colors">
            Know a hidden gem? Suggest a spot &rarr;
          </Link>
        </div>
      </footer>
    </main>
  );
}
