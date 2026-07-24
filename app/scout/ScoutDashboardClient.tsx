"use client";

import { useState } from "react";
import { ShieldCheck, Award, Star, Loader2, ListChecks, CheckCircle2 } from "lucide-react";
import { ScoutProfile } from "@/lib/queries/scout";
import { createScoutProfile } from "@/lib/queries/scout";

interface ScoutDashboardClientProps {
  userId: string;
  initialProfile: ScoutProfile | null;
  leaderboard: ScoutProfile[];
  initialTasks: Array<{
    id: string;
    venue_id: string;
    venue_name: string;
    image_url: string;
    ocr_status: string;
    created_at: string;
  }>;
}

export default function ScoutDashboardClient({
  userId,
  initialProfile,
  leaderboard,
  initialTasks,
}: ScoutDashboardClientProps) {
  const [profile, setProfile] = useState<ScoutProfile | null>(initialProfile);
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [submittingTask, setSubmittingTask] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!usernameInput.trim()) {
      setError("Please choose a username.");
      return;
    }

    setLoading(true);
    const res = await createScoutProfile(userId, usernameInput.trim());
    if (res.success) {
      window.location.reload();
    } else {
      setError(res.error || "Failed to create profile. Username might be taken.");
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string, venueId: string) => {
    setSubmittingTask(taskId);
    try {
      // Simulate task verification completion or menu update
      // Post validation details inside database
      const res = await fetch("/api/v1/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: taskId, // reusing endpoint structure safely
          sessionId: `scout_${userId}`,
          vote: "agree",
        }),
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTask(null);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-md mx-auto bg-white border border-border-default/60 rounded-[28px] p-8 mt-12 space-y-6 shadow-lagoon">
        <div className="text-center space-y-2">
          <span className="text-3xl">🎒</span>
          <h2 className="text-xl font-black text-midnight-lagoon">Join OyaPlan Scouts</h2>
          <p className="text-sm text-text-muted">
            Verify prices, submit restaurant menus, and earn trust rewards. Help make Lagos outings predictable.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
              Choose Scout Username
            </label>
            <input
              type="text"
              placeholder="e.g. lagos_foodie"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
              className="w-full h-12 px-4 bg-surface-grey border border-border-default rounded-[10px] type-body focus:outline-none focus:border-[#008751] focus:bg-white transition-all"
            />
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading || !usernameInput}
            className="w-full h-12 bg-[#008751] hover:bg-[#006b41] disabled:opacity-40 text-white font-bold uppercase tracking-wider text-xs rounded-[10px] transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Become a Scout"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white border border-border-default/60 rounded-[28px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lagoon">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#008751]/10 flex items-center justify-center text-3xl shrink-0">
            {profile.trust_tier === "elite" ? "👑" : profile.trust_tier === "verified" ? "🏅" : "🎒"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-midnight-lagoon">@{profile.username}</h2>
              <span className="px-2.5 py-0.5 bg-[#008751]/10 text-[#008751] text-[10px] font-black uppercase rounded-full tracking-wider">
                {profile.trust_tier} Scout
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">Scout Member since July 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-border-default/50 pt-4 md:pt-0 md:pl-8">
          <div className="text-center">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Score</p>
            <p className="text-xl font-black text-midnight-lagoon">{profile.total_score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Accuracy</p>
            <p className="text-xl font-black text-[#008751]">{profile.accuracy_rate}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Verifications</p>
            <p className="text-xl font-black text-midnight-lagoon">{profile.accepted_submissions}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Verification Task Queue */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-[#008751]" />
            <h3 className="text-base font-black text-midnight-lagoon">Verification Queue</h3>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-border-default/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold text-text-primary">{task.venue_name}</p>
                  <p className="text-xs text-text-muted">Requires verification of pricing evidence</p>
                  {task.image_url && (
                    <a
                      href={task.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#008751] font-bold hover:underline block"
                    >
                      View Uploaded Receipt/Menu →
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleCompleteTask(task.id, task.venue_id)}
                  disabled={submittingTask === task.id}
                  className="h-9 px-4 bg-[#008751] hover:bg-[#006b41] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-colors self-start sm:self-center"
                >
                  {submittingTask === task.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Approve/Verify</span>
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="bg-white border border-border-default/50 rounded-2xl p-8 text-center text-gray-400 text-sm italic">
                No verification tasks currently pending. Check back later!
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard & Badges column */}
        <div className="space-y-8">
          {/* Leaderboard Card */}
          <div className="bg-white border border-border-default/60 rounded-[24px] p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-midnight-lagoon uppercase tracking-wider">Top Scouts</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {leaderboard.map((scout, i) => (
                <div key={scout.user_id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-text-muted w-4">{i + 1}.</span>
                    <span className="font-bold text-text-primary truncate">@{scout.username}</span>
                  </div>
                  <span className="font-black text-[#008751] shrink-0">{scout.total_score} pts</span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-xs text-text-muted italic py-4">No scouts ranked yet.</p>
              )}
            </div>
          </div>

          {/* Badges Display */}
          <div className="bg-white border border-border-default/60 rounded-[24px] p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-black text-midnight-lagoon uppercase tracking-wider">Your Badges</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: "Verifier", emoji: "🔍", desc: "First verification approval" },
                { name: "Accurate", emoji: "🎯", desc: "Maintain >95% accuracy" },
                { name: "Contributor", emoji: "✍️", desc: "10+ menu items verified" },
                { name: "Elite", emoji: "👑", desc: "Earned Elite rank" },
              ].map((badge) => (
                <div
                  key={badge.name}
                  title={`${badge.name}: ${badge.desc}`}
                  className="aspect-square bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-2xl grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-help"
                >
                  {badge.emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
