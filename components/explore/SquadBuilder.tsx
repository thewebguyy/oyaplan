"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SquadBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSquad = searchParams.get("squad") ? parseInt(searchParams.get("squad") || "1") : 2;

  const handleSelectSquad = (size: number) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("squad", size.toString());
    router.replace(`/explore?${nextParams.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-3">
      <h3 className="type-ui-label text-text-primary text-[10px] font-black uppercase tracking-widest text-center">
        Squad Count: {currentSquad} {currentSquad === 1 ? "Person" : "People"}
      </h3>
      <div className="flex justify-center gap-1.5 flex-wrap max-w-sm mx-auto">
        {Array.from({ length: 10 }).map((_, i) => {
          const index = i + 1;
          const isActive = index <= currentSquad;

          return (
            <button
              key={index}
              onClick={() => handleSelectSquad(index)}
              className="p-1 tap-feedback focus:outline-none cursor-pointer"
              title={`Squad size ${index}`}
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-7 h-7"
                style={{
                  fill: isActive ? "#F6C642" : "#0A0A0A",
                  transition: "none" // Instant color fill
                }}
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M12 13c-4.4 0-8 3-8 7v1h16v-1c0-4-3.6-7-8-7z" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
