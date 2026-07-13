import dynamic from "next/dynamic";
import ErrorBanner from "@/components/ErrorBanner";
import PageError from "@/components/PageError";
import { captureServerException } from "@/lib/sentry";
import { getActiveAreas } from "@/lib/queries/areas";
import { Area } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";
import { CheckCircle, Clock, Heart, Coffee, MusicNotes, Lightning, ShareNetwork } from "@phosphor-icons/react/dist/ssr";
import MotionSection from "@/components/motion/MotionSection";
import MobilePlannerDrawer from "@/components/MobilePlannerDrawer";
import AnimatedHeadline from "@/components/AnimatedHeadline";
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
    <main className="min-h-screen bg-surface-grey text-text-primary antialiased">
      <Suspense fallback={null}>
        <ErrorBanner />
      </Suspense>

      {/* Hero Section */}
      <div className="relative pt-24 md:pt-32 pb-16 px-4 min-h-[85vh] flex flex-col items-center justify-start border-b border-border-default overflow-hidden bg-surface-grey">
        
        {/* Placeholder for Lagos Vector Illustration */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none flex items-end justify-center overflow-hidden">
          <div className="w-full h-[60%] bg-[url('/illustrations/lagos-vector-placeholder.svg')] bg-repeat-x bg-bottom opacity-30" style={{ backgroundSize: '800px' }} />
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-surface-grey to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center mt-4">
          <div className="w-full">
            <h1 className="font-extrabold text-5xl md:text-6xl tracking-tighter max-w-3xl mx-auto text-text-primary">
              <AnimatedHeadline />
              <br />
              know what it costs.
            </h1>
          </div>

          <div className="mt-4 px-4">
            <p className="type-body max-w-lg mx-auto md:text-lg text-text-secondary">
              We've already worked out the prices, transport, and hidden costs.
            </p>
          </div>

          <div className="w-full max-w-5xl mx-auto mt-10 flex flex-col md:flex-row gap-6 items-start justify-center">
            
            {/* Mobile Drawer Form */}
            <MobilePlannerDrawer>
               <Suspense fallback={<div className="h-64 shimmer-bg opacity-10 rounded-[24px]" />}>
                 <ForgeForm areas={areas} />
               </Suspense>
            </MobilePlannerDrawer>

            {/* Desktop Inline Form */}
            <div className="hidden md:block w-full md:w-1/2">
              <div className="bg-white rounded-[24px] shadow-float border border-transparent overflow-hidden p-2 text-text-primary">
                <Suspense fallback={<div className="h-64 shimmer-bg opacity-10 rounded-[24px]" />}>
                  <ForgeForm areas={areas} />
                </Suspense>
              </div>
            </div>

            {/* Static Plan Result Preview Card */}
            <div className="w-full md:w-1/2 md:sticky md:top-24 md:self-start">
               <div className="bg-white rounded-[24px] p-5 shadow-float border border-transparent text-left text-text-primary">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-brand-green font-bold uppercase tracking-wider bg-brand-green-15 px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle weight="fill" className="w-3 h-3" /> Verified
                    </span>
                    <div className="w-8 h-8 rounded-full bg-surface-grey flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    </div>
                  </div>
                  <div className="mb-4 border-b border-border-default pb-4">
                    <h3 className="type-venue-name text-base leading-none mb-1 text-text-primary font-bold">Premium Dinner Spot</h3>
                    <p className="text-xs text-text-muted font-medium flex items-center gap-1">📍 Victoria Island, Lagos</p>
                  </div>
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-text-secondary font-medium">🍽 Food & Drinks</span>
                       <span className="font-bold tabular-nums text-text-primary text-base">₦30,000</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-text-secondary font-medium">🚕 Transport</span>
                       <span className="font-bold tabular-nums text-text-primary text-base">₦8,500</span>
                    </div>
                  </div>
                  <div className="border-t border-border-default pt-4 flex justify-between items-center">
                    <span className="text-text-secondary font-bold uppercase tracking-wider text-xs">Total Estimate</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black tabular-nums text-text-primary text-3xl tracking-tighter">₦38,500</span>
                      <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase font-sans">/ person</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      {/* Trust Strip */}
      <div className="py-6 bg-white border-b border-border-default relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
             <div className="flex items-center gap-2">
               <CheckCircle weight="fill" className="w-5 h-5 text-brand-green" />
               <span className="type-label text-text-secondary font-medium text-sm">Verified pricing</span>
             </div>
             <div className="flex items-center gap-2">
               <CheckCircle weight="fill" className="w-5 h-5 text-brand-green" />
               <span className="type-label text-text-secondary font-medium text-sm">Transport included</span>
             </div>
             <div className="flex items-center gap-2">
               <CheckCircle weight="fill" className="w-5 h-5 text-brand-green" />
               <span className="type-label text-text-secondary font-medium text-sm">No hidden fees</span>
             </div>
          </div>
        </div>
      </div>

      {/* Vibe Grid Section */}
      <div className="py-16 bg-surface-grey border-b border-border-default relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="type-heading text-2xl tracking-tighter text-text-primary">What's the vibe?</h2>
            <Link href="/explore" className="text-sm font-bold text-brand-green hover:text-brand-green-70 transition-colors">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/explore?vibe=chill" className="group rounded-[24px] p-6 bg-[var(--color-pastel-blue)] shadow-sm hover:shadow-md transition-all duration-150 card-lift min-h-[140px] flex flex-col justify-between">
              <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
                <Coffee weight="fill" className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-bold text-text-primary mt-4 block">Chill Hangout</span>
            </Link>
            <Link href="/explore?vibe=date-night" className="group rounded-[24px] p-6 bg-[var(--color-pastel-pink)] shadow-sm hover:shadow-md transition-all duration-150 card-lift min-h-[140px] flex flex-col justify-between">
              <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
                <Heart weight="fill" className="w-6 h-6 text-pink-600" />
              </div>
              <span className="font-bold text-text-primary mt-4 block">Date Night</span>
            </Link>
            <Link href="/explore?vibe=party" className="group rounded-[24px] p-6 bg-[var(--color-pastel-yellow)] shadow-sm hover:shadow-md transition-all duration-150 card-lift min-h-[140px] flex flex-col justify-between">
              <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
                <MusicNotes weight="fill" className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="font-bold text-text-primary mt-4 block">Turn Up</span>
            </Link>
            <Link href="/explore?vibe=quick-link" className="group rounded-[24px] p-6 bg-[var(--color-pastel-cream)] shadow-sm hover:shadow-md transition-all duration-150 card-lift min-h-[140px] flex flex-col justify-between">
              <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
                <Lightning weight="fill" className="w-6 h-6 text-orange-500" />
              </div>
              <span className="font-bold text-text-primary mt-4 block">Squad Link-up</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="py-20 bg-white relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MotionSection delay={100} className="h-full">
              <div className="bg-[var(--color-pastel-cream)] rounded-[24px] p-8 shadow-float border border-transparent h-full">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                  <CheckCircle weight="duotone" className="w-7 h-7 text-brand-green" />
                </div>
                <h3 className="type-heading text-xl tracking-tighter mb-2 text-text-primary">Budget-matched</h3>
                <p className="type-body text-text-secondary text-sm">Get recommendations that perfectly fit your group's budget.</p>
              </div>
            </MotionSection>
            <MotionSection delay={200} className="h-full">
              <div className="bg-[var(--color-pastel-blue)] rounded-[24px] p-8 shadow-float border border-transparent h-full">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                  <Clock weight="duotone" className="w-7 h-7 text-brand-green" />
                </div>
                <h3 className="type-heading text-xl tracking-tighter mb-2 text-text-primary">Transport-included</h3>
                <p className="type-body text-text-secondary text-sm">Every plan includes accurate ride-hailing estimates.</p>
              </div>
            </MotionSection>
            <MotionSection delay={300} className="h-full">
              <div className="bg-[var(--color-pastel-pink)] rounded-[24px] p-8 shadow-float border border-transparent h-full">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                  <ShareNetwork weight="duotone" className="w-7 h-7 text-brand-green" />
                </div>
                <h3 className="type-heading text-xl tracking-tighter mb-2 text-text-primary">Squad-shareable</h3>
                <p className="type-body text-text-secondary text-sm">Share the complete plan with your group in one tap.</p>
              </div>
            </MotionSection>
          </div>
        </div>
      </div>

      {/* Social Proof (Hidden for now) */}
      {false && (
        <div className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="type-heading text-2xl mb-8">What people are saying</h2>
            <div className="bg-surface-grey rounded-[24px] p-8 shadow-sm">
              <p className="type-body text-lg font-medium italic mb-4">"OyaPlan saved me from spending double what I thought I would on a date."</p>
              <p className="type-label text-text-muted">— Tolu, Lekki</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-border-default text-center text-text-muted space-y-4">
        <p className="type-body text-sm font-medium">&copy; 2026 OyaPlan.com</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <Link href="/explore" className="type-label text-text-muted hover:text-text-primary transition-colors">
            Explore
          </Link>
          <div className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
          <Link href="/list-your-spot" className="type-label text-text-muted hover:text-text-primary transition-colors">
            Own a venue?
          </Link>
          <div className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
          <Link href="/legal" className="type-label text-text-muted hover:text-text-primary transition-colors">
            Legal / Privacy
          </Link>
        </div>
      </footer>
    </main>
  );
}
