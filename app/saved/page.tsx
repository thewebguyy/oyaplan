import { Suspense } from "react";
import { SessionResolver } from "@/lib/services/identity/sessionResolver";
import { SavedPlanService } from "@/lib/services/identity/savedPlanService";
import { SavedVenueService } from "@/lib/services/identity/savedVenueService";
import { Spot } from "@/lib/types";
import SavedClient from "./SavedClient";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const identity = await SessionResolver.resolveIdentity();
  const isAuthenticated = identity.type === "authenticated";

  let serverSavedPlans: any[] = [];
  let serverSavedSpots: Spot[] = [];

  if (isAuthenticated) {
    const [plansRes, venuesRes] = await Promise.all([
      SavedPlanService.getSavedPlans(identity.profile.id),
      SavedVenueService.getSavedVenues(identity.profile.id),
    ]);

    if (plansRes.success && plansRes.data) {
      serverSavedPlans = plansRes.data;
    }
    if (venuesRes.success && venuesRes.data) {
      serverSavedSpots = venuesRes.data;
    }
  }

  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAFAF8]" />}>
      <SavedClient
        serverSavedPlans={serverSavedPlans}
        serverSavedSpots={serverSavedSpots}
        isAuthenticated={isAuthenticated}
      />
    </Suspense>
  );
}
