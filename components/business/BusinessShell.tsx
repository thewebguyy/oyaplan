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
  LayoutDashboard,
  Building,
  Tag,
  CalendarCheck,
  LineChart,
  Activity,
  Bell,
  Check,
  ArrowRight,
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
    { num: '01', label: 'DESK',         href: `/business/${venue.id}`,              icon: LayoutDashboard },
    { num: '02', label: 'VENUE',        href: `/business/${venue.id}/venue`,        icon: Building },
    { num: '03', label: 'PRICING',      href: `/business/${venue.id}/pricing`,      icon: Tag },
    { num: '04', label: 'UPDATES',      href: `/business/${venue.id}/updates`,      icon: Bell },
    { num: '05', label: 'RESERVATIONS', href: `/business/${venue.id}/reservations`, icon: CalendarCheck },
    { num: '06', label: 'INSIGHTS',     href: `/business/${venue.id}/insights`,     icon: LineChart },
    { num: '07', label: 'ACTIVITY',     href: `/business/${venue.id}/activity`,     icon: Activity },
  ];

  const otherVenues = allVenues.filter(({ venue: v }) => v.id !== venue.id);

  const statusBadge = isVerified ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#EAFDF3] text-[#008751] border border-[#A3F3C6]">
      <ShieldCheck className="w-3.5 h-3.5" />
      <span>● VERIFIED SPOT</span>
    </span>
  ) : isPending ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FAF7F2] text-[#7A3E1D] border border-[#EAE4DC]">
      <span>● UNDER REVIEW</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-white text-[#111111] border border-[#EAE4DC]">
      <span>● CLAIMED PRESENCE</span>
    </span>
  );

  return (
    <div className="min-h-[100dvh] bg-[#F7F5EE] text-[#111111] antialiased flex flex-col font-sans selection:bg-[#F6C642]/30">
      {/* ── Business Top Navigation Header ── */}
      <header className="w-full bg-[#111111] text-[#F7F5EE] border-b border-[#222222] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Main Brand & Venue Bar */}
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: Brand + Operator's Desk Badge + Venue Switcher */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Link href="/for-business" className="flex items-center gap-2.5 shrink-0 tap-feedback">
                <Image
                  src="/logo.png"
                  alt="OyaPlan"
                  width={610}
                  height={143}
                  className="h-6 w-auto object-contain shrink-0 invert"
                  priority
                />
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest text-[#111111] bg-[#F6C642] px-2 py-0.5 rounded uppercase">
                  OPERATOR&apos;S DESK
                </span>
              </Link>

              <span className="text-white/20 shrink-0 font-mono">/</span>

              {/* Venue Selector */}
              <div className="relative min-w-0">
                <button
                  onClick={() => setSwitcherOpen(!switcherOpen)}
                  className="flex items-center gap-2 min-w-0 px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors tap-feedback text-left"
                  aria-label="Switch venue"
                >
                  <span className="text-xs sm:text-sm font-serif font-black text-white tracking-tight truncate max-w-[140px] sm:max-w-[220px]">
                    {venue.name}
                  </span>
                  {otherVenues.length > 0 && (
                    <ChevronDown className={`w-3.5 h-3.5 text-white/60 shrink-0 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Multi-Venue Dropdown Menu */}
                {switcherOpen && otherVenues.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-[#1A1A1A] text-white rounded-2xl border border-[#2D2D2D] shadow-2xl z-50 overflow-hidden divide-y divide-white/10 font-sans">
                    <div className="px-4 py-2.5 bg-black/40">
                      <span className="text-[10px] font-mono font-bold text-[#F6C642] uppercase tracking-wider">
                        Your Managed Venues
                      </span>
                    </div>

                    <div className="py-1">
                      {/* Active venue */}
                      <div className="px-4 py-2.5 bg-white/5 flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate">{venue.name}</span>
                          <span className="text-[10px] font-mono text-[#008751]">Active Venue</span>
                        </div>
                        <Check className="w-3.5 h-3.5 text-[#008751] shrink-0" />
                      </div>

                      {/* Other managed venues */}
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

            {/* Right: What Customers See & WhatsApp Concierge */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 font-mono">
              {(() => {
                const waUrl = getBusinessWhatsAppUrl('general_support', { venueName: venue.name });
                if (!waUrl) return null;
                return (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#008751] bg-[#EAFDF3] hover:bg-[#D8F6E4] border border-[#A3F3C6] transition-colors tap-feedback"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Concierge</span>
                  </a>
                );
              })()}

              <Link
                href={`/venue/${venue.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#111111] bg-[#F7F5EE] hover:bg-[#F6C642] transition-colors tap-feedback"
              >
                <span>What Customers See</span>
                <ExternalLink className="w-3 h-3 text-[#111111]" />
              </Link>
            </div>
          </div>

          {/* Desktop Lagos Wayfinding Navigation Tabs */}
          <nav className="hidden sm:flex space-x-1 overflow-x-auto no-scrollbar -mb-px pt-1 font-mono text-xs" role="navigation" aria-label="Operator's Desk Sections">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => triggerHaptic('selection')}
                  className={`py-2.5 px-3 rounded-t-xl whitespace-nowrap flex items-center gap-1.5 font-bold transition-all tap-feedback border-b-2 ${
                    isActive
                      ? 'border-[#F6C642] bg-white/10 text-[#F6C642]'
                      : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`text-[9px] ${isActive ? 'text-[#F6C642]' : 'text-white/40'}`}>
                    {link.num}
                  </span>
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

      {/* ── Mobile Dedicated Operational Navigation ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-xl border-t border-[#222222] z-40 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-stretch justify-around h-14">
          {[
            navLinks[0], // Desk
            navLinks[1], // Venue
            navLinks[2], // Pricing
            navLinks[4], // Reservations
            navLinks[5], // Insights
          ].map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => triggerHaptic('selection')}
                className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[9px] font-mono font-bold transition-colors tap-feedback ${
                  isActive ? 'text-[#F6C642]' : 'text-white/50 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F6C642]' : 'text-white/40'}`} />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Backdrop for dropdown */}
      {switcherOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setSwitcherOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
