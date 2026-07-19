import ExploreClientLayout from "@/components/explore/ExploreClientLayout";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">Loading map...</div>}>
      <ExploreClientLayout>
        {children}
      </ExploreClientLayout>
    </Suspense>
  );
}
