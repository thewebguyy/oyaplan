import { Metadata } from "next";
import { Suspense } from "react";
import { getAreasWithSpotCounts } from "@/lib/queries/areas";
import { getExploreSpots } from "@/lib/queries/spots";
import { ExploreClient } from "@/components/explore/ExploreClient";
import { Spot } from "@/lib/types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Explore Lagos Outings & Verified Spots — OyaPlan",
  description: "Find your next squad outing across Lagos' best hubs. Real menu prices, verified transport ranges, and zero billing shocks before you leave home.",
  openGraph: {
    title: "Explore Lagos Outings — OyaPlan",
    description: "Search vetted venues by budget, squad size, area, and vibe with full pricing transparency.",
    images: ["/og"],
  },
};

export default async function ExplorePage() {
  const [areasResult, spotsResult] = await Promise.all([
    getAreasWithSpotCounts(),
    getExploreSpots(),
  ]);

  const areas = (areasResult.data || []).filter((a) => a.activeSpotCount > 0);
  const spots = (spotsResult.data || []) as Spot[];

  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAFAF8]" />}>
      <ExploreClient
        initialSpots={spots}
        availableAreas={areas}
        title="Where do you feel like?"
        subtitle="Search hand-verified menus and pricing across Lagos' top hubs. Know what you'll probably spend before you leave home."
      />
    </Suspense>
  );
}
