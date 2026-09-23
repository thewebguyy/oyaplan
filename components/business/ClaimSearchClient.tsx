'use client';

import React, { useState, useMemo } from 'react';
import { Spot } from '@/lib/types';
import Link from 'next/link';
import { Search, Building2, MapPin, ArrowRight, MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';

interface ClaimSearchClientProps {
  initialSpots: Spot[];
}

export function ClaimSearchClient({ initialSpots }: ClaimSearchClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSpots = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialSpots.slice(0, 12);
    }
    const q = searchQuery.toLowerCase().trim();
    return initialSpots.filter((s: Spot) => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchArea = s.address?.toLowerCase().includes(q) || s.areas?.name?.toLowerCase().includes(q);
      const matchCat = s.category?.toLowerCase().includes(q);
      return matchName || matchArea || matchCat;
    }).slice(0, 20);
  }, [searchQuery, initialSpots]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Search Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-[#008751] text-xs font-black uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Claim Your Listing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight">
          Find Your Venue on OyaPlan
        </h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          Search for your restaurant, bar, lounge, or activity in Lagos to verify your business details and pricing.
        </p>
      </div>

      {/* Direct Invitation Callout */}
      <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Received an invitation link?</span> If OyaPlan sent you a direct link via WhatsApp or email (e.g. <span className="font-mono font-semibold">/business/claim/[token]</span>), please open that specific link so your listing is instantly matched.
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          placeholder="Search by venue name (e.g. The House, Circa, Cactus, Landmark)..."
          className="w-full h-14 pl-11 pr-4 bg-white border border-border-default rounded-2xl text-sm font-medium text-text-primary focus:outline-none focus:border-brand-green shadow-xs transition-all"
        />
      </div>

      {/* Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-text-muted px-1">
          <span className="font-bold uppercase tracking-wider text-[11px]">
            {searchQuery.trim() ? `Search Results (${filteredSpots.length})` : 'Popular Venues in Lagos'}
          </span>
        </div>

        {filteredSpots.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-default p-8 text-center space-y-3">
            <Building2 className="w-8 h-8 text-text-muted mx-auto stroke-[1.5]" />
            <h3 className="font-bold text-sm text-midnight-lagoon uppercase">Venue not found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              We may not have created an initial listing for your venue yet. Contact our team and we will add your business promptly.
            </p>
            <a
              href={`https://wa.me/2348000000000?text=Hi%20OyaPlan,%20I'd%20like%20to%20add%20my%20venue%20(${encodeURIComponent(searchQuery)})%20to%20OyaPlan`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-11 px-5 bg-[#EAFDF3] text-[#008751] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#d5f9e3] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Add Your Venue via WhatsApp</span>
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white rounded-3xl border border-border-default overflow-hidden shadow-xs">
            {filteredSpots.map((spot: Spot) => (
              <Link
                key={spot.id}
                href={`/venue/${spot.id}/claim`}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#FAFAF8] transition-colors tap-feedback group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-midnight-lagoon group-hover:text-brand-green transition-colors truncate">
                      {spot.name}
                    </h2>
                    {spot.category && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-surface-grey text-text-secondary shrink-0">
                        {spot.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-muted truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{spot.address || spot.areas?.name || 'Lagos'}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-brand-green uppercase tracking-wider">
                  <span className="hidden sm:inline">Claim</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Help Footer */}
      <div className="p-6 bg-surface-grey rounded-2xl border border-border-default/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="font-bold text-xs uppercase text-midnight-lagoon">Don&apos;t see your venue?</h4>
          <p className="text-xs text-text-muted mt-0.5">
            Our team creates listings for Lagos spots daily. Send us a message and we&apos;ll get yours ready.
          </p>
        </div>
        <a
          href="https://wa.me/2348000000000?text=Hi%20OyaPlan,%20I%20manage%20a%20venue%20in%20Lagos%20and%20would%20like%20to%20claim%20my%20listing"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 h-10 px-4 bg-white border border-border-default text-midnight-lagoon font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-2xs"
        >
          <MessageSquare className="w-3.5 h-3.5 text-brand-green" />
          <span>Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
