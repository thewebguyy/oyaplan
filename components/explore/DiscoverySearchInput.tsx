"use client";

import React, { useRef } from "react";
import { Search, X } from "lucide-react";

interface DiscoverySearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function DiscoverySearchInput({
  value,
  onChange,
  placeholder = "Search venue, area, vibe, or food...",
  className = "",
  autoFocus = false,
}: DiscoverySearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <div 
      role="search" 
      className={`relative flex items-center w-full bg-white rounded-2xl border-2 border-[#111111] shadow-[3px_3px_0px_rgba(1,5,40,0.08)] hover:shadow-[4px_4px_0px_#111111] focus-within:border-[#008751] focus-within:shadow-[4px_4px_0px_#008751] transition-all duration-200 ${className}`}
    >
      <div className="pl-4 pr-2 flex items-center justify-center text-[#111111]/60 shrink-0 pointer-events-none">
        <Search className="w-5 h-5 text-[#111111]" aria-hidden="true" />
      </div>

      <input
        ref={inputRef}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Search venues in Lagos"
        className="w-full py-3.5 pr-10 text-xs sm:text-sm font-mono font-medium text-[#111111] placeholder:text-[#111111]/40 bg-transparent border-none outline-none focus:ring-0 truncate"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search input"
          className="absolute right-3 p-1.5 rounded-lg text-[#111111]/50 hover:text-[#111111] hover:bg-[#FAF8F8] border border-transparent hover:border-[#111111]/20 transition-all tap-feedback cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

