'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface VenueImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fallbackCategory?: string;
}

export function VenueImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px',
  fallbackCategory
}: VenueImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cleanSrc = src?.trim();

  // Reset error state when image source changes
  React.useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [cleanSrc]);

  const shouldRenderImage = Boolean(cleanSrc && !hasError);

  if (!shouldRenderImage || !cleanSrc) {
    return (
      <div 
        className={`w-full h-full bg-[#F4F1EB] flex flex-col items-center justify-center relative overflow-hidden select-none ${className}`}
        aria-label={`${alt} placeholder`}
      >
        {/* Subtle Lagos architectural skyline watermark */}
        <svg 
          width="240" 
          height="70" 
          viewBox="0 0 240 70" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="opacity-20 absolute bottom-2"
        >
          <rect x="15" y="30" width="16" height="40" rx="1" stroke="#008751" strokeWidth="1.5"/>
          <rect x="13" y="20" width="20" height="12" rx="1" stroke="#008751" strokeWidth="1.5"/>
          <rect x="42" y="22" width="26" height="48" rx="1" stroke="#008751" strokeWidth="1.5"/>
          <rect x="47" y="14" width="16" height="10" rx="1" stroke="#008751" strokeWidth="1.5"/>
          <rect x="78" y="36" width="12" height="34" rx="1" stroke="#008751" strokeWidth="1.5"/>
          <rect x="98" y="15" width="34" height="55" rx="1" stroke="#008751" strokeWidth="1.5"/>
          <rect x="106" y="8" width="18" height="10" rx="1" stroke="#008751" strokeWidth="1.5"/>
          <rect x="111" y="2" width="2" height="8" stroke="#008751" strokeWidth="1"/>
          <rect x="140" y="28" width="22" height="42" rx="1" stroke="#008751" strokeWidth="1.5"/>
          <rect x="170" y="32" width="28" height="38" rx="1" stroke="#008751" strokeWidth="1.5"/>
          <rect x="206" y="18" width="20" height="52" rx="1" stroke="#008751" strokeWidth="1.5"/>
        </svg>

        <div className="z-10 flex flex-col items-center gap-1.5 px-4 text-center">
          <div className="w-10 h-10 rounded-full bg-[#E5E0D8] text-[#008751] flex items-center justify-center shadow-xs">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B7280]">
            {fallbackCategory || 'Verified Lagos Venue'}
          </span>
          <span className="text-[9px] font-bold text-[#9CA3AF] tracking-wide">
            Pricing Verified
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${isLoading ? 'bg-[#F0EDE8] animate-pulse' : ''}`}>
      <Image
        src={cleanSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        unoptimized={cleanSrc.startsWith('http')}
        className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
export default VenueImage;
