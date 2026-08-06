"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { completeBetaOnboarding } from "@/lib/actions/completeBetaOnboarding";
import { toast } from "sonner";

export function BetaWelcomeClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    startTransition(async () => {
      try {
        const res = await completeBetaOnboarding();
        if (res.success) {
          toast.success("Welcome aboard! Let's plan your first outing.");
          router.push("/");
          router.refresh();
        } else {
          // If unauthenticated or error, still allow proceeding to plan
          router.push("/");
        }
      } catch (e) {
        router.push("/");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleContinue}
      disabled={isPending}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-base rounded-[16px] shadow-md transition-all tap-feedback cursor-pointer disabled:opacity-70"
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Setting up your passport...</span>
        </>
      ) : (
        <>
          <span>Start Planning Your First Outing</span>
          <ArrowRight className="w-5 h-5" />
        </>
      )}
    </button>
  );
}

export default BetaWelcomeClient;
