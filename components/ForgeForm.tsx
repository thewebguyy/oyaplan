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
  const [formData, setFormData] = useState({
    startArea: "",
    squadSize: "2",
    budget: "50000",
    vibe: "Chill",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Level 2: Loading state with animation handled in parent/page
    const params = new URLSearchParams(formData);
    router.push(`/forge?${params.toString()}`);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-none shadow-2xl bg-white/90 backdrop-blur-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="startArea">Where are you starting from?</Label>
            <Select 
              onValueChange={(v) => setFormData({ ...formData, startArea: v })}
              required
            >
              <SelectTrigger className="h-12">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="squadSize">Squad Size</Label>
              <Select 
                defaultValue={formData.squadSize}
                onValueChange={(v) => setFormData({ ...formData, squadSize: v })}
              >
                <SelectTrigger className="h-12">
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
              <Label htmlFor="vibe">The Vibe</Label>
              <Select 
                defaultValue={formData.vibe}
                onValueChange={(v) => setFormData({ ...formData, vibe: v })}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Vibe" />
                </SelectTrigger>
                <SelectContent>
                  {["Chill", "Foodie", "Party", "Quick", "Dinner", "Brunch"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget (₦)</Label>
            <Select 
              defaultValue={formData.budget}
              onValueChange={(v) => setFormData({ ...formData, budget: v })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select Budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15000">₦15,000 (Lowkey)</SelectItem>
                <SelectItem value="30000">₦30,000 (Standard)</SelectItem>
                <SelectItem value="50000">₦50,000 (Mid-range)</SelectItem>
                <SelectItem value="100000">₦100,000 (Premium)</SelectItem>
                <SelectItem value="250000">₦250,000 (Baller)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-bold bg-[#008751] hover:bg-[#007043] transition-all transform active:scale-95"
            disabled={loading}
          >
            {loading ? "Forging..." : "Forge It"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
