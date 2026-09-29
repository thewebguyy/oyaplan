'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building2,
  Sparkles,
} from 'lucide-react';

interface BusinessReservationsCardProps {
  venueId: string;
  reservationFee?: number | null;
}

export function BusinessReservationsCard({
  venueId,
  reservationFee = 0,
}: BusinessReservationsCardProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'confirmed' | 'commercial'>('requests');

  return (
    <div className="bg-white rounded-2xl border border-border-default overflow-hidden shadow-xs">
      {/* ── Section Header ── */}
      <div className="p-5 sm:p-6 border-b border-border-default bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">
                Reservations &amp; Bookings
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-text-muted">Turn Intent Into Table Outings</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-midnight-lagoon tracking-tight">
              Reservation Requests &amp; Attributed Bookings
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
              When planners are ready to lock in their outing, they submit reservation requests through your listing.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/business/${venueId}/pricing`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-midnight-lagoon hover:bg-surface-grey border border-border-default transition-colors tap-feedback"
            >
              <span>Deposit Settings</span>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted" />
            </Link>
          </div>
        </div>

        {/* ── Direct Deposit & Commission Disclosure Notice ── */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <Building2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-text-secondary leading-relaxed">
              <strong className="font-semibold text-midnight-lagoon">Direct venue deposits:</strong> Customers pay any required table deposit directly to your business. OyaPlan does not hold customer funds.
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#EAE4DC] text-[11px] font-semibold text-text-muted shrink-0">
            Commission applies to reservations through OyaPlan
          </span>
        </div>

        {/* ── Sub-navigation Tabs ── */}
        <div className="flex items-center gap-2 mt-4 pt-1 border-t border-gray-100 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all tap-feedback shrink-0 ${
              activeTab === 'requests'
                ? 'bg-midnight-lagoon text-white shadow-xs'
                : 'text-text-muted hover:text-midnight-lagoon hover:bg-gray-100'
            }`}
          >
            Reservation Requests (0)
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all tap-feedback shrink-0 ${
              activeTab === 'confirmed'
                ? 'bg-midnight-lagoon text-white shadow-xs'
                : 'text-text-muted hover:text-midnight-lagoon hover:bg-gray-100'
            }`}
          >
            Confirmed Bookings (0)
          </button>
          <button
            onClick={() => setActiveTab('commercial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all tap-feedback shrink-0 ${
              activeTab === 'commercial'
                ? 'bg-midnight-lagoon text-white shadow-xs'
                : 'text-text-muted hover:text-midnight-lagoon hover:bg-gray-100'
            }`}
          >
            Commercial Terms &amp; Commission
          </button>
        </div>
      </div>

      {/* ── Tab Content: Honest Empty States ── */}
      <div className="p-6 sm:p-8">
        {activeTab === 'requests' && (
          <div className="text-center py-6 max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EAE4DC] flex items-center justify-center mx-auto text-text-muted">
              <CalendarCheck className="w-6 h-6 text-brand-green" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-midnight-lagoon">
                No reservation requests through OyaPlan yet
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                When customers build a plan around your venue and request a reservation, their details, group size, and requested time will appear here for your confirmation.
              </p>
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-grey border border-border-default text-[11px] text-text-secondary">
                <Clock className="w-3.5 h-3.5 text-brand-green" />
                <span>Current Table Deposit: {reservationFee && reservationFee > 0 ? `₦${reservationFee.toLocaleString('en-NG')}` : '₦0 (No deposit required)'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'confirmed' && (
          <div className="text-center py-6 max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EAE4DC] flex items-center justify-center mx-auto text-text-muted">
              <CheckCircle2 className="w-6 h-6 text-brand-green" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-midnight-lagoon">
                No confirmed reservations yet
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Reservations are only recorded as confirmed once your team reviews the request and accepts any required deposit directly from the customer.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'commercial' && (
          <div className="max-w-xl mx-auto space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2">
              <div className="flex items-center gap-2 font-bold text-midnight-lagoon">
                <CreditCard className="w-4 h-4 text-brand-green" />
                <span>How OyaPlan Monetization Works</span>
              </div>
              <p className="text-text-muted leading-relaxed">
                OyaPlan is a free-to-list marketplace. There is zero recurring subscription fee simply to be listed. We monetize when your business gets value: OyaPlan earns an attributed commission on qualifying reservations generated through the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-xl border border-border-default space-y-1">
                <span className="font-bold text-midnight-lagoon block">100% Direct Deposits</span>
                <p className="text-text-muted leading-relaxed text-[11px]">
                  Customer table deposits are paid directly to your venue bank account or payment terminal. OyaPlan never holds your money in escrow or custody.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border-default space-y-1">
                <span className="font-bold text-midnight-lagoon block">Attributed Reservations</span>
                <p className="text-text-muted leading-relaxed text-[11px]">
                  Commission applies only to qualifying reservations and visits initiated through OyaPlan plans and attributed to our marketplace.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
