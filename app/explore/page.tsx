import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Lagos Outings by Area — OyaPlan",
  description: "Browse spots, restaurants, activities, and hidden gems across all Lagos areas. Find your next squad outing.",
  openGraph: {
    images: ["/og"],
  }
};

export default async function ExploreIndex({ 
  searchParams 
}: { 
  searchParams: Promise<{ budget?: string; vibe?: string }> 
}) {
  const params = await searchParams;
  const { data: areasData } = await supabase
    .from("areas")
    .select("*, spots(active)")
    .order("name");

  const areas = (areasData || [])
    .map((area: any) => ({
      ...area,
      activeSpotCount: area.spots?.filter((s: any) => s.active).length || 0
    }))
    .filter((area: any) => area.activeSpotCount > 0);

  return (
    <main className="min-h-screen bg-white text-text-primary pb-20 antialiased">
      {/* Context Banner */}
      {params.budget && params.vibe && (
        <div className="bg-brand-green text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="type-label">Showing spots for your ₦{parseInt(params.budget).toLocaleString()} {params.vibe} outing</p>
            <Link href="/explore" className="type-label text-white/80 hover:text-white underline">Clear</Link>
          </div>
        </div>
      )}

      <div className="bg-surface-grey border-b border-border-default py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-6 tap-feedback">
            <ArrowLeft className="w-4 h-4" />
            Back to Planner
          </Link>
          <h1 className="type-display text-text-primary">Explore Lagos</h1>
          <p className="type-body text-text-muted mt-2">Select an area to see what's happening.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {areas?.map((area: any) => {
            const areaParams = new URLSearchParams();
            if (params.budget) areaParams.append("budget", params.budget);
            if (params.vibe) areaParams.append("vibe", params.vibe);
            const href = areaParams.toString() ? `/explore/${area.slug}?${areaParams.toString()}` : `/explore/${area.slug}`;

            return (
              <Link 
                key={area.id} 
                href={href}
                className="group p-8 bg-white border border-border-default rounded-[20px] hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)] transition-all text-left tap-feedback"
              >
                <h3 className="type-heading text-text-primary group-hover:text-brand-green transition-colors lowercase first-letter:uppercase">{area.name}</h3>
                <p className="type-caption text-text-muted mt-2">{area.activeSpotCount} spots to discover</p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
