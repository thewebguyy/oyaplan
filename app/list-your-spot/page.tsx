"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Star, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

const LAGOS_AREAS = [
  { name: "Agege", slug: "agege" },
  { name: "Apapa", slug: "apapa" },
  { name: "Ebute Metta", slug: "ebute-metta" },
  { name: "Gbagada", slug: "gbagada" },
  { name: "Ikeja", slug: "ikeja" },
  { name: "Ikoyi", slug: "ikoyi" },
  { name: "Lekki Phase 1", slug: "lekki-phase-1" },
  { name: "Maryland", slug: "maryland" },
  { name: "Ogudu", slug: "ogudu" },
  { name: "Surulere", slug: "surulere" },
  { name: "Victoria Island", slug: "vi" },
  { name: "Yaba", slug: "yaba" }
];

const CATEGORIES = [
  "Restaurant",
  "Cafe",
  "Bar",
  "Beach",
  "Nature/Outdoors",
  "Activity/Fun",
  "Experience",
  "Entertainment"
];

const PRICE_RANGES = [
  "Under ₦15,000",
  "₦15,000 – ₦30,000",
  "₦30,000 – ₦50,000",
  "₦50,000 – ₦100,000",
  "Over ₦100,000"
];

const BUDGET_OPTIONS = [
  "Under ₦50k",
  "₦50k–₦150k",
  "₦150k–₦500k",
  "Over ₦500k"
];

export default function ListYourSpotPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    whatsappNumber: "",
    areaSlug: "",
    spotCategory: "",
    priceRange: "",
    listingTier: "Featured",
    monthlyBudget: "",
    howHeard: "",
    notes: ""
  });

  const scrollToForm = (tier: string) => {
    setFormData(prev => ({ ...prev, listingTier: tier }));
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("operator_inquiries").insert({
        business_name: formData.businessName,
        owner_name: formData.ownerName,
        whatsapp_number: formData.whatsappNumber,
        area_slug: formData.areaSlug,
        spot_category: formData.spotCategory,
        price_per_person_range: formData.priceRange,
        listing_tier: formData.listingTier,
        monthly_budget_ngn: formData.monthlyBudget === "Under ₦50k" ? 25000 : 
                           formData.monthlyBudget === "₦50k–₦150k" ? 100000 :
                           formData.monthlyBudget === "₦150k–₦500k" ? 300000 :
                           formData.monthlyBudget === "Over ₦500k" ? 750000 : null,
        how_they_heard: formData.howHeard || null,
        additional_notes: formData.notes || null
      });

      if (insertError) throw insertError;
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
        <h1 className="text-3xl font-black text-gray-900 mb-2">Thanks {formData.ownerName}.</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          We will contact you on WhatsApp within 24 hours.
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
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-[#008751] text-white pt-12 pb-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black tracking-tighter text-white">
              OyaPlan<span className="text-white/40 font-normal">.com</span>
            </span>
          </Link>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
              Get in front of Lagos squads who are ready to spend
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-medium">
              OyaPlan generates outing plans for budget-conscious Lagos groups. When your spot is featured, you appear first for searches that match your area and vibe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/10">
            <div className="space-y-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-[#FCD116]">🎯</span> Intent-matched
              </h3>
              <p className="text-white/70">Users who see your spot have already decided to go out and spend money</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-[#FCD116]">💰</span> Budget-transparent
              </h3>
              <p className="text-white/70">Your spot appears when someone's budget genuinely fits what you charge</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-[#FCD116]">💬</span> WhatsApp-native
              </h3>
              <p className="text-white/70">Every plan gets copied to a WhatsApp group chat — your spot name travels with it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Selection */}
      <section className="max-w-6xl mx-auto px-6 -mt-12 mb-24">
        <div className="text-center mb-12 hidden md:block">
           {/* This space intentionally left for visual breathing room */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Tier */}
          <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 flex flex-col shadow-sm">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Basic</h3>
            <div className="text-4xl font-black text-gray-900 mb-6">₦0<span className="text-base text-gray-400 font-medium">/month</span></div>
            <p className="text-gray-500 font-medium flex-grow mb-8">
              Your spot in the database. Appears in relevant searches. No placement guarantee.
            </p>
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-2xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50"
              onClick={() => scrollToForm("Basic")}
            >
              Select Basic
            </Button>
          </div>

          {/* Featured Tier */}
          <div className="bg-white border-2 border-[#008751] rounded-3xl p-8 flex flex-col shadow-xl shadow-[#008751]/10 relative transform md:scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FCD116] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
              Most Popular
            </div>
            <h3 className="text-2xl font-black text-[#008751] mb-2 flex items-center gap-2">
              Featured <Star className="w-5 h-5 fill-[#FCD116] text-[#FCD116]" />
            </h3>
            <div className="text-4xl font-black text-gray-900 mb-6">₦25,000<span className="text-base text-gray-400 font-medium">/month</span></div>
            <p className="text-gray-600 font-medium flex-grow mb-8 leading-relaxed">
              Priority placement. Your spot surfaces first for matching searches in your area. "Featured" badge on your plan card.
            </p>
            <Button 
              className="w-full h-14 rounded-2xl bg-[#008751] hover:bg-[#007043] text-white font-black text-lg shadow-lg shadow-[#008751]/20"
              onClick={() => scrollToForm("Featured")}
            >
              Choose Featured
            </Button>
          </div>

          {/* Premium Tier */}
          <div className="bg-white border-2 border-[#008751]/40 rounded-3xl p-8 flex flex-col shadow-lg">
            <h3 className="text-2xl font-black text-[#008751] mb-2 flex items-center gap-2">
              Premium <ShieldCheck className="w-5 h-5" />
            </h3>
            <div className="text-4xl font-black text-gray-900 mb-6">₦50,000<span className="text-base text-gray-400 font-medium">/month</span></div>
            <p className="text-gray-600 font-medium flex-grow mb-8 leading-relaxed">
              City-wide priority. Appears in searches across all areas for relevant vibes. "OyaPlan Verified" badge. Monthly performance report.
            </p>
            <Button 
              className="w-full h-14 rounded-2xl border-2 border-[#008751] text-[#008751] bg-white hover:bg-green-50 font-black text-lg"
              onClick={() => scrollToForm("Premium")}
            >
              Choose Premium
            </Button>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section ref={formRef} className="max-w-3xl mx-auto px-6 pb-32">
        <div className="space-y-8 bg-gray-50 rounded-[40px] p-8 md:p-12 border border-gray-100">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900">List My Spot</h2>
            <p className="text-gray-500 font-medium">Complete the form below and we'll get you started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="font-bold">Business Name *</Label>
                <Input 
                  id="businessName" 
                  required 
                  placeholder="e.g. Yellow Chilli"
                  className="h-14 rounded-xl"
                  value={formData.businessName}
                  onChange={e => setFormData({...formData, businessName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="font-bold">Owner or Manager Name *</Label>
                <Input 
                  id="ownerName" 
                  required 
                  placeholder="e.g. John Doe"
                  className="h-14 rounded-xl"
                  value={formData.ownerName}
                  onChange={e => setFormData({...formData, ownerName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="font-bold">WhatsApp Number *</Label>
                <Input 
                  id="whatsapp" 
                  required 
                  placeholder="+234..."
                  className="h-14 rounded-xl"
                  value={formData.whatsappNumber}
                  onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Area *</Label>
                <Select 
                  required
                  value={formData.areaSlug}
                  onValueChange={v => setFormData({...formData, areaSlug: v || ""})}
                >
                  <SelectTrigger className="h-14 rounded-xl">
                    <SelectValue placeholder="Select Lagos area" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {LAGOS_AREAS.map(area => (
                      <SelectItem key={area.slug} value={area.slug}>{area.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold">Spot Category *</Label>
                <Select 
                  required
                  value={formData.spotCategory}
                  onValueChange={v => setFormData({...formData, spotCategory: v || ""})}
                >
                  <SelectTrigger className="h-14 rounded-xl">
                    <SelectValue placeholder="What kind of spot?" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Approx. Price per Person *</Label>
                <Select 
                  required
                  value={formData.priceRange}
                  onValueChange={v => setFormData({...formData, priceRange: v || ""})}
                >
                  <SelectTrigger className="h-14 rounded-xl">
                    <SelectValue placeholder="Typical spend" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {PRICE_RANGES.map(range => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold">Listing Tier *</Label>
                <Select 
                  required
                  value={formData.listingTier}
                  onValueChange={v => setFormData({...formData, listingTier: v || "Featured"})}
                >
                  <SelectTrigger className="h-14 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Basic">Basic (₦0/mo)</SelectItem>
                    <SelectItem value="Featured">Featured (₦25,000/mo)</SelectItem>
                    <SelectItem value="Premium">Premium (₦50,000/mo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Monthly Marketing Budget</Label>
                <Select 
                  value={formData.monthlyBudget}
                  onValueChange={v => setFormData({...formData, monthlyBudget: v || ""})}
                >
                  <SelectTrigger className="h-14 rounded-xl">
                    <SelectValue placeholder="Intelligence gathering" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {BUDGET_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="howHeard" className="font-bold">How did you hear about us?</Label>
              <Input 
                id="howHeard" 
                placeholder="e.g. Twitter, Referral, Instagram"
                className="h-14 rounded-xl"
                value={formData.howHeard}
                onChange={e => setFormData({...formData, howHeard: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-bold">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Anything else we should know?"
                className="rounded-xl min-h-[100px]"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            {error && <p className="text-red-500 font-bold text-center">{error}</p>}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-[#008751] hover:bg-[#007043] text-white font-black text-xl rounded-2xl shadow-xl shadow-[#008751]/20 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" /> Submitting...
                </span>
              ) : (
                "Submit My Listing Interest"
              )}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
