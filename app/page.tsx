import ForgeForm from "@/components/ForgeForm";
import ErrorBanner from "@/components/ErrorBanner";
import PageError from "@/components/PageError";
import { captureServerException } from "@/lib/sentry";
import { getActiveAreas } from "@/lib/queries/areas";
import { Area } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";
import { Check, Clock } from "lucide-react";
import MotionSection from "@/components/motion/MotionSection";

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
    <main className="min-h-screen bg-white text-text-primary antialiased">
      <Suspense fallback={null}>
        <ErrorBanner />
      </Suspense>

      {/* Hero Section */}
      <div className="relative pt-24 md:pt-32 pb-16 px-4 bg-white min-h-[85vh] flex flex-col items-center justify-start border-b border-border-default overflow-hidden">
        
        <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center mt-4">
          <MotionSection delay={0} className="w-full">
            <h1 className="font-extrabold text-5xl md:text-6xl text-text-primary tracking-tight max-w-3xl mx-auto">
              Find where to go, know what it costs.
            </h1>
          </MotionSection>

          <MotionSection delay={100} className="mt-4 px-4">
            <p className="type-body text-text-secondary max-w-lg mx-auto md:text-lg">
              We've already worked out the prices, transport, and hidden costs.
            </p>
          </MotionSection>

          {/* Form and Preview Card Stack */}
          <div className="w-full max-w-lg mx-auto mt-10 flex flex-col gap-6">
            <MotionSection delay={200} className="w-full">
              <div className="bg-white rounded-[24px] shadow-float border border-border-default overflow-hidden p-2">
                <Suspense fallback={<div className="h-64 shimmer-bg opacity-10 rounded-[24px]" />}>
                  <ForgeForm areas={areas} />
                </Suspense>
              </div>
            </MotionSection>

            {/* Static Plan Result Preview Card */}
            <MotionSection delay={300} className="w-full">
               <div className="bg-white rounded-[24px] p-5 shadow-float border border-border-default text-left">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-brand-green font-bold uppercase tracking-wider bg-brand-green-15 px-2 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" strokeWidth={3} /> Verified
                    </span>
                    <div className="w-8 h-8 rounded-full bg-surface-grey flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-primary"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    </div>
                  </div>
                  <div className="mb-4 border-b border-border-default pb-4">
                    <h3 className="type-venue-name text-base leading-none mb-1 text-text-primary font-bold">Nok by Alara</h3>
                    <p className="text-xs text-text-muted font-medium flex items-center gap-1">📍 Victoria Island, Lagos</p>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-text-secondary font-medium">🍽 Food & Drinks</span>
                       <span className="font-semibold tabular-nums">₦30,000</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-text-secondary font-medium">🚕 Transport</span>
                       <span className="font-semibold tabular-nums">₦8,500</span>
                    </div>
                  </div>
                  <div className="border-t border-border-default pt-3 flex justify-between items-center">
                    <span className="text-text-primary font-black uppercase tracking-wider text-xs">Total</span>
                    <span className="font-black tabular-nums text-text-primary text-xl">₦38,500 <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase font-sans">/ person</span></span>
                  </div>
               </div>
            </MotionSection>
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="py-6 bg-white border-b border-border-default">
        <div className="max-w-4xl mx-auto px-4">
          <MotionSection delay={400} className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
             <div className="flex items-center gap-2">
               <Check className="w-4 h-4 text-brand-green" strokeWidth={3} />
               <span className="type-label text-text-secondary font-medium text-sm">Verified pricing</span>
             </div>
             <div className="flex items-center gap-2">
               <Check className="w-4 h-4 text-brand-green" strokeWidth={3} />
               <span className="type-label text-text-secondary font-medium text-sm">Transport included</span>
             </div>
             <div className="flex items-center gap-2">
               <Check className="w-4 h-4 text-brand-green" strokeWidth={3} />
               <span className="type-label text-text-secondary font-medium text-sm">No hidden fees</span>
             </div>
          </MotionSection>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="py-20 bg-surface-grey">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MotionSection delay={100} className="h-full">
              <div className="bg-white rounded-[24px] p-8 shadow-float border border-border-default h-full">
                <div className="w-12 h-12 rounded-full bg-brand-green-15 flex items-center justify-center mb-6">
                  <Check className="w-6 h-6 text-brand-green" strokeWidth={2.5} />
                </div>
                <h3 className="type-heading text-xl mb-2 text-text-primary">Budget-matched</h3>
                <p className="type-body text-text-secondary text-sm">Get recommendations that perfectly fit your group's budget.</p>
              </div>
            </MotionSection>
            <MotionSection delay={200} className="h-full">
              <div className="bg-white rounded-[24px] p-8 shadow-float border border-border-default h-full">
                <div className="w-12 h-12 rounded-full bg-brand-green-15 flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-brand-green" strokeWidth={2.5} />
                </div>
                <h3 className="type-heading text-xl mb-2 text-text-primary">Transport-included</h3>
                <p className="type-body text-text-secondary text-sm">Every plan includes accurate ride-hailing estimates.</p>
              </div>
            </MotionSection>
            <MotionSection delay={300} className="h-full">
              <div className="bg-white rounded-[24px] p-8 shadow-float border border-border-default h-full">
                <div className="w-12 h-12 rounded-full bg-brand-green-15 flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                </div>
                <h3 className="type-heading text-xl mb-2 text-text-primary">Squad-shareable</h3>
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
