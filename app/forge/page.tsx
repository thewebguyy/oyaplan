import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getForgeSpots, getRouteOverrides } from "@/lib/queries/spots";
import { supabase } from "@/lib/supabase";
import { getAllowedCategories, getPrimaryAreaMatches, getAdjacentZoneMatches, generateRecoverySuggestions } from "@/lib/services/matching/forgeMatcher";
import { evaluatePlan } from "@/lib/services/matching/evaluators/evaluatePlan";
import { captureServerException } from "@/lib/sentry";
import { ForgeInput, Spot, Plan, RecoverySuggestion } from "@/lib/types";
import { SessionResolver } from "@/lib/services/identity/sessionResolver";
import ForgeResultsClient from "./ForgeResultsClient";

export const dynamic = "force-dynamic";

import { normalizeVibeToCanonicalSlug, CANONICAL_VIBE_TO_SPOT_TAG } from "@/lib/planning/buildVenuePlanUrl";
import { normalizeAreaSlug } from "@/lib/planning/utils";

const forgeParamsSchema = z.object({
  vibe: z.string().optional(),
  squad: z.coerce.number().optional(),
  budget: z.coerce.number().optional(),
  area: z.string().optional(),
  pinned: z.string().optional(),
  fresh: z.string().optional(),
  mode: z.enum(["ride-hailing", "public-transit", "driving"]).optional(),
  departureAt: z.string().optional(),
  group: z.string().uuid().optional(),
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
  const rawVibe = typeof resolvedParams.vibe === "string" ? resolvedParams.vibe : undefined;
  const canonicalVibe = normalizeVibeToCanonicalSlug(rawVibe);
  
  const rawSquad = Number(resolvedParams.squad);
  const squad = !isNaN(rawSquad) && rawSquad >= 1 && rawSquad <= 50 ? Math.floor(rawSquad) : 2;

  const rawBudget = Number(resolvedParams.budget);
  const budget = !isNaN(rawBudget) && rawBudget >= 5000 && rawBudget <= 2000000 
    ? Math.round(rawBudget / 500) * 500 
    : 50000;

  const rawArea = typeof resolvedParams.area === "string" ? resolvedParams.area : undefined;
  const area = rawArea && rawArea !== "anywhere" ? normalizeAreaSlug(rawArea) : undefined;
  
  const formattedVibe = canonicalVibe.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formattedArea = area
    ? area.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : "Lagos";

  const title = `₦${budget.toLocaleString()} Outing Plan in ${formattedArea} (${squad} people) — OyaPlan`;
  const description = `Verified ${formattedVibe} squad outing plan in ${formattedArea}. Includes menus, real prices, and transport costs. Zero guesswork.`;
  const imageUrl = `/api/og/plan?vibe=${canonicalVibe}&squad=${squad}&budget=${budget}&area=${area || "anywhere"}`;

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

  // Gracefully normalize parameters with sensible defaults instead of fatal error redirects
  const rawVibe = typeof resolvedParams.vibe === "string" ? resolvedParams.vibe : undefined;
  const canonicalVibe = normalizeVibeToCanonicalSlug(rawVibe);

  const rawSquad = Number(resolvedParams.squad);
  const squad = !isNaN(rawSquad) && rawSquad >= 1 && rawSquad <= 50 ? Math.floor(rawSquad) : 2;

  const rawBudget = Number(resolvedParams.budget);
  const budget = !isNaN(rawBudget) && rawBudget >= 5000 && rawBudget <= 2000000 
    ? Math.round(rawBudget / 500) * 500 
    : 50000;

  const rawArea = typeof resolvedParams.area === "string" ? resolvedParams.area : undefined;
  const normalizedArea = rawArea ? normalizeAreaSlug(rawArea) : undefined;

  const rawPinned = typeof resolvedParams.pinned === "string" && resolvedParams.pinned.trim() 
    ? resolvedParams.pinned.trim() 
    : undefined;
  const isFreshSubmission = resolvedParams.fresh === "true";
  const modeParam = typeof resolvedParams.mode === "string" && ["ride-hailing", "public-transit", "driving"].includes(resolvedParams.mode)
    ? (resolvedParams.mode as "ride-hailing" | "public-transit" | "driving")
    : "ride-hailing";
  const rawDepartureAt = typeof resolvedParams.departureAt === "string" ? resolvedParams.departureAt : undefined;
  const rawGroup = typeof resolvedParams.group === "string" ? resolvedParams.group : undefined;

  const categoryGroup = typeof resolvedParams.categoryGroup === "string" ? resolvedParams.categoryGroup : undefined;
  const allowedCategories = getAllowedCategories(categoryGroup);

  let allSpots: Spot[] = [];
  let routeOverrides: Record<string, { low: number; high: number; source: string; confidence: number }> = {};
  let originDistrictId: string | undefined = undefined;

  try {
    const spotsPromise = getForgeSpots(allowedCategories ?? undefined);
    const overridesPromise = normalizedArea && normalizedArea !== "anywhere"
      ? getRouteOverrides(normalizedArea)
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
    } else if (normalizedArea && normalizedArea !== "anywhere") {
      const { data: areaData } = await supabase
        .from('areas')
        .select('id')
        .eq('slug', normalizedArea)
        .single();
      if (areaData) {
        originDistrictId = areaData.id;
      }
    }
  } catch (e) {
    captureServerException(e);
    redirect("/?error=spots_unavailable");
  }

  // Pinned Spot Validation & Recovery: Ensure pinned venue always survives
  let validatedPinnedId: string | undefined = undefined;
  if (rawPinned) {
    const pinnedSpot = allSpots.find(s => s.id === rawPinned && s.active);
    if (pinnedSpot) {
      validatedPinnedId = pinnedSpot.id;
    } else {
      // Query specifically for the pinned spot in case it was outside category/limit
      try {
        const { data: pinnedSpotData } = await supabase
          .from('spots')
          .select('*, areas(*)')
          .eq('id', rawPinned)
          .single();
        if (pinnedSpotData && pinnedSpotData.active) {
          allSpots.unshift(pinnedSpotData as Spot);
          validatedPinnedId = pinnedSpotData.id;
        }
      } catch (err) {
        captureServerException(err);
      }
    }
  }

  // Resolve Identity for user attribution
  const identity = await SessionResolver.resolveIdentity();
  const userId = identity.type === "authenticated" ? identity.profile.id : undefined;
  const sessionId = identity.sessionId;

  // Map parsed params to ForgeInput
  const input: ForgeInput = {
    startArea: normalizedArea,
    squadSize: squad,
    budget: budget,
    vibe: CANONICAL_VIBE_TO_SPOT_TAG[canonicalVibe] || "Chill",
    pinnedSpotId: validatedPinnedId,
    transportMode: modeParam,
    departureAt: rawDepartureAt,
    routeOverrides,
    originDistrictId,
    userId,
    sessionId,
    groupId: rawGroup,
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
