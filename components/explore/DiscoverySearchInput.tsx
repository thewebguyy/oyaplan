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
      className={`relative flex items-center w-full bg-white rounded-2xl border border-[#EAE4DC] shadow-2xs hover:border-[#008751]/40 focus-within:border-[#008751] focus-within:ring-2 focus-within:ring-[#008751]/15 transition-all duration-200 ${className}`}
    >
      <div className="pl-4 pr-2 flex items-center justify-center text-text-muted shrink-0 pointer-events-none">
        <Search className="w-5 h-5 text-text-muted" aria-hidden="true" />
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
        className="w-full py-3.5 pr-10 text-xs sm:text-sm font-medium text-midnight-lagoon placeholder:text-text-muted bg-transparent border-none outline-none focus:ring-0 truncate"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search input"
          className="absolute right-3 p-1.5 rounded-full text-text-muted hover:text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors tap-feedback cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
