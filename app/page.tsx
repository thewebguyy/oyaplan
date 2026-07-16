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

      {/* Main Content Area */}
      <div className="relative z-10 bg-surface-grey pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4 space-y-16">
          
          {/* Desktop Inline Planner (Scroll Target) */}
          <div id="planner" className="hidden md:block scroll-mt-24">
            <div className="bg-white rounded-[24px] shadow-float border border-transparent overflow-hidden p-2 text-text-primary max-w-lg mx-auto">
              <Suspense fallback={<div className="h-64 shimmer-bg opacity-10 rounded-[24px]" />}>
                <ForgeForm areas={areas} />
              </Suspense>
            </div>
          </div>

          <ExperienceCollections />

          {/* Explore Lagos (Area Chips) */}
          <section className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="type-heading text-xl">Explore Lagos</h2>
              <Link href="/explore" className="text-sm font-bold text-midnight-lagoon hover:text-midnight-lagoon/80 transition-colors">
                Map view
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {areas.map((area) => (
                <Link
                  key={area.id}
                  href={`/explore/${area.slug}`}
                  className="px-4 py-2 bg-white border border-border-default rounded-full type-ui-label text-text-primary hover:border-lasgidi-yellow hover:text-midnight-lagoon transition-colors tap-feedback"
                >
                  {area.name}
                </Link>
              ))}
            </div>
          </section>

          <Suspense fallback={null}>
            <RecentlyVerified />
          </Suspense>

          {/* Planning Guides Placeholder for Milestone 3 */}
          {/* Will be added in Milestone 3 */}

          <TrustSection />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-border-default text-center text-text-muted space-y-4">
        <p className="type-body text-sm font-medium">&copy; {new Date().getFullYear()} OyaPlan</p>
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
