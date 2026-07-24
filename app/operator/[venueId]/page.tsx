import { createServerClient } from "@/lib/supabase-server";
import { getVenuesByOwner } from "@/lib/queries/operator";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ManageVenueClient from "./ManageVenueClient";

export const dynamic = "force-dynamic";

interface ManageVenueProps {
  params: Promise<{ venueId: string }>;
}

export default async function ManageVenuePage({ params }: ManageVenueProps) {
  const { venueId } = await params;
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();

  if (!user) {
    redirect("/admin/login?next=/operator");
  }

  // Security check: Verify user owns/manages this specific venue
  const userVenues = await getVenuesByOwner(user.id);
  const isAuthorized = userVenues.some((v) => v.venue_id === venueId);

  if (!isAuthorized) {
    notFound();
  }

  // Fetch venue configuration
  const { data: venue } = await supabase
    .from("venues")
    .select("*")
    .eq("id", venueId)
    .single();

  // Fetch venue menu items
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .eq("venue_id", venueId)
    .order("category");

  return (
    <main className="min-h-screen bg-[#FAFAF8] antialiased pb-24">
      {/* Nav */}
      <div className="w-full bg-white border-b border-border-default py-4 px-6 flex items-center justify-between">
        <Link href="/operator" className="inline-flex items-center gap-1.5 text-sm font-bold text-text-secondary hover:text-black">
          ← Back to Venues
        </Link>
        <span className="type-ui-label text-xs bg-indigo-600/10 text-indigo-600 px-3 py-1 rounded-full font-black uppercase">
          Manage: {venue?.name}
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10">
        <ManageVenueClient
          userId={user.id}
          venue={venue}
          initialMenuItems={menuItems || []}
        />
      </div>
    </main>
  );
}
