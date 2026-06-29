import { supabase } from "@/lib/supabase";
import { getAllowedCategories } from "@/lib/matchingEngine";
import ForgeResultsClient from "./ForgeResultsClient";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Your Lagos Squad Plan — OyaPlan",
    description: "Here's your personalised outing plan. Copy it to WhatsApp and go.",
    openGraph: {
      title: "Your Lagos Squad Plan — OyaPlan",
      description: "Here's your personalised outing plan. Copy it to WhatsApp and go.",
      images: ["/og"],
    }
  };
}

export default async function ForgePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;

  const categoryGroup = typeof resolvedParams.categoryGroup === "string" ? resolvedParams.categoryGroup : undefined;
  const allowedCategories = getAllowedCategories(categoryGroup);

  let allSpots;
  try {
    let query = supabase
      .from("spots")
      .select("*, areas(*)")
      .eq("active", true);

    if (allowedCategories) {
      query = query.in("category", allowedCategories);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      redirect("/?error=spots_unavailable");
    }
    allSpots = data;
  } catch {
    redirect("/?error=spots_unavailable");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <ForgeResultsClient
        allSpots={allSpots}
        params={resolvedParams as Record<string, string | string[] | undefined>}
      />
    </main>
  );
}
