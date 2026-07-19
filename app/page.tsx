import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import ErrorBanner from "@/components/ErrorBanner";
import ExperienceCollections from "@/components/ExperienceCollections";
import RecentlyVerified from "@/components/RecentlyVerified";
import TrustSection from "@/components/TrustSection";
import HeroSection from "@/components/HeroSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import HowItWorksSection from "@/components/HowItWorksSection";
import { getForgeSpots } from "@/lib/queries/spots";
import { Spot } from "@/lib/types";

export const revalidate = 300;

export default async function LandingPage() {
  let spots: Spot[] = [];
  try {
    const spotsResult = await getForgeSpots();
    spots = (spotsResult.data || []) as Spot[];
  } catch (e) {
    console.error("Failed to load spots for prediction engine", e);
  }

  return (
    <main className="min-h-screen bg-white-sand text-text-primary antialiased">
      <Suspense fallback={null}>
        <ErrorBanner />
      </Suspense>

      {/* Redesigned Hero Section (incorporates sequential narrative panels and interactive sliders) */}
      <HeroSection spots={spots} />

      {/* Redesigned Trust Section (moved to position #2 in layout) */}
      <TrustSection />

      {/* How OyaPlan Works Section */}
      <HowItWorksSection />

      {/* ── CHAPTER 2: Collections — full-bleed ── */}
      <section className="section-exciting w-full py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <ExperienceCollections />
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

      {/* FAQ Section */}
      <FAQSection />

      {/* ── Footer ── */}
      <Footer />
    </main>
  );
}
