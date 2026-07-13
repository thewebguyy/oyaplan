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

      {/* Centered Compositional Hero */}
      <div className="relative pt-24 md:pt-32 pb-24 md:pb-32 px-4 bg-[#FFFDF4] min-h-[85vh] flex flex-col items-center justify-center border-b border-border-default overflow-x-hidden overflow-y-visible">
        
        {/* Abstract Editorial Map Grid (z-0) */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.06]">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Some editorial lines representing routes */}
            <path d="M -100 200 C 300 200, 400 600, 800 500 S 1200 200, 1600 300" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5"/>
          </svg>
        </div>

        {/* Ambient Glow (Only behind illustration) (z-0) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-green/10 blur-[120px] rounded-[100%] pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center mt-8">
          <MotionSection delay={0} className="w-full">
            <RotatingHeadline />
          </MotionSection>

          {/* Trust Strip - Anchored */}
          <MotionSection delay={200} className="mt-8 mb-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
             <div className="flex items-center gap-2">
               <Check className="w-4 h-4 text-brand-green" strokeWidth={3} />
               <span className="type-label text-text-secondary font-medium">Prices verified weekly</span>
             </div>
             <div className="flex items-center gap-2">
               <Check className="w-4 h-4 text-brand-green" strokeWidth={3} />
               <span className="type-label text-text-secondary font-medium">Transport included</span>
             </div>
             <div className="flex items-center gap-2">
               <Check className="w-4 h-4 text-brand-green" strokeWidth={3} />
               <span className="type-label text-text-secondary font-medium">No unexpected billing</span>
             </div>
          </MotionSection>

          <MotionSection delay={400}>
            <a href="#forge-planner" className="inline-block bg-brand-green text-white font-bold uppercase tracking-widest text-[15px] px-12 py-5 rounded-full shadow-md hover:bg-brand-green-70 hover:shadow-lg hover:-translate-y-0.5 transition-all tap-feedback">
              Oya, plan
            </a>
          </MotionSection>
        </div>

        {/* Depth Perforation Pattern (z-10) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] opacity-[0.04] pointer-events-none z-10 flex justify-center items-end">
           <svg viewBox="0 0 400 300" className="w-full h-full">
             {/* Receipt edge perforation dots */}
             <path d="M 0 50 Q 10 50 10 60 Q 10 70 0 70 Z M 0 90 Q 10 90 10 100 Q 10 110 0 110 Z" fill="currentColor" stroke="none" />
             <line x1="20" y1="20" x2="20" y2="280" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" />
             <line x1="380" y1="20" x2="380" y2="280" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" />
           </svg>
        </div>

        {/* Compositional Product + Illustration Layer */}
        <div className="relative w-full max-w-[1200px] mx-auto mt-20 md:mt-28 h-[250px] md:h-[400px] flex justify-center items-end pointer-events-none">
           
           {/* Center Piece (Main Illustration Dominates 55-60%) */}
           <MotionSection delay={600} className="relative z-30 w-full max-w-[400px] md:max-w-[550px] lg:max-w-[650px] origin-bottom">
             <AnimatedIllustration 
               src="/illustrations/img1.png" 
               alt="Budget Confidence" 
               priority={true} 
               float={true}
               className="aspect-[4/5] md:aspect-square w-full"
             />
           </MotionSection>
           
           {/* Left Floating Product Preview (Nok By Alara) */}
           <MotionSection delay={800} className="absolute left-0 md:left-12 lg:left-24 bottom-16 z-20 w-[200px] md:w-[260px] hidden sm:block">
             <div className="bg-white rounded-[16px] p-4 shadow-float border border-border-default transform -rotate-3 transition-transform duration-500 will-change-transform animate-[hero-breathe_6s_ease-in-out_infinite]">
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <h3 className="type-venue-name text-sm md:text-base leading-none mb-1">Nok by Alara</h3>
                   <span className="type-caption text-[10px] text-brand-green font-bold uppercase tracking-wider">Verified this week</span>
                 </div>
                 <div className="bg-brand-green/10 p-1.5 rounded-full">
                   <Check className="w-3 h-3 text-brand-green" strokeWidth={4} />
                 </div>
               </div>
               <div className="w-full h-24 bg-surface-grey rounded-[8px] mb-3 overflow-hidden">
                 <img src="/illustrations/img2.png" className="w-full h-full object-cover opacity-80 mix-blend-multiply" alt="" />
               </div>
               <div className="pt-2 border-t border-border-default flex justify-between items-center">
                 <span className="type-ui-label text-text-muted text-[10px]">Total Est.</span>
                 <span className="type-price text-text-primary text-sm md:text-base">₦42,000</span>
               </div>
             </div>
           </MotionSection>

           {/* Right Floating Product Preview (Cost Breakdown) */}
           <MotionSection delay={900} className="absolute right-0 md:right-12 lg:right-24 bottom-28 z-20 w-[200px] md:w-[260px] hidden sm:block">
             <div className="bg-white rounded-[16px] p-5 shadow-float border border-border-default transform rotate-3 transition-transform duration-500 will-change-transform animate-[hero-breathe_7s_ease-in-out_infinite_reverse]">
               <div className="flex items-center gap-2 mb-4 border-b border-border-default pb-3">
                 <div className="w-6 h-6 rounded-full bg-intent-yellow/20 flex items-center justify-center">
                   <Clock className="w-3 h-3 text-intent-yellow" strokeWidth={3} />
                 </div>
                 <span className="type-ui-label text-[11px] md:text-xs text-text-primary font-bold">Estimated Spend</span>
               </div>
               
               <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-text-secondary font-medium">Food</span>
                   <span className="font-semibold tabular-nums">₦25,000</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-text-secondary font-medium">Transport</span>
                   <span className="font-semibold tabular-nums">₦8,500</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-text-secondary font-medium">VAT & Service</span>
                   <span className="font-semibold tabular-nums">₦3,500</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="text-text-secondary font-medium text-brand-green">Buffer (15%)</span>
                   <span className="font-semibold tabular-nums text-brand-green">₦5,000</span>
                 </div>
               </div>
             </div>
           </MotionSection>
        </div>
      </div>

      {/* Dossier Card Preview Grid */}
      <div className="relative py-24 px-4 bg-white">
        <div className="max-w-[1400px] mx-auto">
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
                Every recommendation is generated using our deterministic planning engine and verified venue data—not guesses. Focus on the experience, not the unexpected billing.
              </p>
            </MotionSection>
            <MotionSection delay={300} className="pt-2">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                   <Check className="w-5 h-5 text-brand-green" strokeWidth={2.5} />
                 </div>
                 <span className="type-label text-text-primary font-bold">Deterministic Pricing Engine</span>
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
            <p className="type-body text-text-secondary">Tell us your vibe and budget, and get a verified recommendation.</p>
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
