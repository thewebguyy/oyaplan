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

  return (
    <Card className="w-full max-w-md mx-auto border border-gray-200 bg-white text-left text-gray-900">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="startArea" className="text-[14px] font-medium">Where are you coming from?</Label>
            <Select 
              onValueChange={(v: string | null) => {
                setFormData({ ...formData, startArea: v ?? "" });
                setAreaError(false);
              }}
            >
              <SelectTrigger className={`min-h-[56px] h-14 ${areaError ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.slug}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {areaError && (
              <p className="text-red-500 text-xs font-medium mt-1">⚠️ Please select your starting area first.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="squadSize" className="text-[14px] font-medium">How many people?</Label>
              <Select 
                defaultValue={formData.squadSize}
                onValueChange={(v: string | null) => setFormData({ ...formData, squadSize: v ?? "2" })}
              >
                <SelectTrigger className="min-h-[56px] h-14">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((s) => (
                    <SelectItem key={s} value={s.toString()}>
                      {s} {s === 1 ? 'person' : 'people'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vibe" className="text-[14px] font-medium">The Vibe</Label>
              <Select 
                defaultValue={formData.vibe}
                onValueChange={(v: string | null) => setFormData({ ...formData, vibe: v ?? "Chill" })}
              >
                <SelectTrigger className="min-h-[56px] h-14">
                  <SelectValue placeholder="Vibe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chill">Chill Hangout</SelectItem>
                  <SelectItem value="Foodie">Serious Chop</SelectItem>
                  <SelectItem value="Party">Turn Up</SelectItem>
                  <SelectItem value="Quick">Quick Link</SelectItem>
                  <SelectItem value="Dinner">Date Night / Dinner</SelectItem>
                  <SelectItem value="Brunch">Brunch Vibes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-[14px] font-medium">Total Budget (₦)</Label>
            <Select 
              defaultValue={formData.budget}
              onValueChange={(v: string | null) => setFormData({ ...formData, budget: v ?? "50000" })}
            >
              <SelectTrigger className="min-h-[56px] h-14">
                <SelectValue placeholder="Select Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15000">₦15,000 — Lowkey</SelectItem>
                <SelectItem value="30000">₦30,000 — Standard Link</SelectItem>
                <SelectItem value="50000">₦50,000 — Chop Life</SelectItem>
                <SelectItem value="100000">₦100,000 — Big Boy Energy</SelectItem>
                <SelectItem value="250000">₦250,000 — Baller</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full min-h-[56px] h-14 text-lg font-bold bg-[#008751] hover:bg-[#007043] transition-all transform active:scale-95"
            disabled={loading}
          >
            {loading ? "Forging..." : "Get My Plan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
