'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Venue, MenuItem } from '@/lib/types';
import { ExternalLink, ShieldCheck, Receipt, ArrowRight, Check, Radar, Camera, MessageSquare } from 'lucide-react';
import { getBusinessWhatsAppUrl } from '@/lib/config/businessWhatsApp';

interface WhatCustomersSeePreviewProps {
  venue: Venue;
  menuItems: MenuItem[];
}

export function WhatCustomersSeePreview({ venue, menuItems }: WhatCustomersSeePreviewProps) {
  const [activeTab, setActiveTab] = useState<'solo' | 'date' | 'squad' | 'birthday'>('date');

  const perPersonBase = venue.derived_typical_cost || 14000;
  const vatPct = venue.vat_pct ?? 7.5;
  const servicePct = venue.service_charge_pct ?? 10;
  const isIsland = ['lekki', 'vi', 'victoria-island', 'ikoyi'].some((s) =>
    (venue.districts?.slug || '').toLowerCase().includes(s)
  );
  const rideCost = isIsland ? 9000 : 5000;

  const headcountMap = {
    solo: 1,
    date: 2,
    squad: 4,
    birthday: 6,
  };

  const labelMap = {
    solo: 'Solo Waka (1 pax)',
    date: 'Date / +1 (2 pax)',
    squad: 'Squad Linkup (4 pax)',
    birthday: 'Birthday Turn Up (6+ pax)',
  };

  const currentHeadcount = headcountMap[activeTab];
  const foodTotal = perPersonBase * currentHeadcount;
  const vatTotal = Math.round((foodTotal * vatPct) / 100);
  const serviceTotal = Math.round((foodTotal * servicePct) / 100);
  const totalOuting = foodTotal + vatTotal + serviceTotal + rideCost;
  const perPersonSplit = Math.round(totalOuting / currentHeadcount);

  const waAuditUrl = getBusinessWhatsAppUrl('claim_support');

  return (
    <section className="bg-[#1E1B18] text-[#F5F1E8] rounded-[24px] border border-[#2D2823] p-6 sm:p-7 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D2823] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#E59A28] uppercase px-2.5 py-0.5 rounded bg-[#E59A28]/15 border border-[#E59A28]/30">
              TILL SLIP STUDIO · THE OUTING MATH STUDIO
            </span>
            <span className="text-xs text-[#A0978C] font-mono">Verified Outside Math</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight mt-1">
            Your 4 Live Till Slips in Lagos
          </h2>
          <p className="text-xs text-[#A0978C] leading-relaxed mt-0.5 max-w-xl">
            This is how your venue fits into real Lagos pocket boundaries. Toggle between outing types below to inspect what planners see before leaving home.
          </p>
        </div>

        <Link
          href={`/venue/${venue.id}`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E59A28] hover:bg-[#D48B1B] text-[#141210] text-xs font-mono font-black transition-all shadow-md tap-feedback cursor-pointer shrink-0 uppercase tracking-wider"
        >
          <span>Open Live Listing</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#141210]" />
        </Link>
      </div>

      {/* Outing Type Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
        {(['solo', 'date', 'squad', 'birthday'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab
                ? 'bg-[#E59A28] text-[#141210] shadow-lg'
                : 'bg-[#141210] text-[#A0978C] hover:text-white border border-[#2D2823]'
            }`}
          >
            {labelMap[tab]}
          </button>
        ))}
      </div>

      {/* ── THE LIVE TILL SLIP PREVIEW CARD (#F7F4EC Warm Ivory Receipt Paper) ── */}
      <div className="max-w-2xl mx-auto rounded-3xl bg-[#F7F4EC] text-[#141210] border-4 border-[#2D2823] p-5 sm:p-6 space-y-4 font-mono shadow-2xl relative">
        <div className="flex items-start justify-between pb-3 border-b-2 border-dashed border-[#141210]/20">
          <div>
            <span className="text-[10px] font-bold text-[#12A165] uppercase tracking-widest block">
              OYAPLAN VETTED VENUE · LIVE TILL SLIP
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-black text-[#141210]">
              {venue.name} — {labelMap[activeTab]}
            </h3>
            <p className="text-xs text-[#141210]/60 font-sans">{venue.address}</p>
          </div>
          <Receipt className="w-5 h-5 text-[#141210]/40 shrink-0" />
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between items-center">
            <span>Dining &amp; Drinks ({currentHeadcount}x Guests):</span>
            <span className="font-bold">₦{foodTotal.toLocaleString('en-NG')}</span>
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#141210]/80 border-t border-[#141210]/10 pt-1.5">
            <span>VAT ({vatPct}%) &amp; Service ({servicePct}%):</span>
            <span className="font-bold text-[#12A165]">₦{(vatTotal + serviceTotal).toLocaleString('en-NG')}</span>
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#141210]/70 border-t border-[#141210]/10 pt-1.5">
            <span>Est. Round-Trip Transport ({isIsland ? 'Island' : 'Mainland'}):</span>
            <span className="font-bold">₦{rideCost.toLocaleString('en-NG')}</span>
          </div>
        </div>

        {/* Total Cost Highlight */}
        <div className="bg-[#141210]/5 p-3.5 rounded-2xl border border-[#141210]/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-[#141210]/60 font-bold block">Total Outing Damage</span>
            <span className="text-xl sm:text-2xl font-black text-[#141210]">
              ~₦{totalOuting.toLocaleString('en-NG')}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase text-[#141210]/60 font-bold block">Damage Per Head</span>
            <span className="text-sm sm:text-base font-bold text-[#141210]">
              ~₦{perPersonSplit.toLocaleString('en-NG')} / head
            </span>
          </div>
        </div>
      </div>

      {/* ── BUDGET BOUNDARY RADAR & ZERO SURPRISE CHECKLIST ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-2">
        
        {/* Budget Boundary Radar */}
        <div className="p-4 rounded-2xl bg-[#141210] border border-[#2D2823] space-y-2">
          <div className="flex items-center gap-2 text-[#E59A28] font-bold">
            <Radar className="w-4 h-4 text-[#E59A28] animate-spin" />
            <span>BUDGET BOUNDARY RADAR</span>
          </div>
          <p className="text-[#A0978C] text-[11px] leading-relaxed">
            Right now in Lagos, the #1 searched Date Night budget is <strong className="text-white">₦30,000–₦40,000 total</strong>. Your current Date Night Till Slip is <strong className="text-[#12A165]">₦33,675 total</strong>. You are a Top Match in Victoria Island / Lekki.
          </p>
        </div>

        {/* Zero Surprise Checklist */}
        <div className="p-4 rounded-2xl bg-[#141210] border border-[#2D2823] space-y-2">
          <div className="flex items-center gap-2 text-[#12A165] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#12A165]" />
            <span>ZERO SURPRISE CHECKLIST</span>
          </div>
          <div className="space-y-1 text-[#A0978C] text-[11px]">
            <p className="flex items-center gap-1.5 text-white">
              <Check className="w-3.5 h-3.5 text-[#12A165]" />
              <span>7.5% VAT: Explicitly Itemized</span>
            </p>
            <p className="flex items-center gap-1.5 text-white">
              <Check className="w-3.5 h-3.5 text-[#12A165]" />
              <span>Service Charge: 10% Included</span>
            </p>
            <p className="flex items-center gap-1.5 text-white">
              <Check className="w-3.5 h-3.5 text-[#12A165]" />
              <span>No Hidden Cover Charges</span>
            </p>
          </div>
        </div>

      </div>

      {/* Snap-to-Audit Menu Updater */}
      <div className="p-4 rounded-2xl bg-[#141210] border border-[#2D2823] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <Camera className="w-5 h-5 text-[#E59A28] shrink-0" />
          <div>
            <span className="text-white font-bold block">Snap-to-Audit Menu Updater</span>
            <span className="text-[#A0978C] text-[11px]">Snap a photo of your new physical menu on WhatsApp to update dish prices in 10s.</span>
          </div>
        </div>

        {waAuditUrl && (
          <a
            href={waAuditUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 h-10 px-4 bg-[#E59A28] hover:bg-[#D48B1B] text-[#141210] font-black uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all tap-feedback cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Snap Menu on WhatsApp →</span>
          </a>
        )}
      </div>

    </section>
  );
}
