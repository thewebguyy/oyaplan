'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Venue, MenuItem } from '@/lib/types';
import { ExternalLink, ShieldCheck, Car, Utensils, Sparkles, Check, ArrowRight } from 'lucide-react';

interface WhatCustomersSeePreviewProps {
  venue: Venue;
  menuItems: MenuItem[];
}

export function WhatCustomersSeePreview({ venue, menuItems }: WhatCustomersSeePreviewProps) {
  const isIsland = ['lekki', 'vi', 'victoria-island', 'ikoyi', 'oniru'].some((slug) =>
    (venue.districts?.slug || '').toLowerCase().includes(slug)
  );

  const transportEstimate = isIsland ? 10000 : 5000;
  const typicalPerPerson = venue.derived_typical_cost || 18000;
  const vat = Math.round(typicalPerPerson * ((venue.vat_pct ?? 7.5) / 100));
  const service = Math.round(typicalPerPerson * ((venue.service_charge_pct ?? 10) / 100));
  const totalOutingCost = typicalPerPerson + vat + service + transportEstimate;

  const sampleMenu = menuItems.slice(0, 3);
  const coverUrl = venue.cover_url || (venue.gallery_urls && venue.gallery_urls[0]) || '/images/default-venue.jpg';

  return (
    <section className="bg-white rounded-[24px] border border-[#EAE4DC] p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE4DC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#008751] uppercase px-2 py-0.5 rounded bg-[#EAFDF3] border border-[#A3F3C6]">
              CONSUMER OUTCOME MIRROR
            </span>
            <span className="text-xs text-text-muted font-mono">Zero Bill Shock Standard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-[#111111] tracking-tight mt-1">
            What Customers See on OyaPlan
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed mt-0.5 max-w-xl">
            This live preview shows how Lagos leisure seekers calculate their Total Outing Cost and experience your venue before leaving home.
          </p>
        </div>

        <Link
          href={`/venue/${venue.id}`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-[#F7F5EE] text-xs font-mono font-bold transition-all shadow-xs tap-feedback cursor-pointer shrink-0"
        >
          <span>Open Live Listing</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#F6C642]" />
        </Link>
      </div>

      {/* The Mirrored Consumer Card */}
      <div className="max-w-2xl mx-auto rounded-[20px] bg-[#FAF7F2] border border-[#EAE4DC] p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#EAE4DC] border border-[#EAE4DC]">
            <Image
              src={coverUrl}
              alt={venue.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#111111] text-[#F6C642]">
                {venue.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#008751] bg-[#EAFDF3] px-2 py-0.5 rounded border border-[#A3F3C6]">
                <ShieldCheck className="w-3 h-3" />
                VERIFIED OUTING MATH
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-serif font-black text-[#111111] truncate">
              {venue.name}
            </h3>

            <p className="text-xs text-text-secondary truncate">
              {venue.address}
            </p>
          </div>
        </div>

        {/* Total Outing Cost Breakdown Box */}
        <div className="p-4 rounded-xl bg-white border border-[#EAE4DC] space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE4DC]">
            <span className="font-bold text-[#111111] uppercase tracking-wider text-[11px]">
              TOTAL OUTING COST (PER PERSON)
            </span>
            <span className="text-sm font-black text-[#111111]">
              ~₦{totalOutingCost.toLocaleString('en-NG')}
            </span>
          </div>

          <div className="space-y-1.5 text-text-secondary text-[11px]">
            <div className="flex justify-between">
              <span>Typical Food &amp; Drinks:</span>
              <span className="font-bold text-[#111111]">₦{typicalPerPerson.toLocaleString('en-NG')}</span>
            </div>

            <div className="flex justify-between">
              <span>Service Charge ({venue.service_charge_pct || 10}%) &amp; VAT (7.5%):</span>
              <span className="font-bold text-[#111111]">₦{(service + vat).toLocaleString('en-NG')}</span>
            </div>

            <div className="flex justify-between">
              <span>Transport Buffer ({isIsland ? 'Island' : 'Mainland'} Round-trip):</span>
              <span className="font-bold text-[#111111]">₦{transportEstimate.toLocaleString('en-NG')}</span>
            </div>
          </div>
        </div>

        {/* Sample Menu Items Preview */}
        {sampleMenu.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-mono font-bold uppercase text-text-secondary block">
              Sample Owner-Confirmed Menu Prices
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sampleMenu.map((item) => (
                <div key={item.id} className="p-2.5 rounded-lg bg-white border border-[#EAE4DC] text-xs">
                  <p className="font-bold text-[#111111] truncate">{item.name}</p>
                  <p className="font-mono text-[#008751] font-bold text-[11px] mt-0.5">
                    ₦{item.price.toLocaleString('en-NG')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between text-xs text-text-secondary font-mono border-t border-[#EAE4DC]">
          <span>Need to modify prices or charges?</span>
          <Link
            href={`/business/${venue.id}/pricing`}
            className="text-[#008751] font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Edit in Pricing Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
