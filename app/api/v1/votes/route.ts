import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/v1/votes?planId=UUID
 * Returns a summary of vote tallies for a shared plan.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get("planId");

  if (!planId) {
    return NextResponse.json({ error: "Missing planId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("plan_votes")
    .select("vote")
    .eq("plan_id", planId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const summary = {
    agree: 0,
    too_expensive: 0,
    different_vibe: 0,
  };

  data.forEach((row) => {
    if (row.vote in summary) {
      summary[row.vote as keyof typeof summary]++;
    }
  });

  return NextResponse.json(summary);
}

/**
 * POST /api/v1/votes
 * Registers or updates a vote for a plan.
 * Body: { planId: UUID, sessionId: string, vote: 'agree' | 'too_expensive' | 'different_vibe' }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, sessionId, vote } = body;

    if (!planId || !sessionId || !vote) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["agree", "too_expensive", "different_vibe"].includes(vote)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    // Upsert vote using voter_session_id and plan_id
    const { error } = await supabase.from("plan_votes").upsert(
      {
        plan_id: planId,
        voter_session_id: sessionId,
        vote: vote,
      },
      { onConflict: "plan_id,voter_session_id" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
