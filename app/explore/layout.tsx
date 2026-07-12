import ExploreClientLayout from "@/components/explore/ExploreClientLayout";
import { getActiveSpotsByZone } from "@/lib/queries/zones";
import { captureServerException } from "@/lib/sentry";
import { Spot } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ExploreLayout({ children }: { children: React.ReactNode }) {
  let spots: Spot[] = [];

  try {
    const spotsResult = await getActiveSpotsByZone();
    if (!spotsResult.error) {
      spots = (spotsResult.data || []) as Spot[];
    }
  } catch (e) {
    captureServerException(e);
  }

  return (
    <ExploreClientLayout spots={spots}>
      {children}
    </ExploreClientLayout>
  );
}
