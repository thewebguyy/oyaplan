import { Suspense } from "react";
import { SessionResolver } from "@/lib/services/identity/sessionResolver";
import { SavedPlanService } from "@/lib/services/identity/savedPlanService";
import SavedClient from "./SavedClient";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const identity = await SessionResolver.resolveIdentity();
  const isAuthenticated = identity.type === "authenticated";

  let serverSavedPlans: any[] = [];

  if (isAuthenticated) {
    const res = await SavedPlanService.getSavedPlans(identity.profile.id);
    if (res.success && res.data) {
      serverSavedPlans = res.data;
    }
  }

  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAFAF8]" />}>
      <SavedClient
        serverSavedPlans={serverSavedPlans}
        isAuthenticated={isAuthenticated}
      />
    </Suspense>
  );
}
