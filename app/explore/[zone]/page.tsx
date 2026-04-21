import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ zone: string }> }): Promise<Metadata> {
  const { zone } = await params;
  return {
    title: `Explore ${zone} — OyaPlan`,
    description: `Discover spots in ${zone} Lagos.`,
  };
}

export default async function ExploreZone({ 
  params,
  searchParams 
}: { 
  params: Promise<{ zone: string }>;
  searchParams: Promise<{ budget?: string; vibe?: string }> 
}) {
  const { zone } = await params;
  const search = await searchParams;
  
  const { data: zoneData } = await supabase
    .from("zones")
    .select("*")
    .eq("slug", zone)
    .single();
    
  if (!zoneData) {
    notFound();
  }

  const { data: areasData } = await supabase
    .from("areas")
    .select("*, spots!inner(active, zone)")
    .eq("spots.zone", zone)
    .eq("spots.active", true)
    .order("name");

  // Deduplicate and process areas
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
      {/* Context Banner */}
      {search.budget && search.vibe && (
        <div className="bg-brand-green text-white py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="type-label">Showing spots for your ₦{parseInt(search.budget).toLocaleString()} {search.vibe} outing</p>
            <Link href={`/explore/${zone}`} className="type-label text-white/80 hover:text-white underline">Clear</Link>
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
            if (search.budget) areaParams.append("budget", search.budget);
            if (search.vibe) areaParams.append("vibe", search.vibe);
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
