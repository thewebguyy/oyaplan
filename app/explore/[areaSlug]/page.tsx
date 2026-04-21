import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ areaSlug: string }>;
  searchParams: Promise<{ budget?: string; vibe?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ areaSlug: string }> }): Promise<Metadata> {
  const { areaSlug } = await params;
  const { data: area } = await supabase
    .from("areas")
    .select("name")
    .eq("slug", areaSlug)
    .single();

  const areaName = area?.name || "Lagos";

  return {
    title: `${areaName} Outing Spots — OyaPlan`,
    description: `Restaurants, activities, and experiences in ${areaName}, Lagos. Budget-friendly squad planning.`,
    openGraph: {
      images: ["/og"],
    }
  };
}

export default async function ExploreArea({ params, searchParams }: Props) {
  const { areaSlug } = await params;
  const urlParams = await searchParams;
  const budget = urlParams.budget ? parseInt(urlParams.budget) : null;
  const vibe = urlParams.vibe || null;

  // Fetch area details
  const { data: area } = await supabase
    .from("areas")
    .select("*, spots(*)")
    .eq("slug", areaSlug)
    .single();

  if (!area) return <div className="p-20 text-center type-heading">Area not found</div>;

  // Process spots with budget awareness
  const spots = (area.spots || []).filter((s: any) => s.active !== false).map((spot: any) => {
    const estimatedTotal = spot.price_per_person * 2 * 1.1;
    const fitsBudget = budget ? estimatedTotal <= budget : true;
    return { ...spot, fitsBudget };
  }).sort((a: any, b: any) => {
    if (a.fitsBudget && !b.fitsBudget) return -1;
    if (!a.fitsBudget && b.fitsBudget) return 1;
    return 0;
  });

  return (
    <main className="min-h-screen bg-white text-text-primary pb-20 antialiased">
      {/* Context Banner */}
      {budget && vibe && (
        <div className="bg-brand-green text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="type-label">Showing spots in <span className="lowercase first-letter:uppercase">{area.name}</span> for your ₦{budget.toLocaleString()} outing</p>
            <Link href={`/explore/${areaSlug}`} className="type-label text-white/80 hover:text-white underline">Clear</Link>
          </div>
        </div>
      )}

      <div className="bg-surface-grey border-b border-border-default py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/explore" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-6 tap-feedback">
            <ArrowLeft className="w-4 h-4" />
            Back to Areas
          </Link>
          <h1 className="type-display text-text-primary lowercase first-letter:uppercase">{area.name}</h1>
          <p className="type-body text-text-muted mt-2">Found {spots.length} spots in this area.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-6">
        {spots.length > 0 ? (
          spots.map((spot: any) => {
            const prefillParams = new URLSearchParams();
            prefillParams.append("startArea", areaSlug);
            prefillParams.append("pinnedSpotId", spot.id);
            if (budget) prefillParams.append("budget", budget.toString());
            if (vibe) prefillParams.append("vibe", vibe);

            return (
              <div 
                key={spot.id} 
                className={`p-8 border rounded-[20px] transition-all duration-200 ${
                  spot.fitsBudget 
                    ? "bg-white border-border-default" 
                    : "bg-surface-grey border-border-default opacity-50"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4 text-left flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="type-heading text-text-primary">{spot.name}</h3>
                        <div className="bg-surface-grey text-text-muted px-2 py-0.5 rounded-[4px] text-[10px] font-[700] uppercase tracking-tighter border border-border-default">
                          {spot.category}
                        </div>
                        {budget && spot.fitsBudget && (
                          <div className="bg-brand-green text-white px-2 py-0.5 rounded-[4px] text-[10px] font-[700] uppercase tracking-tighter">
                            Fits your budget
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 type-caption text-text-muted">
                        <MapPin className="w-[14px] h-[14px] shrink-0" />
                        {spot.address}
                      </div>
                    </div>
                    
                    <p className="type-subheading text-brand-green">
                      Avg ₦{spot.price_per_person.toLocaleString()} per person
                    </p>
                  </div>
                  
                  <Link href={`/?${prefillParams.toString()}`} className="w-full md:w-auto">
                    <Button className="bg-brand-green hover:bg-brand-green-70 text-white type-label h-[48px] px-8 rounded-[10px] tap-feedback w-full shadow-none border-none">
                      Plan around this spot
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-surface-grey rounded-[24px] border border-border-default">
            <p className="type-body text-text-muted">No spots found in this area yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}
