"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Loader2, MapPin, Clock, MessageSquare, Laptop, Smartphone } from "lucide-react";
import Link from "next/link";

const DEVICE_OPTIONS = [
  "Android phone on 4G",
  "Android phone on WiFi",
  "iPhone on 4G",
  "iPhone on WiFi",
  "Laptop or desktop",
  "Other"
];

const PRICE_TIERS = [
  { value: "15000", label: "₦15,000 — Lowkey" },
  { value: "30000", label: "₦30,000 — Standard" },
  { value: "50000", label: "₦50,000 — Chop Life" },
  { value: "100000", label: "₦100,000 — Big Boy Energy" },
  { value: "250000", label: "₦250,000 — Baller" }
];

export default function FeedbackPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    testerName: "",
    device: "",
    whatTried: "",
    whatFrustrated: "",
    whatWished: "",
    spotName: "",
    spotArea: "",
    spotPrice: "",
    whatsapp: ""
  });

  useEffect(() => {
    async function fetchAreas() {
      const { data } = await supabase.from("areas").select("*").order("name");
      if (data) setAreas(data);
    }
    fetchAreas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Write observation
      const { error: obsError } = await supabase.from("tester_observations").insert({
        tester_name: formData.testerName,
        device_and_network: formData.device,
        what_they_tried: formData.whatTried,
        what_frustrated_them: formData.whatFrustrated || null,
        what_they_wished_existed: formData.whatWished || null,
        page_url: window.location.href
      });

      if (obsError) throw obsError;

      // 2. Write spot suggestion if filled
      if (formData.spotName) {
        const { error: spotError } = await supabase.from("spot_suggestions").insert({
          spot_name: formData.spotName,
          area_name: formData.spotArea,
          rough_price_per_person: formData.spotPrice ? parseInt(formData.spotPrice) : null,
          suggester_whatsapp: formData.whatsapp || null
        });
        if (spotError) throw spotError;
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-20 h-20 text-[#008751] mb-6" />
        <h1 className="text-3xl font-black text-gray-900 mb-2">Thank you, {formData.testerName}.</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          Your feedback has been logged. We're using it right now to make OyaPlan better.
        </p>
        <Link href="/">
          <Button className="bg-[#008751] hover:bg-[#007043] h-14 px-10 rounded-2xl font-black text-lg shadow-lg shadow-[#008751]/20">
            Go back to OyaPlan
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Brand Header */}
      <div className="bg-[#008751] py-8 px-6 text-center border-b border-white/10 shadow-lg shadow-[#008751]/10">
        <span className="text-2xl font-black tracking-tighter text-white block">OyaPlan</span>
        <p className="text-white/80 text-sm font-medium mt-1">You're helping shape OyaPlan. Thank you.</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 mt-12 space-y-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-black uppercase tracking-widest text-gray-400">Your name or nickname</Label>
              <Input 
                id="name"
                required
                className="h-14 rounded-xl border-2 border-gray-100 bg-gray-50 px-5 text-base font-medium focus:border-[#008751] focus:ring-0 transition-all"
                value={formData.testerName}
                onChange={e => setFormData({...formData, testerName: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-black uppercase tracking-widest text-gray-400">What device and network were you on?</Label>
              <Select 
                required 
                onValueChange={(v: string | null) => setFormData({...formData, device: v || ""})}
              >
                <SelectTrigger className="h-14 rounded-xl border-2 border-gray-100 bg-gray-50 px-5 text-base font-medium">
                  <SelectValue placeholder="Select one..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-gray-100">
                  {DEVICE_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt} className="h-12 font-medium">{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="tried" className="text-sm font-black uppercase tracking-widest text-gray-400">What were you trying to do?</Label>
              <Textarea 
                id="tried"
                required
                rows={3}
                placeholder="e.g. I was trying to find a spot in Surulere for 4 people on a Friday night"
                className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5 text-base font-medium focus:border-[#008751] transition-all resize-none"
                value={formData.whatTried}
                onChange={e => setFormData({...formData, whatTried: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="frustrated" className="text-sm font-black uppercase tracking-widest text-gray-400">What confused or frustrated you?</Label>
              <Textarea 
                id="frustrated"
                rows={3}
                placeholder="Be honest — the more specific the better"
                className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5 text-base font-medium focus:border-[#008751] transition-all resize-none"
                value={formData.whatFrustrated}
                onChange={e => setFormData({...formData, whatFrustrated: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="wished" className="text-sm font-black uppercase tracking-widest text-gray-400">What do you wish OyaPlan could do?</Label>
              <Textarea 
                id="wished"
                rows={3}
                className="rounded-xl border-2 border-gray-100 bg-gray-50 p-5 text-base font-medium focus:border-[#008751] transition-all resize-none"
                value={formData.whatWished}
                onChange={e => setFormData({...formData, whatWished: e.target.value})}
              />
            </div>
          </div>

          <div className="p-8 bg-gray-50 rounded-3xl border-2 border-gray-100 space-y-8">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-gray-900">Know a spot we're missing?</h3>
              <p className="text-sm text-gray-500 font-medium italic">Help us expand the Lagos database.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="spotName" className="text-xs font-black uppercase tracking-widest text-gray-400">Spot Name</Label>
                <Input 
                  id="spotName"
                  className="h-14 rounded-xl border-2 border-white bg-white px-5 text-base font-medium focus:border-[#008751] transition-all shadow-sm"
                  value={formData.spotName}
                  onChange={e => setFormData({...formData, spotName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Area</Label>
                  <Select onValueChange={(v: string | null) => setFormData({...formData, spotArea: v || ""})}>
                    <SelectTrigger className="h-14 rounded-xl border-2 border-white bg-white px-5 text-base font-medium shadow-sm">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {areas.map(a => (
                        <SelectItem key={a.id} value={a.name}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Price / Person</Label>
                  <Select onValueChange={(v: string | null) => setFormData({...formData, spotPrice: v || ""})}>
                    <SelectTrigger className="h-14 rounded-xl border-2 border-white bg-white px-5 text-base font-medium shadow-sm">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {PRICE_TIERS.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col">
                  <Label htmlFor="whatsapp" className="text-xs font-black uppercase tracking-widest text-gray-400">Your WhatsApp Number</Label>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">Only if you want us to follow up.</span>
                </div>
                <Input 
                  id="whatsapp"
                  placeholder="+234..."
                  className="h-14 rounded-xl border-2 border-white bg-white px-5 text-base font-medium focus:border-[#008751] transition-all shadow-sm"
                  value={formData.whatsapp}
                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 font-bold text-center animate-in fade-in slide-in-from-bottom-1">{error}</p>}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-[#008751] hover:bg-[#007043] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#008751]/20 active:scale-[0.98] transition-all"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Feedback"}
          </Button>
        </form>
      </div>
    </main>
  );
}
