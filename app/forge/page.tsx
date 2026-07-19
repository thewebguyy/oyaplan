import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getForgeSpots } from "@/lib/queries/spots";
import { getAllowedCategories, forgePlans, generateRecoverySuggestions } from "@/lib/services/matching/forgeMatcher";
import { evaluatePlan } from "@/lib/services/matching/evaluators/evaluatePlan";
import { captureServerException } from "@/lib/sentry";
import { ForgeInput, Spot, RecoverySuggestion } from "@/lib/types";
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
  area: z.string().optional().default("anywhere"),
  pinned: z.string().optional(),
  fresh: z.string().optional(),
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
    return <div className="min-h-screen bg-white" />;
  }

  // Zod Param Validation
  const parsed = forgeParamsSchema.safeParse(resolvedParams);
  if (!parsed.success) {
    redirect("/?error=invalid_params");
  }

  const categoryGroup = typeof resolvedParams.categoryGroup === "string" ? resolvedParams.categoryGroup : undefined;
  const allowedCategories = getAllowedCategories(categoryGroup);

  let allSpots: Spot[] = [];
  try {
    const isFreshSubmission = parsed.data.fresh === "true";
    const spotsPromise = getForgeSpots(allowedCategories ?? undefined);
    
    // Data-gated Hold-Up logic: only enforce the 900ms floor on fresh submissions
    const promises: Promise<any>[] = [spotsPromise];
    if (isFreshSubmission) {
      promises.push(new Promise(resolve => setTimeout(resolve, 900)));
    }
    
    const [spotsResult] = await Promise.all(promises);
    const { data, error } = spotsResult;

    if (error || !data || data.length === 0) {
      redirect("/?error=spots_unavailable");
    }
    allSpots = data;
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
  };

  // Run Matching/Pricing Engine
  const generatedPlans = forgePlans(input, allSpots);
  
  // Run Trust Evaluation Engine
  const evaluations = generatedPlans.map(plan => evaluatePlan({
    currentPlan: plan,
    candidatePlans: generatedPlans,
    input: input
  }));

  // Render Empty State Data Server-Side if needed
  let vibeMetrics = null;
  let nearbySpots: Spot[] = [];
  let targetAreaName = "";
  let recoverySuggestions: RecoverySuggestion[] = [];

  if (evaluations.length === 0) {
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

  return (
    <main
      className="min-h-screen pt-24 pb-16 px-4"
      style={{ background: 'linear-gradient(to bottom, #FAFAF8 0px, #FFFFFF 120px)' }}
    >
      <ForgeResultsClient
        evaluations={evaluations}
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
