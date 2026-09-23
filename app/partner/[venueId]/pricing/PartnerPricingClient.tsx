'use client';

import React, { useState } from 'react';
import { Venue, MenuItem } from '@/lib/types';
import { PartnerHeader } from '@/components/partner/PartnerHeader';
import { PriceUpdateModal } from '@/components/partner/PriceUpdateModal';
import { addMenuItemAction, deleteMenuItemAction, updateStructuredChargesAction } from '@/lib/actions/partnerPricingActions';
import { getVerificationText } from '@/lib/planning/presentation/decisionCardMapper';
import { Tag, Plus, Edit2, Trash2, ShieldCheck, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PartnerPricingClientProps {
  venue: Venue;
  initialMenuItems: MenuItem[];
}

export function PartnerPricingClient({
  venue,
  initialMenuItems,
}: PartnerPricingClientProps) {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<MenuItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // New item state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string>('main');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [addingLoading, setAddingLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Structured charges state
  const [vatPct, setVatPct] = useState(venue.vat_pct || 7.5);
  const [serviceChargePct, setServiceChargePct] = useState(venue.service_charge_pct || 0);
  const [minimumSpend, setMinimumSpend] = useState(venue.minimum_spend || 0);
  const [corkageFee, setCorkageFee] = useState(venue.corkage_fee || 0);
  const [entranceFee, setEntranceFee] = useState(venue.entrance_fee || 0);
  const [weekendNotes, setWeekendNotes] = useState(venue.weekend_pricing_notes || '');
  const [savingCharges, setSavingCharges] = useState(false);
  const [chargesSuccess, setChargesSuccess] = useState(false);

  const priceFreshness = getVerificationText(venue.last_price_updated_at);

  const handleEditClick = (item: MenuItem) => {
    setSelectedItemForEdit(item);
    setIsEditModalOpen(true);
  };

  const handlePriceUpdated = (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map((i: MenuItem) => (i.id === updatedItem.id ? updatedItem : i)));
    router.refresh();
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const priceNum = parseInt(newItemPrice, 10);
    if (!newItemName.trim() || isNaN(priceNum) || priceNum <= 0) {
      setAddError('Please enter a valid item name and positive price.');
      return;
    }

    setAddingLoading(true);
    const res = await addMenuItemAction({
      venueId: venue.id,
      name: newItemName.trim(),
      category: newItemCategory as any,
      price: priceNum,
    });
    setAddingLoading(false);

    if (!res.success) {
      setAddError(res.error || 'Failed to add item');
    } else {
      if (res.item) {
        setMenuItems(prev => [...prev, res.item!]);
      }
      setNewItemName('');
      setNewItemPrice('');
      setIsAddingItem(false);
      router.refresh();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item? An audit entry will be logged.')) return;
    const res = await deleteMenuItemAction(venue.id, itemId);
    if (res.success) {
      setMenuItems(prev => prev.filter((i: MenuItem) => i.id !== itemId));
      router.refresh();
    }
  };

  const handleSaveCharges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCharges(true);
    setChargesSuccess(false);

    const res = await updateStructuredChargesAction({
      venueId: venue.id,
      vatPct: Number(vatPct),
      serviceChargePct: Number(serviceChargePct),
      minimumSpend: Number(minimumSpend),
      corkageFee: Number(corkageFee),
      entranceFee: Number(entranceFee),
      weekendPricingNotes: weekendNotes,
    });

    setSavingCharges(false);
    if (res.success) {
      setChargesSuccess(true);
      setTimeout(() => setChargesSuccess(false), 4000);
      router.refresh();
    }
  };

  // Group items
  const foodItems = menuItems.filter((i: MenuItem) => ['main', 'starter', 'dessert'].includes(i.category));
  const drinkItems = menuItems.filter((i: MenuItem) => ['cocktail', 'wine', 'beer', 'spirits', 'soft_drink'].includes(i.category));
  const activityItems = menuItems.filter((i: MenuItem) => i.category === 'activity_fee');
  const otherItems = menuItems.filter((i: MenuItem) => !['main', 'starter', 'dessert', 'cocktail', 'wine', 'beer', 'spirits', 'soft_drink', 'activity_fee'].includes(i.category));

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] antialiased pb-24 space-y-6">
      <PartnerHeader venue={venue} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-border-default p-6 sm:p-7 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider">
                Price Transparency Engine
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-text-muted">
                {priceFreshness.text}
              </span>
            </div>
            <h1 className="type-h3 text-midnight-lagoon font-black uppercase">
              Menu Pricing &amp; Charges
            </h1>
            <p className="type-body text-xs text-text-muted mt-1 max-w-xl">
              Changes you make here immediately protect Lagos planners from bill shock. Every update logs an auditable entry and is reviewed by OyaPlan for verified confidence.
            </p>
          </div>

          <button
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="h-11 px-5 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer tap-feedback shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>

        {/* Audit Transparency Callout */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Non-Destructive Pricing Guarantee</span>
            <p className="leading-relaxed">
              When you adjust a price, OyaPlan never deletes your previous menu records. It registers your change under <span className="font-mono font-bold">price_audit_logs</span> and presents it as a partner-confirmed rate while queueing evidence verification.
            </p>
          </div>
        </div>

        {/* Add Item Form Drawer */}
        {isAddingItem && (
          <form onSubmit={handleAddItem} className="bg-white rounded-3xl border-2 border-brand-green/30 p-6 space-y-4 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="type-h4 text-midnight-lagoon font-bold text-sm uppercase">Add New Menu Item</h3>
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="text-xs text-text-muted hover:text-midnight-lagoon"
              >
                Cancel
              </button>
            </div>

            {addError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg font-medium">{addError}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemName(e.target.value)}
                  placeholder="e.g. Asun Platter"
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Category *</label>
                <select
                  value={newItemCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewItemCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:border-brand-green"
                >
                  <option value="main">Main Course</option>
                  <option value="starter">Starter / Appetizer</option>
                  <option value="cocktail">Cocktail</option>
                  <option value="wine">Wine</option>
                  <option value="beer">Beer</option>
                  <option value="spirits">Spirits</option>
                  <option value="soft_drink">Soft Drink / Water</option>
                  <option value="dessert">Dessert</option>
                  <option value="activity_fee">Activity / Entry Fee</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Price (₦) *</label>
                <input
                  type="number"
                  required
                  value={newItemPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemPrice(e.target.value)}
                  placeholder="e.g. 8500"
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono font-bold focus:bg-white focus:outline-none focus:border-brand-green"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={addingLoading}
                className="h-10 px-5 bg-midnight-lagoon hover:bg-[#00041f] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {addingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Item'}
              </button>
            </div>
          </form>
        )}

        {/* Current Items Inventory */}
        <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-6 shadow-xs">
          {/* Food */}
          {foodItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="type-ui-label text-xs font-black text-text-muted uppercase tracking-wider">
                Food &amp; Dining
              </h3>
              <div className="divide-y divide-gray-100">
                {foodItems.map((item: MenuItem) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-text-primary text-sm block">{item.name}</span>
                      <span className="text-[10px] text-text-muted capitalize">
                        {item.category} · {item.last_updated_at ? `Updated ${new Date(item.last_updated_at).toLocaleDateString()}` : 'Baseline'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-midnight-lagoon">
                        ₦{item.price.toLocaleString('en-NG')}
                      </span>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-2 rounded-lg bg-surface-grey hover:bg-black/5 text-text-secondary transition-colors cursor-pointer tap-feedback"
                        title="Edit price"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-lg bg-surface-grey hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer tap-feedback"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drinks */}
          {drinkItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="type-ui-label text-xs font-black text-text-muted uppercase tracking-wider">
                Drinks &amp; Beverages
              </h3>
              <div className="divide-y divide-gray-100">
                {drinkItems.map((item: MenuItem) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-text-primary text-sm block">{item.name}</span>
                      <span className="text-[10px] text-text-muted capitalize">
                        {item.category} · {item.last_updated_at ? `Updated ${new Date(item.last_updated_at).toLocaleDateString()}` : 'Baseline'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-midnight-lagoon">
                        ₦{item.price.toLocaleString('en-NG')}
                      </span>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-2 rounded-lg bg-surface-grey hover:bg-black/5 text-text-secondary transition-colors cursor-pointer tap-feedback"
                        title="Edit price"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-lg bg-surface-grey hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer tap-feedback"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities / Other */}
          {[...activityItems, ...otherItems].length > 0 && (
            <div className="space-y-3">
              <h3 className="type-ui-label text-xs font-black text-text-muted uppercase tracking-wider">
                Activities &amp; Other
              </h3>
              <div className="divide-y divide-gray-100">
                {[...activityItems, ...otherItems].map((item: MenuItem) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-text-primary text-sm block">{item.name}</span>
                      <span className="text-[10px] text-text-muted capitalize">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-midnight-lagoon">
                        ₦{item.price.toLocaleString('en-NG')}
                      </span>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-2 rounded-lg bg-surface-grey hover:bg-black/5 text-text-secondary transition-colors cursor-pointer tap-feedback"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-lg bg-surface-grey hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer tap-feedback"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {menuItems.length === 0 && (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-bold text-midnight-lagoon">No individual menu items entered yet.</p>
              <p className="text-xs text-text-muted">
                Add a few representative food and drink items so planners can gauge real outing costs.
              </p>
            </div>
          )}
        </div>

        {/* Structured Mandatory Charges Card */}
        <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-6 shadow-xs">
          <div>
            <span className="type-ui-label text-xs font-black text-midnight-lagoon uppercase tracking-wider">
              Mandatory Fees &amp; Structured Charges
            </span>
            <p className="text-xs text-text-muted mt-0.5">
              These rates are automatically calculated into user outing budgets. Keep them accurate to prevent bill shock.
            </p>
          </div>

          {chargesSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-green" />
              <span>Mandatory charges updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveCharges} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px] block">VAT (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vatPct}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVatPct(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px] block">Service Charge (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={serviceChargePct}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceChargePct(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px] block">Minimum Spend (₦)</label>
                <input
                  type="number"
                  value={minimumSpend}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinimumSpend(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px] block">Corkage Fee (₦)</label>
                <input
                  type="number"
                  value={corkageFee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCorkageFee(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px] block">Entrance Fee (₦)</label>
                <input
                  type="number"
                  value={entranceFee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEntranceFee(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-text-muted uppercase text-[10px] block">Weekend / Event Notes</label>
              <input
                type="text"
                value={weekendNotes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeekendNotes(e.target.value)}
                placeholder="e.g. ₦10,000 entrance fee applies after 10pm on Fridays & Saturdays"
                className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingCharges}
                className="h-10 px-6 bg-midnight-lagoon hover:bg-[#00041f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                {savingCharges ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Charges'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Edit Price Modal */}
      <PriceUpdateModal
        venueId={venue.id}
        item={selectedItemForEdit}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onPriceUpdated={handlePriceUpdated}
      />
    </div>
  );
}
