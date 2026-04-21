"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Link as LinkIcon, Loader2 } from "lucide-react";
import { Plan, ForgeInput } from "@/lib/types";
import { createShareablePlan } from "@/lib/actions/sharePlan";

interface WhatsAppCopyButtonProps {
  plan: Plan;
  input: ForgeInput;
}

export default function WhatsAppCopyButton({ plan, input }: WhatsAppCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const ensureShareUrl = async () => {
    if (shareUrl) return shareUrl;
    setSharing(true);
    try {
      const uuid = await createShareablePlan(plan, input);
      if (uuid) {
        const url = `https://oyaplan.com/plan/${uuid}`;
        setShareUrl(url);
        return url;
      }
      setShareError(true);
      setTimeout(() => setShareError(false), 2000);
      return null;
    } catch (e) {
      setShareError(true);
      setTimeout(() => setShareError(false), 2000);
      return null;
    } finally {
      setSharing(false);
    }
  };

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone/i.test(navigator.userAgent);

  const handleAction = async () => {
    const url = await ensureShareUrl();
    const text = `*OyaPlan: The Squad Outing Plan* 🇳🇬

📍 *Spot:* ${plan.spot.name}
🗺️ *Address:* ${plan.spot.address}

💰 *Estimated Costs:*
- ${plan.spot.has_food !== false ? "Food/Drinks" : "Entry/Activity"}: ₦${plan.foodCost.toLocaleString()}
- Transport: ₦${plan.transportCost.toLocaleString()}
- *Total Landed Cost: ₦${plan.totalCost.toLocaleString()}*

💡 *Why it fits:*
${plan.whyItFits}

View full plan: ${url || "https://oyaplan.com"}`;

    if (isMobile) {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLink = async () => {
    const url = await ensureShareUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button 
        onClick={handleAction}
        disabled={sharing}
        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black flex items-center justify-center gap-2 h-[52px] transition-all rounded-xl shadow-md active:scale-[0.98]"
      >
        {sharing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <MessageSquare className="w-5 h-5" />
        )}
        {copied ? (
          "Copied! Paste in group chat ✓"
        ) : isMobile ? (
          "Send via WhatsApp"
        ) : (
          "Copy Plan for WhatsApp"
        )}
      </Button>
      
      <Button
        onClick={handleShareLink}
        disabled={sharing}
        variant="outline"
        className="w-full border-gray-200 text-gray-600 font-bold flex items-center justify-center gap-2 h-[48px] transition-all rounded-xl active:scale-[0.98]"
      >
        {sharing ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#008751]" />
        ) : (
          <LinkIcon className="w-4 h-4 text-[#008751]" />
        )}
        {linkCopied ? (
          "Link copied!"
        ) : shareError ? (
          "Try again"
        ) : (
          "Share Link"
        )}
      </Button>
    </div>
  );
}
