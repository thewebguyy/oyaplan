'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Venue } from '@/lib/types';
import {
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  Home,
  Tag,
  BarChart2,
  Lightbulb,
  Building2,
  Bell,
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

  const navLinks = [
    { label: 'Home',     href: `/business/${venue.id}`,          icon: Home },
    { label: 'Venue',    href: `/business/${venue.id}/venue`,     icon: Building2 },
    { label: 'Pricing',  href: `/business/${venue.id}/pricing`,   icon: Tag },
    { label: 'Activity', href: `/business/${venue.id}/activity`,  icon: BarChart2 },
    { label: 'Insights', href: `/business/${venue.id}/insights`,  icon: Lightbulb },
    { label: 'Updates',  href: `/business/${venue.id}/updates`,   icon: Bell },
  ];

  const otherVenues = allVenues.filter(({ venue: v }) => v.id !== venue.id);

  const statusBadge = isVerified ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EAFDF3] text-[#0A7C3F]">
      <ShieldCheck className="w-3 h-3" />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700">
      {venue.partner_state === 'verification_pending' ? 'In Review' : 'Claimed'}
    </span>
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] antialiased">
      {/* ── Top header ── */}
      <header className="w-full bg-white border-b border-border-default sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Brand bar */}
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: brand + venue switcher */}
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/business" className="tap-feedback shrink-0">
                <span className="text-base font-black tracking-tighter uppercase text-midnight-lagoon">
                  OyaPlan
                </span>
              </Link>
              <span className="text-gray-300 shrink-0">/</span>

              {/* Venue name + switcher */}
              <div className="relative min-w-0">
                <button
                  onClick={() => setSwitcherOpen(!switcherOpen)}
                  className="flex items-center gap-1.5 min-w-0 tap-feedback"
                  aria-label="Switch venue"
                >
                  <span className="text-xs font-black uppercase text-text-primary tracking-tight truncate max-w-[120px] sm:max-w-[200px]">
                    {venue.name}
                  </span>
                  {otherVenues.length > 0 && (
                    <ChevronDown className={`w-3.5 h-3.5 text-text-muted shrink-0 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Dropdown */}
                {switcherOpen && otherVenues.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl border border-border-default shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-border-default/60">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Your Venues</span>
                    </div>
                    <div className="py-1">
                      {/* Current venue */}
                      <div className="px-4 py-3 bg-surface-grey">
                        <span className="text-xs font-bold text-midnight-lagoon truncate block">{venue.name}</span>
                        <span className="text-[10px] text-text-muted">Currently viewing</span>
                      </div>
                      {/* Other venues */}
                      {otherVenues.map(({ venue: v, role }) => (
                        <Link
                          key={v.id}
                          href={`/business/${v.id}`}
                          onClick={() => setSwitcherOpen(false)}
                          className="block px-4 py-3 hover:bg-surface-grey transition-colors"
                        >
                          <span className="text-xs font-bold text-text-primary truncate block">{v.name}</span>
                          <span className="text-[10px] text-text-muted capitalize">{role}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 hidden sm:block">{statusBadge}</div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://wa.me/2348000000000?text=Hi%20OyaPlan%20Ops%2C%20I%20need%20help%20with%20${encodeURIComponent(venue.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#008751] bg-[#EAFDF3] hover:bg-[#daf8e7] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Support</span>
              </a>
              <Link
                href={`/venue/${venue.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-text-muted hover:text-midnight-lagoon hover:bg-surface-grey transition-colors"
              >
                <span className="hidden sm:inline">View listing</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Desktop nav tabs */}
          <nav className="hidden sm:flex space-x-1 overflow-x-auto hide-scrollbar -mb-px">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors tap-feedback ${
                    isActive
                      ? 'border-[#008751] text-[#008751]'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-10 space-y-6">
        {children}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border-default z-40 px-1">
        <div className="flex items-stretch">
          {navLinks.slice(0, 5).map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-bold transition-colors tap-feedback ${
                  isActive ? 'text-[#008751]' : 'text-text-muted'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#008751]' : 'text-gray-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Dismiss switcher on outside click */}
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
