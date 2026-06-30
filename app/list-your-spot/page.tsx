"use client";

import { useState, useRef } from "react";
import { submitOperatorInquiry } from "@/lib/actions/submitOperatorInquiry";
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
import { CheckCircle2, Loader2, Star, ShieldCheck } from "lucide-react";
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

    const result = await submitOperatorInquiry({
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      whatsappNumber: formData.whatsappNumber,
      areaSlug: formData.areaSlug,
      spotCategory: formData.spotCategory,
      priceRange: formData.priceRange,
      listingTier: formData.listingTier,
      monthlyBudget: formData.monthlyBudget,
      howHeard: formData.howHeard,
      notes: formData.notes,
    });

    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError("Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center antialiased">
        <CheckCircle2 className="w-20 h-20 text-brand-green mb-8" />
        <h1 className="type-display text-text-primary mb-4">Thanks {formData.ownerName}.</h1>
        <p className="type-body text-text-muted mb-12 max-w-sm mx-auto">
          We will contact you on WhatsApp within 24 hours to finalize your listing.
        </p>
        <Link href="/">
          <Button className="bg-brand-green hover:bg-brand-green-70 text-white h-[56px] px-10 rounded-[12px] type-subheading tap-feedback shadow-none border-none">
            Go back to OyaPlan
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white antialiased">
      {/* Header Section */}
      <section className="bg-brand-green text-white pt-12 pb-24 px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <Link href="/" className="inline-block tap-feedback">
            <span className="text-2xl font-[900] tracking-tighter">
              <span className="text-white">Oya</span>
              <span className="text-brand-yellow">Plan</span>
            </span>
          </Link>

          <div className="max-w-3xl space-y-6">
            <h1 className="type-display text-white">
              Get in front of Lagos squads ready to spend
            </h1>
            <p className="type-body text-white/80 max-w-2xl">
              OyaPlan generates outing plans for budget-conscious Lagos groups. When your spot is featured, you appear first for searches that match your area and vibe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/10">
            <div className="space-y-3">
              <h3 className="type-subheading text-white flex items-center gap-2">
                <span className="text-brand-yellow">🎯</span> Intent-matched
              </h3>
              <p className="type-body text-white/70">Users who see your spot have already decided to go out and spend money today.</p>
            </div>
            <div className="space-y-3">
              <h3 className="type-subheading text-white flex items-center gap-2">
                <span className="text-brand-yellow">💰</span> Budget-transparent
              </h3>
              <p className="type-body text-white/70">Your spot appears when someone&apos;s budget genuinely fits what you charge.</p>
            </div>
            <div className="space-y-3">
              <h3 className="type-subheading text-white flex items-center gap-2">
                <span className="text-brand-yellow">💬</span> WhatsApp-native
              </h3>
              <p className="type-body text-white/70">Every plan is copied to a WhatsApp group chat — your spot name travels with it.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tier Selection */}
      <section className="max-w-6xl mx-auto px-6 -mt-12 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Tier */}
          <div className="bg-white border border-border-default rounded-[24px] p-8 flex flex-col hover:border-brand-green/30 transition-all">
            <h3 className="type-heading text-text-primary mb-2">Basic</h3>
            <div className="text-4xl font-[900] text-text-primary mb-6">₦0<span className="type-label text-text-muted ml-2">/month</span></div>
            <p className="type-body text-text-muted flex-grow mb-8">
              Your spot in the database. Appears in relevant searches. No placement guarantee.
            </p>
            <Button 
              variant="outline" 
              className="w-full h-14 rounded-[12px] border-border-default type-label text-text-secondary hover:bg-surface-grey tap-feedback"
              onClick={() => scrollToForm("Basic")}
            >
              Select Basic
            </Button>
          </div>

          {/* Featured Tier */}
          <div className="bg-white border-2 border-brand-green rounded-[24px] p-8 flex flex-col shadow-[0px_24px_48px_rgba(0,135,81,0.1)] relative transform md:scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-yellow text-text-primary type-label uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md text-[10px]">
              Most Popular
            </div>
            <h3 className="type-heading text-brand-green mb-2 flex items-center gap-2">
              Featured <Star className="w-5 h-5 fill-brand-yellow text-brand-yellow" />
            </h3>
            <div className="text-4xl font-[900] text-text-primary mb-6">₦25,000<span className="type-label text-text-muted ml-2">/month</span></div>
            <p className="type-body text-text-secondary flex-grow mb-8 leading-relaxed">
              Priority placement. Your spot surfaces first for matching searches in your area. &quot;Featured&quot; badge on your plan card.
            </p>
            <Button 
              className="w-full h-14 rounded-[12px] bg-brand-green hover:bg-brand-green-70 text-white type-subheading tap-feedback shadow-none border-none"
              onClick={() => scrollToForm("Featured")}
            >
              Choose Featured
            </Button>
          </div>

          {/* Premium Tier */}
          <div className="bg-white border border-border-default rounded-[24px] p-8 flex flex-col hover:border-brand-green/30 transition-all">
            <h3 className="type-heading text-brand-green mb-2 flex items-center gap-2">
              Premium <ShieldCheck className="w-5 h-5" />
            </h3>
            <div className="text-4xl font-[900] text-text-primary mb-6">₦50,000<span className="type-label text-text-muted ml-2">/month</span></div>
            <p className="type-body text-text-secondary flex-grow mb-8 leading-relaxed">
              City-wide priority. Appears in searches across all areas for relevant vibes. &quot;OyaPlan Verified&quot; badge.
            </p>
            <Button 
              className="w-full h-14 rounded-[12px] border border-brand-green text-brand-green bg-white hover:bg-brand-green-5 type-subheading tap-feedback shadow-none"
              onClick={() => scrollToForm("Premium")}
            >
              Choose Premium
            </Button>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section ref={formRef} className="max-w-3xl mx-auto px-6 pb-32">
        <div className="bg-surface-grey rounded-[32px] p-8 md:p-16 border border-border-default space-y-12">
          <div className="space-y-3">
            <h2 className="type-display text-text-primary">List My Spot</h2>
            <p className="type-body text-text-muted">Complete the form below and we&apos;ll get you started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="type-label text-text-secondary">Business Name</Label>
                <Input 
                  id="businessName" 
                  required 
                  placeholder="e.g. Yellow Chilli"
                  className="h-[56px] rounded-[12px] type-body bg-white border-border-default focus-ring"
                  value={formData.businessName}
                  onChange={e => setFormData({...formData, businessName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="type-label text-text-secondary">Owner or Manager</Label>
                <Input 
                  id="ownerName" 
                  required 
                  placeholder="Full name"
                  className="h-[56px] rounded-[12px] type-body bg-white border-border-default focus-ring"
                  value={formData.ownerName}
                  onChange={e => setFormData({...formData, ownerName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="type-label text-text-secondary">WhatsApp Number</Label>
                <Input 
                  id="whatsapp" 
                  required 
                  placeholder="+234..."
                  className="h-[56px] rounded-[12px] type-body bg-white border-border-default focus-ring"
                  value={formData.whatsappNumber}
                  onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="type-label text-text-secondary">Area</Label>
                <Select 
                  required
                  value={formData.areaSlug}
                  onValueChange={v => setFormData({...formData, areaSlug: v || ""})}
                >
                  <SelectTrigger className="h-[56px] rounded-[12px] type-body bg-white border-border-default focus-ring">
                    <SelectValue placeholder="Select area" />
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
                <Label className="type-label text-text-secondary">Spot Category</Label>
                <Select 
                  required
                  value={formData.spotCategory}
                  onValueChange={v => setFormData({...formData, spotCategory: v || ""})}
                >
                  <SelectTrigger className="h-[56px] rounded-[12px] type-body bg-white border-border-default focus-ring">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="type-label text-text-secondary">Typical Price per Person</Label>
                <Select 
                  required
                  value={formData.priceRange}
                  onValueChange={v => setFormData({...formData, priceRange: v || ""})}
                >
                  <SelectTrigger className="h-[56px] rounded-[12px] type-body bg-white border-border-default focus-ring">
                    <SelectValue placeholder="Spend range" />
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
                <Label className="type-label text-text-secondary">Listing Tier</Label>
                <Select 
                  required
                  value={formData.listingTier}
                  onValueChange={v => setFormData({...formData, listingTier: v || "Featured"})}
                >
                  <SelectTrigger className="h-[56px] rounded-[12px] type-body bg-white border-border-default focus-ring">
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
                <Label className="type-label text-text-secondary">Marketing Budget</Label>
                <Select 
                  value={formData.monthlyBudget}
                  onValueChange={v => setFormData({...formData, monthlyBudget: v || ""})}
                >
                  <SelectTrigger className="h-[56px] rounded-[12px] type-body bg-white border-border-default focus-ring">
                    <SelectValue placeholder="Monthly spend" />
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
              <Label htmlFor="howHeard" className="type-label text-text-secondary">How did you hear about us?</Label>
              <Input 
                id="howHeard" 
                placeholder="e.g. Twitter, Referral"
                className="h-[56px] rounded-[12px] type-body bg-white border-border-default focus-ring"
                value={formData.howHeard}
                onChange={e => setFormData({...formData, howHeard: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="type-label text-text-secondary">Additional Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Anything else we should know?"
                className="rounded-[12px] type-body bg-white border-border-default focus-ring min-h-[120px]"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            {error && <p className="type-label text-error text-center">{error}</p>}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-[64px] bg-brand-green hover:bg-brand-green-70 text-white type-subheading rounded-[16px] tap-feedback shadow-none border-none relative overflow-hidden group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                </span>
              ) : (
                <>
                  <span className="relative z-10">Submit My Listing Interest</span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
