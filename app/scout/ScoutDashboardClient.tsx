"use client";

import { useState } from "react";
import { Award, Star, Loader2, ListChecks, CheckCircle2 } from "lucide-react";
import { ScoutProfile } from "@/lib/queries/scout";
import { createScoutProfile } from "@/lib/queries/scout";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import { useAuth } from "@/components/providers/AuthProvider";
import { toast } from "sonner";

interface ScoutDashboardClientProps {
  userId: string | null;
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
  const { openModal } = useAuth();
  const [profile] = useState<ScoutProfile | null>(initialProfile);
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [submittingTask, setSubmittingTask] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userId) {
      openModal("Sign in to join OyaPlan Scouts", "/scout");
      return;
    }

    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setError("Please choose a username.");
      return;
    }

    setLoading(true);
    AnalyticsService.track('scout_profile_attempt', {
      session_id: '00000000-0000-0000-0000-000000000000',
      properties: { category: 'Scout', username: trimmed, version: '1.0' }
    }, userId);

    const res = await createScoutProfile(userId, trimmed);
    if (res.success) {
      AnalyticsService.track('scout_profile_created', {
        session_id: '00000000-0000-0000-0000-000000000000',
        properties: { category: 'Scout', username: trimmed, version: '1.0' }
      }, userId);
      window.location.reload();
    } else {
      const errorMsg = res.error || "That scout username is already taken. Please choose another.";
      AnalyticsService.track('scout_profile_failed', {
        session_id: '00000000-0000-0000-0000-000000000000',
        properties: { category: 'Scout', username: trimmed, error: errorMsg, version: '1.0' }
      }, userId);
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string, venueId: string, action: "confirm" | "flag" = "confirm") => {
    setSubmittingTask(taskId);
    try {
      const res = await fetch("/api/v1/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: taskId,
          sessionId: `scout_${userId}`,
          vote: action === "confirm" ? "agree" : "disagree",
        }),
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast.success("Thanks! You've helped future planners see accurate prices.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit verification.");
    } finally {
      setSubmittingTask(null);
    }
  };

  if (!profile) {
    return (
      <div className="max-w-md mx-auto bg-white border border-border-default/60 rounded-[28px] p-8 mt-8 space-y-6 shadow-lagoon">
        <div className="text-center space-y-2">
          <span className="text-3xl">🎒</span>
          <h2 className="text-xl font-black text-midnight-lagoon">Join OyaPlan Scouts</h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Help us keep venue prices accurate across Lagos. Verify menus, earn Scout status, and give squad planners budget confidence.
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

  const formatTier = (tier: string) => {
    if (tier === "elite") return "Lead Scout";
    if (tier === "verified") return "Trusted Scout";
    return "Scout";
  };

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
                {formatTier(profile.trust_tier)}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">Scout Member since July 2026</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-border-default/50 pt-4 md:pt-0 md:pl-8">
          <div className="text-center">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Verified</p>
            <p className="text-xl font-black text-midnight-lagoon">{profile.accepted_submissions}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Status</p>
            <p className="text-xl font-black text-[#008751]">{formatTier(profile.trust_tier)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Points</p>
            <p className="text-xl font-black text-midnight-lagoon">{profile.total_score}</p>
          </div>
        </div>
      </div>

      {/* Trust Progress Bar */}
      <div className="bg-[#008751]/5 border border-[#008751]/15 rounded-2xl p-4.5 flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-[#008751] uppercase tracking-wider">Trust Progress</p>
          <p className="text-sm font-bold text-midnight-lagoon">
            {profile.accepted_submissions >= 5 
              ? "Highest community trust tier unlocked"
              : `${5 - profile.accepted_submissions} more verified menus to reach Trusted Scout`}
          </p>
        </div>
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden shrink-0">
          <div 
            className="h-full bg-[#008751] rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(10, (profile.accepted_submissions / 5) * 100))}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Verification Task Hero Card System */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-[#008751]" />
              <h3 className="text-base font-black text-midnight-lagoon">Needs Verification</h3>
            </div>
            <span className="text-xs text-text-muted font-medium">{tasks.length} pending</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-border-default/60 rounded-2xl p-5 shadow-xs flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#008751] uppercase tracking-wider">Price Verification</span>
                    <h4 className="text-base font-black text-midnight-lagoon">{task.venue_name}</h4>
                    <p className="text-xs text-text-muted">Uploaded evidence waiting for price confirmation</p>
                  </div>
                  {task.image_url && (
                    <a
                      href={task.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-surface-grey hover:bg-border-default text-text-primary text-xs font-bold rounded-lg shrink-0 transition-colors"
                    >
                      View Receipt ↗
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleCompleteTask(task.id, task.venue_id, "confirm")}
                    disabled={submittingTask === task.id}
                    className="flex-1 h-10 bg-[#008751] hover:bg-[#006b41] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {submittingTask === task.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Confirm Price</span>
                  </button>

                  <button
                    onClick={() => handleCompleteTask(task.id, task.venue_id, "flag")}
                    disabled={submittingTask === task.id}
                    className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Flag Different
                  </button>
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="bg-white border border-border-default/50 rounded-2xl p-8 text-center text-gray-500 text-sm space-y-1">
                <p className="font-bold text-midnight-lagoon">All venue prices are verified!</p>
                <p className="text-xs text-text-muted">Thanks for helping keep Lagos outing budgets predictable.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Contributors & Badges Column */}
        <div className="space-y-6">
          {/* Badges Display */}
          <div className="bg-white border border-border-default/60 rounded-[24px] p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black text-midnight-lagoon uppercase tracking-wider">Scout Milestones</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Trusted Contributor", emoji: "🎯", desc: "First 5 verified price approvals" },
                { name: "Accuracy Champion", emoji: "👑", desc: "Maintain top data accuracy" },
              ].map((badge) => (
                <div
                  key={badge.name}
                  title={`${badge.name}: ${badge.desc}`}
                  className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold text-text-secondary"
                >
                  <span className="text-lg">{badge.emoji}</span>
                  <span className="truncate">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Understated Top Contributors */}
          <div className="bg-white border border-border-default/60 rounded-[24px] p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black text-midnight-lagoon uppercase tracking-wider">Top Contributors</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {leaderboard.slice(0, 5).map((scout, i) => (
                <div key={scout.user_id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-text-muted w-3.5 text-[11px]">{i + 1}.</span>
                    <span className="font-bold text-text-primary truncate">@{scout.username}</span>
                  </div>
                  <span className="font-black text-[#008751] shrink-0 text-[11px]">{scout.total_score} pts</span>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <p className="text-xs text-text-muted italic py-2">No contributors ranked yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
