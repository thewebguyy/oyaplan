import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function ExploreLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[#FAFAF8] flex items-center justify-center font-bold text-midnight-lagoon">Loading...</div>}>
      {children}
    </Suspense>
  );
}
