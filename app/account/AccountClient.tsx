"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  Bookmark, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  LogOut, 
  Sliders, 
  Share2, 
  Users, 
  Wallet, 
  Smile,
  Headphones,
  Mail,
  Lock,
  Star,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserProfile } from "@/lib/services/identity/sessionResolver";
import { toast } from "sonner";

interface AccountClientProps {
  isAuthenticated: boolean;
  profile: UserProfile | null;
  savedPlansCount: number;
  referralCode: string | null;
}

const BUDGET_OPTIONS = [20000, 35000, 50000, 100000];
const SQUAD_OPTIONS = [2, 3, 4, 6];
const VIBE_OPTIONS = [
  { id: "date-night", label: "Date Night", emoji: "🍷" },
  { id: "squad-linkup", label: "Squad Linkup", emoji: "🍻" },
  { id: "brunch", label: "Sunday Brunch", emoji: "🥞" },
  { id: "quick-bites", label: "Quick Bites", emoji: "🍔" },
  { id: "nightlife", label: "Nightlife & Drinks", emoji: "🪩" }
];

export default function AccountClient({
  isAuthenticated,
  profile,
  savedPlansCount,
  referralCode,
}: AccountClientProps) {
  const { signOut, openModal } = useAuth();
  const [copied, setCopied] = useState(false);

  // Preference States (Loaded from LocalStorage)
  const [budget, setBudget] = useState<number>(50000);
  const [squadSize, setSquadSize] = useState<number>(2);
  const [favoriteVibe, setFavoriteVibe] = useState<string>("squad-linkup");
  const [scoutCount, setScoutCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedBudget = localStorage.getItem("oyaplan_pref_budget");
      const savedSquad = localStorage.getItem("oyaplan_pref_squad");
      const savedVibe = localStorage.getItem("oyaplan_pref_vibe");

      if (savedBudget) setBudget(parseInt(savedBudget));
      if (savedSquad) setSquadSize(parseInt(savedSquad));
      if (savedVibe) setFavoriteVibe(savedVibe);

      try {
        const subs = JSON.parse(localStorage.getItem("oyaplan_scout_submissions") || "[]");
        setScoutCount(subs.length);
      } catch { /* ignore */ }
    }
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem("oyaplan_pref_budget", budget.toString());
    localStorage.setItem("oyaplan_pref_squad", squadSize.toString());
    localStorage.setItem("oyaplan_pref_vibe", favoriteVibe);
    toast.success("Outing preferences saved! These will auto-fill on your next plan.");
  };

  const inviteLink = typeof window !== "undefined" && referralCode 
    ? `${window.location.origin}/?ref=${referralCode}` 
    : referralCode 
    ? `https://oyaplan.app/?ref=${referralCode}` 
    : null;

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (!inviteLink) return;
    const text = encodeURIComponent(
      `Join me on OyaPlan to plan verified Lagos outings with real menu prices & zero budget guesswork: ${inviteLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (!isAuthenticated || !profile) {
    return (
      <main className="min-h-[100dvh] bg-[#FAFAF8] pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-black text-midnight-lagoon tracking-tight">Account & Profile</h1>
            <p className="type-body text-text-muted mt-1">Manage your OyaPlan account and saved preferences.</p>
          </div>

          <div className="bg-white border border-border-default rounded-[24px] p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="type-heading text-text-primary">Sign in to OyaPlan</h2>
              <p className="type-body text-text-muted max-w-md mx-auto">
                Sign in to save your custom Lagos outing plans, set default preferences, and access exclusive scout tools.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => openModal()}
                className="bg-brand-green hover:bg-brand-green-70 text-white rounded-full type-label h-12 px-8 shadow-md border-none"
              >
                Sign In or Register
              </Button>
              <Link href="/">
                <Button className="bg-surface-grey hover:bg-black/5 text-text-primary rounded-full type-label h-12 px-8 shadow-none border border-border-default">
                  Return to Planner
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-black text-midnight-lagoon tracking-tight">Account & Profile</h1>
          <p className="type-body text-text-muted mt-1">Manage your OyaPlan account, default budget, and referral rewards.</p>
        </div>

        {/* 1. User Profile Header */}
        <div className="bg-white border border-border-default rounded-[24px] p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-midnight-lagoon text-white rounded-full flex items-center justify-center font-black text-xl">
                {profile.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="type-heading text-text-primary">{profile.display_name || 'OyaPlan Planner'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2.5 py-0.5 bg-brand-green/10 text-brand-green rounded-md type-caption font-extrabold uppercase tracking-wider">
                    {profile.role}
                  </span>
                  <span className="type-caption text-text-muted">ID: {profile.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border-default grid grid-cols-2 gap-4">
            <div className="bg-surface-grey p-4 rounded-xl">
              <span className="type-caption text-text-muted block">Account Status</span>
              <span className="type-label text-brand-green font-extrabold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-4 h-4" /> Active Planner
              </span>
            </div>
            <Link href="/dashboard" className="bg-surface-grey p-4 rounded-xl hover:bg-brand-green/5 transition-colors group block">
              <span className="type-caption text-text-muted block">Saved Outing Plans</span>
              <span className="type-label text-text-primary font-bold group-hover:text-brand-green transition-colors mt-0.5 block">
                {savedPlansCount} saved →
              </span>
            </Link>
          </div>
        </div>

        {/* 2. Scout Badge & Community Contribution Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-xl font-bold shrink-0">
                🏅
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="type-heading text-amber-950 font-black text-base">OyaPlan Scout Program</h3>
                  {scoutCount > 0 && (
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-[10px] font-black uppercase tracking-wider">
                      Active Scout
                    </span>
                  )}
                </div>
                <p className="type-caption text-amber-800 font-semibold mt-0.5">
                  {scoutCount > 0 
                    ? `You're an Official Scout! ${scoutCount} spot suggestion${scoutCount > 1 ? 's' : ''} logged.`
                    : "Help map Lagos spots & earn your Official Scout Badge."}
                </p>
              </div>
            </div>
            <Link href="/suggest-a-spot" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white rounded-xl type-label text-xs h-10 px-5 font-extrabold shadow-sm border-none">
                {scoutCount > 0 ? "Suggest Another Spot 🏅" : "Earn Scout Badge 🏅"}
              </Button>
            </Link>
          </div>
        </div>

        {/* 3. Social Proof & Verification Trust Card */}
        <div className="bg-gradient-to-br from-midnight-lagoon to-[#001D12] text-white rounded-[24px] p-6 space-y-4 shadow-md relative overflow-hidden">
          <div className="flex items-center gap-2 text-brand-green type-caption uppercase font-extrabold tracking-widest">
            <Star className="w-4 h-4 fill-brand-green" /> Verified Community Proof
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black">50+ Lagos Squad Outings Planned This Week</h3>
            <p className="text-white/70 text-xs">
              Prices verified by 120+ community scouts across Lekki Phase 1, Yaba, Victoria Island & Ikeja.
            </p>
          </div>
          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-xl text-xs space-y-1.5 border border-white/10">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Quote className="w-3.5 h-3.5 text-brand-green shrink-0" />
              <span>&quot;Planned a ₦35k Date Night in Lekki — didn&apos;t spend a single Naira extra.&quot;</span>
            </div>
            <p className="text-white/60 pl-5 text-[11px]"> — Tunde & Squad, Yaba</p>
          </div>
        </div>

        {/* 3. Help & Direct Support Safety Net */}
        <div className="bg-white border border-border-default rounded-[24px] p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="type-heading text-text-primary">Planner Support & Safety Net</h2>
              <p className="type-caption text-text-muted">Need help with a plan or found a price error? We respond within 24 hours.</p>
            </div>
          </div>

          <div className="pt-1">
            <a
              href="mailto:hello.oyaplan@gmail.com?subject=OyaPlan%20Support%20Request"
              className="p-3.5 bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-xl type-label text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-green/20 transition-colors w-full"
            >
              <Mail className="w-4 h-4" /> Email Support (hello.oyaplan@gmail.com)
            </a>
          </div>
        </div>

        {/* 4. Planning Preferences */}
        <div className="bg-white border border-border-default rounded-[24px] p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="type-heading text-text-primary">Default Outing Preferences</h2>
              <p className="type-caption text-text-muted">Set your default budget & squad size for faster planning</p>
            </div>
          </div>

          <div className="space-y-5 pt-2">
            {/* Default Budget */}
            <div>
              <label className="type-label text-text-primary flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-brand-green" /> Default Budget
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUDGET_OPTIONS.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setBudget(amount)}
                    className={`py-2.5 px-3 rounded-xl type-label text-sm transition-all border ${
                      budget === amount
                        ? "bg-brand-green text-white border-brand-green font-black shadow-sm"
                        : "bg-surface-grey text-text-primary border-transparent hover:bg-black/5"
                    }`}
                  >
                    ₦{(amount / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {/* Default Squad Size */}
            <div>
              <label className="type-label text-text-primary flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-brand-green" /> Default Squad Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SQUAD_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSquadSize(size)}
                    className={`py-2.5 px-3 rounded-xl type-label text-sm transition-all border ${
                      squadSize === size
                        ? "bg-brand-green text-white border-brand-green font-black shadow-sm"
                        : "bg-surface-grey text-text-primary border-transparent hover:bg-black/5"
                    }`}
                  >
                    {size} {size === 1 ? "person" : "people"}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Vibe */}
            <div>
              <label className="type-label text-text-primary flex items-center gap-2 mb-2">
                <Smile className="w-4 h-4 text-brand-green" /> Favorite Vibe
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {VIBE_OPTIONS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setFavoriteVibe(v.id)}
                    className={`py-2.5 px-4 rounded-xl type-label text-sm transition-all border flex items-center gap-2.5 text-left ${
                      favoriteVibe === v.id
                        ? "bg-brand-green/10 text-brand-green border-brand-green font-bold"
                        : "bg-surface-grey text-text-primary border-transparent hover:bg-black/5"
                    }`}
                  >
                    <span>{v.emoji}</span>
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSavePreferences}
              className="w-full bg-[#0A0A0A] hover:bg-black/80 text-white rounded-xl type-label h-12 mt-2 shadow-none border-none"
            >
              Save Preferences
            </Button>
          </div>
        </div>

        {/* 5. Referral Link & Squad Rewards */}
        <div className="bg-white border border-border-default rounded-[24px] p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="type-heading text-text-primary">Referral Program</h2>
              <p className="type-caption text-text-muted">Invite friends to OyaPlan & share verified price confidence</p>
            </div>
          </div>

          {inviteLink ? (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 bg-surface-grey border border-border-default rounded-xl flex items-center justify-between gap-3">
                <span className="type-body text-text-primary font-mono text-sm truncate">{inviteLink}</span>
                <Button
                  onClick={handleCopyLink}
                  size="sm"
                  className="bg-brand-green hover:bg-brand-green-70 text-white rounded-lg type-caption font-bold h-9 px-4 shrink-0 shadow-none"
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleWhatsAppShare}
                  className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl type-label h-11 shadow-none border-none flex items-center justify-center gap-2"
                >
                  Share on WhatsApp
                </Button>
              </div>
            </div>
          ) : (
            <p className="type-body text-text-muted">Your referral code is being generated...</p>
          )}
        </div>

        {/* 6. Data Privacy & Security Statement */}
        <div className="p-5 bg-surface-grey border border-border-default rounded-[20px] space-y-2">
          <div className="flex items-center gap-2 text-text-primary font-bold type-label">
            <Lock className="w-4 h-4 text-brand-green" /> Data Privacy & Transparency Guarantee
          </div>
          <p className="type-caption text-text-muted leading-relaxed">
            Your email and saved plans are strictly private. We never share your contact details or personal saved itineraries with third parties or venues.
          </p>
        </div>

        {/* 7. Quick Nav Links */}
        <div className="bg-white border border-border-default rounded-[24px] overflow-hidden shadow-sm divide-y divide-border-default">
          <Link href="/dashboard" className="p-5 flex items-center justify-between hover:bg-surface-grey transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="type-label text-text-primary group-hover:text-brand-green transition-colors">Saved Outing Plans</h3>
                <p className="type-caption text-text-muted">View all your saved itineraries & price breakdowns</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-green transition-colors" />
          </Link>

          <Link href="/scout" className="p-5 flex items-center justify-between hover:bg-surface-grey transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="type-label text-text-primary group-hover:text-purple-600 transition-colors">Scout Dashboard</h3>
                <p className="type-caption text-text-muted">Verify menu prices & earn OyaScore XP</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-purple-600 transition-colors" />
          </Link>
        </div>

        {/* 8. Sign Out Section */}
        <div className="bg-white border border-border-default rounded-[24px] p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="type-label text-text-primary">Sign Out</h3>
            <p className="type-caption text-text-muted">Disconnect your current browser session</p>
          </div>
          <Button
            onClick={() => signOut()}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl type-label h-11 px-6"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </main>
  );
}
