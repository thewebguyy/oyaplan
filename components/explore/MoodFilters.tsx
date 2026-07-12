"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Moon, Sun, Zap } from "lucide-react";

const MOODS = [
  { label: "Intimate / Dim", value: "date-night", icon: Moon },
  { label: "Daylight / Sun", value: "brunch", icon: Sun },
  { label: "High Energy", value: "party", icon: Zap }
];

export default function MoodFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeVibe = searchParams.get("vibe") || "";

  const handleSelectVibe = (val: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (activeVibe === val) {
      nextParams.delete("vibe");
    } else {
      nextParams.set("vibe", val);
    }
    router.replace(`/explore?${nextParams.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-3">
      <h3 className="type-ui-label text-text-primary text-[10px] font-black uppercase tracking-widest text-center">
        Outing Mood
      </h3>
      <div className="flex justify-center gap-3">
        {MOODS.map((mood) => {
          const Icon = mood.icon;
          const isActive = activeVibe === mood.value;

          return (
            <button
              key={mood.value}
              onClick={() => handleSelectVibe(mood.value)}
              className={`flex items-center gap-2 px-4 py-2 border-2 border-black rounded-[8px] type-ui-label text-xs uppercase font-extrabold cursor-pointer tap-feedback ${
                isActive 
                  ? "bg-black text-white" 
                  : "bg-white text-black hover:bg-black hover:text-white"
              }`}
              style={{ transition: "none" }}
              title={mood.label}
            >
              <Icon className="w-4 h-4" />
              <span>{mood.value.replace("-", " ")}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
