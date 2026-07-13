"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePlanTransport } from "@/app/plan/[id]/actions";
import { Car, Loader2 } from "lucide-react";

interface TransportToggleProps {
  planId: string;
  hasCar: boolean;
}

export function TransportToggle({ planId, hasCar }: TransportToggleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFlipping, setIsFlipping] = useState(false);

  const handleToggle = async () => {
    setIsFlipping(true);
    const newHasCar = !hasCar;
    const result = await togglePlanTransport(planId, newHasCar);
    
    if (result.success && result.id) {
      if (result.id === planId) {
        // State unchanged or same ID returned
        setIsFlipping(false);
      } else {
        startTransition(() => {
          router.replace(`/plan/${result.id}`);
        });
      }
    } else {
      setIsFlipping(false);
      // In a real app we might show a toast error here
    }
  };

  const isLoading = isPending || isFlipping;

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors
        ${hasCar 
          ? "bg-black text-white border border-black hover:bg-black/80" 
          : "bg-white text-black border border-black hover:bg-surface-grey"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      aria-pressed={hasCar}
    >
      {isLoading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Car className="w-3 h-3" />
      )}
      {hasCar ? "We have a car" : "We are ordering a ride"}
    </button>
  );
}
