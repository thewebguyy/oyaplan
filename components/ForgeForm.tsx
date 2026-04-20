"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Area } from "@/lib/types";

interface ForgeFormProps {
  areas: Area[];
}

const SQUAD_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const BUDGET_OPTIONS = [
  { value: "15000", label: "₦15,000 — Lowkey" },
  { value: "30000", label: "₦30,000 — Standard Link" },
  { value: "50000", label: "₦50,000 — Chop Life" },
  { value: "100000", label: "₦100,000 — Big Boy Energy" },
  { value: "250000", label: "₦250,000 — Baller" },
];
const VIBE_OPTIONS = [
  { value: "Chill",  label: "😎 Chill Hangout" },
  { value: "Foodie", label: "🍽️ Serious Chop" },
  { value: "Party",  label: "🎉 Turn Up" },
  { value: "Quick",  label: "⚡ Quick Link" },
  { value: "Dinner", label: "🌙 Date Night / Dinner" },
  { value: "Brunch", label: "☀️ Brunch Vibes" },
];

function squadLabel(n: number) {
  return n === 1 ? "1 person" : `${n} people`;
}

export default function ForgeForm({ areas }: ForgeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [areaError, setAreaError] = useState(false);
  const [formData, setFormData] = useState({
    startArea: "",
    squadSize: "2",
    budget: "50000",
    vibe: "Chill",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startArea) {
      setAreaError(true);
      return;
    }
    setAreaError(false);
    setLoading(true);
    const params = new URLSearchParams(formData);
    router.push(`/forge?${params.toString()}`);
  };

  const triggerCls =
    "h-14 w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-base font-medium text-gray-800 hover:bg-gray-100 transition-all focus-visible:ring-2 focus-visible:ring-[#008751]/40 focus-visible:border-[#008751]";

  return (
    <Card className="w-full max-w-lg mx-auto border border-white/20 bg-white shadow-2xl shadow-black/20 text-left text-gray-900 rounded-2xl overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Field: Where are you coming from */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-gray-500">
              <span className="text-base">📍</span> Where are you coming from?
            </Label>
            <Select
              onValueChange={(v: string | null) => {
                setFormData({ ...formData, startArea: v ?? "" });
                setAreaError(false);
              }}
            >
              <SelectTrigger
                className={`${triggerCls} ${
                  areaError
                    ? "border-red-400 bg-red-50 ring-2 ring-red-300/40"
                    : ""
                }`}
              >
                <SelectValue placeholder="Pick your area…" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl">
                {areas.map((area) => (
                  <SelectItem
                    key={area.id}
                    value={area.slug}
                    className="text-base py-2.5"
                  >
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {areaError && (
              <p className="flex items-center gap-1.5 text-red-500 text-xs font-medium mt-1 animate-in slide-in-from-top-1 duration-150">
                <span>⚠️</span> Please select your starting area first.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Row: Squad Size + Vibe */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-gray-500">
                <span className="text-base">👥</span> Squad size
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
                <SelectContent className="rounded-xl shadow-xl">
                  {SQUAD_OPTIONS.map((s) => (
                    <SelectItem
                      key={s}
                      value={s.toString()}
                      className="text-base py-2.5"
                    >
                      {squadLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-gray-500">
                <span className="text-base">🎭</span> The vibe
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
                <SelectContent className="rounded-xl shadow-xl">
                  {VIBE_OPTIONS.map((o) => (
                    <SelectItem
                      key={o.value}
                      value={o.value}
                      className="text-base py-2.5"
                    >
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Field: Budget */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-gray-500">
              <span className="text-base">💰</span> Total budget (₦)
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
              <SelectContent className="rounded-xl shadow-xl">
                {BUDGET_OPTIONS.map((o) => (
                  <SelectItem
                    key={o.value}
                    value={o.value}
                    className="text-base py-2.5"
                  >
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-14 text-[17px] font-black rounded-xl bg-[#008751] hover:bg-[#007043] text-white shadow-lg shadow-[#008751]/30 transition-all duration-200 active:scale-[0.98] mt-1"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Forging your plan…
              </span>
            ) : (
              "🚀 Get My Plan"
            )}
          </Button>

          <p className="text-center text-[12px] text-gray-400 font-medium pt-0.5">
            Usually ready in under 3 seconds ⚡
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
