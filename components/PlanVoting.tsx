"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, DollarSign, Shuffle, Check, Loader2 } from "lucide-react";
import { Spot } from "@/lib/types";
import Link from "next/link";

interface PlanVotingProps {
  planId: string;
  originalBudget: number;
  squadSize: number;
  currentSpot: Spot;
  startArea: string;
  spotsList: Spot[];
}

export default function PlanVoting({
  planId,
  originalBudget,
  squadSize,
  currentSpot,
  startArea,
  spotsList,
}: PlanVotingProps) {
  const [sessionId, setSessionId] = useState("");
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tallies, setTallies] = useState({ agree: 0, too_expensive: 0, different_vibe: 0 });
  const [alternatives, setAlternatives] = useState<Spot[]>([]);
  const [altType, setAltType] = useState<"cheaper" | "vibe" | null>(null);

  // Initialize unique session ID per device
  useEffect(() => {
    let sid = localStorage.getItem("oyaplan_voter_session");
    if (!sid) {
      sid = `voter_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("oyaplan_voter_session", sid);
    }
    setSessionId(sid);

    // Fetch initial tallies
    fetch(`/api/v1/votes?planId=${planId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setTallies(data);
        }
      });
  }, [planId]);

  const handleVote = async (voteType: "agree" | "too_expensive" | "different_vibe") => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, sessionId, vote: voteType }),
      });
      const data = await res.json();
      if (data.success) {
        setMyVote(voteType);
        // Refresh tallies
        const talliesRes = await fetch(`/api/v1/votes?planId=${planId}`);
        const talliesData = await talliesRes.json();
        if (talliesData && !talliesData.error) {
          setTallies(talliesData);
        }

        // Generate context-specific alternatives
        if (voteType === "too_expensive") {
          setAltType("cheaper");
          const targetBudget = originalBudget * 0.75; // Try to target 25% cheaper
          const cheaperSpots = spotsList
            .filter((s) => s.id !== currentSpot.id && (s.price_per_person * squadSize) <= targetBudget)
            .slice(0, 3);
          setAlternatives(cheaperSpots);
        } else if (voteType === "different_vibe") {
          setAltType("vibe");
          // Find spots in same budget scope but different vibes
          const otherVibeSpots = spotsList
            .filter((s) => s.id !== currentSpot.id && !s.vibe_tags.some(v => currentSpot.vibe_tags.includes(v)))
            .slice(0, 3);
          setAlternatives(otherVibeSpots);
        } else {
          setAltType(null);
          setAlternatives([]);
        }
      }
    } catch (err) {
      console.error("Failed to submit vote:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#FAFAF8] border border-border-default/80 rounded-[24px] p-6 space-y-6">
      <div className="space-y-1">
        <h3 className="type-body font-black text-midnight-lagoon text-base">Squad Feedback</h3>
        <p className="type-caption text-text-muted">Quick consensus builder. Agree or ask for adjustments.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Vote Agree */}
        <button
          onClick={() => handleVote("agree")}
          disabled={loading}
          className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all tap-feedback ${
            myVote === "agree"
              ? "bg-[#008751] border-[#008751] text-white"
              : "bg-white border-border-default hover:bg-gray-50 text-text-primary"
          }`}
        >
          {loading && myVote === "agree" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ThumbsUp className="w-5 h-5" />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider">Agree ({tallies.agree})</span>
        </button>

        {/* Vote Too Expensive */}
        <button
          onClick={() => handleVote("too_expensive")}
          disabled={loading}
          className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all tap-feedback ${
            myVote === "too_expensive"
              ? "bg-amber-600 border-amber-600 text-white"
              : "bg-white border-border-default hover:bg-gray-50 text-text-primary"
          }`}
        >
          {loading && myVote === "too_expensive" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <DollarSign className="w-5 h-5" />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider">Cheaper ({tallies.too_expensive})</span>
        </button>

        {/* Vote Different Vibe */}
        <button
          onClick={() => handleVote("different_vibe")}
          disabled={loading}
          className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all tap-feedback ${
            myVote === "different_vibe"
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "bg-white border-border-default hover:bg-gray-50 text-text-primary"
          }`}
        >
          {loading && myVote === "different_vibe" ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Shuffle className="w-5 h-5" />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider">New Vibe ({tallies.different_vibe})</span>
        </button>
      </div>

      {/* Suggested Alternatives Drawer/Sub-section */}
      {alternatives.length > 0 && altType && (
        <div className="pt-4 border-t border-border-default/60 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-green" />
            <h4 className="text-xs font-black text-midnight-lagoon uppercase tracking-wider">
              {altType === "cheaper" ? "Cheaper Alternatives" : "Alternative Vibes"}
            </h4>
          </div>
          <div className="space-y-3">
            {alternatives.map((spot) => {
              const estPrice = spot.price_per_person * squadSize;
              return (
                <div
                  key={spot.id}
                  className="bg-white border border-border-default/50 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-[#008751]/45 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary truncate">{spot.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      ₦{spot.price_per_person.toLocaleString()} per person • {spot.vibe_tags.slice(0, 2).join(", ")}
                    </p>
                  </div>
                  <Link
                    href={`/plan/${spot.id}?squad=${squadSize}&budget=${originalBudget}`}
                    className="h-8 px-3.5 bg-brand-green hover:bg-brand-green-70 text-white text-[11px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>View Plan</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
