import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Utensils, Car, Info, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PlanPageProps): Promise<Metadata> {
  const { id } = await params;
  const { data: plan } = await supabase
    .from("shared_plans")
    .select("*, spot:spots(*)")
    .eq("id", id)
    .single();

  if (!plan) {
    return {
      title: "Plan Not Found | OyaPlan",
    };
  }

  const spotName = plan.spot?.name || "Unknown Spot";
  const totalCost = plan.total_cost.toLocaleString();
  const squadSize = plan.squad_size;

  return {
    title: `Squad plan at ${spotName} — OyaPlan`,
    description: `Total cost: ₦${totalCost} for ${squadSize} people. See the full breakdown.`,
    openGraph: {
      title: `Squad plan at ${spotName} — OyaPlan`,
      description: `Total cost: ₦${totalCost} for ${squadSize} people. See the full breakdown.`,
      images: ["/og"],
      type: "website",
    },
  };
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;

  const { data: plan } = await supabase
    .from("shared_plans")
    .select("*, spot:spots(*)")
    .eq("id", id)
    .single();

  if (!plan) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🏜️</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Plan not found</h1>
        <p className="text-gray-500 mb-8 max-w-xs">
          This plan has expired or doesn't exist. Link might be broken.
        </p>
        <Link href="/">
          <Button className="bg-[#008751] hover:bg-[#007043] rounded-xl font-bold h-12 px-8">
            Go to Planner
          </Button>
        </Link>
      </main>
    );
  }

  const hasFood = plan.spot?.has_food !== false;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Brand Header */}
      <div className="bg-white py-6 px-6 border-b border-gray-100 text-center">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-black tracking-tighter text-[#008751]">
            OyaPlan<span className="text-gray-300 font-normal">.com</span>
          </span>
        </Link>
      </div>

      {/* Plan Hero */}
      <div className="bg-[#008751] text-white py-12 px-6 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="inline-flex bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            {plan.vibe} Outing — {plan.squad_size} People
          </div>
          <h1 className="text-4xl font-black tracking-tight">{plan.spot?.name}</h1>
          <div className="pt-2">
            <span className="text-white/70 text-sm font-bold uppercase tracking-wider">Total Cost</span>
            <div className="text-5xl font-black">₦{plan.total_cost.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="max-w-md mx-auto w-full -mt-6 px-4 space-y-6 pb-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Costs */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400 text-[11px] font-black uppercase tracking-wider">
                  {hasFood ? <Utensils className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
                  {hasFood ? "Food/Drinks" : "Entry/Activity"}
                </div>
                <div className="text-xl font-bold text-gray-900">₦{plan.food_cost.toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400 text-[11px] font-black uppercase tracking-wider">
                  <Car className="w-3 h-3" />
                  Transport
                </div>
                <div className="text-xl font-bold text-gray-900">₦{plan.transport_cost.toLocaleString()}</div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Why it fits */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400 text-[11px] font-black uppercase tracking-wider">
                <Info className="w-3 h-3" />
                Why it fits
              </div>
              <p className="text-gray-600 font-medium italic leading-relaxed">
                "{plan.why_it_fits}"
              </p>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400 text-[11px] font-black uppercase tracking-wider">
                <MapPin className="w-3 h-3" />
                Full Address
              </div>
              <p className="text-gray-900 font-bold">
                {plan.spot?.address}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <Link href="/">
              <Button className="w-full bg-[#008751] hover:bg-[#007043] h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#008751]/20">
                Plan your own outing
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        
        <p className="text-center text-gray-400 text-xs font-medium">
          Generated with OyaPlan — Lagos Outing Planner
        </p>
      </div>
    </main>
  );
}
