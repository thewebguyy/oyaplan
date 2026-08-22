import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getForgeSpots, getRouteOverrides } from "@/lib/queries/spots";
import { getAllowedCategories, getPrimaryAreaMatches, getAdjacentZoneMatches, generateRecoverySuggestions } from "@/lib/services/matching/forgeMatcher";
import { evaluatePlan } from "@/lib/services/matching/evaluators/evaluatePlan";
import { captureServerException } from "@/lib/sentry";
import { ForgeInput, Spot, Plan, RecoverySuggestion } from "@/lib/types";
import ForgeResultsClient from "./ForgeResultsClient";

export const dynamic = "force-dynamic";

const VIBE_URL_MAP: Record<string, string> = {
  "date-night": "Dinner",
  "chill": "Chill",
  "foodie": "Foodie",
  "party": "Party",
  "quick-link": "Quick",
  "brunch": "Brunch"
};

const forgeParamsSchema = z.object({
  vibe: z.enum(["date-night", "chill", "foodie", "party", "quick-link", "brunch"]),
  squad: z.coerce.number().int().positive().min(1).max(50),
  budget: z.coerce.number().int().positive().min(5000).max(2000000),
  area: z.string().optional(),
  pinned: z.string().optional(),
  fresh: z.string().optional(),
  mode: z.enum(["ride-hailing", "public-transit", "driving"]).optional(),
  departureAt: z.string().optional(),
});

function isBotRequest(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const botKeywords = [
    'whatsapp',
    'twitterbot',
    'facebookexternalhit',
    'slackbot',
    'telegrambot',
    'discordbot',
    'skypeuripreview',
    'googlebot',
    'bingbot',
  ];
  const uaLower = userAgent.toLowerCase();
  return botKeywords.some(keyword => uaLower.includes(keyword));
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const parsed = forgeParamsSchema.safeParse(resolvedParams);
  
  if (!parsed.success) {
    return {
      title: "Your Lagos Squad Plan — OyaPlan",
    };
  }

  const { vibe, squad, budget, area } = parsed.data;
  
  const formattedVibe = vibe.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formattedArea = area && area !== "anywhere"
    ? area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : "Lagos";

  const title = `₦${budget.toLocaleString()} Outing Plan in ${formattedArea} (${squad} people) — OyaPlan`;
  const description = `Verified ${formattedVibe} squad outing plan in ${formattedArea}. Includes menus, real prices, and transport costs. Zero guesswork.`;
  const imageUrl = `/api/og/plan?vibe=${vibe}&squad=${squad}&budget=${budget}&area=${area}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    }
  };
}

export default async function ForgePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  // Crawler User Agent Check
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  if (isBotRequest(userAgent)) {
    return <div className="min-h-[100dvh] bg-white" />;
  }

  // Zod Param Validation
  const parsed = forgeParamsSchema.safeParse(resolvedParams);
  if (!parsed.success) {
    redirect("/?error=invalid_params");
  }

  const categoryGroup = typeof resolvedParams.categoryGroup === "string" ? resolvedParams.categoryGroup : undefined;
  const allowedCategories = getAllowedCategories(categoryGroup);

  let allSpots: Spot[] = [];
  let routeOverrides: Record<string, { low: number; high: number; source: string; confidence: number }> = {};
  let originDistrictId: string | undefined = undefined;

  try {
    const isFreshSubmission = parsed.data.fresh === "true";
    const spotsPromise = getForgeSpots(allowedCategories ?? undefined);
    const overridesPromise = parsed.data.area && parsed.data.area !== "anywhere"
      ? getRouteOverrides(parsed.data.area)
      : Promise.resolve({ data: [], error: null });

    // Data-gated Hold-Up logic: only enforce the 900ms floor on fresh submissions
    const promises: Promise<unknown>[] = [spotsPromise, overridesPromise];
    if (isFreshSubmission) {
      promises.push(new Promise(resolve => setTimeout(resolve, 900)));
    }
    
    const results = await Promise.all(promises);
    const spotsResult = results[0] as { data: Spot[] | null; error: unknown };
    const overridesResult = results[1] as { data: any[] | null; error: unknown };
    const { data, error } = spotsResult;

    if (error || !data || data.length === 0) {
      redirect("/?error=spots_unavailable");
    }
    allSpots = data;

    if (overridesResult.data && overridesResult.data.length > 0) {
      originDistrictId = overridesResult.data[0]?.origin_area_id;
      overridesResult.data.forEach((ov) => {
        routeOverrides[ov.destination_area_id] = {
          low: ov.fixed_cost_low,
          high: ov.fixed_cost_high,
          source: ov.source,
          confidence: ov.confidence
        };
      });
    } else if (parsed.data.area && parsed.data.area !== "anywhere") {
      const { data: areaData } = await supabase
        .from('areas')
        .select('id')
        .eq('slug', parsed.data.area)
        .single();
      if (areaData) {
        originDistrictId = areaData.id;
      }
    }
  } catch (e) {
    captureServerException(e);
    redirect("/?error=spots_unavailable");
  }

  // Pinned Spot Validation
  let validatedPinnedId: string | undefined = undefined;
  if (parsed.data.pinned) {
    const pinnedSpot = allSpots.find(s => s.id === parsed.data.pinned && s.active);
    if (pinnedSpot) {
      validatedPinnedId = pinnedSpot.id;
    }
  }

  // Map parsed params to ForgeInput
  const input: ForgeInput = {
    startArea: parsed.data.area,
    squadSize: parsed.data.squad,
    budget: parsed.data.budget,
    vibe: VIBE_URL_MAP[parsed.data.vibe] || parsed.data.vibe,
    pinnedSpotId: validatedPinnedId,
    transportMode: parsed.data.mode || "ride-hailing",
    departureAt: parsed.data.departureAt,
    routeOverrides,
    originDistrictId,
  };

  // Run Matching/Pricing Engine: 2-Pass Matching (gated by area presence)
  const hasArea = Boolean(input.startArea && input.startArea !== "anywhere");
  const generatedPlans = hasArea ? getPrimaryAreaMatches(input, allSpots) : [];
  
  // Run Trust Evaluation Engine on Primary Plans
  const evaluations = generatedPlans.map((plan: Plan) => evaluatePlan({
    currentPlan: plan,
    candidatePlans: generatedPlans,
    input: input
  }));

  // Render Empty State Data Server-Side if needed
  let vibeMetrics = null;
  let nearbySpots: Spot[] = [];
  let targetAreaName = "";
  let recoverySuggestions: RecoverySuggestion[] = [];

  if (hasArea && evaluations.length === 0) {
    recoverySuggestions = generateRecoverySuggestions(input, allSpots);
    
    const vibeSpots = allSpots.filter(s => s.vibe_tags.includes(input.vibe));
    const prices = vibeSpots.map(s => s.price_per_person * input.squadSize * (s.has_food !== false ? 1.1 : 1.0));
    
    if (prices.length > 0) {
      const sortedPrices = [...prices].sort((a, b) => a - b);
      vibeMetrics = {
        min: sortedPrices[0],
        max: sortedPrices[sortedPrices.length - 1],
        median: sortedPrices[Math.floor(sortedPrices.length / 2)],
      };
    }

    const areaSpots = allSpots.filter(s => s.areas?.slug === input.startArea);
    targetAreaName = areaSpots[0]?.areas?.name || "";
    nearbySpots = areaSpots
      .filter(s => s.active)
      .sort((a, b) => a.price_per_person - b.price_per_person)
      .slice(0, 3);
  }

  // Pass 2: Adjacent Zone Matches (Enhancement Section or Location Recovery)
  const hasLocationRecovery = recoverySuggestions.some(r => r.type === "SwitchArea");
  const shouldFetchAdjacent = hasArea && (generatedPlans.length > 0 || hasLocationRecovery);
  const adjacentPlans = shouldFetchAdjacent 
    ? getAdjacentZoneMatches(input, allSpots, generatedPlans) 
    : [];

  const adjacentEvaluations = adjacentPlans.map((plan: Plan) => evaluatePlan({
    currentPlan: plan,
    candidatePlans: adjacentPlans,
    input: input
  }));

  return (
    <main
      className="min-h-[100dvh] pt-24 pb-16 px-4"
      style={{ background: 'linear-gradient(to bottom, #FAFAF8 0px, #FFFFFF 120px)' }}
    >
      <ForgeResultsClient
        evaluations={evaluations}
        adjacentEvaluations={adjacentEvaluations}
        vibeMetrics={vibeMetrics}
        nearbySpots={nearbySpots}
        targetAreaName={targetAreaName}
        forgeInput={input}
        allSpots={allSpots}
        recoverySuggestions={recoverySuggestions}
      />
    </main>
  );
}
