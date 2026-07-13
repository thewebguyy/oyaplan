"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function VibeIsland() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeVibe = searchParams.get("vibe") || "chill";
  const currentSquad = searchParams.get("squad") ? parseInt(searchParams.get("squad") || "1") : 2;

  const VIBES = ["chill", "party", "date-night", "brunch"];
  
  const cycleVibe = () => {
    const nextIndex = (VIBES.indexOf(activeVibe) + 1) % VIBES.length;
    const nextVibe = VIBES[nextIndex];
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("vibe", nextVibe);
    router.replace(`/explore?${nextParams.toString()}`, { scroll: false });
  };

  const cycleSquad = () => {
    let nextSquad = currentSquad + 1;
    if (nextSquad > 10) nextSquad = 1;
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("squad", nextSquad.toString());
    router.replace(`/explore?${nextParams.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto w-fit bg-white/50 backdrop-blur-xl border-4 border-black rounded-[24px] px-4 sm:px-6 py-4 shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-wrap justify-center items-center gap-x-2 gap-y-3 font-sans font-black text-xl sm:text-2xl uppercase tracking-tighter text-black">
      <span>I want to</span>
      <button 
        onClick={cycleVibe} 
        className="bg-brand-green text-white px-3 sm:px-4 py-1 rounded-[12px] border-2 border-black rotate-[-3deg] hover:rotate-[2deg] hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0_rgba(0,0,0,1)] tap-feedback"
      >
        {activeVibe.replace("-", " ")}
      </button>
      <span>with</span>
      <button 
        onClick={cycleSquad} 
        className="bg-chow-yellow-100 text-black px-3 sm:px-4 py-1 rounded-[12px] border-2 border-black rotate-[3deg] hover:rotate-[-2deg] hover:scale-105 active:scale-95 transition-all shadow-[2px_2px_0_rgba(0,0,0,1)] tap-feedback"
      >
        {currentSquad === 1 ? "Just Me" : `${currentSquad} Peeps`}
      </button>
    </div>
  );
}
