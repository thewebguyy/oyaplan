import dynamic from "next/dynamic";
import ErrorBanner from "@/components/ErrorBanner";
import PageError from "@/components/PageError";
import { captureServerException } from "@/lib/sentry";
import { getActiveAreas } from "@/lib/queries/areas";
import { Area } from "@/lib/types";
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
  let areas: Area[] = [];
  let landingFetchError = false;

  try {
    const areasResult = await getActiveAreas();

    if (areasResult.error) {
      landingFetchError = true;
    } else {
      areas = (areasResult.data || []) as Area[];
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
                   <ForgeForm areas={areas} />
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
                  <ForgeForm areas={areas} />
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="type-heading text-midnight-lagoon">Explore Lagos</h2>
              <Link href="/explore" className="text-sm font-bold text-atlantic-blue hover:text-midnight-lagoon transition-colors">
                Map view
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {areas.map((area) => (
                <Link
                  key={area.id}
                  href={`/explore/${area.slug}`}
                  className="px-4 py-2 bg-white border border-border-default rounded-full type-ui-label text-text-primary chip-fill tap-feedback"
                >
                  {area.name}
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

