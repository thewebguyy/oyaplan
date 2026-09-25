import React from 'react';
import { Venue, MenuItem } from '@/lib/types';
import { getVerificationText } from '@/lib/planning/presentation/decisionCardMapper';
import { ShieldCheck, Info, Tag, PartyPopper, Layers, Wine, Cake, CheckCircle2 } from 'lucide-react';

interface PublicPricingSectionProps {
  venue: Venue;
  menuItems: MenuItem[];
}

export function PublicPricingSection({ venue, menuItems }: PublicPricingSectionProps) {
  const freshnessText = getVerificationText(venue.last_price_updated_at);
  const isPartnerVerified = venue.partner_state === 'verified_partner';

  // Group items
  const mains = menuItems.filter(i => i.category === 'main');
  const starters = menuItems.filter(i => i.category === 'starter');
  const desserts = menuItems.filter(i => i.category === 'dessert');
  const drinks = menuItems.filter(i => ['cocktail', 'wine', 'beer', 'spirits', 'soft_drink'].includes(i.category));
  const activities = menuItems.filter(i => i.category === 'activity_fee');
  const others = menuItems.filter(i => !['main', 'starter', 'dessert', 'cocktail', 'wine', 'beer', 'spirits', 'soft_drink', 'activity_fee'].includes(i.category));

  const foodItems = [...mains, ...starters, ...desserts];

  const hasCharges = (venue.vat_pct > 0) || (venue.service_charge_pct > 0) || 
    (venue.minimum_spend > 0) || Boolean(venue.corkage_fee && venue.corkage_fee > 0) ||
    Boolean(venue.cake_fee && venue.cake_fee > 0) ||
    Boolean(venue.entrance_fee && venue.entrance_fee > 0) || Boolean(venue.reservation_fee && venue.reservation_fee > 0);

  const hasCelebrationRules = Boolean(
    venue.cake_fee !== undefined ||
    venue.corkage_fee !== undefined ||
    venue.spirit_corkage_fee !== undefined ||
    venue.decor_fee !== undefined ||
    venue.celebration_notes
  );

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-8 space-y-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight flex items-center gap-2">
            <span>What you might spend</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Representative menu items and house charges for realistic budget planning.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isPartnerVerified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EAFDF3] border border-[#A3F3C6] rounded-full text-xs font-bold text-[#0A7C3F]">
              <ShieldCheck className="w-4 h-4" />
              <span>Partner Verified</span>
            </span>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-grey border border-border-default rounded-full text-xs font-bold text-text-secondary">
            <Tag className="w-3.5 h-3.5 text-[#008751]" />
            <span>{freshnessText}</span>
          </div>
        </div>
      </div>

      {/* Menu Categories */}
      <div className="space-y-6">
        {/* Food Section */}
        {foodItems.length > 0 && (
          <div className="space-y-3">
            <h3 className="type-ui-label text-xs font-black text-text-muted uppercase tracking-wider">
              Food &amp; Dining
            </h3>
            <div className="divide-y divide-gray-100">
              {foodItems.slice(0, 8).map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-text-primary">{item.name}</span>
                  <span className="font-mono font-bold text-midnight-lagoon">
                    ₦{item.price.toLocaleString('en-NG')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drinks Section */}
        {drinks.length > 0 && (
          <div className="space-y-3">
            <h3 className="type-ui-label text-xs font-black text-text-muted uppercase tracking-wider">
              Drinks &amp; Beverages
            </h3>
            <div className="divide-y divide-gray-100">
              {drinks.slice(0, 6).map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-text-primary">{item.name}</span>
                  <span className="font-mono font-bold text-midnight-lagoon">
                    ₦{item.price.toLocaleString('en-NG')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities Section */}
        {activities.length > 0 && (
          <div className="space-y-3">
            <h3 className="type-ui-label text-xs font-black text-text-muted uppercase tracking-wider">
              Activities &amp; Entry
            </h3>
            <div className="divide-y divide-gray-100">
              {activities.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-text-primary">{item.name}</span>
                  <span className="font-mono font-bold text-midnight-lagoon">
                    ₦{item.price.toLocaleString('en-NG')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other items */}
        {others.length > 0 && (
          <div className="space-y-3">
            <h3 className="type-ui-label text-xs font-black text-text-muted uppercase tracking-wider">
              Other Special Items
            </h3>
            <div className="divide-y divide-gray-100">
              {others.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-text-primary">{item.name}</span>
                  <span className="font-mono font-bold text-midnight-lagoon">
                    ₦{item.price.toLocaleString('en-NG')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {menuItems.length === 0 && (
          <div className="py-8 text-center bg-surface-grey rounded-2xl border border-border-default/60 space-y-2">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Menu Items Currently Being Verified
            </p>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Our team and venue operators are updating exact item prices. Overall budget estimates reflect average per-person spend for this venue class.
            </p>
          </div>
        )}
      </div>

      {/* Mandatory Charges & House Fees */}
      {hasCharges && (
        <div className="p-4 sm:p-5 bg-surface-grey rounded-2xl border border-border-default/60 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-text-muted">
            <Info className="w-3.5 h-3.5 text-brand-green" />
            <span>Taxes &amp; Mandatory House Policies</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {venue.vat_pct > 0 && (
              <div className="space-y-0.5">
                <span className="text-text-muted">Lagos State VAT</span>
                <p className="font-mono font-bold text-text-primary">{venue.vat_pct}%</p>
              </div>
            )}
            {venue.service_charge_pct > 0 && (
              <div className="space-y-0.5">
                <span className="text-text-muted">Service Charge</span>
                <p className="font-mono font-bold text-text-primary">{venue.service_charge_pct}%</p>
              </div>
            )}
            {venue.minimum_spend > 0 && (
              <div className="space-y-0.5">
                <span className="text-text-muted">Minimum Table Spend</span>
                <p className="font-mono font-bold text-text-primary">₦{venue.minimum_spend.toLocaleString('en-NG')}</p>
              </div>
            )}
            {Boolean(venue.corkage_fee && venue.corkage_fee > 0) && (
              <div className="space-y-0.5">
                <span className="text-text-muted">Wine Corkage</span>
                <p className="font-mono font-bold text-text-primary">₦{venue.corkage_fee?.toLocaleString('en-NG')} / bottle</p>
              </div>
            )}
            {Boolean(venue.entrance_fee && venue.entrance_fee > 0) && (
              <div className="space-y-0.5">
                <span className="text-text-muted">Door Entry Fee</span>
                <p className="font-mono font-bold text-text-primary">₦{venue.entrance_fee?.toLocaleString('en-NG')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Celebration & Corkage Rules */}
      {hasCelebrationRules && (
        <div className="p-4 sm:p-5 bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-midnight-lagoon">
            <PartyPopper className="w-3.5 h-3.5 text-brand-green" />
            <span>Celebrations &amp; Bring-Your-Own Policies</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {venue.cake_fee !== undefined && (
              <div className="p-2.5 rounded-xl bg-white border border-[#EAE4DC] space-y-0.5">
                <div className="flex items-center gap-1 text-slate-500 font-bold">
                  <Cake className="w-3 h-3 text-amber-600" />
                  <span>Outside Birthday Cake</span>
                </div>
                <p className="font-bold text-slate-900">
                  {venue.cake_fee === 0 ? 'Allowed (No fee)' : `Allowed (₦${venue.cake_fee?.toLocaleString('en-NG')} cutting fee)`}
                </p>
              </div>
            )}

            {(venue.corkage_fee !== undefined || venue.spirit_corkage_fee !== undefined) && (
              <div className="p-2.5 rounded-xl bg-white border border-[#EAE4DC] space-y-0.5">
                <div className="flex items-center gap-1 text-slate-500 font-bold">
                  <Wine className="w-3 h-3 text-indigo-600" />
                  <span>Outside Bottle Corkage</span>
                </div>
                <p className="font-bold text-slate-900">
                  {venue.spirit_corkage_fee ? `₦${venue.spirit_corkage_fee.toLocaleString('en-NG')} / spirit bottle` : venue.corkage_fee ? `₦${venue.corkage_fee.toLocaleString('en-NG')} / wine bottle` : 'Inquire with venue'}
                </p>
              </div>
            )}
          </div>

          {venue.celebration_notes && (
            <p className="text-xs text-slate-600 italic pt-1">
              &ldquo;{venue.celebration_notes}&rdquo;
            </p>
          )}
        </div>
      )}

    </div>
  );
}
