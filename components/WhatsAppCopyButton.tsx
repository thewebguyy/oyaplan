"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Link as LinkIcon, Loader2, Check } from "lucide-react";
import { Plan, ForgeInput } from "@/lib/types";
import { createShareablePlan } from "@/lib/actions/sharePlan";
import { getReferralCode } from "@/lib/actions/getReferralCode";
import { trackEvent } from "@/lib/analytics/trackClient";
import { toast } from 'sonner';
import { triggerMoment } from "@/components/ui/moment-of-delight";

interface WhatsAppCopyButtonProps {
  plan: Plan;
  input: ForgeInput;
  variant?: 'filled' | 'outlined';
  squadName?: string;
}

export default function WhatsAppCopyButton({ plan, input, variant = 'filled', squadName }: WhatsAppCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const ensureShareUrl = async (): Promise<string | null> => {
    if (shareUrl) return shareUrl;

    setSharing(true);
    try {
      const result = await createShareablePlan(plan, input);
      if (result.success && result.id) {
        const origin = typeof window !== 'undefined' 
          ? window.location.origin 
          : (process.env.NEXT_PUBLIC_APP_URL || 'https://oyaplan.app');
        let url = `${origin}/plan/${result.id}`;
        
        // Append referral code if authenticated
        const refCode = await getReferralCode();
        if (refCode) {
          url += `?ref=${refCode}`;
        }
        
        trackEvent('plan_shared', {
          category: 'Sharing',
          plan_id: result.id,
          share_method: 'whatsapp',
          version: '1.0'
        });

        if (input.groupId) {
          trackEvent('group_plan_shared', {
            category: 'Planning',
            group_id: input.groupId,
            shared_plan_id: result.id,
            version: '1.0',
          });
        }

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
      toast.error("We couldn't load this right now. Try again.");
      return;
    }
    const perPersonCost = Math.round(plan.totalCost / input.squadSize);
    const text = `Found the spot.\n\n${plan.spot.name}\n\n• Squad: ${input.squadSize} people\n• Total Outing Cost: ~₦${perPersonCost.toLocaleString("en-NG")} each (~₦${plan.totalCost.toLocaleString("en-NG")} total)\n• Verified food, drinks & round-trip rides accounted for.\n\nWe moving?\n\n${url}`;

    if (isMobile) {
      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      triggerMoment("plan_shared");
      if (isIOS && iosWindow) {
        iosWindow.location.href = waUrl;
      } else {
        window.open(waUrl, "_blank");
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied ✓ Go win the group chat.');
      triggerMoment("plan_shared");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareLink = async () => {
    const url = await ensureShareUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success('Copied ✓ Now send it before someone suggests somewhere else.');
      triggerMoment("plan_shared");
      setTimeout(() => setLinkCopied(false), 2500);
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
            ? "bg-[#111111] border-[#111111] text-[#F9E828]" 
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
          "Copied! Paste in chat"
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

