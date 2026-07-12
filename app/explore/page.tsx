import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Lagos Outings — OyaPlan",
  description: "Find your next squad outing across all Lagos zones.",
  openGraph: {
    images: ["/og"],
  }
};

export default function ExploreIndex() {
  // All interactive and structural visuals (map, ticker, filters) are handled in the shared layout
  return null;
}
