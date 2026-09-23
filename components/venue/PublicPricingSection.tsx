import React from 'react';
import { Venue, MenuItem } from '@/lib/types';
import { getVerificationText } from '@/lib/planning/presentation/decisionCardMapper';
import { ShieldCheck, Info, Tag } from 'lucide-react';

interface PublicPricingSectionProps {
  venue: Venue;
  menuItems: MenuItem[];
}

export function PublicPricingSection({ venue, menuItems }: PublicPricingSectionProps) {
  const freshnessText = getVerificationText(venue.last_price_updated_at);
  const isVerified = venue.partner_state === 'verified_partner' || venue.operational_status === 'verified' || venue.operational_status === 'fresh';

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
    Boolean(venue.entrance_fee && venue.entrance_fee > 0) || Boolean(venue.reservation_fee && venue.reservation_fee > 0);

  return (
    <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-default/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-midnight-lagoon uppercase tracking-tight flex items-center gap-2">
            <span>What you might spend</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-0.5">
            Representative menu items and mandatory charges for realistic budget planning.
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 bg-surface-grey border border-border-default rounded-full text-xs font-bold text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-[#008751]" />
          <span>{freshnessText}</span>
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

        {/* Empty Menu State */}
        {menuItems.length === 0 && (
          <div className="p-6 bg-surface-grey rounded-2xl text-center space-y-1">
            <Tag className="w-6 h-6 text-gray-400 mx-auto" />
            <p className="font-bold text-text-primary text-sm">Estimated from category baseline</p>
            <p className="text-xs text-text-muted">
              Representative item prices are being verified for this venue.
            </p>
          </div>
        )}
      </div>

      {/* Mandatory Charges & Tax Policies */}
      {hasCharges && (
        <div className="bg-[#FAFAF8] border border-border-default rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-midnight-lagoon">
            <Info className="w-4 h-4 text-brand-green" />
            <span>Taxes &amp; Mandatory Fees</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {venue.vat_pct > 0 && (
              <div className="p-3 bg-white rounded-xl border border-border-default/60">
                <span className="text-text-muted block">VAT</span>
                <span className="font-bold text-text-primary text-sm">{venue.vat_pct}%</span>
              </div>
            )}

            {venue.service_charge_pct > 0 && (
              <div className="p-3 bg-white rounded-xl border border-border-default/60">
                <span className="text-text-muted block">Service Charge</span>
                <span className="font-bold text-text-primary text-sm">{venue.service_charge_pct}%</span>
              </div>
            )}

            {venue.minimum_spend > 0 && (
              <div className="p-3 bg-white rounded-xl border border-border-default/60">
                <span className="text-text-muted block">Minimum Spend</span>
                <span className="font-bold text-text-primary text-sm">₦{venue.minimum_spend.toLocaleString('en-NG')}</span>
              </div>
            )}

            {Boolean(venue.corkage_fee && venue.corkage_fee > 0) && (
              <div className="p-3 bg-white rounded-xl border border-border-default/60">
                <span className="text-text-muted block">Corkage Fee</span>
                <span className="font-bold text-text-primary text-sm">₦{venue.corkage_fee?.toLocaleString('en-NG')}</span>
              </div>
            )}

            {Boolean(venue.entrance_fee && venue.entrance_fee > 0) && (
              <div className="p-3 bg-white rounded-xl border border-border-default/60">
                <span className="text-text-muted block">Entrance Fee</span>
                <span className="font-bold text-text-primary text-sm">₦{venue.entrance_fee?.toLocaleString('en-NG')}</span>
              </div>
            )}

            {Boolean(venue.reservation_fee && venue.reservation_fee > 0) && (
              <div className="p-3 bg-white rounded-xl border border-border-default/60">
                <span className="text-text-muted block">Reservation Deposit</span>
                <span className="font-bold text-text-primary text-sm">₦{venue.reservation_fee?.toLocaleString('en-NG')}</span>
              </div>
            )}
          </div>

          {venue.weekend_pricing_notes && (
            <p className="text-xs text-text-secondary bg-white p-3 rounded-xl border border-border-default/60">
              <span className="font-bold">Weekend / Event Notes:</span> {venue.weekend_pricing_notes}
            </p>
          )}
        </div>
      )}

      {/* Trust Philosophy Statement */}
      <div className="text-[11px] text-text-muted leading-relaxed border-t border-border-default/40 pt-4">
        Cost transparency is OyaPlan&apos;s non-negotiable standard. Pricing reflects verified menu figures and mandatory taxes so your squad doesn&apos;t face bill shock.
      </div>
    </div>
  );
}
