import ForgeForm from "@/components/ForgeForm";
import { supabase } from "@/lib/supabase";
import { Area } from "@/lib/types";
import Link from "next/link";
import { Suspense } from "react";

export const revalidate = 300;

async function getAreas() {
  const { data: areas, error } = await supabase
    .from("areas")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching areas:", error);
    return [];
  }
  return areas;
}

async function getPlanCount() {
  const { count, error } = await supabase
    .from("plan_requests")
    .select("*", { count: "exact", head: true });
  
  if (error) return 0;
  return count || 0;
}

export default async function LandingPage() {
  const [areas, planCount] = await Promise.all([
    getAreas(),
    getPlanCount()
  ]);

  return (
    <main className="min-h-screen bg-[#008751] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tighter">
            Stop the group chat wahala. <br />
            <span className="text-[#FCD116]">Get one complete plan in 3s.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
            Input 4 simple fields. Get the exact food cost, transport estimate, and "why it fits" note. Copy to WhatsApp and go.
          </p>

          {/* Form */}
          <div className="mt-12 px-4 w-full space-y-4">
            <Suspense fallback={<div className="h-96 animate-pulse bg-white/10 rounded-2xl" />}>
              <ForgeForm areas={areas} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-white text-gray-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
            {planCount > 0 ? (
              <>
                Join <span className="text-[#008751] font-black">{planCount.toLocaleString('en-NG')}</span> Lagos squads who have already planned their outing.
              </>
            ) : (
              "Be the first Lagos squad to plan your outing today."
            )}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-white/60 text-[15px]">
        &copy; 2026 OyaPlan.com &middot; Built in Lagos.
      </footer>
    </main>
  );
}
