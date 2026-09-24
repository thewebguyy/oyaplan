'use client';

import React, { useState } from 'react';
import { Venue, MenuItem } from '@/lib/types';
import { PriceUpdateModal } from '@/components/partner/PriceUpdateModal';
import {
  addMenuItemAction,
  deleteMenuItemAction,
  updateStructuredChargesAction,
  confirmAllPricesAction,
  type AddMenuItemInput,
} from '@/lib/actions/partnerPricingActions';
import { getVerificationText } from '@/lib/planning/presentation/decisionCardMapper';
import { TablePolicyManager } from '@/components/business/TablePolicyManager';
import { CelebrationRulesCard } from '@/components/business/CelebrationRulesCard';
import {
  Plus,
  Edit2,
  Trash2,
  Info,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Percent,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BusinessPricingClientProps {
  venue: Venue;
  initialMenuItems: MenuItem[];
}

export function BusinessPricingClient({
  venue,
  initialMenuItems,
}: BusinessPricingClientProps) {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<MenuItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // New item form state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string>('main');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [addingLoading, setAddingLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Structured charges state
  const [vatPct, setVatPct] = useState(venue.vat_pct ?? 7.5);
  const [serviceChargePct, setServiceChargePct] = useState(venue.service_charge_pct ?? 0);
  const [minimumSpend, setMinimumSpend] = useState(venue.minimum_spend ?? 0);
  const [corkageFee, setCorkageFee] = useState(venue.corkage_fee ?? 0);
  const [entranceFee, setEntranceFee] = useState(venue.entrance_fee ?? 0);
  const [weekendNotes, setWeekendNotes] = useState(venue.weekend_pricing_notes || '');
  const [savingCharges, setSavingCharges] = useState(false);
  const [chargesSuccess, setChargesSuccess] = useState(false);

  // Speed pricing / 1-tap confirmation
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  const priceFreshness = getVerificationText(venue.last_price_updated_at);

  const handleEditClick = (item: MenuItem) => {
    setSelectedItemForEdit(item);
    setIsEditModalOpen(true);
  };

  const handlePriceUpdated = (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map((i: MenuItem) => (i.id === updatedItem.id ? updatedItem : i)));
    router.refresh();
  };

  const handleConfirmAll = async () => {
    setConfirmingAll(true);
    setConfirmSuccess(false);
    const res = await confirmAllPricesAction(venue.id);
    setConfirmingAll(false);
    if (res.success) {
      setConfirmSuccess(true);
      setTimeout(() => setConfirmSuccess(false), 5000);
      router.refresh();
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    const priceNum = parseInt(newItemPrice, 10);
    if (!newItemName.trim() || isNaN(priceNum) || priceNum <= 0) {
      setAddError('Please enter a valid item name and price.');
      return;
    }

    setAddingLoading(true);
    const res = await addMenuItemAction({
      venueId: venue.id,
      name: newItemName.trim(),
      category: newItemCategory as AddMenuItemInput['category'],
      price: priceNum,
    });
    setAddingLoading(false);

    if (!res.success) {
      setAddError(res.error || 'Failed to add item');
      return;
    }

    if (res.item) {
      setMenuItems(prev => [...prev, res.item!]);
    }
    setNewItemName('');
    setNewItemPrice('');
    setIsAddingItem(false);
    router.refresh();
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

  // Group items by menu category
  const foodItems = menuItems.filter((i: MenuItem) => ['main', 'starter', 'dessert'].includes(i.category));
  const drinkItems = menuItems.filter((i: MenuItem) => ['cocktail', 'wine', 'beer', 'spirits', 'soft_drink'].includes(i.category));
  const activityItems = menuItems.filter((i: MenuItem) => i.category === 'activity_fee');
  const otherItems = menuItems.filter((i: MenuItem) => !['main', 'starter', 'dessert', 'cocktail', 'wine', 'beer', 'spirits', 'soft_drink', 'activity_fee'].includes(i.category));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-border-default p-5 sm:p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">
              Menu Pricing &amp; Charges
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-text-muted">{priceFreshness}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-lagoon tracking-tight">
            Menu Items &amp; Mandatory Fees
          </h1>

          <p className="text-xs sm:text-sm text-text-muted max-w-xl leading-relaxed">
            Changes here directly inform squad budget estimates. Confirm current prices with 1 tap or adjust individual items.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Speed Pricing Confirmation */}
          <button
            type="button"
            onClick={handleConfirmAll}
            disabled={confirmingAll}
            className="h-10 px-4 bg-[#EAFDF3] hover:bg-[#D5F9E4] text-[#0A7C3F] border border-[#A3F3C6] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer tap-feedback shadow-xs disabled:opacity-50"
            title="Confirm that your current prices are still up to date"
          >
            {confirmingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : confirmSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>{confirmSuccess ? 'Prices Confirmed!' : 'Confirm Prices Current'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="h-10 px-4 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer tap-feedback shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Non-Destructive Guarantee Banner */}
      <div className="bg-[#FAF7F2] border border-[#EAE4DC] rounded-xl p-4 sm:p-5 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#7A3E1D] shrink-0 mt-0.5" />
        <div className="text-xs text-[#5C381E] space-y-0.5">
          <span className="font-bold text-midnight-lagoon block">Non-Destructive Pricing Guarantee</span>
          <p className="leading-relaxed">
            When you adjust a price, OyaPlan never deletes historical data. Changes are recorded in an auditable price ledger, immediately reflecting in outing cost calculations for Lagos planners.
          </p>
        </div>
      </div>

      {/* Add Item Form */}
      {isAddingItem && (
        <form onSubmit={handleAddItem} className="bg-white rounded-2xl border-2 border-brand-green/40 p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-border-default pb-3">
            <h3 className="font-bold text-midnight-lagoon text-sm">Add New Menu Item</h3>
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
              <label className="font-bold text-text-secondary text-[11px]">Item Name *</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemName(e.target.value)}
                placeholder="e.g. Asun Platter"
                className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAF7F2] text-xs focus:bg-white focus:outline-none focus:border-brand-green font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-secondary text-[11px]">Category *</label>
              <select
                value={newItemCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewItemCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAF7F2] text-xs focus:bg-white focus:outline-none focus:border-brand-green font-medium"
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
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-secondary text-[11px]">Price (NGN) *</label>
              <input
                type="number"
                required
                min="0"
                step="100"
                value={newItemPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItemPrice(e.target.value)}
                placeholder="e.g. 8500"
                className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAF7F2] text-xs focus:bg-white focus:outline-none focus:border-brand-green font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="h-10 px-4 rounded-xl text-xs font-semibold text-text-muted hover:bg-surface-grey transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingLoading}
              className="h-10 px-5 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 tap-feedback"
            >
              {addingLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Item</span>
            </button>
          </div>
        </form>
      )}

      {/* Menu Categories */}
      <div className="space-y-4">
        {/* Food Section */}
        <div className="bg-white rounded-2xl border border-border-default overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-border-default flex items-center justify-between bg-[#FAF7F2]">
            <div>
              <h3 className="font-bold text-midnight-lagoon text-sm">Food &amp; Dining</h3>
              <p className="text-[11px] text-text-muted">Mains, appetizers, and desserts</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-text-muted border border-border-default">
              {foodItems.length} items
            </span>
          </div>

          {foodItems.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {foodItems.map((item) => (
                <div key={item.id} className="p-4 sm:px-5 flex items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors">
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-text-primary block truncate">{item.name}</span>
                    <span className="text-[10px] text-text-muted capitalize">{item.category}</span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-xs sm:text-sm font-bold font-mono text-midnight-lagoon">
                      ₦{item.price.toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-2 rounded-lg text-text-muted hover:text-midnight-lagoon hover:bg-surface-grey transition-colors tap-feedback"
                      title="Update Price"
                      aria-label={`Update price for ${item.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors tap-feedback"
                      title="Remove Item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-text-muted">
              No food items added yet. Add your main dishes so planners understand your spend tier.
            </div>
          )}
        </div>

        {/* Drinks Section */}
        <div className="bg-white rounded-2xl border border-border-default overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-border-default flex items-center justify-between bg-[#FAF7F2]">
            <div>
              <h3 className="font-bold text-midnight-lagoon text-sm">Drinks &amp; Beverages</h3>
              <p className="text-[11px] text-text-muted">Cocktails, wine, beers, and soft drinks</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-text-muted border border-border-default">
              {drinkItems.length} items
            </span>
          </div>

          {drinkItems.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {drinkItems.map((item) => (
                <div key={item.id} className="p-4 sm:px-5 flex items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors">
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-text-primary block truncate">{item.name}</span>
                    <span className="text-[10px] text-text-muted capitalize">{item.category}</span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-xs sm:text-sm font-bold font-mono text-midnight-lagoon">
                      ₦{item.price.toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-2 rounded-lg text-text-muted hover:text-midnight-lagoon hover:bg-surface-grey transition-colors tap-feedback"
                      title="Update Price"
                      aria-label={`Update price for ${item.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors tap-feedback"
                      title="Remove Item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-text-muted">
              No beverage items added yet. Planners consider drinks essential to total budget calculations.
            </div>
          )}
        </div>

        {/* Activity & Other Fees */}
        {(activityItems.length > 0 || otherItems.length > 0) && (
          <div className="bg-white rounded-2xl border border-border-default overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-border-default flex items-center justify-between bg-[#FAF7F2]">
              <div>
                <h3 className="font-bold text-midnight-lagoon text-sm">Activities &amp; Other Items</h3>
                <p className="text-[11px] text-text-muted">Ticket items, arcade passes, or miscellaneous fees</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-text-muted border border-border-default">
                {activityItems.length + otherItems.length} items
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {[...activityItems, ...otherItems].map((item) => (
                <div key={item.id} className="p-4 sm:px-5 flex items-center justify-between gap-4 hover:bg-[#FAF7F2]/50 transition-colors">
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-text-primary block truncate">{item.name}</span>
                    <span className="text-[10px] text-text-muted capitalize">{item.category}</span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-xs sm:text-sm font-bold font-mono text-midnight-lagoon">
                      ₦{item.price.toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-2 rounded-lg text-text-muted hover:text-midnight-lagoon hover:bg-surface-grey transition-colors tap-feedback"
                      title="Update Price"
                      aria-label={`Update price for ${item.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors tap-feedback"
                      title="Remove Item"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Charges Form */}
      <form onSubmit={handleSaveCharges} className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-default pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-green" />
              <h2 className="text-base font-bold text-midnight-lagoon">
                Mandatory Charges &amp; Bill Breakdown
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              These percentages and fees are automatically factored into squad budget totals so guests are never surprised.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingCharges}
            className="h-9 px-4 bg-midnight-lagoon hover:bg-[#00041f] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0 cursor-pointer tap-feedback"
          >
            {savingCharges && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {chargesSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{chargesSuccess ? 'Charges Saved' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* VAT */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]/60">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-text-secondary">VAT Percentage</label>
              <Percent className="w-3.5 h-3.5 text-text-muted" />
            </div>
            <input
              type="number"
              min="0"
              max="30"
              step="0.5"
              value={vatPct}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVatPct(parseFloat(e.target.value) || 0)}
              className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green font-mono"
            />
            <p className="text-[10px] text-text-muted">Standard Nigerian VAT is 7.5%.</p>
          </div>

          {/* Service Charge */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]/60">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-text-secondary">Service Charge %</label>
              <Percent className="w-3.5 h-3.5 text-text-muted" />
            </div>
            <input
              type="number"
              min="0"
              max="30"
              step="0.5"
              value={serviceChargePct}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceChargePct(parseFloat(e.target.value) || 0)}
              className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green font-mono"
            />
            <p className="text-[10px] text-text-muted">Optional. Enter 0 if no service charge is applied.</p>
          </div>

          {/* Minimum Spend */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]/60">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-text-secondary">Minimum Spend (NGN)</label>
              <span className="text-[10px] text-text-muted font-mono font-bold">₦</span>
            </div>
            <input
              type="number"
              min="0"
              step="5000"
              value={minimumSpend}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinimumSpend(parseInt(e.target.value, 10) || 0)}
              className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green font-mono"
            />
            <p className="text-[10px] text-text-muted">Leave 0 if you do not enforce table minimums.</p>
          </div>

          {/* Corkage Fee */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]/60">
            <label className="text-[11px] font-bold text-text-secondary block">Corkage Fee (NGN)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={corkageFee}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCorkageFee(parseInt(e.target.value, 10) || 0)}
              className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green font-mono"
            />
            <p className="text-[10px] text-text-muted">Charge for outside wine or drinks.</p>
          </div>

          {/* Entrance Fee */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]/60">
            <label className="text-[11px] font-bold text-text-secondary block">Cover / Entry (NGN)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={entranceFee}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEntranceFee(parseInt(e.target.value, 10) || 0)}
              className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green font-mono"
            />
            <p className="text-[10px] text-text-muted">Door fee per person if applicable.</p>
          </div>

          {/* Weekend Notes */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC]/60">
            <label className="text-[11px] font-bold text-text-secondary block">Special Conditions</label>
            <input
              type="text"
              value={weekendNotes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeekendNotes(e.target.value)}
              placeholder="e.g. 10% surcharge on Sundays"
              className="w-full h-10 px-3 rounded-lg border border-border-default bg-white text-xs text-midnight-lagoon focus:outline-none focus:border-brand-green font-medium"
            />
            <p className="text-[10px] text-text-muted">Surge pricing, weekend rules, or table policies.</p>
          </div>
        </div>
      </form>

      {/* Operational Table Policies */}
      <TablePolicyManager
        venueId={venue.id}
        initialPolicies={venue.table_policies || []}
        updatedAt={venue.table_policies_updated_at}
      />

      {/* Celebration & Corkage Rules */}
      <CelebrationRulesCard
        venueId={venue.id}
        initialCakeFee={venue.cake_fee}
        initialSpiritCorkageFee={venue.spirit_corkage_fee}
        initialDecorFee={venue.decor_fee}
        initialPhotoShootFee={venue.photo_shoot_fee}
        initialCelebrationNotes={venue.celebration_notes}
        status={venue.celebration_rules_status}
        updatedAt={venue.celebration_rules_updated_at}
      />

      {/* Outing Spend Confidence Explainer */}
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#EAE4DC] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-1.5 text-brand-green font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">How Lagos Planners Use This</span>
          </div>
          <h3 className="font-bold text-sm text-midnight-lagoon">
            Every verified price improves your squad match confidence
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            When squads ask OyaPlan for outings under ₦25,000/person, venues with confirmed pricing and transparent VAT/service fees match naturally without fear of surprise bills.
          </p>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-border-default text-xs text-text-secondary space-y-1 shrink-0">
          <span className="font-bold text-midnight-lagoon block">Current Formula Applied:</span>
          <div className="font-mono text-[11px]">Subtotal + {vatPct}% VAT + {serviceChargePct}% Service</div>
          {minimumSpend > 0 && <div className="text-[#7A3E1D] font-bold font-mono text-[11px]">₦{minimumSpend.toLocaleString()} min spend enforced</div>}
        </div>
      </div>

      {/* Price Update Modal */}
      {selectedItemForEdit && (
        <PriceUpdateModal
          key={selectedItemForEdit.id}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItemForEdit(null);
          }}
          item={selectedItemForEdit}
          venueId={venue.id}
          onPriceUpdated={handlePriceUpdated}
        />
      )}
    </div>
  );
}
