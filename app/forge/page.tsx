import { supabase } from "@/lib/supabase";
import ForgeResultsClient from "./ForgeResultsClient";

export const dynamic = "force-dynamic";

export default async function ForgePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  // Fetch all active spots once
  const { data: allSpots, error } = await supabase
    .from("spots")
    .select("*")
    .eq("active", true);

  if (error || !allSpots) {
    console.error("Error fetching spots:", error);
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border">
          <h2 className="text-xl font-bold mb-2">Supabase not connected</h2>
          <p className="text-gray-500 mb-4">Please set up your environment variables.</p>
          <a href="/" className="text-[#008751] font-bold">Return Home</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <ForgeResultsClient 
        allSpots={allSpots || []} 
        params={resolvedParams as any} 
      />
    </main>
  );
}
