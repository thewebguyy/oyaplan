import { useMemo } from "react";
import { Spot } from "@/lib/types";
import { useOrigin } from "@/lib/location/OriginContext";
import { LocationService } from "@/lib/services/LocationService";
import { PlanningEngine, createPlanningContext, PlanningDependencies, DEFAULT_PLANNING_DEPS } from "./planningEngine";
import { PlanningRequest, ExplainedPlan } from "./types";

interface UseRecommendationsProps {
  spots: Spot[];
  request: Omit<PlanningRequest, "startArea">;
  dependencies?: PlanningDependencies;
  isAdjacent?: boolean;
}

export function useRecommendations({
  spots,
  request,
  dependencies = DEFAULT_PLANNING_DEPS,
  isAdjacent = false
}: UseRecommendationsProps) {
  const { origin, status } = useOrigin();

  return useMemo(() => {
    // Build request with startArea set purely based on active origin or active verified area
    const defaultArea = LocationService.getVerifiedAreas()[0]?.id || "ikeja";
    const startArea = origin?.planningAreaSlug || defaultArea;

    const fullRequest: PlanningRequest = {
      ...request,
      startArea
    };

    const context = createPlanningContext(fullRequest);
    if (origin) {
      context.origin = origin;
    }

    const plans = PlanningEngine(context, dependencies, spots, isAdjacent);
    return {
      plans,
      origin,
      status
    };
  }, [spots, request, dependencies, isAdjacent, origin, status]);
}
