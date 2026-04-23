import ForgeForm from "@/components/ForgeForm";
import ErrorBanner from "@/components/ErrorBanner";
import { supabase } from "@/lib/supabase";
import { Area } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";

export const revalidate = 300;

export default async function LandingPage() {
  const [areasResult, planCountResult, recentPlansResult, trendingResult] = await Promise.all([
    supabase.from("areas").select("*").eq("active", true).order("name"),
    supabase.from("plan_requests").select("*", { count: "exact", head: true }),
    supabase.from("shared_plans").select(`
      total_cost,
      spots (
        name,
        areas (
          name
        )
      )
    `).order("created_at", { ascending: false }).limit(4),
    supabase.from("spots").select("id, name, zone, trending_score").gt("trending_score", 0).order("trending_score", { ascending: false }).limit(5)
  ]);

  const areas = areasResult.data || [];
  const planCount = planCountResult.count || 0;
  const recentPlans = (recentPlansResult.data || []).filter(p => p.spots && (p.spots as any).areas);
  const trendingSpots = trendingResult.data || [];

  return (
    <main className="min-h-screen bg-brand-green text-white antialiased">
      <Suspense fallback={null}>
        <ErrorBanner />
      </Suspense>
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 px-4 overflow-visible">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="type-display text-white">
            Stop the group chat wahala. <br />
            <span className="text-brand-yellow">Get one complete plan in 3s.</span>
          </h1>
          <p className="type-body text-white/80 max-w-2xl mx-auto">
            Input 4 simple fields. Get the exact food cost, transport estimate, and "why it fits" note. Copy to WhatsApp and go.
          </p>

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
            <div className="flex overflow-x-auto gap-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {trendingSpots.map((spot: any) => (
                <Link 
                  key={spot.id} 
                  href={`/explore/${spot.zone}?pinnedSpotId=${spot.id}`} 
                  className="min-w-[200px] p-5 border border-border-default rounded-[16px] bg-surface-grey hover:border-brand-green hover:shadow-[0px_4px_12px_rgba(0,135,81,0.08)] transition-all tap-feedback shrink-0 flex flex-col justify-between"
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
      <div className="bg-[#004d2e] text-white py-24 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {recentPlans.length > 0 && (
            <div className="space-y-6">
              <h2 className="type-label text-white/60">Recently planned outings</h2>
              <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-3 overflow-x-auto pb-4 md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {recentPlans.map((plan: any, i) => (
                  <div key={i} className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 flex items-center gap-2 shrink-0">
                    <span className="type-label text-white/90 lowercase first-letter:uppercase">{plan.spots.name}</span>
                    <span className="text-white/20">&bull;</span>
                    <span className="type-label text-brand-yellow">₦{plan.total_cost.toLocaleString()}</span>
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
