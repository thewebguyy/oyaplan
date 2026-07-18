"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Link as LinkIcon, Loader2, Check } from "lucide-react";
import { Plan, ForgeInput } from "@/lib/types";
import { createShareablePlan } from "@/lib/actions/sharePlan";
import { getReferralCode } from "@/lib/actions/getReferralCode";
import { AnalyticsService } from "@/lib/services/analytics/analyticsService";
import { toast } from 'sonner';

interface WhatsAppCopyButtonProps {
  plan: Plan;
  input: ForgeInput;
  variant?: 'filled' | 'outlined';
}

export default function WhatsAppCopyButton({ plan, input, variant = 'filled' }: WhatsAppCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const ensureShareUrl = async () => {
    if (shareUrl) return shareUrl;
    setSharing(true);
    try {
      const result = await createShareablePlan(plan, input);
      if (result.success && result.id) {
        let url = `https://oyaplan.com/plan/${result.id}`;
        
        // Append referral code if authenticated
        const refCode = await getReferralCode();
        if (refCode) {
          url += `?ref=${refCode}`;
        }
        
        AnalyticsService.track('plan_shared', {
          session_id: '00000000-0000-0000-0000-000000000000',
          properties: {
            category: 'Sharing',
            plan_id: result.id,
            share_method: 'whatsapp',
            version: '1.0'
          }
        });

        setShareUrl(url);
        return url;
      }
      setShareError(true);
      setTimeout(() => setShareError(false), 2000);
      return null;
    } catch {
      setShareError(true);
      setTimeout(() => setShareError(false), 2000);
      return null;
    } finally {
      setSharing(false);
    }
  };

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone/i.test(navigator.userAgent);

  const handleAction = async () => {
    // Physical press effect
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 80);

    const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // iOS Safari blocks window.open() called after an await.
    // Open a blank window synchronously while inside the click handler,
    // then redirect it once the URL is ready.
    let iosWindow: Window | null = null;
    if (isMobile && isIOS) {
      iosWindow = window.open('', '_blank');
    }

    const url = await ensureShareUrl();
    if (!url) {
      if (iosWindow) iosWindow.close();
      toast.error("Couldn't prepare your plan link. Please try again.");
      return;
    }
    const perPersonCost = Math.round(plan.totalCost / input.squadSize);
    
    const text = `🥂 *The Plan: ${plan.spot.name}* 

*The Vibe:* ${input.vibe}
*Estimated Spend:* ₦${perPersonCost.toLocaleString()} per person

*Why we should go:* 
${plan.whyItFits}
Prices are verified, so no unexpected billing.

*What's covered in the ₦${perPersonCost.toLocaleString()}:*
Food, drinks, taxes, and round-trip transport. 

Check the full breakdown and let's lock it in: 
${url}`;

    if (isMobile) {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      if (isIOS && iosWindow) {
        iosWindow.location.href = waUrl;
      } else {
        window.open(waUrl, "_blank");
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareLink = async () => {
    const url = await ensureShareUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };


  return (
    <div className="flex flex-col gap-2 w-full">
      <Button 
        onClick={handleAction}
        disabled={sharing}
        style={{ 
          transform: isPressed ? 'scale(0.96)' : 'scale(1)',
          transition: isPressed ? 'transform 80ms ease-out' : 'transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
        className={`w-full type-subheading flex items-center justify-center gap-2 h-[52px] rounded-[10px] tap-feedback border-2 whatsapp-confirm ${
          copied 
            ? "bg-brand-green border-brand-green text-white" 
            : variant === 'filled'
              ? "bg-[#25D366] border-[#25D366] text-white hover:bg-[#128C7E] hover:border-[#128C7E]"
              : "bg-white border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5"
        }`}
      >
        {sharing ? (
          <Loader2 className="w-[18px] h-[18px] animate-spin" />
        ) : copied ? (
          <Check className="w-[18px] h-[18px]" />
        ) : (
          <MessageSquare className="w-[18px] h-[18px]" />
        )}
        {copied ? (
          "Copied! Paste in chat ✓"
        ) : isMobile ? (
          "Send via WhatsApp"
        ) : (
          "Copy for WhatsApp"
        )}
      </Button>
      
      <Button
        onClick={handleShareLink}
        disabled={sharing}
        className="w-full bg-surface-grey hover:bg-border-default text-text-secondary type-body flex items-center justify-center gap-2 h-[44px] transition-colors rounded-[10px] border-none tap-feedback"
      >
        {sharing ? (
          <Loader2 className="w-4 h-4 animate-spin text-brand-green" />
        ) : (
          <LinkIcon className="w-4 h-4 text-text-muted" />
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

