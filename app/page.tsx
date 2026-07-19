import dynamic from "next/dynamic";
import ErrorBanner from "@/components/ErrorBanner";
import PageError from "@/components/PageError";
import { captureServerException } from "@/lib/sentry";
import { getAreasWithSpotCounts } from "@/lib/queries/areas";
import { getForgeSpots } from "@/lib/queries/spots";
import { Area, Spot } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";
import MobilePlannerDrawer from "@/components/MobilePlannerDrawer";
import AnimatedHeadline from "@/components/AnimatedHeadline";
import TimeGreeting from "@/components/TimeGreeting";
import ExperienceCollections from "@/components/ExperienceCollections";
import RecentlyVerified from "@/components/RecentlyVerified";
import TrustSection from "@/components/TrustSection";
import { Button } from "@/components/ui/button";
import RevealOnScroll from "@/components/motion/RevealOnScroll";


const ForgeForm = dynamic(() => import("@/components/ForgeForm"), {
  ssr: true,
  loading: () => <div className="h-64 shimmer-bg opacity-10 rounded-[24px]" />,
});

export const revalidate = 300;

export default async function LandingPage() {
  let areas: Array<Area & { activeSpotCount?: number }> = [];
  let spots: Spot[] = [];
  let landingFetchError = false;

  try {
    const [areasResult, spotsResult] = await Promise.all([
      getAreasWithSpotCounts(),
      getForgeSpots()
    ]);

    if (areasResult.error || spotsResult.error) {
      landingFetchError = true;
    } else {
      areas = (areasResult.data || []) as Array<Area & { activeSpotCount?: number }>;
      spots = (spotsResult.data || []) as Spot[];
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
    <main className="min-h-screen bg-white-sand text-text-primary antialiased">
      <Suspense fallback={null}>
        <ErrorBanner />
      </Suspense>

      {/* Hero Section — FROZEN, do not modify */}
      <div className="relative pt-24 md:pt-32 pb-12 px-4 flex flex-col items-center justify-start overflow-hidden bg-[#FFFBF2]">
        {/* Animated Lagos Vector Illustration */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-end justify-center overflow-hidden">
          <div className="w-full h-full bg-[url('/illustrations/lagos-animated.svg')] bg-cover bg-no-repeat bg-bottom mix-blend-multiply opacity-90" />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center flex flex-col items-center mt-4 mb-8">
          <TimeGreeting />
          <AnimatedHeadline />

          {/* Static Preview Cost Card (Proof of Mechanism) */}
          <div className="mt-8 w-full max-w-sm bg-white border border-border-default/80 rounded-[20px] p-5 shadow-[0px_12px_24px_-8px_rgba(1,5,40,0.04)] text-left font-mono text-xs text-text-secondary space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200">
            <div className="flex items-center justify-between border-b border-border-default/40 pb-2">
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-text-muted">Verification Proof</span>
              <span className="bg-[#008751]/10 text-[#008751] px-2 py-0.5 rounded-full font-sans font-bold text-[9px] uppercase tracking-wider">Lagos Outing</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span>1x Date Night in Ikeja</span>
                <span className="font-semibold text-text-primary">₦35,000</span>
              </div>
              <div className="flex justify-between">
                <span>Round-trip Transport (Bolt)</span>
                <span className="font-semibold text-text-primary">₦4,000</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Baked-in Buffer (VAT & service)</span>
                <span className="font-semibold">Included</span>
              </div>
            </div>
            <div className="flex justify-between border-t border-dashed border-border-default/60 pt-2 text-sm font-black text-midnight-lagoon">
              <span>ESTIMATED TOTAL</span>
              <span>₦39,000</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center w-full max-w-sm gap-4">
            {/* Desktop Start Planning Button */}
            <div className="hidden md:block w-full">
              <Link href="#planner" className="w-full block">
                <Button className="w-full h-14 bg-lasgidi-yellow hover:bg-[#E2B63B] text-midnight-lagoon font-[900] text-lg rounded-full shadow-lg tap-feedback btn-spring border-none">
                  Start Planning
                </Button>
              </Link>
            </div>
            {/* Mobile Drawer Trigger */}
            <div className="md:hidden w-full">
              <MobilePlannerDrawer>
                 <Suspense fallback={<div className="h-64 shimmer-bg opacity-10 rounded-[24px]" />}>
                   <ForgeForm areas={areas as Area[]} spots={spots} />
                 </Suspense>
              </MobilePlannerDrawer>
            </div>
          </div>
        </div>
      </div>

      {/* Section divider — thin gradient line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-border-default to-transparent" />

      {/* ── CHAPTER 1: Planner ── */}
      <section className="section-focused w-full pb-10 pt-10">
        <div className="max-w-4xl mx-auto px-4">
          <div id="planner" className="hidden md:block scroll-mt-24">
            <RevealOnScroll>
              <div className="bg-white rounded-[28px] shadow-[0px_24px_48px_-12px_rgba(1,5,40,0.08)] border border-border-default/50 overflow-hidden p-2 text-text-primary max-w-lg mx-auto">
                <Suspense fallback={<div className="h-64 shimmer-bg opacity-10 rounded-[24px]" />}>
                  <ForgeForm areas={areas} spots={spots} />
                </Suspense>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── CHAPTER 2: Collections — full-bleed ── */}
      <section className="section-exciting w-full py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <ExperienceCollections />
        </div>
      </section>

      {/* ── CHAPTER 3: Explore Lagos ── */}
      <section className="section-explore w-full py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <RevealOnScroll>
            <div className="flex items-center justify-between mb-8">
              <h2 className="type-heading text-midnight-lagoon">Explore Lagos</h2>
              <Link href="/explore" className="text-sm font-bold text-atlantic-blue hover:text-midnight-lagoon transition-colors">
                Map view
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {areas.map((area) => (
                <Link
                  key={area.id}
                  href={`/explore/${area.slug}`}
                  className="group relative p-5 bg-white border border-border-default/60 rounded-[20px] shadow-xs hover:shadow-lift-warm tap-feedback card-lift overflow-hidden flex flex-col justify-between h-28"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-midnight-lagoon/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex flex-col justify-between h-full w-full">
                    <span className="type-ui-label text-midnight-lagoon font-bold text-base group-hover:text-brand-green transition-colors">
                      {area.name}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-text-muted mt-auto">
                      {area.activeSpotCount ?? 0} spots
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── CHAPTER 4: Recently Verified ── */}
      <section className="section-trustworthy w-full py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <Suspense fallback={null}>
            <RecentlyVerified />
          </Suspense>
        </div>
      </section>

      {/* ── CHAPTER 5: Trust ── */}
      <section className="section-editorial w-full py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <TrustSection />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="section-quiet border-t border-border-default/50 py-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <span className="text-midnight-lagoon font-black tracking-tighter text-lg uppercase select-none">
              OyaPlan
            </span>
            <nav className="flex items-center gap-6 sm:gap-8">
              <Link href="/explore" className="type-caption text-text-muted hover:text-midnight-lagoon transition-colors font-medium">
                Explore
              </Link>
              <span className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
              <Link href="/guides" className="type-caption text-text-muted hover:text-midnight-lagoon transition-colors font-medium">
                Guides
              </Link>
              <span className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
              <Link href="/list-your-spot" className="type-caption text-text-muted hover:text-midnight-lagoon transition-colors font-medium">
                Own a venue?
              </Link>
            </nav>
            <p className="type-caption text-text-muted">&copy; {new Date().getFullYear()} OyaPlan</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

