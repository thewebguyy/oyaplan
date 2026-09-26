import { Suspense } from "react";
import ErrorBanner from "@/components/ErrorBanner";
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
    <main className="min-h-[100dvh] bg-white-sand text-text-primary antialiased">
      <Suspense fallback={null}>
        <ErrorBanner />
      </Suspense>

      {/* Hero Section */}
      <HeroSection spots={spots} />

      {/* How OyaPlan Works Section */}
      <HowItWorksSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
