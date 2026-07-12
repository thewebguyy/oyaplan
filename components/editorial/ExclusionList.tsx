"use client";

import { useState } from "react";
import { ExclusionEvaluation } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ExclusionList({ exclusions }: { exclusions?: ExclusionEvaluation[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!exclusions || exclusions.length === 0) return null;

  return (
    <div className="pt-6 border-t border-border-default space-y-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group tap-feedback"
      >
        <p className="type-caption text-text-muted uppercase tracking-wider font-[700] group-hover:text-text-secondary transition-colors">
          Why not another venue?
        </p>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          {exclusions.map((exclusion, i) => (
            <div key={i} className="space-y-1 pb-4 border-b border-border-default/50 last:border-0 last:pb-0">
              <span className="type-label text-text-primary block">{exclusion.spotName}</span>
              <span className="type-caption text-text-secondary block">{exclusion.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
