'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Venue } from '@/lib/types';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';

interface BusinessReservationsClientProps {
  venue: Venue;
}

export function BusinessReservationsClient({ venue }: BusinessReservationsClientProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'pending' | 'confirmed' | 'rules'>('today');

  const reservationFee = venue.reservation_fee || 0;
  const waUrl = getBusinessWhatsAppUrl('general_support', { venueName: venue.name });

  return (
    <div className="space-y-6">
      {/* ── Control Header ── */}
      <div className="bg-[#111111] text-[#F7F5EE] rounded-[24px] border border-[#222222] p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#F6C642] uppercase px-2 py-0.5 rounded bg-white/10">
                05 • RESERVATIONS
              </span>
              <span className="text-white/30 font-mono text-xs">/</span>
              <span className="text-xs text-white/70 font-mono">Operating Floor</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
              Table Bookings &amp; Inbound Requests
            </h1>

            <p className="text-xs sm:text-sm text-white/70 max-w-xl leading-relaxed">
              When planners lock in an outing at {venue.name}, their booking details, party sizes, and arrival times appear directly on your desk.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/business/${venue.id}/pricing`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors tap-feedback"
            >
              <span>Deposit Settings ({reservationFee > 0 ? `₦${reservationFee.toLocaleString('en-NG')}` : '₦0'})</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F6C642]" />
            </Link>
          </div>
        </div>

        {/* ── Operational Metric Pills ── */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10 font-mono">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase text-white/60 tracking-wider block">Today</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">0</span>
              <span className="text-[11px] text-white/40">booked</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase text-white/60 tracking-wider block">Pending</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-[#F6C642] tabular-nums">0</span>
              <span className="text-[11px] text-white/40">requests</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase text-white/60 tracking-wider block">Confirmed</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-[#008751] tabular-nums">0</span>
              <span className="text-[11px] text-white/40">reservations</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Direct Deposit & Commercial Rules Banner ── */}
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#008751]/10 text-[#008751] flex items-center justify-center shrink-0 mt-0.5">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-[#111111]">Direct Venue Deposits — 100% to Your Bank Account</p>
            <p className="text-text-secondary leading-relaxed max-w-2xl">
              Planners pay any table deposits or minimum spend directly into your venue account or POS. OyaPlan does not escrow or hold customer funds.
            </p>
          </div>
        </div>

        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#008751] bg-white border border-[#A3F3C6] hover:bg-[#EAFDF3] transition-colors shrink-0 tap-feedback"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Operator Concierge</span>
          </a>
        )}
      </div>

      {/* ── Operational Tabs ── */}
      <div className="bg-white rounded-2xl border border-[#EAE4DC] overflow-hidden shadow-xs">
        <div className="flex items-center gap-2 p-2 border-b border-[#EAE4DC] bg-[#FAF7F2] overflow-x-auto no-scrollbar font-mono text-xs">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all tap-feedback cursor-pointer ${
              activeTab === 'today'
                ? 'bg-[#111111] text-[#F6C642] shadow-xs'
                : 'text-text-secondary hover:text-[#111111] hover:bg-white'
            }`}
          >
            Today (0)
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all tap-feedback cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-[#111111] text-[#F6C642] shadow-xs'
                : 'text-text-secondary hover:text-[#111111] hover:bg-white'
            }`}
          >
            Pending Requests (0)
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all tap-feedback cursor-pointer ${
              activeTab === 'confirmed'
                ? 'bg-[#111111] text-[#F6C642] shadow-xs'
                : 'text-text-secondary hover:text-[#111111] hover:bg-white'
            }`}
          >
            Confirmed Bookings (0)
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all tap-feedback cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-[#111111] text-[#F6C642] shadow-xs'
                : 'text-text-secondary hover:text-[#111111] hover:bg-white'
            }`}
          >
            Deposit &amp; Commission Rules
          </button>
        </div>

        {/* ── Tab Body: Real Honest States ── */}
        <div className="p-8 sm:p-12">
          {activeTab === 'today' && (
            <div className="max-w-md mx-auto text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F5EE] border border-[#EAE4DC] flex items-center justify-center mx-auto text-[#111111]">
                <Clock className="w-7 h-7 text-[#008751]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-serif font-black text-[#111111]">
                  No Outings Scheduled for Today
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  When squads lock in reservations for today, each entry will display party size, expected arrival time, occasion, and deposit verification state.
                </p>
              </div>

              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F5EE] border border-[#EAE4DC] text-xs font-mono text-text-secondary">
                  <span>Current Table Deposit:</span>
                  <strong className="text-[#111111]">
                    {reservationFee > 0 ? `₦${reservationFee.toLocaleString('en-NG')}` : '₦0 (Free / Walk-in)'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="max-w-md mx-auto text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F5EE] border border-[#EAE4DC] flex items-center justify-center mx-auto text-[#111111]">
                <Calendar className="w-7 h-7 text-[#F6C642]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-serif font-black text-[#111111]">
                  No Pending Reservation Requests
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  New requests submitted by planners will appear here with squad phone numbers, occasion tags, and time slots for your team to confirm or decline.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'confirmed' && (
            <div className="max-w-md mx-auto text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#F7F5EE] border border-[#EAE4DC] flex items-center justify-center mx-auto text-[#111111]">
                <CheckCircle2 className="w-7 h-7 text-[#008751]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-serif font-black text-[#111111]">
                  No Confirmed Bookings Yet
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Confirmed reservations appear here once your operations team verifies table availability and direct deposit receipt.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="max-w-xl mx-auto space-y-5 text-left text-xs">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#111111]">
                  <Building2 className="w-4 h-4 text-[#008751]" />
                  <span>How OyaPlan Reservation Monetization Works</span>
                </div>
                <p className="text-text-secondary leading-relaxed">
                  Listing your venue on OyaPlan is 100% free with no monthly software subscription. We only charge a success-based commission when squads actually book through your verified listing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-[#EAE4DC] bg-white space-y-1.5">
                  <span className="font-bold text-[#111111] block">Direct Customer Deposits</span>
                  <p className="text-text-secondary leading-relaxed text-[11px]">
                    All table deposits or booking fees are sent directly to your venue bank account or POS terminal. OyaPlan never touches or delays customer funds.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#EAE4DC] bg-white space-y-1.5">
                  <span className="font-bold text-[#111111] block">Transparent Value</span>
                  <p className="text-text-secondary leading-relaxed text-[11px]">
                    Commission only applies to confirmed bookings created through OyaPlan. Regular walk-ins and direct phone bookings are never charged.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
