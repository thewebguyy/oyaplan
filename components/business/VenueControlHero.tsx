'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Venue } from '@/lib/types';
import { ShieldCheck, Clock, ExternalLink, ArrowRight, Tag, Settings, MapPin, Award } from 'lucide-react';

interface VenueControlHeroProps {
  venue: Venue;
}

export function VenueControlHero({ venue }: VenueControlHeroProps) {
  const isVerified = venue.partner_state === 'verified_partner';
  const isPending = venue.partner_state === 'verification_pending' || venue.partner_state === 'claim_pending';
  const plaqueCode = `PLAQUE-${venue.id.slice(0, 8).toUpperCase()}`;

  const districtName = venue.districts?.name || 'Lagos';
  const coverPhoto = venue.cover_url || (venue.gallery_urls && venue.gallery_urls[0]) || '/images/default-venue.jpg';

  return (
    <div className="relative rounded-[28px] bg-[#111111] text-[#F7F5EE] border border-[#222222] overflow-hidden shadow-md">
      {/* Subtle Road-Line Texture / Architectural Grain */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(rgba(246, 198, 66, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
        {/* Venue Photographic Anchor */}
        <div className="relative w-full lg:w-72 h-48 sm:h-56 lg:h-auto rounded-[20px] overflow-hidden shrink-0 border border-white/10 bg-[#1A1A1A]">
          <Image
            src={coverPhoto}
            alt={venue.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 300px"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Category & Serial Pill */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[#F6C642] uppercase font-bold border border-white/10">
              {venue.category}
            </span>
            <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white/80 font-bold border border-white/10 select-all">
              {plaqueCode}
            </span>
          </div>
        </div>

        {/* Control Room Core Information */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            {/* Top Designation Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest text-[#F6C642] uppercase bg-[#F6C642]/10 border border-[#F6C642]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F6C642] animate-pulse" />
                OPERATOR&apos;S DESK
              </span>

              <span className="text-white/30 font-mono text-xs">·</span>

              <div className="inline-flex items-center gap-1 text-xs text-white/70 font-mono">
                <MapPin className="w-3 h-3 text-[#008751]" />
                <span>{districtName}, Lagos</span>
              </div>
            </div>

            {/* Venue Name & Status */}
            <div className="pt-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight text-white leading-tight">
                {venue.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/60 font-sans mt-1 line-clamp-2 max-w-2xl">
                {venue.address || 'Lagos, Nigeria'}
              </p>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 pt-2">
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#008751]/20 text-[#34D399] border border-[#008751]/40">
                  <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                  <span>● VERIFIED OPERATING PRESENCE</span>
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F6C642]/15 text-[#F6C642] border border-[#F6C642]/40">
                  <Clock className="w-4 h-4" />
                  <span>● VERIFICATION IN PROGRESS</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white/80 border border-white/15">
                  <span>● CLAIMED PRESENCE</span>
                </span>
              )}

              {venue.is_temporarily_closed && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  TEMPORARILY CLOSED
                </span>
              )}
            </div>
          </div>

          {/* Quick Control Room CTAs */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            <Link
              href={`/venue/${venue.id}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F6C642] text-[#111111] text-xs font-mono font-bold transition-all shadow-xs tap-feedback cursor-pointer"
            >
              <span>What Customers See</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href={`/business/${venue.id}/pricing`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2e2e2e] text-white text-xs font-mono font-bold border border-white/15 transition-all tap-feedback cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-[#F6C642]" />
              <span>Update Pricing &amp; Menu</span>
            </Link>

            <Link
              href={`/business/${venue.id}/venue`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#222222] hover:bg-[#2e2e2e] text-white text-xs font-mono font-bold border border-white/15 transition-all tap-feedback cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#008751]" />
              <span>Manage Public Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
