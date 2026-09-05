import { captureServerException } from "@/lib/sentry";
import { getSharedPlanWithSpot } from "@/lib/queries/plans";
import { getSpendSummaryForSpot } from "@/lib/queries/actualSpend";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageError from "@/components/PageError";
import ActualSpendCapture from "@/components/ActualSpendCapture";
import PlanVoting from "@/components/PlanVoting";
import PlanViewTracker from "@/components/PlanViewTracker";
import { VenueImage } from "@/components/ui/VenueImage";

import { LedgerCard } from "@/components/dossier/LedgerCard";
import { ReceiptStructure } from "@/components/dossier/ReceiptStructure";
import { TransportToggle } from "@/components/dossier/TransportToggle";
import { PlanCTAs } from "@/components/dossier/PlanCTAs";
import { BeforeYouGo } from "@/components/dossier/BeforeYouGo";
import { WhyWePickedThis } from "@/components/dossier/WhyWePickedThis";
import { AREAS } from "@/lib/config/areas";
import { TrustStatus } from "@/components/ui/trust-badge";
import { BudgetFitStatus } from "@/components/ui/budget-fit-badge";
import { SharedPlanRow, Spot } from "@/lib/types";
import { TrendingUp } from "lucide-react";
import RecommendationFeedback from "@/components/RecommendationFeedback";
import SaveAsSquadPrompt from "@/components/squad/SaveAsSquadPrompt";

export const dynamic = "force-dynamic";

interface PlanPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ feedback?: string }>;
}

export async function generateMetadata({ params }: PlanPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data, notFound: isNotFound } = await getSharedPlanWithSpot(id);
    const plan = data as SharedPlanRow | null;

    if (isNotFound || !plan) return { title: "Plan Not Found | OyaPlan" };

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

export default async function PlanPage({ params, searchParams }: PlanPageProps) {
  const { id } = await params;
  const { feedback } = await searchParams;
  const isFeedbackFlow = feedback === "true";

  let plan: SharedPlanRow | undefined;
  let planFetchError = false;
  try {
    const { data, notFound: isNotFound, error } = await getSharedPlanWithSpot(id);

    if (error) {
      planFetchError = true;
    } else if (isNotFound || !data) {
      notFound();
    } else {
      plan = data as SharedPlanRow;
    }
  } catch (e) {
    captureServerException(e);
    planFetchError = true;
  }

  let spendSummary: Awaited<ReturnType<typeof getSpendSummaryForSpot>> = null;
  try {
    if (plan?.spot?.id) {
      spendSummary = await getSpendSummaryForSpot(plan.spot.id);
    }
  } catch (e) {
    captureServerException(e);
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
  let trustStatus: TrustStatus = "pending";
  if (explanation.status === 'verified' || explanation.status === 'owner_verified') trustStatus = "verified";
  else if (explanation.status === 'community_verified') trustStatus = "estimated";
  else if (explanation.status === 'stale') trustStatus = "estimated";
  
  // Compute Budget Fit
  let budgetFitStatus: BudgetFitStatus = "within";
  const diff = (plan?.budget || 0) - (plan?.total_cost || 0);
  if (diff > 2000) budgetFitStatus = "comfortable";
  else if (diff < 0 && Math.abs(diff) <= (plan?.budget || 0) * 0.15) budgetFitStatus = "stretch";
  // Spots fallback for action components
  const spots: Spot[] = plan?.spot ? [plan.spot as Spot] : [];

  return (
    <main className="min-h-[100dvh] bg-white-sand flex flex-col antialiased">
      <div className="max-w-2xl mx-auto w-full px-4 pt-6 pb-24 space-y-8">
        {/* Shared Plan Origin Badge */}
        <div className="flex items-center justify-between">
          <span className="type-ui-label text-text-secondary text-[11px] bg-white border border-border-default/80 px-3 py-1 rounded-full font-bold shadow-xs">
            Shared Plan
          </span>
        </div>
        
        {/* Hero Photo */}
        <div className="w-full aspect-[16/9] relative rounded-[28px] overflow-hidden img-zoom-container shadow-lagoon">
          <VenueImage 
            src={plan?.spot?.image_url || plan?.spot?.cover_url} 
            alt={plan?.spot?.name || "Venue"} 
            fallbackCategory={plan?.spot?.category}
            className="img-zoom"
          />
        </div>

        {/* Zero-Context Explainer */}
        <div className="text-center max-w-md mx-auto mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight mb-2">
            Squad Outing at {plan?.spot?.name}
          </h2>
          <p className="type-body text-[#4B5563] text-sm sm:text-base leading-relaxed">
            Verified plan for a squad of <strong>{plan?.squad_size}</strong>. Real menu prices, round-trip rides, and taxes accounted for upfront. Zero Instagram billing surprises.
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
          budget={plan?.budget || plan?.total_cost || 0}
          transportEstimate={plan?.transport_estimate}
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
          spots={spots}
          currentSpotId={plan?.spot?.id || ""}
          foodCost={plan?.food_cost || 0}
          transportCost={plan?.transport_cost || 0}
          totalCost={plan?.total_cost || 0}
          squadName={Array.isArray(plan?.group) ? plan?.group[0]?.name : plan?.group?.name}
        />

        {/* Post-Plan OyaSquad Intent Prompt */}
        <SaveAsSquadPrompt
          sharedPlanId={plan?.id || id}
          squadSize={plan?.squad_size || 1}
          existingGroupId={plan?.group_id}
          initialSquadName={Array.isArray(plan?.group) ? plan?.group[0]?.name : plan?.group?.name}
        />

        {/* Squad Voting Consensus builder */}
        <PlanVoting
          planId={plan?.id || id}
          originalBudget={plan?.budget || plan?.total_cost || 0}
          squadSize={plan?.squad_size || 1}
          currentSpot={plan?.spot as Spot}
          startArea={plan?.start_area || "lekki"}
          spotsList={spots || []}
        />

        {/* Recommendation Utility Feedback */}
        <div className="mt-8">
          <RecommendationFeedback planId={plan?.id || id} />
        </div>

        {/* Beta Feedback */}
        <div className="mt-12 pt-8 border-t border-border-default/50 text-center space-y-3">
          <p className="type-caption text-text-muted font-bold tracking-wide uppercase">Beta Feedback</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="mailto:support@oyaplan.app?subject=Plan Feedback: Was this helpful?" className="text-sm font-medium text-text-secondary hover:text-brand-green bg-white border border-border-default rounded-full px-4 py-2 tap-feedback shadow-sm">
              Was this helpful?
            </a>
            <a href="mailto:support@oyaplan.app?subject=Plan Feedback: Suggest an improvement" className="text-sm font-medium text-text-secondary hover:text-brand-green bg-white border border-border-default rounded-full px-4 py-2 tap-feedback shadow-sm">
              Suggest an improvement
            </a>
          </div>
        </div>

        {/* Create My Own Plan CTA for viewers */}
        <div className="w-full max-w-lg mx-auto pt-2">
          <Link href="/">
            <button className="w-full bg-lasgidi-yellow text-midnight-lagoon font-sans font-black uppercase tracking-widest text-xs h-14 rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#E2B63B] transition-colors tap-feedback btn-spring border-none shadow-sm">
              Create My Own Plan
            </button>
          </Link>
        </div>

        {/* New Reassurance Modules */}
        <WhyWePickedThis plan={plan!} />
        <BeforeYouGo />

        {/* Spend Accuracy Badge — only when we have 5+ reports */}
        {spendSummary && spendSummary.count >= 5 && (
          <div className="w-full flex items-center gap-3 bg-[#F0FBF5] border border-[#008751]/20 rounded-2xl px-5 py-4">
            <TrendingUp className="w-5 h-5 text-[#008751] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-black text-[#008751] uppercase tracking-wider">Community Accuracy</p>
              <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">
                Based on {spendSummary.count} squads: ₦{spendSummary.medianActual.toLocaleString()} median spend
                {spendSummary.variancePct <= 10 && " — highly accurate"}
                {spendSummary.variancePct > 10 && spendSummary.variancePct <= 20 && " — good estimate"}
                {spendSummary.variancePct > 20 && ` — ±${spendSummary.variancePct}% variance`}
              </p>
            </div>
          </div>
        )}

        {/* Utility / Feedback block */}
        <div className="pt-16 pb-8 space-y-6" id="spend-feedback">
          {isFeedbackFlow && (
            <div className="w-full bg-[#FCC630]/10 border border-[#FCC630]/40 rounded-2xl px-5 py-4 flex items-start gap-3">
              <span className="text-xl">👋</span>
              <div>
                <p className="text-sm font-black text-[#1A1A1A]">You&apos;re back!</p>
                <p className="text-sm text-[#4B5563] leading-snug">
                  Tell us what you actually spent — it takes 10 seconds and helps future squads get better estimates.
                </p>
              </div>
            </div>
          )}
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
