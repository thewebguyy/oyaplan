import { supabase } from "@/lib/supabase";
import { captureServerException } from "@/lib/sentry";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Utensils, Car, Info, ArrowRight } from "lucide-react";
import PageError from "@/components/PageError";
import ActualSpendCapture from "@/components/ActualSpendCapture";
import SavePlanButton from "@/components/SavePlanButton";
import PlanViewTracker from "@/components/PlanViewTracker";
import EditorialPlan from "@/components/EditorialPlan";
import { Plan, ForgeInput } from "@/lib/types";

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
    const totalCost = plan.total_cost.toLocaleString('en-NG');
    const squadSize = plan.squad_size;

    return {
      title: `Squad plan at ${spotName} — OyaPlan`,
      description: `Total cost: ₦${totalCost} for ${squadSize} people. See the full breakdown.`,
      openGraph: {
        title: `Squad plan at ${spotName} — OyaPlan`,
        description: `Total cost: ₦${totalCost} for ${squadSize} people. See the full breakdown.`,
        images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://oyaplan.vercel.app'}/api/og/plan?id=${id}`],
        type: "website",
      },
    };
  } catch (e) {
    captureServerException(e);
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
  } catch (e) {
    captureServerException(e);
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

      {/* Unified Editorial Plan */}
      <div className="max-w-2xl mx-auto w-full -mt-12 px-4 space-y-6 pb-20 relative z-10">
        <EditorialPlan 
          evaluation={{
            plan: {
              spot: plan.spot as any,
              foodCost: plan.food_cost,
              transportCost: plan.transport_cost,
              totalCost: plan.total_cost,
              whyItFits: plan.why_it_fits
            },
            trustSignals: []
          }}
          input={{
            startArea: plan.start_area || "",
            squadSize: plan.squad_size,
            budget: plan.budget || plan.total_cost,
            vibe: plan.vibe || "Chill"
          }} 
          planId={plan.id}
          isTopPick={true}
          originalBudget={plan.budget || plan.total_cost}
        />

        {/* Actual Spend Capture — feeds pricing flywheel */}
        <ActualSpendCapture
          sharedPlanId={plan.id}
          spotId={plan.spot?.id ?? null}
          estimatedTotal={plan.total_cost}
          spotName={plan.spot?.name ?? "this spot"}
        />
        
        <PlanViewTracker planId={plan.id} />

        <div className="text-center pt-8">
          <Link href="/" className="type-label text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-2 tap-feedback">
            Plan your own outing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
