"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Area } from "@/lib/types";
import Link from "next/link";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";

import { ChevronDown, MapPin, Wallet, Users, Music, Utensils, Clock, Sparkles } from "lucide-react";

interface ForgeFormProps {
  areas: Area[];
}

const SQUAD_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const BUDGET_OPTIONS = [
  { value: "15000", label: "₦15,000 — Lowkey" },
  { value: "30000", label: "₦30,000 — Standard" },
  { value: "50000", label: "₦50,000 — Chop Life" },
  { value: "100000", label: "₦100,000 — Big Boy Energy" },
  { value: "250000", label: "₦250,000 — Baller" },
];
const VIBE_OPTIONS = [
  { value: "Chill",  label: "😎 Chill Hangout" },
  { value: "Foodie", label: "🍽️ Serious Chop" },
  { value: "Party",  label: "🎉 Turn Up" },
  { value: "Quick",  label: "⚡ Quick Link" },
  { value: "Dinner", label: "🌙 Date Night" },
  { value: "Brunch", label: "☀️ Brunch Vibes" },
];

const CATEGORY_OPTIONS = [
  { value: "Anywhere", label: "🌍 Anywhere" },
  { value: "Eat and drink", label: "🍽️ Eat & drink" },
  { value: "Activity and fun", label: "🎮 Activity & fun" },
  { value: "Nature and outdoors", label: "🌳 Nature" },
];

const DAYPART_OPTIONS = [
  { value: "Any time", label: "⏰ Any time" },
  { value: "Morning", label: "☀️ Morning" },
  { value: "Afternoon", label: "🌤️ Afternoon" },
  { value: "Evening", label: "🌆 Evening" },
  { value: "Night", label: "🌙 Night" },
];

function squadLabel(n: number) {
  return n === 1 ? "1 person" : `${n} people`;
}

export default function ForgeForm({ areas }: ForgeFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [areaError, setAreaError] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lastInputs, setLastInputs] = useState<any>(null);
  const [formData, setFormData] = useState({
    startArea: "",
    squadSize: "2",
    budget: "50000",
    vibe: "Chill",
    categoryGroup: "Anywhere",
    daypart: "Any time",
    pinnedSpotId: ""
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("oyaplan_last_inputs");
      if (stored) {
        const parsed = JSON.parse(stored);
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (parsed.timestamp && Date.now() - parsed.timestamp < thirtyDays) {
          setLastInputs(parsed);
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const startArea = searchParams.get("startArea");
    const pinnedSpotId = searchParams.get("pinnedSpotId");
    const categoryGroup = searchParams.get("categoryGroup");
    const budget = searchParams.get("budget");
    const vibe = searchParams.get("vibe");
    const daypart = searchParams.get("daypart");
    
    if (startArea || pinnedSpotId || categoryGroup || budget || vibe || daypart) {
      if (categoryGroup && categoryGroup !== "Anywhere" || daypart && daypart !== "Any time") {
        setShowAdvanced(true);
      }
      setFormData(prev => ({
        ...prev,
        startArea: startArea || prev.startArea,
        pinnedSpotId: pinnedSpotId || prev.pinnedSpotId,
        categoryGroup: categoryGroup || prev.categoryGroup,
        budget: budget || prev.budget,
        vibe: vibe || prev.vibe,
        daypart: daypart || prev.daypart,
      }));
    }
  }, [searchParams]);

  const handleTryAgain = () => {
    if (lastInputs) {
      setFormData({
        ...formData,
        startArea: lastInputs.startArea || "",
        squadSize: lastInputs.squadSize?.toString() || "2",
        budget: lastInputs.budget?.toString() || "50000",
        vibe: lastInputs.vibe || "Chill",
        categoryGroup: lastInputs.categoryGroup || "Anywhere",
        daypart: lastInputs.daypart || "Any time",
        pinnedSpotId: lastInputs.pinnedSpotId || ""
      });
      if (lastInputs.categoryGroup !== "Anywhere" || lastInputs.daypart !== "Any time") {
        setShowAdvanced(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startArea) {
      setAreaError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setAreaError(false);
    setLoading(true);
    
    const params = new URLSearchParams();
    Object.entries(formData).forEach(([key, value]) => {
      if (value && value !== "Anywhere" && value !== "Any time") params.append(key, value);
      else if (value && key !== "categoryGroup" && key !== "daypart") params.append(key, value);
    });
    
    AnalyticsService.track('forge_started', {
      session_id: 'browser',
      properties: {
        category: 'Activation',
        source: 'form',
        area: formData.startArea,
        budget: Number(formData.budget),
        squad_size: Number(formData.squadSize),
        version: '1.0'
      }
    });

    router.push(`/forge?${params.toString()}`);
  };

  const triggerCls =
    "h-[56px] w-full rounded-[16px] border border-border-default bg-surface-grey px-4 type-body text-text-primary hover:bg-white hover:border-brand-green-40 hover:shadow-[0px_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 focus-ring data-[state=open]:bg-white data-[state=open]:border-brand-green data-[state=open]:shadow-[0px_8px_24px_rgba(0,135,81,0.08)]";

  const labelCls = "flex items-center gap-2 type-label text-text-secondary";

  return (
    <div className="w-full bg-white border border-border-default p-5 md:p-8 rounded-[20px] text-left">
      {lastInputs && (
        <div className="mb-6 p-3 bg-surface-grey border border-border-default rounded-[12px] flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <p className="type-caption text-text-muted">
            Last time: <span className="font-[700] text-text-secondary">{lastInputs.vibe} · {areas.find(a => a.slug === lastInputs.startArea)?.name || lastInputs.startArea} · ₦{parseInt(lastInputs.budget).toLocaleString()} · {lastInputs.squadSize} {parseInt(lastInputs.squadSize) === 1 ? 'person' : 'people'}</span>
          </p>
          <button 
            type="button" 
            onClick={handleTryAgain}
            className="type-label text-brand-green hover:underline tap-feedback"
          >
            Try again →
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 sm:gap-4">

        {/* Field: Starting Area */}
        <div className="col-span-2 sm:col-span-1 space-y-1.5">
          <Label className={labelCls}>
            <MapPin className="w-3.5 h-3.5 text-brand-green" /> Starting area
          </Label>
          <Select
            value={formData.startArea}
            onValueChange={(v: string | null) => {
              setFormData({ ...formData, startArea: v ?? "" });
              setAreaError(false);
            }}
          >
            <SelectTrigger
              className={`${triggerCls} ${
                areaError ? "border-error ring-2 ring-error/10" : ""
              }`}
            >
              <SelectValue placeholder="Pick area…" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {areas.map((area) => (
                <SelectItem key={area.id} value={area.slug} className="type-body py-3">
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {areaError && (
            <p className="type-caption text-error flex items-center gap-1 mt-1 animate-in slide-in-from-top-1">
              <span>⚠️</span> Required
            </p>
          )}
        </div>

        {/* Field: Budget */}
        <div className="col-span-2 sm:col-span-1 space-y-1.5">
          <Label className={labelCls}>
            <Wallet className="w-3.5 h-3.5 text-brand-green" /> Total budget
          </Label>
          <Select
            value={formData.budget}
            onValueChange={(v: string | null) =>
              setFormData({ ...formData, budget: v ?? "50000" })
            }
          >
            <SelectTrigger className={triggerCls}>
              <SelectValue>
                {BUDGET_OPTIONS.find((o) => o.value === formData.budget)?.label ?? "Select budget"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {BUDGET_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value} className="type-body py-3">
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row: Squad Size + Vibe */}
        <div className="col-span-1 space-y-1.5">
            <Label className={labelCls}>
              <Users className="w-3.5 h-3.5 text-brand-green" /> Squad size
            </Label>
            <Select
              value={formData.squadSize}
              onValueChange={(v: string | null) =>
                setFormData({ ...formData, squadSize: v ?? "2" })
              }
            >
              <SelectTrigger className={triggerCls}>
                <SelectValue>
                  {squadLabel(Number(formData.squadSize))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {SQUAD_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s.toString()} className="type-body py-3">
                    {squadLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1 space-y-1.5">
            <Label className={labelCls}>
              <Music className="w-3.5 h-3.5 text-brand-green" /> The vibe
            </Label>
            <Select
              value={formData.vibe}
              onValueChange={(v: string | null) =>
                setFormData({ ...formData, vibe: v ?? "Chill" })
              }
            >
              <SelectTrigger className={triggerCls}>
                <SelectValue>
                  {VIBE_OPTIONS.find((o) => o.value === formData.vibe)?.label ?? "Pick vibe"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {VIBE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="type-body py-3">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        {/* Advanced Toggle */}
        <div className="col-span-2 pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 type-caption text-text-muted hover:text-text-secondary transition-colors"
          >
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`} />
            ⚙ Refine further
          </button>
        </div>

        {/* Optional Row: Category + Daypart */}
        <div 
          className={`col-span-2 overflow-hidden transition-all duration-300 ease-in-out ${showAdvanced ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"} grid`}
          style={{ transitionDuration: 'var(--motion-considered)' }}
        >
          <div className="overflow-hidden min-h-0">
            <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label className={labelCls}>
                <Utensils className="w-3.5 h-3.5 text-brand-green" /> Category
              </Label>
              <Select
                value={formData.categoryGroup}
                onValueChange={(v: string | null) =>
                  setFormData({ ...formData, categoryGroup: v ?? "Anywhere" })
                }
              >
                <SelectTrigger className={triggerCls}>
                  <SelectValue>
                    {CATEGORY_OPTIONS.find((o) => o.value === formData.categoryGroup)?.label ?? "Anywhere"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CATEGORY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="type-body py-3">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={labelCls}>
                <Clock className="w-3.5 h-3.5 text-brand-green" /> Time
              </Label>
              <Select
                value={formData.daypart}
                onValueChange={(v: string | null) =>
                  setFormData({ ...formData, daypart: v ?? "Any time" })
                }
              >
                <SelectTrigger className={triggerCls}>
                  <SelectValue>
                    {DAYPART_OPTIONS.find((o) => o.value === formData.daypart)?.label ?? "Any time"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {DAYPART_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="type-body py-3">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

        {/* Submit */}
        <div className="col-span-2 space-y-4 pt-2">
          <Button
            type="submit"
            className="relative w-full h-[56px] rounded-[12px] bg-brand-green hover:bg-brand-green-70 text-white type-subheading overflow-hidden tap-feedback"
            disabled={loading}
          >
            {loading && <div className="absolute inset-0 shimmer-bg" />}
            <span className="relative z-10">
              {loading ? "Finding your squad's plan…" : "🚀 Get My Plan"}
            </span>
          </Button>

          <p className="text-center type-caption text-text-muted">
            Usually ready in under 3 seconds ⚡
          </p>
        </div>
      </form>
      
      <div className="mt-8 pt-6 border-t border-border-default text-center">
        <ExploreLink formData={formData} />
      </div>
    </div>
  );
}

function ExploreLink({ formData }: { formData: any }) {
  const params = new URLSearchParams();
  if (formData.budget) params.append("budget", formData.budget);
  if (formData.vibe) params.append("vibe", formData.vibe);
  
  const href = params.toString() ? `/explore?${params.toString()}` : "/explore";

  return (
    <Link 
      href={href} 
      className="type-caption text-text-muted hover:text-text-secondary hover:underline transition-all"
    >
      Not sure where to go? Browse by area →
    </Link>
  );
}

