'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Spot } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';
import { searchVenuesForClaimAction, ClaimSearchVenueResult } from '@/lib/actions/venueClaimActions';
import {
  Search,
  Building2,
  MapPin,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Link2,
  ShieldCheck,
  Clock,
  Loader2,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export interface VenueSearchItem {
  id: string;
  slug?: string;
  name: string;
  category?: string;
  address?: string;
  partner_state?: string;
  district_name?: string;
  cover_url?: string;
  logo_url?: string;
  gallery_urls?: string[];
}

interface ClaimSearchClientProps {
  initialVenues?: VenueSearchItem[];
  initialSpots?: Spot[];
}

function getVenueMonogram(name: string): string {
  const clean = name.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  return clean.slice(0, 1).toUpperCase();
}

export function ClaimSearchClient({ initialVenues, initialSpots }: ClaimSearchClientProps) {
  const searchParams = useSearchParams();
  const isFirstTime = searchParams?.get('firstTime') === 'true';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [liveResults, setLiveResults] = useState<ClaimSearchVenueResult[] | null>(null);
  const [monthlyBookingVol, setMonthlyBookingVol] = useState<number>(1000000);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Unify venues or spots into standardized initial list
  const allVenues: VenueSearchItem[] = useMemo(() => {
    if (initialVenues && initialVenues.length > 0) {
      return initialVenues;
    }
    if (initialSpots && initialSpots.length > 0) {
      return initialSpots.map((s: Spot) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        address: s.address,
        district_name: s.areas?.name,
        partner_state: 'unclaimed',
        cover_url: s.cover_url || s.image_url,
      }));
    }
    return [];
  }, [initialVenues, initialSpots]);

  // Real-time server query against venues table
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setLiveResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchVenuesForClaimAction(trimmed);
        setLiveResults(results);
      } catch (err) {
        console.error('Error during real-time venue search:', err);
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Combined results: prioritize live database search, fallback to local memo
  const displayVenues = useMemo(() => {
    if (!searchQuery.trim()) {
      return allVenues.slice(0, 16);
    }

    if (liveResults !== null) {
      return liveResults;
    }

    const q = searchQuery.toLowerCase().trim();
    return allVenues
      .filter((v: VenueSearchItem) => {
        const matchName = v.name.toLowerCase().includes(q);
        const matchArea =
          v.address?.toLowerCase().includes(q) ||
          v.district_name?.toLowerCase().includes(q);
        const matchCat = v.category?.toLowerCase().includes(q);
        return matchName || matchArea || matchCat;
      })
      .slice(0, 30);
  }, [searchQuery, liveResults, allVenues]);

  const addVenueWaUrl = getBusinessWhatsAppUrl('add_venue', { query: searchQuery.trim() });
  const generalClaimWaUrl = getBusinessWhatsAppUrl('claim_support');

  // Direct deposit savings math: 15% typical aggregator commission vs ₦0 on OyaPlan
  const typicalAggregatorFee = Math.round(monthlyBookingVol * 0.15);

  return (
    <div className="space-y-8 max-w-3xl mx-auto font-sans text-[#F8F9FA]">
      {/* First-time welcoming state */}
      {isFirstTime && (
        <div className="p-4 bg-[#121418] border border-[#00E575]/40 rounded-2xl flex items-start gap-3 text-white text-xs leading-relaxed animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-[#00E575] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block text-sm">
              Authenticated. Find your venue to take the floor.
            </span>
            <p className="mt-0.5 text-white/60">
              Select your venue below to connect your host account and broadcast live demand, bottle menus, and table reservations directly to Lagos squads.
            </p>
          </div>
        </div>
      )}

      {/* The Live Frequency Search Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121418] border border-[#232732] text-[#00E575] text-xs font-mono font-bold uppercase tracking-wider shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-pulse" />
          <span>The Pulse • Find Your Venue</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Who&apos;s on the Floor?
        </h1>
        <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-xl">
          Locate your spot across Victoria Island, Ikoyi, Lekki, or Ikeja. Take the room, broadcast tonight&apos;s vibe, and capture squad outings with direct deposits and ₦0 commission.
        </p>

        {/* Live Step Progression */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-mono font-bold text-white/40 overflow-x-auto py-2.5 border-y border-[#232732] scrollbar-none">
          <span className="text-[#00E575] flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E575]" />
            <span>01 Find Venue</span>
          </span>
          <span className="text-[#232732]">→</span>
          <span className="shrink-0 text-white/70">02 Verify Host Stand</span>
          <span className="text-[#232732]">→</span>
          <span className="shrink-0 text-white/70">03 Push Live Offerings</span>
          <span className="text-[#232732]">→</span>
          <span className="shrink-0 text-white/70">04 Run Tonight</span>
        </div>
      </div>

      {/* Live Lagos Demand Alert */}
      <div className="p-4 rounded-2xl bg-[#121418] border border-[#232732] flex items-center gap-3 text-xs font-mono text-white/80">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00E575] animate-ping shrink-0" />
        <div>
          <span className="text-white font-bold">Live Lagos Nightlife Demand: </span>
          <span className="text-white/70">Squads are budgeting weekend outings right now. Confirm your presence to capture direct bookings before Friday night.</span>
        </div>
      </div>

      {/* Direct WhatsApp Host Link Callout */}
      <div className="p-4 bg-[#121418] border border-[#232732] rounded-2xl flex items-start gap-3 text-white/70 text-xs leading-relaxed">
        <Link2 className="w-4 h-4 text-[#00E575] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Have a direct VIP host link?</span> If OyaPlan sent your management team a direct liaison link on WhatsApp, tap it to open your verified venue console instantly.
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          placeholder="Search venue name (e.g. The House, Circa, Cactus, Landmark, W Sarafina)..."
          className="w-full h-14 pl-11 pr-11 bg-[#121418] border border-[#232732] rounded-2xl text-sm font-medium text-white placeholder:text-white/40 focus:outline-none focus:border-[#00E575] shadow-lg transition-all font-sans"
        />
        {isSearching && (
          <Loader2 className="w-4 h-4 text-[#00E575] animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* Results Grid: Rich Visual Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-white/50 px-1">
          <span className="font-mono font-bold uppercase tracking-wider text-[11px]">
            {searchQuery.trim() ? `Search Results (${displayVenues.length})` : 'Popular Venues on the Floor in Lagos'}
          </span>
          {isSearching && (
            <span className="text-[10px] font-mono font-bold text-[#00E575] flex items-center gap-1">
              <span>Searching live database...</span>
            </span>
          )}
        </div>

        {displayVenues.length === 0 ? (
          <div className="bg-[#121418] rounded-2xl border border-[#232732] p-8 text-center space-y-3 shadow-xl">
            <Building2 className="w-8 h-8 text-white/30 mx-auto stroke-[1.5]" />
            <h3 className="font-bold text-sm text-white uppercase font-display">Can&apos;t find your venue on the floor?</h3>
            <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
              We may not have listed your spot yet. Message our host liaison on WhatsApp and we will set up your live frequency promptly.
            </p>
            {addVenueWaUrl ? (
              <a
                href={addVenueWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-11 px-5 bg-[#008751] hover:bg-[#007043] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer tap-feedback"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Host Stand on WhatsApp</span>
              </a>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {displayVenues.map((venue: VenueSearchItem) => {
              const isVerified = venue.partner_state === 'verified_partner';
              const isPending = venue.partner_state === 'verification_pending';
              const monogram = getVenueMonogram(venue.name);
              const imageUrl = venue.cover_url || venue.logo_url;

              return (
                <Link
                  key={venue.id}
                  href={`/venue/${venue.id}/claim`}
                  className="group bg-[#121418] hover:bg-[#181B22] border border-[#232732] hover:border-[#00E575]/50 rounded-2xl overflow-hidden shadow-lg transition-all tap-feedback flex flex-col justify-between"
                >
                  {/* Visual Header / Cover Image */}
                  <div className="h-32 w-full relative bg-gradient-to-br from-[#1E2330] via-[#141720] to-[#0A0C10] overflow-hidden">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={venue.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 360px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-between p-4 bg-gradient-to-r from-emerald-950/30 to-black/60">
                        <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 text-[#00E575] font-mono font-black text-lg flex items-center justify-center shadow-lg">
                          {monogram}
                        </div>
                        <Flame className="w-6 h-6 text-white/20" />
                      </div>
                    )}

                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-transparent to-black/40 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 z-10">
                      {venue.category ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white/90 border border-white/15">
                          {venue.category}
                        </span>
                      ) : <span />}

                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#008751]/90 text-white backdrop-blur-md shadow-xs">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Live Partner</span>
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/80 text-white backdrop-blur-md">
                          <Clock className="w-3 h-3" />
                          <span>Review Pending</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 backdrop-blur-md text-white/70 border border-white/15">
                          <span>Unclaimed</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h2 className="font-serif font-black text-base text-white group-hover:text-[#00E575] transition-colors line-clamp-1">
                        {venue.name}
                      </h2>
                      <div className="flex items-center gap-1 text-xs text-white/60 font-mono truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#00E575] shrink-0" />
                        <span className="truncate">{venue.address || venue.district_name || 'Lagos'}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-[#232732] flex items-center justify-between text-xs font-mono font-bold">
                      <span className="text-[11px] text-white/50">Direct Payouts</span>
                      <span className="inline-flex items-center gap-1 text-[#00E575] group-hover:translate-x-0.5 transition-transform">
                        <span>{isVerified ? 'Enter Console' : 'Take The Floor'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Direct Deposit vs Aggregator Cut (Keep 100% of Squad Spend) */}
      <div className="p-6 bg-[#121418] rounded-3xl border border-[#232732] space-y-5 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E575]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00E575]">
                DIRECT DEPOSIT GUARANTEE
              </span>
            </div>
            <h3 className="font-serif font-black text-xl text-white mt-1">
              ₦0 Commission vs. 15% Aggregator Fees
            </h3>
          </div>
          <span className="text-xl font-mono font-black text-[#00E575] tabular-nums">
            ₦{typicalAggregatorFee.toLocaleString('en-NG')} saved monthly
          </span>
        </div>

        <p className="text-xs text-white/60 leading-relaxed">
          Aggregators take 15% of your food, cocktail, and table revenue. OyaPlan charges ₦0 commission. Squad booking deposits flow directly into your Nigerian bank account via Paystack/Monnify.
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-white/60">
            <span>Estimated Monthly Squad Outing Volume:</span>
            <span className="text-white font-bold">₦{monthlyBookingVol.toLocaleString('en-NG')}</span>
          </div>
          <input
            type="range"
            min="200000"
            max="5000000"
            step="100000"
            value={monthlyBookingVol}
            onChange={(e) => setMonthlyBookingVol(Number(e.target.value))}
            className="w-full h-2 bg-[#232732] rounded-lg appearance-none cursor-pointer accent-[#00E575]"
            aria-label="Monthly squad volume slider"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
          <div className="p-4 bg-black/40 rounded-2xl border border-[#008751]/30">
            <span className="text-[10px] text-white/50 uppercase block">OyaPlan Venue Model</span>
            <span className="text-lg font-black text-[#00E575] block mt-0.5">0% Commission</span>
            <span className="text-[11px] text-white/70 mt-1 block leading-normal">
              ₦0 deductions. Customers pay your venue directly.
            </span>
          </div>
          <div className="p-4 bg-black/40 rounded-2xl border border-red-500/20">
            <span className="text-[10px] text-white/50 uppercase block">Typical Delivery / Booking App</span>
            <span className="text-lg font-black text-red-400 block mt-0.5">
              -₦{typicalAggregatorFee.toLocaleString('en-NG')} lost
            </span>
            <span className="text-[11px] text-white/60 mt-1 block leading-normal">
              Standard 15% cut shaved off every customer tab.
            </span>
          </div>
        </div>
      </div>

      {/* Host Concierge WhatsApp Support */}
      <div className="p-6 bg-[#121418] rounded-3xl border border-[#232732] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#00E575] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#00E575]" />
            <span>Host Stand Fast-Track</span>
          </div>
          <h4 className="font-bold text-base text-white">Can&apos;t find your venue on the floor?</h4>
          <p className="text-xs text-white/60 max-w-md">
            Our Lagos hospitality team will verify and activate your venue frequency within 24 hours.
          </p>
        </div>
        {generalClaimWaUrl && (
          <a
            href={generalClaimWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 h-11 px-5 bg-[#008751] hover:bg-[#007043] text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-colors cursor-pointer tap-feedback"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span>Direct WhatsApp Stand</span>
          </a>
        )}
      </div>
    </div>
  );
}
