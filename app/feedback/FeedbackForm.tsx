"use client";

import { useState } from "react";
import { submitFeedback } from "@/lib/actions/submitFeedback";
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
import { CheckCircle2, Loader2, MapPin, Wallet, Phone, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";

const DEVICE_OPTIONS = [
  "Android phone on 4G",
  "Android phone on WiFi",
  "iPhone on 4G",
  "iPhone on WiFi",
  "Laptop or desktop",
  "Other",
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
    } else {
      setError("Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <main className="min-h-[100dvh] bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md bg-white rounded-[28px] border border-[#EAE4DC] p-8 shadow-xs space-y-6">
          <div className="w-16 h-16 bg-[#EAFDF3] text-[#008751] rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-midnight-lagoon">
              Thank you, {formData.testerName}.
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Your feedback has been logged. We&apos;re using it to improve budget confidence and real-world planning in Lagos.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/">
              <Button className="w-full h-12 bg-[#008751] hover:bg-[#007043] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs">
                Back to OyaPlan
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 my-8 space-y-8 animate-in fade-in duration-200">
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Main Feedback Card */}
        <div className="bg-white rounded-[24px] border border-[#EAE4DC] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-[#EAE4DC] pb-4">
            <MessageSquare className="w-4 h-4 text-[#008751]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-midnight-lagoon">
              Experience &amp; Usability Feedback
            </h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="block text-xs font-bold text-midnight-lagoon"
              >
                Your Name or Nickname
              </Label>
              <Input
                id="name"
                required
                placeholder="e.g. Tunde"
                className="h-12 rounded-xl border border-[#EAE4DC] hover:border-[#D5CFC7] focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/15 bg-[#FCFBF9] focus:bg-white px-4 text-xs sm:text-sm font-medium transition-all shadow-2xs"
                value={formData.testerName}
                onChange={(e) => setFormData({ ...formData, testerName: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="block text-xs font-bold text-midnight-lagoon">
                Device &amp; Connection
              </Label>
              <Select
                required
                onValueChange={(v: string | null) => setFormData({ ...formData, device: v ?? "" })}
              >
                <SelectTrigger className="h-12 rounded-xl border border-[#EAE4DC] hover:border-[#D5CFC7] bg-[#FCFBF9] focus:bg-white px-4 text-xs sm:text-sm font-medium shadow-2xs">
                  <SelectValue placeholder="Select device & connection..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-[#EAE4DC]">
                  {DEVICE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt} className="h-10 text-xs sm:text-sm font-medium">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="tried"
                className="block text-xs font-bold text-midnight-lagoon"
              >
                What were you trying to plan?
              </Label>
              <Textarea
                id="tried"
                required
                rows={3}
                placeholder="e.g. I was trying to find a dinner spot in VI for 4 people with ₦50k total budget..."
                className="rounded-xl border border-[#EAE4DC] hover:border-[#D5CFC7] focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/15 bg-[#FCFBF9] focus:bg-white p-3.5 text-xs sm:text-sm font-medium transition-all resize-none shadow-2xs"
                value={formData.whatTried}
                onChange={(e) => setFormData({ ...formData, whatTried: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="frustrated"
                className="block text-xs font-bold text-midnight-lagoon"
              >
                What felt unclear, slow, or frustrating?
              </Label>
              <Textarea
                id="frustrated"
                rows={3}
                placeholder="Be as honest and specific as possible..."
                className="rounded-xl border border-[#EAE4DC] hover:border-[#D5CFC7] focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/15 bg-[#FCFBF9] focus:bg-white p-3.5 text-xs sm:text-sm font-medium transition-all resize-none shadow-2xs"
                value={formData.whatFrustrated}
                onChange={(e) => setFormData({ ...formData, whatFrustrated: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="wished"
                className="block text-xs font-bold text-midnight-lagoon"
              >
                What do you wish OyaPlan did automatically?
              </Label>
              <Textarea
                id="wished"
                rows={3}
                placeholder="e.g. Split bills directly on WhatsApp, show corkage fees..."
                className="rounded-xl border border-[#EAE4DC] hover:border-[#D5CFC7] focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/15 bg-[#FCFBF9] focus:bg-white p-3.5 text-xs sm:text-sm font-medium transition-all resize-none shadow-2xs"
                value={formData.whatWished}
                onChange={(e) => setFormData({ ...formData, whatWished: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Submit-a-spot Community Section */}
        <div className="p-6 sm:p-8 bg-[#FAF7F2] rounded-[24px] border border-[#EAE4DC] space-y-6 shadow-2xs">
          <div className="space-y-1 border-b border-[#EAE4DC] pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#008751]" />
              <h3 className="text-sm font-black text-midnight-lagoon">
                Know a spot we&apos;re missing?
              </h3>
            </div>
            <p className="text-xs text-text-secondary">
              Help us make Lagos outings easier to plan. Add any unlisted restaurant, lounge, or activity hub.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="spotName"
                className="block text-xs font-bold text-midnight-lagoon"
              >
                Spot Name
              </Label>
              <Input
                id="spotName"
                placeholder="e.g. The Harvest, Woks & Koi"
                className="h-12 rounded-xl border border-[#EAE4DC] hover:border-[#D5CFC7] focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/15 bg-white px-4 text-xs sm:text-sm font-medium transition-all shadow-2xs"
                value={formData.spotName}
                onChange={(e) => setFormData({ ...formData, spotName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="block text-xs font-bold text-midnight-lagoon flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#008751]" />
                  <span>Area / Neighborhood</span>
                </Label>
                <Select onValueChange={(v: string | null) => setFormData({ ...formData, spotArea: v ?? "" })}>
                  <SelectTrigger className="h-12 rounded-xl border border-[#EAE4DC] hover:border-[#D5CFC7] bg-white px-4 text-xs sm:text-sm font-medium shadow-2xs">
                    <SelectValue placeholder="Select area..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-[#EAE4DC]">
                    {areas.map((a) => (
                      <SelectItem key={a.id} value={a.name} className="text-xs sm:text-sm font-medium">
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="block text-xs font-bold text-midnight-lagoon flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-[#008751]" />
                  <span>Estimated Price / Person</span>
                </Label>
                <Select onValueChange={(v: string | null) => setFormData({ ...formData, spotPrice: v ?? "" })}>
                  <SelectTrigger className="h-12 rounded-xl border border-[#EAE4DC] hover:border-[#D5CFC7] bg-white px-4 text-xs sm:text-sm font-medium shadow-2xs">
                    <SelectValue placeholder="Select spend tier..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-[#EAE4DC]">
                    {PRICE_TIERS.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs sm:text-sm font-medium">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="whatsapp"
                className="block text-xs font-bold text-midnight-lagoon flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-[#008751]" />
                <span>Your WhatsApp (Optional)</span>
              </Label>
              <Input
                id="whatsapp"
                placeholder="e.g. +234 801 234 5678"
                className="h-12 rounded-xl border border-[#EAE4DC] hover:border-[#D5CFC7] focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/15 bg-white px-4 text-xs sm:text-sm font-medium transition-all shadow-2xs"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              />
              <p className="text-[11px] text-text-muted">
                Only if you&apos;d like us to confirm when the venue is audited and live.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-xs font-bold text-center animate-in fade-in">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#008751] hover:bg-[#007043] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer tap-feedback"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Feedback"}
        </Button>
      </form>
    </div>
  );
}
