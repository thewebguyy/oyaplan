'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Venue } from '@/lib/types';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';
import { triggerHaptic } from '@/lib/ui/haptics';
import {
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  Activity,
  Users,
  UtensilsCrossed,
  SlidersHorizontal,
  Radar,
  Check,
} from 'lucide-react';

interface VenueOption {
  venue: Venue;
  role: string;
}

interface BusinessShellProps {
  venue: Venue;
  allVenues: VenueOption[];
  children: React.ReactNode;
}

export function BusinessShell({ venue, allVenues, children }: BusinessShellProps) {
  const pathname = usePathname();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const isVerified = venue.partner_state === 'verified_partner';
  const isPending = venue.partner_state === 'verification_pending' || venue.partner_state === 'claim_pending';

  const navLinks = [
    { id: 'radar', label: 'RADAR', href: `/business/${venue.id}`, icon: Radar },
    { id: 'floor', label: 'THE FLOOR', href: `/business/${venue.id}/reservations`, icon: Users },
    { id: 'look', label: 'THE LOOK', href: `/business/${venue.id}/pricing`, icon: UtensilsCrossed },
    { id: 'vibes', label: 'VIBE CHECKS', href: `/business/${venue.id}/venue`, icon: SlidersHorizontal },
    { id: 'intel', label: 'STREET INTEL', href: `/business/${venue.id}/insights`, icon: Activity },
  ];

  const otherVenues = allVenues.filter(({ venue: v }) => v.id !== venue.id);

  const statusBadge = isVerified ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#008751]/10 text-[#008751] border border-[#008751]/25">
      <span className="w-1.5 h-1.5 rounded-full bg-[#008751] animate-pulse" />
      <span>LIVE ON THE PULSE</span>
    </span>
  ) : isPending ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/5 text-[#64748B] border border-black/10">
      <span>● VERIFICATION IN REVIEW</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/5 text-[#111111] border border-black/10">
      <span>● CLAIMED SPOT</span>
    </span>
  );

  return (
    <div className="min-h-[100dvh] bg-[#090A0D] text-[#F8F9FA] antialiased flex flex-col font-sans selection:bg-[#008751]/30">
      {/* ── Business Command Header (Original Logo & Crisp Contrast) ── */}
      <header className="w-full bg-[#FFFFFF] text-[#111111] border-b border-[#EAE4DC] shadow-xs sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Main Brand & Venue Bar */}
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: Original Brand Logo + Pulse Badge + Venue Switcher */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Link href={`/business/${venue.id}`} className="flex items-center gap-2.5 shrink-0 tap-feedback">
                <Image
                  src="/logo.png"
                  alt="OyaPlan"
                  width={610}
                  height={143}
                  className="h-7 w-auto object-contain shrink-0"
                  style={{ width: "auto", height: "26px" }}
                  priority
                />
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-[#008751] bg-[#008751]/10 border border-[#008751]/25 px-2.5 py-0.5 rounded-full uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008751] animate-pulse" />
                  THE PULSE
                </span>
              </Link>

              <span className="text-black/15 shrink-0 font-mono">/</span>

              {/* Venue Selector */}
              <div className="relative min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (otherVenues.length > 0) {
                      setSwitcherOpen(!switcherOpen);
                    }
                  }}
                  disabled={otherVenues.length === 0}
                  className={`flex items-center gap-1.5 min-w-0 px-2.5 py-1.5 rounded-xl transition-colors tap-feedback text-left ${
                    otherVenues.length > 0 ? 'hover:bg-black/5 cursor-pointer' : 'cursor-default'
                  }`}
                  aria-label="Switch venue"
                  aria-haspopup={otherVenues.length > 0 ? "true" : undefined}
                  aria-expanded={otherVenues.length > 0 ? switcherOpen : undefined}
                >
                  <span className="text-xs sm:text-sm font-bold text-[#111111] tracking-tight truncate max-w-[130px] sm:max-w-[200px]">
                    {venue.name}
                  </span>
                  {otherVenues.length > 0 && (
                    <ChevronDown className={`w-3.5 h-3.5 text-black/50 shrink-0 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Multi-Venue Dropdown Menu */}
                {switcherOpen && otherVenues.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-[#121418] text-white rounded-2xl border border-[#232732] shadow-2xl z-50 overflow-hidden divide-y divide-white/10 font-sans">
                    <div className="px-4 py-2.5 bg-black/40">
                      <span className="text-[10px] font-mono font-bold text-[#00E575] uppercase tracking-wider">
                        Your Venues
                      </span>
                    </div>

                    <div className="py-1">
                      {/* Active venue */}
                      <div className="px-4 py-2.5 bg-white/5 flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate">{venue.name}</span>
                          <span className="text-[10px] font-mono text-[#00E575]">Active Venue</span>
                        </div>
                        <Check className="w-3.5 h-3.5 text-[#00E575] shrink-0" />
                      </div>

                      {/* Other venues */}
                      {otherVenues.map(({ venue: v, role }) => (
                        <Link
                          key={v.id}
                          href={`/business/${v.id}`}
                          onClick={() => setSwitcherOpen(false)}
                          className="block px-4 py-2.5 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-xs font-semibold text-white truncate block">{v.name}</span>
                          <span className="text-[10px] font-mono text-white/50 capitalize">{role}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 hidden lg:block">{statusBadge}</div>
            </div>

            {/* Right: Bouncer Stand Link & What Customers See */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 font-mono">
              {/* Bouncer Stand Mode Trigger (Accessible on all screens) */}
              <Link
                href={`/business/${venue.id}/bouncer`}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors tap-feedback"
                title="Bouncer door stand (zero financials)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#008751]" />
                <span className="hidden xs:inline sm:inline">Bouncer Mode</span>
              </Link>

              {(() => {
                const waUrl = getBusinessWhatsAppUrl('general_support', { venueName: venue.name });
                if (!waUrl) return null;
                return (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#008751] bg-[#008751]/10 hover:bg-[#008751]/20 border border-[#008751]/25 transition-colors tap-feedback"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Host WhatsApp</span>
                  </a>
                );
              })()}

              <Link
                href={`/venue/${venue.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#111111] bg-black/5 hover:bg-black/10 border border-black/10 transition-colors tap-feedback"
              >
                <span>Preview</span>
                <ExternalLink className="w-3 h-3 text-[#008751]" />
              </Link>
            </div>
          </div>

          {/* Desktop Lagos Hospitality Wayfinding Navigation Tabs */}
          <nav className="hidden sm:flex space-x-1 overflow-x-auto no-scrollbar -mb-px pt-1 font-mono text-xs border-t border-[#EAE4DC]/60" role="navigation" aria-label="The Pulse Sections">
            {navLinks.map((link) => {
              const cleanPath = pathname?.replace(/\/$/, '') || '';
              const cleanHref = link.href.replace(/\/$/, '');
              const isActive = link.id === 'radar' 
                ? cleanPath === cleanHref 
                : cleanPath === cleanHref || cleanPath.startsWith(cleanHref + '/');
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => triggerHaptic('selection')}
                  className={`py-2 px-3.5 rounded-t-xl whitespace-nowrap flex items-center gap-2 font-bold transition-all tap-feedback border-b-2 ${
                    isActive
                      ? 'border-[#008751] bg-[#008751]/10 text-[#008751]'
                      : 'border-transparent text-slate-600 hover:text-[#111111] hover:bg-black/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#008751]' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Page Content Container ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-12 space-y-6">
        {children}
      </main>

      {/* ── Mobile Dedicated Operational Navigation (Thumb-first) ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#090A0D]/95 backdrop-blur-xl border-t border-[#232732] z-40 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-stretch justify-around h-14">
          {navLinks.map((link) => {
            const cleanPath = pathname?.replace(/\/$/, '') || '';
            const cleanHref = link.href.replace(/\/$/, '');
            const isActive = link.id === 'radar' 
              ? cleanPath === cleanHref 
              : cleanPath === cleanHref || cleanPath.startsWith(cleanHref + '/');
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => triggerHaptic('selection')}
                className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[9px] font-mono font-bold transition-colors tap-feedback ${
                  isActive ? 'text-[#00E575]' : 'text-white/40 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00E575]' : 'text-white/40'}`} />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Backdrop for dropdown (only when multiple venues exist) */}
      {switcherOpen && otherVenues.length > 0 && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setSwitcherOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
