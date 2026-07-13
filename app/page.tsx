import ForgeForm from "@/components/ForgeForm";
import ErrorBanner from "@/components/ErrorBanner";
import PageError from "@/components/PageError";
import { captureServerException } from "@/lib/sentry";
import { getActiveAreas } from "@/lib/queries/areas";
import { Area } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";
import { TrustBadge } from "@/components/ui/trust-badge";
import { BudgetFitBadge } from "@/components/ui/budget-fit-badge";
import { TrustUnknown } from "@/components/ui/trust-unknown";
import { Check, Clock } from "lucide-react";
import RotatingHeadline from "@/components/RotatingHeadline";
import DossierDropWrapper from "@/components/DossierDropWrapper";
import AnimatedIllustration from "@/components/motion/AnimatedIllustration";
import ScrollParallax from "@/components/motion/ScrollParallax";
import AmbientParallax from "@/components/motion/AmbientParallax";
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

      {/* Hero Section: The Ledger */}
      <div className="relative pt-16 pb-24 px-4 bg-white bg-civic-hex">
        <div className="max-w-[1400px] mx-auto">
          {/* Hero Section: The Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24 lg:mb-32">
            {/* Left Col: Staggered Text */}
            <div className="space-y-6 text-center lg:text-left pt-12 lg:pt-0">
              <MotionSection delay={0}>
                <RotatingHeadline />
              </MotionSection>
              <MotionSection delay={200}>
                <p className="type-body text-text-secondary max-w-xl mx-auto lg:mx-0 text-lg md:text-xl">
                  Deterministic outing planning for Lagos. We verify the menus, transport costs, and operational hours so your squad never gets stranded.
                </p>
              </MotionSection>
              <MotionSection delay={400} className="pt-4">
                <a href="#forge-planner" className="inline-block bg-[#0A0A0A] text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-[8px] hover:bg-black/80 transition-colors tap-feedback btn-intent-snaps">
                  Plan an outing
                </a>
              </MotionSection>
            </div>
            
            {/* Right Col: Hero Illustration */}
            <div className="relative flex justify-center lg:justify-end">
              <MotionSection delay={600} className="relative z-10 w-full max-w-[420px]">
                <AnimatedIllustration 
                  src="/illustrations/img1.png" 
                  alt="Budget Confidence" 
                  priority={true} 
                  float={true}
                />
              </MotionSection>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-green/5 blur-3xl rounded-full -z-10 pointer-events-none" />
            </div>
          </div>

          {/* Lagos Landmark Motifs (Task 3) */}
          <div className="absolute bottom-6 left-8 hidden lg:block text-border-strong opacity-35 pointer-events-none select-none">
            <svg viewBox="0 0 100 150" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-20 h-32">
              <path d="M50 10 L25 140 M50 10 L75 140" />
              <path d="M38 60 L62 60 M33 90 L67 90 M28 120 L72 120" strokeWidth="2" />
              <path d="M50 30 L5 140 M50 30 L95 140" strokeWidth="1.5" />
              <path d="M50 50 L10 140 M50 50 L90 140" strokeWidth="1.5" />
              <path d="M50 70 L15 140 M50 70 L85 140" strokeWidth="1.5" />
            </svg>
            <span className="type-caption block text-center mt-2 tracking-widest text-[9px] uppercase font-bold text-text-secondary">Lekki-Ikoyi Bridge</span>
          </div>

          <div className="absolute bottom-8 right-8 hidden lg:block text-border-strong opacity-35 pointer-events-none select-none">
            <svg viewBox="0 0 150 100" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-28 h-20">
              <path d="M10 50 C 40 10, 110 10, 140 50 C 120 70, 30 70, 10 50 Z" />
              <path d="M30 65 L30 85 L120 85 L120 65" />
              <path d="M40 35 L45 68" strokeWidth="1.5" />
              <path d="M60 22 L62 69" strokeWidth="1.5" />
              <path d="M75 18 L75 70" strokeWidth="1.5" />
              <path d="M90 22 L88 69" strokeWidth="1.5" />
              <path d="M110 35 L105 68" strokeWidth="1.5" />
            </svg>
            <span className="type-caption block text-center mt-2 tracking-widest text-[9px] uppercase font-bold text-text-secondary">National Theatre</span>
          </div>

          {/* Trust Legend - Explicitly teaching the iconography before the cards */}
          <div className="max-w-3xl mx-auto bg-white rounded-[12px] border-2 border-border-default py-4 px-6 mb-12 shadow-sm">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-brand-green" strokeWidth={3} />
                <span className="type-ui-label text-text-primary text-xs font-black">Verified Accuracy</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-border-default" />
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-text-muted" strokeWidth={2.5} />
                <span className="type-ui-label text-text-primary text-xs font-black">Estimated Cost</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-border-default" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-trust-warning" />
                <span className="type-ui-label text-text-primary text-xs font-black">Pending Verification</span>
              </div>
            </div>
          </div>

          {/* 3-Column Venue Card Collage */}
          <DossierDropWrapper className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto dossier-grid">
            {/* Card 1: Budget Fit Green + Fully Verified */}
            <div className="bg-white rounded-[16px] shadow-sm border border-border-default flex flex-col overflow-hidden dossier-card">
              <div className="p-2 pb-0 relative">
                <div className="relative w-full aspect-[4/3] rounded-[12px] bg-surface-grey border border-border-default flex items-center justify-center overflow-hidden dossier-photo-container">
                  <span className="text-text-muted type-caption uppercase tracking-wider dossier-photo">Image Pending</span>
                  <div className="absolute top-3 inset-x-3 flex flex-wrap justify-between items-start gap-2">
                    <div className="bg-[#E05C3A] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                      Restaurant
                    </div>
                    <TrustBadge status="verified" freshnessText="today" />
                  </div>
                </div>
              </div>
              <div className="pt-6 pb-6 px-5 flex flex-col flex-grow">
                <h2 className="type-venue-hero text-text-primary mb-2 uppercase text-4xl">NOK BY<br/>ALARA</h2>
                <p className="text-text-muted font-medium tracking-tight mt-auto text-xs uppercase">Victoria Island, Lagos</p>
              </div>
              <div className="border-t border-border-default px-5 py-4 flex justify-between items-center bg-white">
                <BudgetFitBadge status="comfortable" />
                <div className="text-right flex flex-col">
                  <span className="font-sans font-semibold text-text-primary tracking-tight text-lg leading-none">₦45,000</span>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">/ person</span>
                </div>
              </div>
            </div>

            {/* Card 2: Estimated + Unknown State explicitly shown */}
            <div className="bg-white rounded-[16px] shadow-sm border border-border-default flex flex-col overflow-hidden dossier-card">
              <div className="p-2 pb-0 relative">
                <div className="relative w-full aspect-[4/3] rounded-[12px] bg-surface-grey border border-border-default flex items-center justify-center overflow-hidden dossier-photo-container">
                  <span className="text-text-muted type-caption uppercase tracking-wider dossier-photo">Image Pending</span>
                  <div className="absolute top-3 inset-x-3 flex flex-wrap justify-between items-start gap-2">
                    <div className="bg-text-primary text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                      Nightclub
                    </div>
                    <TrustBadge status="estimated" />
                  </div>
                </div>
              </div>
              <div className="pt-6 pb-6 px-5 flex flex-col flex-grow">
                <h2 className="type-venue-hero text-text-primary mb-2 uppercase text-4xl">QUILOX<br/>CLUB</h2>
                <p className="text-text-muted font-medium tracking-tight mt-auto text-xs uppercase">Victoria Island, Lagos</p>
              </div>
              <div className="border-t border-border-default px-5 py-4 bg-surface-grey">
                <TrustUnknown message="Stale pricing data — Verifying" className="w-full justify-center bg-white" />
              </div>
            </div>

            {/* Card 3: Pending Verification + Slight Stretch */}
            <div className="bg-white rounded-[16px] shadow-sm border border-border-default flex flex-col overflow-hidden hidden md:flex dossier-card">
              <div className="p-2 pb-0 relative">
                <div className="relative w-full aspect-[4/3] rounded-[12px] bg-surface-grey border border-border-default flex items-center justify-center overflow-hidden dossier-photo-container">
                  <span className="text-text-muted type-caption uppercase tracking-wider dossier-photo">Image Pending</span>
                  <div className="absolute top-3 inset-x-3 flex flex-wrap justify-between items-start gap-2">
                    <div className="bg-[#4A90E2] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                      Event Hall
                    </div>
                    <TrustBadge status="pending" freshnessText="User Submitted" />
                  </div>
                </div>
              </div>
              <div className="pt-6 pb-6 px-5 flex flex-col flex-grow">
                <h2 className="type-venue-hero text-text-primary mb-2 uppercase text-4xl">BALMORAL<br/>TENT</h2>
                <p className="text-text-muted font-medium tracking-tight mt-auto text-xs uppercase">Ikoyi, Lagos</p>
              </div>
              <div className="border-t border-border-default px-5 py-4 flex justify-between items-center bg-white">
                <BudgetFitBadge status="stretch" />
                <div className="text-right flex flex-col">
                  <span className="font-sans font-semibold text-text-primary tracking-tight text-lg leading-none">₦120,000</span>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">/ person</span>
                </div>
              </div>
            </div>
          </DossierDropWrapper>
        </div>
      </div>

      {/* Budget Confidence Section (Planning Together) */}
      <div className="py-24 md:py-32 bg-surface-grey border-t border-border-default overflow-hidden relative">
        {/* Parallax Background Blob */}
        <AmbientParallax speed={-0.2} className="absolute top-0 right-0 w-1/2 h-full bg-intent-yellow/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <MotionSection delay={0} className="order-2 lg:order-1 relative">
            <ScrollParallax speed={0.05}>
              <AnimatedIllustration 
                src="/illustrations/img3.png" 
                alt="Planning Together" 
                float={false}
                className="w-full max-w-[500px] mx-auto"
              />
            </ScrollParallax>
            {/* Small glow behind focal object */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-white/40 blur-2xl rounded-full -z-10 pointer-events-none" />
          </MotionSection>
          
          <div className="order-1 lg:order-2 space-y-6">
            <MotionSection delay={100}>
              <h2 className="type-display-product text-text-primary uppercase tracking-tight">Certainty in<br/>every plan</h2>
            </MotionSection>
            <MotionSection delay={200}>
              <p className="type-body text-text-secondary max-w-md">
                No more guessing if a menu has changed or if an Uber will break the budget. We crunch real-time data so you can focus on the experience.
              </p>
            </MotionSection>
            <MotionSection delay={300} className="pt-2">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                   <Check className="w-5 h-5 text-brand-green" strokeWidth={2.5} />
                 </div>
                 <span className="type-label text-text-primary font-bold">100% Deterministic pricing</span>
               </div>
            </MotionSection>
          </div>
        </div>
      </div>

      {/* Discovery Section (Where to Next) */}
      <div className="py-24 bg-white overflow-hidden relative">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-16">
          <MotionSection>
            <h2 className="type-display-product text-text-primary uppercase tracking-tight">Where to next?</h2>
            <p className="type-body text-text-secondary mt-4 max-w-xl mx-auto">
              Discover verified spots across Lagos perfectly matched to your squad's vibe.
            </p>
          </MotionSection>
          
          <div className="relative">
            {/* Deep Background Parallax Layer */}
            <ScrollParallax speed={-0.15} className="absolute inset-0 flex justify-center items-center pointer-events-none">
               <div className="w-full max-w-[800px] h-[300px] bg-brand-green-5 blur-[80px] rounded-full" />
            </ScrollParallax>
            
            {/* Midground Illustration */}
            <ScrollParallax speed={0.08}>
              <MotionSection delay={200} className="relative z-10 w-full max-w-[700px] mx-auto">
                <AnimatedIllustration 
                  src="/illustrations/img2.png" 
                  alt="Where to Next" 
                  float={true}
                  className="will-change-transform origin-bottom hover:scale-[1.01] transition-transform duration-700 ease-out" 
                />
              </MotionSection>
            </ScrollParallax>
          </div>
        </div>
      </div>

      {/* The Planner / Forge Form */}
      <div id="forge-planner" className="py-24 bg-white border-t border-border-default px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-sans font-black text-4xl tracking-tight text-text-primary uppercase">Start Planning</h2>
            <p className="type-body text-text-secondary">Enter your constraints and get a deterministic, verified recommendation.</p>
          </div>
          <div className="bg-white rounded-[8px] shadow-sm border border-border-default overflow-hidden p-2">
            <Suspense fallback={<div className="h-96 shimmer-bg opacity-10 rounded-[8px]" />}>
              <ForgeForm areas={areas} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-border-default text-center text-text-muted space-y-4">
        <p className="type-body text-sm font-medium">&copy; 2026 OyaPlan.com &middot; Built in Lagos.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <Link href="/list-your-spot" className="type-label text-text-muted hover:text-text-primary transition-colors">
            Own a Lagos spot? Get listed
          </Link>
          <div className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
          <Link href="/suggest-a-spot" className="type-label text-text-muted hover:text-text-primary transition-colors">
            Know a hidden gem? Suggest a spot
          </Link>
        </div>
      </footer>
    </main>
  );
}
