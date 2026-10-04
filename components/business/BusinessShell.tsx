'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Venue } from '@/lib/types';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';
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
  Check,
  ArrowUpRight,
  HelpCircle,
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
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAFDF3] text-[#0A7C3F] border border-[#A3F3C6]">
      <ShieldCheck className="w-3.5 h-3.5" />
      Verified Partner
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FBF7F0] text-[#7A3E1D] border border-[#EAE4DC]">
      {venue.partner_state === 'verification_pending' ? 'Under Review' : 'Claimed Spot'}
    </span>
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAF7F2] text-text-primary antialiased flex flex-col">
      {/* ── Business App Top Header ── */}
      <header className="w-full bg-white border-b border-border-default sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Main Brand & Venue Bar */}
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: OyaPlan Brand Logo + For Business Designation + Venue Switcher */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Link href="/for-business" className="flex items-center gap-2 shrink-0 tap-feedback">
                <Image
                  src="/logo.png"
                  alt="OyaPlan"
                  width={610}
                  height={143}
                  className="h-6 w-auto object-contain shrink-0"
                  priority
                />
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
                  <span className="text-xs font-bold text-slate-900 tracking-tight">
                    For Business
                  </span>
                </div>
              </Link>

              <span className="text-slate-300 shrink-0">/</span>

              {/* Venue Selector */}
              <div className="relative min-w-0">
                <button
                  onClick={() => setSwitcherOpen(!switcherOpen)}
                  className="flex items-center gap-1.5 min-w-0 px-2.5 py-1 -mx-2 rounded-xl hover:bg-slate-100 transition-colors tap-feedback text-left"
                  aria-label="Switch venue"
                >
                  <span className="text-xs sm:text-sm font-serif font-black text-slate-900 tracking-tight truncate max-w-[130px] sm:max-w-[200px]">
                    {venue.name}
                  </span>
                  {otherVenues.length > 0 && (
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Multi-Venue Dropdown Menu */}
                {switcherOpen && otherVenues.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-border-default shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
                    <div className="px-4 py-2.5 bg-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your Managed Venues</span>
                    </div>

                    <div className="py-1">
                      {/* Active venue */}
                      <div className="px-4 py-2.5 bg-[#FAF7F2] flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">{venue.name}</span>
                          <span className="text-[10px] text-brand-green font-semibold">Active venue</span>
                        </div>
                        <Check className="w-3.5 h-3.5 text-brand-green shrink-0" />
                      </div>

                      {/* Other managed venues */}
                      {otherVenues.map(({ venue: v, role }) => (
                        <Link
                          key={v.id}
                          href={`/business/${v.id}`}
                          onClick={() => setSwitcherOpen(false)}
                          className="block px-4 py-2.5 hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-xs font-semibold text-slate-900 truncate block">{v.name}</span>
                          <span className="text-[10px] text-slate-500 capitalize">{role}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 hidden md:block">{statusBadge}</div>
            </div>

            {/* Right: Marketplace Bridge, WhatsApp Concierge, Customer View */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Marketplace Bridge */}
              <Link
                href="/"
                className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-brand-green transition-colors px-2.5 py-1.5 rounded-xl hover:bg-[#EAFDF3] tap-feedback"
                title="See what Lagos planners see on the marketplace"
              >
                <span>Marketplace</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-brand-green" />
              </Link>

              {(() => {
                const waUrl = getBusinessWhatsAppUrl('general_support', { venueName: venue.name });
                if (!waUrl) return null;
                return (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#008751] bg-[#EAFDF3] hover:bg-[#D8F6E4] border border-[#A3F3C6]/60 transition-colors tap-feedback"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Concierge</span>
                  </a>
                );
              })()}

              <Link
                href={`/venue/${venue.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-border-default transition-colors tap-feedback"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden sm:flex space-x-1 overflow-x-auto hide-scrollbar -mb-px pt-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors tap-feedback ${
                    isActive
                      ? 'border-brand-green text-brand-green'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-green' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-12 space-y-6">
        {children}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-border-default z-40 px-2 safe-area-pb">
        <div className="flex items-stretch justify-around h-14">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center justify-center py-1 gap-1 text-[10px] font-bold transition-colors tap-feedback ${
                  isActive ? 'text-brand-green' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-green' : 'text-slate-400'}`} />
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
