"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { submitFeedback } from "@/lib/actions/submitFeedback";
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
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Wallet,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Send,
  Smartphone,
  Laptop,
  Wifi,
  HelpCircle
} from "lucide-react";

const DEVICE_OPTIONS = [
  { value: "Android phone on 4G", label: "Android phone (MTN / Airtel 4G)", icon: "📱" },
  { value: "Android phone on WiFi", label: "Android phone (WiFi / Fiber)", icon: "📶" },
  { value: "iPhone on 4G", label: "iPhone (MTN / Airtel 5G/4G)", icon: "📱" },
  { value: "iPhone on WiFi", label: "iPhone (WiFi / Starlink)", icon: "📶" },
  { value: "Laptop or desktop", label: "Laptop or Desktop browser", icon: "💻" },
  { value: "Other", label: "Other device / network", icon: "⚡" },
];

const PRICE_TIERS = [
  { value: "15000", label: "₦15,000 — Lowkey" },
  { value: "30000", label: "₦30,000 — Standard" },
  { value: "50000", label: "₦50,000 — Chop Life" },
  { value: "100000", label: "₦100,000 — Big Boy Energy" },
  { value: "250000", label: "₦250,000 — Baller" },
];

interface Area {
  id: string;
  name: string;
  slug: string;
}

interface FeedbackFormProps {
  areas: Area[];
}

export default function FeedbackForm({ areas }: FeedbackFormProps) {
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
    whatsapp: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await submitFeedback(formData);

    setLoading(false);
    if (result.success) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError("Something went wrong. Please check your network and try again.");
    }
  };

  // ── SUCCESS STATE: DELIGHTFUL "E CHOKE!" STAMP + KEKE ZOOM ──
  if (submitted) {
    return (
      <main className="relative min-h-[100dvh] bg-[#F6F6F2] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden font-sans">
        {/* Subtle Geometric Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#111111 1.5px, transparent 1.5px)`,
            backgroundSize: "24px 24px"
          }}
          aria-hidden="true"
        />

        {/* Celebratory Success Card (Neo-Brutalist) */}
        <div className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-[#111111] p-7 sm:p-10 shadow-[8px_8px_0px_0px_#111111] text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Animated Keke Napep / Danfo Driving Header Track */}
          <div className="relative w-full h-14 bg-[#F6F6F2] rounded-2xl border-2 border-[#111111] overflow-hidden flex items-center px-4 shadow-inner">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] border-b-2 border-dashed border-[#111111]/30" />
            
            {/* Driving Vehicle */}
            <div className="relative z-10 flex items-center gap-2 animate-[pulse_2s_ease-in-out_infinite]">
              {/* Danfo / Keke Yellow Vehicle SVG */}
              <div className="relative w-11 h-7 bg-[#F9E828] rounded-xs border-2 border-[#111111] flex flex-col justify-between overflow-hidden shadow-xs">
                <div className="flex items-center gap-0.5 pt-0.5 px-0.5">
                  <div className="h-1.5 w-3 bg-[#111111]/80 rounded-[1px]" />
                  <div className="h-1.5 w-2 bg-[#111111]/80 rounded-[1px]" />
                  <div className="h-1.5 w-2 bg-[#111111]/80 rounded-[1px]" />
                </div>
                {/* Double Racing Stripes */}
                <div className="w-full flex flex-col gap-[1px]">
                  <div className="w-full h-[1.5px] bg-[#111111]" />
                  <div className="w-full h-[1.5px] bg-[#111111]" />
                </div>
                {/* Wheels */}
                <div className="absolute -bottom-1 left-1 w-2.5 h-2.5 bg-[#111111] rounded-full border border-white/50" />
                <div className="absolute -bottom-1 right-1 w-2.5 h-2.5 bg-[#111111] rounded-full border border-white/50" />
              </div>
              <span className="text-[10px] font-mono font-black text-[#111111] uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md border border-[#111111]/20">
                Lagos Run
              </span>
            </div>
          </div>

          {/* "E CHOKE!" Lagos Culture Stamp */}
          <div className="flex justify-center -mt-2">
            <div className="inline-block transform -rotate-3 hover:rotate-0 transition-transform">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#F9E828] border-2 border-[#111111] text-[#111111] font-display font-black text-sm uppercase tracking-widest shadow-[3px_3px_0px_0px_#111111]">
                <span>E CHOKE! 🤙</span>
              </span>
            </div>
          </div>

          {/* Headline & Body */}
          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#111111] font-display uppercase tracking-tight">
              Thanks for the gist. We&apos;re on it.
            </h1>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed font-medium px-2">
              Your notes have landed directly on the Lagos board, <strong className="text-[#111111]">{formData.testerName || "Chief"}</strong>. We&apos;re tuning OyaPlan so your next outing math is 100% stress-free.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Link href="/" className="block">
              <button
                type="button"
                className="w-full h-13 rounded-2xl bg-[#F9E828] hover:bg-[#ffe710] active:scale-98 text-[#111111] font-display font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] transition-all flex items-center justify-center gap-2 cursor-pointer tap-feedback"
              >
                <span>Back to OyaPlan ⚡</span>
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── MAIN FORM STATE ──
  return (
    <main className="relative min-h-[100dvh] bg-[#F6F6F2] pb-24 font-sans selection:bg-[#F9E828] selection:text-[#111111]">
      
      {/* ── 1. PALETTE & STORYTELLING: ASPHALT GREEN / TROPICAL EMERALD HEADER ── */}
      <header className="relative bg-[#072418] text-white border-b-2 border-[#111111] overflow-hidden pt-8 pb-14 sm:pb-16 px-4 sm:px-6">
        
        {/* Subtle Radial Glow in Header */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle at 50% 20%, rgba(249, 232, 40, 0.18), transparent 70%)"
          }}
          aria-hidden="true"
        />

        {/* Embedded Flat-Vector Continuous-Line Illustration of Lagos Social Scene */}
        <div 
          className="absolute inset-y-0 right-0 w-full max-w-xl pointer-events-none select-none opacity-20 sm:opacity-25 overflow-hidden flex items-center justify-end"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 500 240"
            className="w-full h-auto text-[#F9E828] stroke-current fill-none stroke-[1.75]"
          >
            {/* Lekki-Ikoyi Link Bridge Pylon & Cables in Background */}
            <path d="M 380 20 L 370 220 L 390 220 Z" opacity="0.6" strokeWidth="2.5" />
            <line x1="380" y1="40" x2="310" y2="220" opacity="0.4" strokeDasharray="3 3" />
            <line x1="380" y1="65" x2="330" y2="220" opacity="0.4" strokeDasharray="3 3" />
            <line x1="380" y1="90" x2="350" y2="220" opacity="0.4" strokeDasharray="3 3" />
            <line x1="380" y1="40" x2="450" y2="220" opacity="0.4" strokeDasharray="3 3" />
            <line x1="380" y1="65" x2="430" y2="220" opacity="0.4" strokeDasharray="3 3" />

            {/* DJ Turntable & Vinyl Groove */}
            <circle cx="210" cy="150" r="50" strokeWidth="2" opacity="0.8" />
            <circle cx="210" cy="150" r="35" opacity="0.5" />
            <circle cx="210" cy="150" r="20" opacity="0.5" />
            <circle cx="210" cy="150" r="6" fill="currentColor" />
            <line x1="210" y1="150" x2="260" y2="120" strokeWidth="2.5" />

            {/* Clinking Cocktail Glasses */}
            {/* Glass 1 */}
            <path d="M 90 90 L 120 140 L 120 180 L 105 180 L 135 180" strokeWidth="2" />
            <line x1="85" y1="90" x2="125" y2="90" strokeWidth="2" />
            <circle cx="100" cy="80" r="5" fill="#34D399" />
            
            {/* Glass 2 (Clinking angle) */}
            <path d="M 155 92 L 128 140" strokeWidth="2" />
            <line x1="125" y1="90" x2="160" y2="98" strokeWidth="2" />
            <path d="M 130 140 L 130 180 L 120 180 L 140 180" strokeWidth="2" />

            {/* Sound / Energy Rhythm Arcs */}
            <path d="M 135 70 Q 145 60 155 70" opacity="0.7" />
            <path d="M 130 60 Q 145 45 160 60" opacity="0.5" />
          </svg>
        </div>

        {/* Header Top Controls */}
        <div className="relative max-w-2xl mx-auto flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all tap-feedback"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>OyaPlan</span>
          </Link>

          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#F9E828] bg-[#F9E828]/15 border border-[#F9E828]/40 px-2.5 py-0.5 rounded-full">
            Beta Playbook
          </span>
        </div>

        {/* Header Title & Relatable Subtitle */}
        <div className="relative max-w-2xl mx-auto text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase font-display">
            Tell Us Your Mind
          </h1>
          <p className="text-sm sm:text-base text-white/80 font-medium max-w-lg mx-auto">
            Help us build the ultimate Lagos playbook. No filters, just facts.
          </p>
        </div>
      </header>

      {/* ── 2. BACKGROUND GEOMETRIC TEXTURE BEHIND FORM CARD ── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `
            radial-gradient(#111111 1.5px, transparent 1.5px),
            linear-gradient(to right, #111111 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px, 112px 112px"
        }}
        aria-hidden="true"
      />

      {/* ── 3. FORM CONTAINER: NEO-BRUTALIST CARD ── */}
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 -mt-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Main Card */}
          <div className="bg-white rounded-3xl border-2 border-[#111111] p-6 sm:p-10 shadow-[6px_6px_0px_0px_#111111] sm:shadow-[8px_8px_0px_0px_#111111] space-y-7">
            
            {/* Section 1 Header */}
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F9E828] flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#111111] font-display">
                    How was your OyaPlan experience?
                  </h2>
                  <p className="text-[11px] text-[#666666] font-medium font-sans">
                    Every detail helps us dial in the real costs of Lasgidi.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Field 1: Name or Nickname */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="testerName"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-mono"
                >
                  Your Name or Nickname <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="testerName"
                  required
                  placeholder="e.g. Tunde or Bola"
                  className="h-12 rounded-xl border-2 border-[#111111] focus:border-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 bg-[#FCFBF9] focus:bg-white px-4 text-xs sm:text-sm font-medium transition-all shadow-xs"
                  value={formData.testerName}
                  onChange={(e) => setFormData({ ...formData, testerName: e.target.value })}
                />
              </div>

              {/* Field 2: Custom Styled Device & Connection Dropdown */}
              <div className="space-y-1.5">
                <Label 
                  htmlFor="device"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-mono"
                >
                  Device &amp; Connection <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={formData.device}
                  onValueChange={(val: string | null) => setFormData({ ...formData, device: val ?? "" })}
                >
                  <SelectTrigger 
                    id="device"
                    className="h-12 rounded-xl border-2 border-[#111111] focus:border-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 bg-[#FCFBF9] focus:bg-white px-4 text-xs sm:text-sm font-medium shadow-xs text-left"
                  >
                    <SelectValue placeholder="Select device & network setup..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] bg-white">
                    {DEVICE_OPTIONS.map((opt) => (
                      <SelectItem 
                        key={opt.value} 
                        value={opt.value} 
                        className="h-11 text-xs sm:text-sm font-medium cursor-pointer hover:bg-[#F9E828]/20 focus:bg-[#F9E828]/30"
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Field 3: What was the mission? */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="whatTried"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-mono"
                >
                  What was the mission? <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="whatTried"
                  required
                  rows={3}
                  placeholder="e.g. I was trying to find a dinner spot in VI for 4 people with ₦50k total budget..."
                  className="rounded-xl border-2 border-[#111111] focus:border-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 bg-[#FCFBF9] focus:bg-white p-3.5 text-xs sm:text-sm font-medium transition-all resize-none shadow-xs"
                  value={formData.whatTried}
                  onChange={(e) => setFormData({ ...formData, whatTried: e.target.value })}
                />
              </div>

              {/* Field 4: What stressed you out? */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="whatFrustrated"
                    className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-mono"
                  >
                    What stressed you out?
                  </Label>
                  <span className="text-[10px] text-[#666666] font-mono">Did you hit any roadblocks?</span>
                </div>
                <Textarea
                  id="whatFrustrated"
                  rows={3}
                  placeholder="Be as honest and specific as possible... Confusing calculations, slow screens, or missing prices?"
                  className="rounded-xl border-2 border-[#111111] focus:border-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 bg-[#FCFBF9] focus:bg-white p-3.5 text-xs sm:text-sm font-medium transition-all resize-none shadow-xs"
                  value={formData.whatFrustrated}
                  onChange={(e) => setFormData({ ...formData, whatFrustrated: e.target.value })}
                />
              </div>

              {/* Field 5: What do you wish OyaPlan did automatically? */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="whatWished"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-mono"
                >
                  What do you wish happened automatically?
                </Label>
                <Textarea
                  id="whatWished"
                  rows={3}
                  placeholder="e.g. Split bills directly on WhatsApp, show corkage fees, calculate ride fares automatically..."
                  className="rounded-xl border-2 border-[#111111] focus:border-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 bg-[#FCFBF9] focus:bg-white p-3.5 text-xs sm:text-sm font-medium transition-all resize-none shadow-xs"
                  value={formData.whatWished}
                  onChange={(e) => setFormData({ ...formData, whatWished: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 2: PLUG A SPOT (COMMUNITY SECTION) ── */}
          <div className="p-6 sm:p-8 bg-[#FFFEE5] rounded-3xl border-2 border-[#111111] space-y-6 shadow-[6px_6px_0px_0px_#111111]">
            <div className="space-y-1 border-b-2 border-[#111111] pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#111111] text-[#F9E828] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#111111] font-display">
                    Plug a Spot
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#111111] text-[#F9E828] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Drop a Hidden Gem
                </span>
              </div>
              <p className="text-xs text-[#555555] font-medium pt-1">
                Help us make Lagos outings easier to plan. Add any unlisted restaurant, lounge, or activity hub.
              </p>
            </div>

            <div className="space-y-5">
              {/* Spot Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="spotName"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-mono"
                >
                  Spot Name
                </Label>
                <Input
                  id="spotName"
                  placeholder="e.g. The Harvest, Woks & Koi, Danfo Bistro..."
                  className="h-12 rounded-xl border-2 border-[#111111] focus:border-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 bg-white px-4 text-xs sm:text-sm font-medium transition-all shadow-xs"
                  value={formData.spotName}
                  onChange={(e) => setFormData({ ...formData, spotName: e.target.value })}
                />
              </div>

              {/* Area & Price Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label 
                    htmlFor="spotArea"
                    className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-mono flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#111111]" />
                    <span>Area / Neighborhood</span>
                  </Label>
                  <Select 
                    value={formData.spotArea}
                    onValueChange={(v: string | null) => setFormData({ ...formData, spotArea: v ?? "" })}
                  >
                    <SelectTrigger 
                      id="spotArea"
                      className="h-12 rounded-xl border-2 border-[#111111] focus:border-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 bg-white px-4 text-xs sm:text-sm font-medium shadow-xs"
                    >
                      <SelectValue placeholder="Select Lagos area..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] bg-white max-h-64">
                      {areas.map((a) => (
                        <SelectItem key={a.id} value={a.name} className="text-xs sm:text-sm font-medium cursor-pointer">
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label 
                    htmlFor="spotPrice"
                    className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-mono flex items-center gap-1"
                  >
                    <Wallet className="w-3.5 h-3.5 text-[#111111]" />
                    <span>Estimated Spend / Person</span>
                  </Label>
                  <Select 
                    value={formData.spotPrice}
                    onValueChange={(v: string | null) => setFormData({ ...formData, spotPrice: v ?? "" })}
                  >
                    <SelectTrigger 
                      id="spotPrice"
                      className="h-12 rounded-xl border-2 border-[#111111] focus:border-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 bg-white px-4 text-xs sm:text-sm font-medium shadow-xs"
                    >
                      <SelectValue placeholder="Select spend tier..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] bg-white">
                      {PRICE_TIERS.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="text-xs sm:text-sm font-medium cursor-pointer">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* WhatsApp Input */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="whatsapp"
                  className="block text-xs font-bold uppercase tracking-wider text-[#111111] font-mono flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Your WhatsApp (Optional)</span>
                </Label>
                <Input
                  id="whatsapp"
                  placeholder="e.g. +234 801 234 5678"
                  className="h-12 rounded-xl border-2 border-[#111111] focus:border-[#111111] focus:ring-4 focus:ring-[#F9E828]/50 bg-white px-4 text-xs sm:text-sm font-medium transition-all shadow-xs"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
                <p className="text-[11px] text-[#666666] font-medium font-sans">
                  Only if you&apos;d like us to ping you when the spot is vetted and live on OyaPlan.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-500 text-red-700 text-xs font-bold text-center animate-in fade-in">
              {error}
            </div>
          )}

          {/* ── SUBMIT BUTTON: BOLD DANFO YELLOW ── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-[#F9E828] hover:bg-[#ffe710] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#111111] text-[#111111] font-display font-black text-sm uppercase tracking-wider border-2 border-[#111111] shadow-[5px_5px_0px_0px_#111111] transition-all flex items-center justify-center gap-2.5 cursor-pointer tap-feedback disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending Gist...</span>
              </>
            ) : (
              <>
                <span>Send Feedback 🚀</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
