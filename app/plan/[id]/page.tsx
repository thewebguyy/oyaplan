import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Utensils, Car, Info, ArrowRight } from "lucide-react";
import PageError from "@/components/PageError";

export const dynamic = "force-dynamic";

interface PlanPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PlanPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data: plan } = await supabase
      .from("shared_plans")
      .select("*, spot:spots(*)")
      .eq("id", id)
      .single();

    if (!plan) {
      return { title: "Plan Not Found | OyaPlan" };
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
        images: [`/plan/${id}/og`],
        type: "website",
      },
    };
  } catch {
    return { title: "OyaPlan" };
  }
}

export default async function PlanPage({ params }: PlanPageProps) {
  const { id } = await params;

  let plan;
  let planFetchError = false;
  try {
    const { data, error } = await supabase
      .from("shared_plans")
      .select("*, spot:spots(*)")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") notFound();
      planFetchError = true;
    } else if (!data) {
      notFound();
    } else {
      plan = data;
    }
  } catch {
    planFetchError = true;
  }

  if (planFetchError) {
    return <PageError message="We could not load this plan. Please try again." href="/" linkLabel="Plan a new outing" />;
  }

  const hasFood = plan.spot?.has_food !== false;

  return (
    <main className="min-h-screen bg-surface-grey flex flex-col antialiased">
      {/* Premium Header */}
      <div className="bg-brand-green pt-12 pb-24 px-6 text-center">
        <div className="max-w-md mx-auto space-y-12">
          <Link href="/" className="inline-block tap-feedback">
            <span className="text-2xl font-[900] tracking-tighter">
              <span className="text-white">Oya</span>
              <span className="text-brand-yellow">Plan</span>
            </span>
          </Link>

          <div className="space-y-4">
            <div className="inline-flex bg-white/10 px-4 py-1.5 rounded-full type-label text-white uppercase tracking-widest">
              {plan.vibe} Outing — {plan.squad_size} People
            </div>
            <h1 className="type-display text-white">{plan.spot?.name}</h1>
          </div>
        </div>
      </div>

      {/* Floating Breakdown Card */}
      <div className="max-w-md mx-auto w-full -mt-12 px-4 space-y-6 pb-20 relative z-10">
        {/* Expiry Banner */}
        <div className="bg-brand-yellow text-text-primary py-3 px-6 rounded-t-[20px] text-center border-b border-black/5 shadow-sm">
          <p className="type-label uppercase tracking-widest text-[10px] md:text-[11px]">
            Generated on {new Date(plan.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-white rounded-b-[20px] shadow-[0px_24px_48px_rgba(0,0,0,0.15)] border border-border-default overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Total Cost Display */}
            <div className="text-center pb-4 border-b border-border-default">
              <span className="type-label text-text-muted uppercase tracking-wider">Landed Cost</span>
              <div className="text-5xl font-[900] text-brand-green mt-1">₦{plan.total_cost.toLocaleString()}</div>
            </div>

            {/* Cost Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-grey border border-border-default rounded-[12px] space-y-1">
                <div className="flex items-center gap-2 text-text-muted type-label">
                  {hasFood ? <Utensils className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
                  {hasFood ? "Food/Drink" : "Activity"}
                </div>
                <div className="type-subheading text-text-primary">₦{plan.food_cost.toLocaleString()}</div>
              </div>
              <div className="p-4 bg-surface-grey border border-border-default rounded-[12px] space-y-1">
                <div className="flex items-center gap-2 text-text-muted type-label">
                  <Car className="w-3 h-3" />
                  Transport
                </div>
                <div className="type-subheading text-text-primary">₦{plan.transport_cost.toLocaleString()}</div>
              </div>
            </div>

            {/* Why it fits */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-text-muted type-label">
                <Info className="w-3 h-3" />
                Why it fits
              </div>
              <p className="type-body text-text-secondary leading-relaxed">
                {plan.why_it_fits}
              </p>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-text-muted type-label">
                <MapPin className="w-3 h-3" />
                Address
              </div>
              <p className="type-subheading text-text-primary">
                {plan.spot?.address}
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-6 bg-surface-grey border-t border-border-default">
            <Link href="/">
              <Button className="w-full bg-brand-green hover:bg-brand-green-70 h-[56px] rounded-[12px] type-subheading text-white flex items-center justify-center gap-2 tap-feedback shadow-none border-none">
                Plan your own outing
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="type-caption text-text-muted">
            Generated with OyaPlan &middot; Lagos Outing Planner
          </p>
          <Link href="/" className="type-label text-brand-green hover:underline inline-block">
            oyaplan.com
          </Link>
        </div>
      </div>
    </main>
  );
}
