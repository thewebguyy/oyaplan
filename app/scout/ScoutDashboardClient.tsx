"use client";

import { useState } from "react";
import { Award, Star, Loader2, ListChecks, CheckCircle2, MapPin, Plus, Sparkles, X } from "lucide-react";
import { ScoutProfile } from "@/lib/queries/scout";
import { createScoutProfile } from "@/lib/queries/scout";
import { Area } from "@/lib/types";
import { submitSpotSuggestion } from "@/lib/actions/submitSpotSuggestion";
import { triggerMoment } from "@/components/ui/moment-of-delight";
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
  areas?: Area[];
}

export default function ScoutDashboardClient({
  userId,
  initialProfile,
  leaderboard,
  initialTasks,
  areas = [],
}: ScoutDashboardClientProps) {
  const { openModal } = useAuth();
  const [profile] = useState<ScoutProfile | null>(initialProfile);
  const [usernameInput, setUsernameInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [submittingTask, setSubmittingTask] = useState<string | null>(null);

  // Suggest a Spot Modal State inside Scout Portal
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestForm, setSuggestForm] = useState({
    spotName: "",
    areaName: areas[0]?.name || "Lekki Phase 1",
    roughPrice: "30000",
    vibe: "Chill",
    comment: "",
    whatsapp: "",
  });

  const handleSuggestSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestForm.spotName.trim() || !suggestForm.areaName.trim()) {
      toast.error("Please enter spot name and area.");
      return;
    }

    setSuggestLoading(true);

    try {
      const existingSubmissions = JSON.parse(localStorage.getItem("oyaplan_scout_submissions") || "[]");
      existingSubmissions.push({
        spotName: suggestForm.spotName,
        location: suggestForm.areaName,
        timestamp: Date.now(),
      });
      localStorage.setItem("oyaplan_scout_submissions", JSON.stringify(existingSubmissions));

      const userProfile = JSON.parse(localStorage.getItem("oyaplan_user_profile") || "{}");
      localStorage.setItem(
        "oyaplan_user_profile",
        JSON.stringify({
          ...userProfile,
          isScout: true,
          scoutBadgesCount: existingSubmissions.length,
        })
      );
    } catch { /* ignore localStorage errors */ }

    const res = await submitSpotSuggestion({
      spotName: suggestForm.spotName,
      areaName: suggestForm.areaName,
      roughPricePerPerson: parseInt(suggestForm.roughPrice) || 30000,
      vibeDescription: `${suggestForm.vibe}: ${suggestForm.comment}`,
      suggesterWhatsapp: suggestForm.whatsapp || null,
    });

    setSuggestLoading(false);

    if (res.success) {
      setSuggestSuccess(true);
      triggerMoment("venue_suggested");
      toast.success("Venue suggested! Thank you for contributing to squad budget confidence.");
      AnalyticsService.track('spot_suggested', {
        session_id: '00000000-0000-0000-0000-000000000000',
        properties: {
          category: 'Contribution',
          spot_name: suggestForm.spotName,
          area: suggestForm.areaName,
          rough_price: parseInt(suggestForm.roughPrice) || 30000,
          version: '1.0'
        }
      }, userId || undefined);
    } else {
      toast.error(res.error || "Failed to submit venue suggestion.");
    }
  };

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

        <div className="flex flex-col sm:flex-row items-center gap-4 border-t md:border-t-0 md:border-l border-border-default/50 pt-4 md:pt-0 md:pl-8">
          <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
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

          <button
            onClick={() => {
              setSuggestSuccess(false);
              setShowSuggestModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#008751] hover:bg-[#006b41] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-colors tap-feedback shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Suggest a Venue 📍</span>
          </button>
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
          {/* Scout Action Card: Know a Great Spot? */}
          <div className="bg-gradient-to-br from-[#008751]/10 via-amber-50 to-white border border-[#008751]/20 rounded-[24px] p-5 space-y-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#008751]" />
                <h3 className="text-xs font-black text-midnight-lagoon uppercase tracking-wider">Know a Great Spot?</h3>
              </div>
              <span className="text-[10px] font-black uppercase text-[#008751] bg-[#008751]/15 px-2 py-0.5 rounded-full">
                +Impact
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Know a great restaurant, café, or linkup spot in Lagos? Suggest it to help us build Lagos venue intelligence.
            </p>
            <button
              onClick={() => {
                setSuggestSuccess(false);
                setShowSuggestModal(true);
              }}
              className="w-full py-2.5 bg-[#008751] hover:bg-[#006b41] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 tap-feedback"
            >
              <Plus className="w-4 h-4" />
              <span>Suggest a New Venue</span>
            </button>
          </div>

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

      {/* Suggest a Spot Modal inside Scout Portal */}
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 relative my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏅</span>
                <div>
                  <h3 className="text-lg font-black text-midnight-lagoon">Suggest a New Venue</h3>
                  <p className="text-xs text-text-muted">Know a great spot in Lagos? Help us build venue intelligence.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSuggestModal(false)}
                className="w-8 h-8 rounded-full bg-surface-grey flex items-center justify-center font-bold text-text-muted hover:text-midnight-lagoon"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {suggestSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-emerald-50 text-[#008751] rounded-full flex items-center justify-center mx-auto text-2xl font-black border border-emerald-200">
                  ✓
                </div>
                <h4 className="text-xl font-black text-midnight-lagoon">Venue Submitted 🎉</h4>
                <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                  Thanks for helping improve OyaPlan. Our team reviews every suggestion for <span className="font-bold text-text-primary">&quot;{suggestForm.spotName}&quot;</span> before publishing it to ensure accurate menu prices.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSuggestSuccess(false);
                      setSuggestForm({
                        spotName: "",
                        areaName: areas[0]?.name || "Lekki Phase 1",
                        roughPrice: "30000",
                        vibe: "Chill",
                        comment: "",
                        whatsapp: "",
                      });
                    }}
                    className="w-full py-3 bg-[#008751] hover:bg-[#006b41] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Suggest Another Venue 📍
                  </button>
                  <button
                    onClick={() => setShowSuggestModal(false)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Back to Scout Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSuggestSpot} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Spot / Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hard Rock Cafe, Danfo Bistro, Sailor's Lounge"
                    value={suggestForm.spotName}
                    onChange={(e) => setSuggestForm((prev) => ({ ...prev, spotName: e.target.value }))}
                    className="w-full h-11 px-4 bg-surface-grey border border-border-default rounded-xl type-body text-sm focus:outline-none focus:border-[#008751] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Area / Neighborhood *
                  </label>
                  {areas.length > 0 ? (
                    <select
                      value={suggestForm.areaName}
                      onChange={(e) => setSuggestForm((prev) => ({ ...prev, areaName: e.target.value }))}
                      className="w-full h-11 px-4 bg-surface-grey border border-border-default rounded-xl type-body text-sm focus:outline-none focus:border-[#008751] focus:bg-white transition-all"
                    >
                      {areas.map((area) => (
                        <option key={area.id} value={area.name}>
                          {area.name}
                        </option>
                      ))}
                      <option value="Other Lagos Area">Other Lagos Area</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lekki Phase 1, Ikeja GRA, Yaba"
                      value={suggestForm.areaName}
                      onChange={(e) => setSuggestForm((prev) => ({ ...prev, areaName: e.target.value }))}
                      className="w-full h-11 px-4 bg-surface-grey border border-border-default rounded-xl type-body text-sm focus:outline-none focus:border-[#008751] focus:bg-white transition-all"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                      Est. Spend per Person
                    </label>
                    <select
                      value={suggestForm.roughPrice}
                      onChange={(e) => setSuggestForm((prev) => ({ ...prev, roughPrice: e.target.value }))}
                      className="w-full h-11 px-3 bg-surface-grey border border-border-default rounded-xl type-body text-xs font-bold focus:outline-none focus:border-[#008751] focus:bg-white transition-all"
                    >
                      <option value="15000">Under ₦15k</option>
                      <option value="25000">₦15k - ₦25k</option>
                      <option value="35000">₦25k - ₦40k</option>
                      <option value="50000">₦40k - ₦60k</option>
                      <option value="75000">₦75k+</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                      Primary Vibe
                    </label>
                    <select
                      value={suggestForm.vibe}
                      onChange={(e) => setSuggestForm((prev) => ({ ...prev, vibe: e.target.value }))}
                      className="w-full h-11 px-3 bg-surface-grey border border-border-default rounded-xl type-body text-xs font-bold focus:outline-none focus:border-[#008751] focus:bg-white transition-all"
                    >
                      <option value="Chill">Chill Vibe</option>
                      <option value="Dinner">Date Night</option>
                      <option value="Foodie">Serious Chop</option>
                      <option value="Party">Turn Up</option>
                      <option value="Quick">Quick Linkup</option>
                      <option value="Brunch">Brunch</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Notes / Must-try Dishes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Great cocktails, outdoor terrace seating..."
                    value={suggestForm.comment}
                    onChange={(e) => setSuggestForm((prev) => ({ ...prev, comment: e.target.value }))}
                    className="w-full p-3 bg-surface-grey border border-border-default rounded-xl type-body text-xs focus:outline-none focus:border-[#008751] focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Your WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +2348012345678"
                    value={suggestForm.whatsapp}
                    onChange={(e) => setSuggestForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full h-11 px-4 bg-surface-grey border border-border-default rounded-xl type-body text-xs focus:outline-none focus:border-[#008751] focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={suggestLoading}
                  className="w-full h-12 bg-[#008751] hover:bg-[#006b41] disabled:opacity-40 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {suggestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Spot & Earn Badge 🏅"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
