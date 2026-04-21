import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ budget?: string; vibe?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Try zone first
  const { data: zone } = await supabase.from("zones").select("name").eq("slug", slug).single();
  if (zone) {
    return {
      title: `Explore ${zone.name} — OyaPlan`,
      description: `Discover spots in ${zone.name} Lagos.`,
    };
  }

  // Fallback to area
  const { data: area } = await supabase.from("areas").select("name").eq("slug", slug).single();
  if (area) {
    return {
      title: `${area.name} Outing Spots — OyaPlan`,
      description: `Restaurants, activities, and experiences in ${area.name}, Lagos. Budget-friendly squad planning.`,
    };
  }

  return { title: "Explore — OyaPlan" };
}

export default async function ExploreSlug({ params, searchParams }: Props) {
  const { slug } = await params;
  const urlParams = await searchParams;
  const budget = urlParams.budget ? parseInt(urlParams.budget) : null;
  const vibe = urlParams.vibe || null;

  // 1. Try Zone View
  const { data: zoneData } = await supabase
    .from("zones")
    .select("*")
    .eq("slug", slug)
    .single();

  if (zoneData) {
    const { data: areasData } = await supabase
      .from("areas")
      .select("*, spots!inner(active, zone)")
      .eq("spots.zone", slug)
      .eq("spots.active", true)
      .order("name");

    const areasMap = new Map();
    (areasData || []).forEach((area: any) => {
      if (!areasMap.has(area.id)) {
        areasMap.set(area.id, {
          ...area,
          activeSpotCount: area.spots?.length || 0
        });
      }
    });
    const areas = Array.from(areasMap.values());

    return (
      <main className="min-h-screen bg-white text-text-primary pb-20 antialiased">
        {budget && vibe && (
          <div className="bg-brand-green text-white py-3 px-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <p className="type-label">Showing spots for your ₦{budget.toLocaleString()} {vibe} outing</p>
              <Link href={`/explore/${slug}`} className="type-label text-white/80 hover:text-white underline">Clear</Link>
            </div>
          </div>
        )}

        <div className="bg-surface-grey border-b border-border-default py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/explore" className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-6 tap-feedback">
              <ArrowLeft className="w-4 h-4" />
              Back to Zones
            </Link>
            <h1 className="type-display text-text-primary capitalize">{zoneData.name}</h1>
            <p className="type-body text-text-muted mt-2">{zoneData.description}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {areas?.map((area: any) => {
              const areaParams = new URLSearchParams();
              if (urlParams.budget) areaParams.append("budget", urlParams.budget);
              if (urlParams.vibe) areaParams.append("vibe", urlParams.vibe);
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
            
            {areas.length === 0 && (
              <div className="col-span-full py-12 text-center text-text-muted type-body">
                No active areas found in this zone.
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // 2. Try Area View
  const { data: area } = await supabase
    .from("areas")
    .select("*, spots(*)")
    .eq("slug", slug)
    .single();

  if (!area) {
    notFound();
  }

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
      {budget && vibe && (
        <div className="bg-brand-green text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="type-label">Showing spots in <span className="lowercase first-letter:uppercase">{area.name}</span> for your ₦{budget.toLocaleString()} outing</p>
            <Link href={`/explore/${slug}`} className="type-label text-white/80 hover:text-white underline">Clear</Link>
          </div>
        </div>
      )}

      <div className="bg-surface-grey border-b border-border-default py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* We determine back path dynamically. If we don't know the zone, we just link to explore. But spots have zone! */}
          <Link href={`/explore`} className="inline-flex items-center gap-2 type-label text-text-muted hover:text-text-primary transition-colors mb-6 tap-feedback">
            <ArrowLeft className="w-4 h-4" />
            Back to Zones
          </Link>
          <h1 className="type-display text-text-primary lowercase first-letter:uppercase">{area.name}</h1>
          <p className="type-body text-text-muted mt-2">Found {spots.length} spots in this area.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-12 space-y-6">
        {spots.length > 0 ? (
          spots.map((spot: any) => {
            const prefillParams = new URLSearchParams();
            prefillParams.append("startArea", slug);
            prefillParams.append("pinnedSpotId", spot.id);
            if (budget) prefillParams.append("budget", budget.toString());
            if (vibe) prefillParams.append("vibe", vibe);

            return (
              <div 
                key={spot.id} 
                className={`p-4 sm:p-8 border rounded-[16px] sm:rounded-[20px] transition-all duration-200 ${
                  spot.fitsBudget 
                    ? "bg-white border-border-default hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)]" 
                    : "bg-surface-grey border-border-default opacity-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                  <div className="space-y-2 sm:space-y-4 text-left flex-1">
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <h3 className="type-subheading sm:type-heading text-text-primary">{spot.name}</h3>
                        <div className="bg-surface-grey text-text-muted px-2 py-0.5 rounded-[4px] text-[10px] font-[700] uppercase tracking-tighter border border-border-default">
                          {spot.category}
                        </div>
                        {budget && spot.fitsBudget && (
                          <div className="bg-brand-green text-white px-2 py-0.5 rounded-[4px] text-[10px] font-[700] uppercase tracking-tighter">
                            Fits budget
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 type-caption text-text-muted">
                        <MapPin className="w-[14px] h-[14px] shrink-0" />
                        <span className="truncate">{spot.address}</span>
                      </div>
                    </div>
                    
                    <p className="type-label sm:type-subheading text-brand-green">
                      Avg ₦{spot.price_per_person.toLocaleString()} <span className="type-caption text-text-muted">/ person</span>
                    </p>
                  </div>
                  
                  <Link href={`/?${prefillParams.toString()}`} className="w-full sm:w-auto mt-2 sm:mt-0">
                    <Button className="bg-brand-green hover:bg-brand-green-70 text-white type-label h-[44px] sm:h-[48px] px-6 sm:px-8 rounded-[10px] tap-feedback w-full shadow-none border-none">
                      Plan around this
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
