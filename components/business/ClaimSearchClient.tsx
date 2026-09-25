'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Spot } from '@/lib/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';
import { searchVenuesForClaimAction } from '@/lib/actions/venueClaimActions';
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
} from 'lucide-react';

export interface VenueSearchItem {
  id: string;
  slug?: string;
  name: string;
  category?: string;
  address?: string;
  partner_state?: string;
  district_name?: string;
}

interface ClaimSearchClientProps {
  initialVenues?: VenueSearchItem[];
  initialSpots?: Spot[];
}

export function ClaimSearchClient({ initialVenues, initialSpots }: ClaimSearchClientProps) {
  const searchParams = useSearchParams();
  const isFirstTime = searchParams?.get('firstTime') === 'true';

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [liveResults, setLiveResults] = useState<VenueSearchItem[] | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Unify venues or legacy spots into standardized initial list
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
      return allVenues.slice(0, 15);
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

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* First-time welcoming state */}
      {isFirstTime && (
        <div className="p-4 bg-[#EAFDF3] border border-[#A3F3C6] rounded-2xl flex items-start gap-3 text-[#0A7C3F] text-xs leading-relaxed animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-midnight-lagoon block text-sm">
              You&apos;re signed in! Now let&apos;s find your business.
            </span>
            <p className="mt-0.5 text-[#0A7C3F]">
              Search below for your spot so you can connect it to your account and review what Lagos outing planners see.
            </p>
          </div>
        </div>
      )}

      {/* Search Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-[#008751] text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Venue Claim</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight">
          Find your business on OyaPlan
        </h1>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl">
          Find your business, check how it appears on OyaPlan, and take control of the information customers use to plan a visit.
        </p>

        {/* 4 simple steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-left">
          <div className="p-2.5 rounded-xl bg-white border border-border-default/60">
            <span className="text-[10px] font-bold text-brand-green uppercase block">Step 1</span>
            <span className="text-xs font-bold text-midnight-lagoon">Find your spot</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-border-default/60">
            <span className="text-[10px] font-bold text-brand-green uppercase block">Step 2</span>
            <span className="text-xs font-bold text-midnight-lagoon">See customer view</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-border-default/60">
            <span className="text-[10px] font-bold text-brand-green uppercase block">Step 3</span>
            <span className="text-xs font-bold text-midnight-lagoon">Submit claim</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-border-default/60">
            <span className="text-[10px] font-bold text-brand-green uppercase block">Step 4</span>
            <span className="text-xs font-bold text-midnight-lagoon">Control pricing</span>
          </div>
        </div>
      </div>

      {/* Direct Invitation Callout - Friendly, helpful path */}
      <div className="p-4 bg-[#FAF7F2] border border-[#EAE4DC] rounded-2xl flex items-start gap-3 text-text-secondary text-xs leading-relaxed">
        <Link2 className="w-4 h-4 text-[#7A3E1D] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-midnight-lagoon">Have a direct invitation link?</span> If OyaPlan sent you a direct link via WhatsApp or email, open that link directly to connect to your pre-verified venue listing immediately.
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
          className="w-full h-14 pl-11 pr-11 bg-white border border-border-default rounded-2xl text-sm font-medium text-text-primary focus:outline-none focus:border-brand-green shadow-xs transition-all"
        />
        {isSearching && (
          <Loader2 className="w-4 h-4 text-brand-green animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-text-muted px-1">
          <span className="font-bold uppercase tracking-wider text-[11px]">
            {searchQuery.trim() ? `Search Results (${displayVenues.length})` : 'Indexed Venues in Lagos'}
          </span>
          {isSearching && (
            <span className="text-[10px] font-bold text-brand-green flex items-center gap-1">
              <span>Searching live database...</span>
            </span>
          )}
        </div>

        {displayVenues.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-default p-8 text-center space-y-3">
            <Building2 className="w-8 h-8 text-text-muted mx-auto stroke-[1.5]" />
            <h3 className="font-bold text-sm text-midnight-lagoon uppercase">Can&apos;t find your business?</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              We may not have created an initial listing for your venue yet. Message us and we&apos;ll get it listed promptly.
            </p>
            {addVenueWaUrl ? (
              <a
                href={addVenueWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-11 px-5 bg-[#EAFDF3] text-[#008751] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#d5f9e3] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Us on WhatsApp to Add It</span>
              </a>
            ) : (
              <p className="text-xs text-text-muted font-medium">
                Reach out to our Lagos ops team to create your spot listing.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white rounded-3xl border border-border-default overflow-hidden shadow-xs">
            {displayVenues.map((venue: VenueSearchItem) => {
              const isVerified = venue.partner_state === 'verified_partner';
              const isPending = venue.partner_state === 'verification_pending';

              return (
                <Link
                  key={venue.id}
                  href={`/venue/${venue.id}/claim`}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#FAFAF8] transition-colors tap-feedback group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-sm text-midnight-lagoon group-hover:text-brand-green transition-colors truncate">
                        {venue.name}
                      </h2>
                      {venue.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-surface-grey text-text-secondary shrink-0">
                          {venue.category}
                        </span>
                      )}
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EAFDF3] text-[#0A7C3F] border border-[#A3F3C6]">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Partner</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF7F2] text-[#7A3E1D] border border-[#EAE4DC]">
                          <Clock className="w-3 h-3" />
                          <span>Verification in Progress</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-text-muted truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{venue.address || venue.district_name || 'Lagos'}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-brand-green uppercase tracking-wider">
                    <span className="hidden sm:inline">
                      {isVerified ? 'Manage' : 'Claim'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* WhatsApp Help Footer */}
      <div className="p-6 bg-surface-grey rounded-2xl border border-border-default/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <h4 className="font-bold text-xs uppercase text-midnight-lagoon">Can&apos;t find your business?</h4>
          <p className="text-xs text-text-muted mt-0.5">
            Message our Lagos team directly and we&apos;ll help get your spot listed and verified.
          </p>
        </div>
        {generalClaimWaUrl && (
          <a
            href={generalClaimWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 h-10 px-4 bg-white border border-border-default text-midnight-lagoon font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-brand-green" />
            <span>Chat on WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
}
