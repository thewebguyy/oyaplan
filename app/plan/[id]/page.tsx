import { captureServerException } from '@/lib/sentry';
import { getSharedPlanWithSpot } from '@/lib/queries/plans';
import { getSpendSummaryForSpot } from '@/lib/queries/actualSpend';
import { getPublicVenueById, getVenueMenuItems } from '@/lib/queries/partner';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageError from '@/components/PageError';
import PlanViewTracker from '@/components/PlanViewTracker';
import { PlanHeroSummary } from '@/components/plan/PlanHeroSummary';
import { PlanWhatYouGet } from '@/components/plan/PlanWhatYouGet';
import { PlanCostBreakdown } from '@/components/plan/PlanCostBreakdown';
import { PlanWhyThisWorks } from '@/components/plan/PlanWhyThisWorks';
import { PlanActionsShare } from '@/components/plan/PlanActionsShare';
import { PlanActualSpendPrompt } from '@/components/plan/PlanActualSpendPrompt';
import { PlanMobileStickyBar } from '@/components/plan/PlanMobileStickyBar';
import { TrustStatus } from '@/components/ui/trust-badge';
import { SharedPlanRow, Venue, MenuItem } from '@/lib/types';
import { LocationService } from '@/lib/services/LocationService';

export const dynamic = 'force-dynamic';

interface PlanPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ feedback?: string }>;
}

export async function generateMetadata({ params }: PlanPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const { data, notFound: isNotFound } = await getSharedPlanWithSpot(id);
    const plan = data as SharedPlanRow | null;

    if (isNotFound || !plan) return { title: 'Plan Not Found | OyaPlan' };

    const spotName = plan.spot?.name || 'Lagos Venue';
    const totalCost = plan.total_cost.toLocaleString('en-NG');
    const squadSize = plan.squad_size;

    return {
      title: `Squad Outing at ${spotName} — OyaPlan`,
      description: `Estimated spend: ~₦${totalCost} for ${squadSize} people. See full breakdown and menu items.`,
      openGraph: {
        title: `Squad Outing at ${spotName} — OyaPlan`,
        description: `Estimated spend: ~₦${totalCost} for ${squadSize} people. See full breakdown and menu items.`,
        images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://oyaplan.vercel.app'}/api/og/plan?id=${id}`],
        type: 'website',
      },
    };
  } catch (e) {
    captureServerException(e);
    return { title: 'OyaPlan' };
  }
}

export default async function PlanPage({ params, searchParams }: PlanPageProps) {
  const { id } = await params;
  const { feedback } = await searchParams;
  const isFeedbackFlow = feedback === 'true';

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

  if (planFetchError || !plan) {
    return (
      <PageError
        message="We could not load this plan. Please check the link or create a new plan."
        href="/"
        linkLabel="Plan a new outing"
      />
    );
  }

  let venue: Venue | null = null;
  let menuItems: MenuItem[] = [];
  let spendSummary: Awaited<ReturnType<typeof getSpendSummaryForSpot>> = null;

  try {
    if (plan.spot?.id) {
      const [venueRes, menuRes, spendRes] = await Promise.all([
        getPublicVenueById(plan.spot.id),
        getVenueMenuItems(plan.spot.id),
        getSpendSummaryForSpot(plan.spot.id),
      ]);
      venue = venueRes.data;
      menuItems = menuRes;
      spendSummary = spendRes;
    }
  } catch (e) {
    captureServerException(e);
  }

  // Explanation state
  const explanation = plan.explanation || ({} as Partial<import('@/lib/types').PlanExplanation>);
  const hasCar = explanation.has_car === true;

  // Compute Trust
  let trustStatus: TrustStatus = 'estimated';
  if (explanation.status === 'verified' || explanation.status === 'owner_verified') {
    trustStatus = 'verified';
  } else if (explanation.status === 'stale' || explanation.status === 'community_verified') {
    trustStatus = 'estimated';
  } else if (explanation.status === 'pending') {
    trustStatus = 'pending';
  }

  const areaSlug = plan.start_area || 'lekki';
  const startAreaMatch = LocationService.getAllAreas().find(
    (a) => a.id === areaSlug || a.name.toLowerCase() === areaSlug.toLowerCase()
  );
  const startAreaName =
    startAreaMatch?.name ||
    (areaSlug !== 'anywhere'
      ? areaSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Lagos');

  const spotName = plan.spot?.name || venue?.name || 'Venue';
  const userBudget = plan.budget || plan.total_cost;

  return (
    <main className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col antialiased">
      <div className="max-w-2xl mx-auto w-full px-4 pt-4 sm:pt-6 pb-28 space-y-6">
        {/* 1. Plan Context & Decision Hero */}
        <PlanHeroSummary
          squadSize={plan.squad_size}
          budget={userBudget}
          estimatedSpend={plan.total_cost}
          vibe={plan.vibe}
          startAreaName={startAreaName}
          spot={plan.spot}
          venue={venue}
          trustStatus={trustStatus}
          freshnessText={explanation.freshness}
          isSharedPlan={true}
        />

        {/* 2. What You're Getting */}
        <PlanWhatYouGet
          squadSize={plan.squad_size}
          foodCost={plan.food_cost || Math.max(0, plan.total_cost - (plan.transport_cost || 0))}
          spot={plan.spot}
          venue={venue}
          menuItems={menuItems}
          hasFood={plan.spot?.has_food}
        />

        {/* 3. Cost Breakdown & Landing Total */}
        <PlanCostBreakdown
          foodCost={plan.food_cost || 0}
          transportCost={plan.transport_cost || 0}
          totalCost={plan.total_cost}
          budget={userBudget}
          squadSize={plan.squad_size}
          startAreaName={startAreaName}
          transportEstimate={plan.transport_estimate}
          freshnessText={explanation.freshness}
          hasCar={hasCar}
          hasFood={plan.spot?.has_food}
          serviceChargePct={venue?.service_charge_pct ?? 0}
          vatPct={venue?.vat_pct ?? 0}
        />

        {/* 4. Why This Plan */}
        <PlanWhyThisWorks
          squadSize={plan.squad_size}
          budget={userBudget}
          totalCost={plan.total_cost}
          vibe={plan.vibe}
          startAreaName={startAreaName}
          orderedReasons={explanation.ordered_reasons}
          spotName={spotName}
        />

        {/* 5. Sharing & Squad Attribution */}
        <PlanActionsShare
          planId={plan.id || id}
          venueName={spotName}
          squadSize={plan.squad_size}
          budget={userBudget}
          totalCost={plan.total_cost}
          foodCost={plan.food_cost || 0}
          transportCost={plan.transport_cost || 0}
          vibe={plan.vibe}
          startArea={plan.start_area}
          planCode={plan.plan_code}
          venuePhone={venue?.contact_number}
        />

        {/* 6. Post-Outing Actual Spend Reporting */}
        <div id="actual-spend">
          <PlanActualSpendPrompt
            sharedPlanId={plan.id || id}
            spotId={plan.spot?.id ?? null}
            estimatedTotal={plan.total_cost}
            spotName={spotName}
          />
        </div>

        {/* Background Analytics View Tracker */}
        <PlanViewTracker planId={plan.id || id} />
      </div>

      {/* 7. Mobile Persistent Sticky Bar */}
      <PlanMobileStickyBar
        planId={plan.id || id}
        venueName={spotName}
        squadSize={plan.squad_size}
        budget={userBudget}
        totalCost={plan.total_cost}
        foodCost={plan.food_cost || 0}
        transportCost={plan.transport_cost || 0}
        vibe={plan.vibe}
        startArea={plan.start_area}
      />
    </main>
  );
}
