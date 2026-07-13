import { supabase } from "@/lib/supabase";
import { captureServerException } from "@/lib/sentry";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import PageError from "@/components/PageError";
import ActualSpendCapture from "@/components/ActualSpendCapture";
import PlanViewTracker from "@/components/PlanViewTracker";

import { LedgerCard } from "@/components/dossier/LedgerCard";
import { ReceiptStructure } from "@/components/dossier/ReceiptStructure";
import { TransportToggle } from "@/components/dossier/TransportToggle";
import { PlanCTAs } from "@/components/dossier/PlanCTAs";
import { BeforeYouGo } from "@/components/dossier/BeforeYouGo";
import { WhyWePickedThis } from "@/components/dossier/WhyWePickedThis";
import { AREAS } from "@/lib/config/areas";
import { TrustStatus } from "@/components/ui/trust-badge";
import { BudgetFitStatus } from "@/components/ui/budget-fit-badge";
import { SharedPlanRow } from "@/lib/types";

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

    if (!plan) return { title: "Plan Not Found | OyaPlan" };

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

  let plan: SharedPlanRow | undefined;
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

  // Configuration derivation
  const neonColor = AREAS.find(a => a.slug === plan?.spot?.areas?.slug || a.slug === plan?.start_area)?.neonColor || "#000000";
  
  // Explanation state 
  const explanation = plan?.explanation || ({} as Partial<import('@/lib/types').PlanExplanation>);
  const hasCar = explanation.has_car === true;
  
  // Compute Trust
  const confScore = explanation.confidence_score || 50;
  let trustStatus: TrustStatus = "pending";
  if (explanation.status === 'verified' || explanation.status === 'owner_verified') trustStatus = "verified";
  else if (explanation.status === 'community_verified') trustStatus = "estimated";
  else if (explanation.status === 'stale') trustStatus = "estimated";
  
  // Compute Budget Fit
  let budgetFitStatus: BudgetFitStatus = "within";
  const diff = (plan?.budget || 0) - (plan?.total_cost || 0);
  if (diff > 2000) budgetFitStatus = "comfortable";
  else if (diff < 0 && Math.abs(diff) <= (plan?.budget || 0) * 0.15) budgetFitStatus = "stretch";
  else if (diff < 0) budgetFitStatus = "over";

  return (
    <main className="min-h-screen bg-white flex flex-col antialiased">
      {/* Brutalist Top Nav */}
      <div className="w-full bg-white border-b-2 border-black py-4 px-6 flex items-center justify-between">
        <Link href="/" className="inline-block tap-feedback">
          <span className="text-xl font-black tracking-tighter uppercase text-black">
            OyaPlan
          </span>
        </Link>
        <span className="type-ui-label text-black text-[10px] bg-[#F6C642] px-2 py-1 font-bold">
          Live Plan
        </span>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 pt-12 pb-24 space-y-8">
        
        {/* Zero-Context Explainer */}
        <div className="text-center max-w-sm mx-auto mb-8">
          <p className="font-sans font-medium text-black text-sm sm:text-base leading-relaxed">
            Someone built a plan for <strong>{plan?.squad_size} people</strong> going to <strong>{plan?.spot?.name}</strong>. We did the math so you can just enjoy the night. No unexpected billing.
          </p>
        </div>

        {/* The Ledger Card */}
        <LedgerCard 
          totalCost={plan?.total_cost || 0} 
          neonColor={neonColor} 
          trustStatus={trustStatus}
          freshnessText={explanation.freshness}
        />

        {/* The Receipt Structure & Toggle */}
        <ReceiptStructure 
          venueName={plan?.spot?.name || "Venue"}
          venueCost={plan?.food_cost || 0}
          transportCost={plan?.transport_cost || 0}
          squadSize={plan?.squad_size || 1}
          budgetFitStatus={budgetFitStatus}
          hasCar={hasCar}
          transportToggleNode={<TransportToggle planId={plan?.id || id} hasCar={hasCar} />}
        />

        {/* Action CTAs */}
        <PlanCTAs 
          planId={plan?.id || id}
          venueName={plan?.spot?.name || "Venue"}
          address={plan?.spot?.address || ""}
          budget={plan?.budget || plan?.total_cost || 0}
          squadSize={plan?.squad_size || 1}
          vibe={plan?.vibe || "Chill"}
          startArea={plan?.start_area || ""}
        />

        {/* New Reassurance Modules */}
        <WhyWePickedThis plan={plan!} />
        <BeforeYouGo />

        {/* Utility / Feedback block */}
        <div className="pt-16 pb-8 space-y-6">
          <ActualSpendCapture
            sharedPlanId={plan?.id || id}
            spotId={plan?.spot?.id ?? null}
            estimatedTotal={plan?.total_cost || 0}
            spotName={plan?.spot?.name ?? "this spot"}
          />
          <PlanViewTracker planId={plan?.id || id} />
        </div>
        
      </div>
    </main>
  );
}
