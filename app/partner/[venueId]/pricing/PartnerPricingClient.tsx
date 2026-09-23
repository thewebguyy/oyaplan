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
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<MenuItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // New item state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<any>('main');
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

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(newItemPrice.replace(/[^0-9]/g, ''), 10);
    if (!newItemName.trim() || isNaN(priceNum) || priceNum <= 0) {
      setAddError('Please enter a valid item name and price.');
      return;
    }

    setAddingLoading(true);
    setAddError(null);

    const res = await addMenuItemAction({
      venueId: venue.id,
      name: newItemName.trim(),
      category: newItemCategory,
      price: priceNum,
    });

    setAddingLoading(false);

    if (res.success && res.menuItemId) {
      setMenuItems([
        ...menuItems,
        {
          id: res.menuItemId,
          venue_id: venue.id,
          name: newItemName.trim(),
          category: newItemCategory,
          price: priceNum,
          is_available: true,
          last_updated_at: new Date().toISOString(),
        }
      ]);
      setNewItemName('');
      setNewItemPrice('');
      setIsAddingItem(false);
      router.refresh();
    } else {
      setAddError(res.error || 'Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item? An audit entry will be logged.')) return;
    const res = await deleteMenuItemAction(venue.id, itemId);
    if (res.success) {
      setMenuItems(menuItems.filter(i => i.id !== itemId));
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
  const foodItems = menuItems.filter(i => ['main', 'starter', 'dessert'].includes(i.category));
  const drinkItems = menuItems.filter(i => ['cocktail', 'wine', 'beer', 'spirits', 'soft_drink'].includes(i.category));
  const activityItems = menuItems.filter(i => i.category === 'activity_fee');
  const otherItems = menuItems.filter(i => !['main', 'starter', 'dessert', 'cocktail', 'wine', 'beer', 'spirits', 'soft_drink', 'activity_fee'].includes(i.category));

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] antialiased pb-24 space-y-6">
      <PartnerHeader venue={venue} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-2 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="type-ui-label text-xs font-black text-brand-green uppercase tracking-wider block">
                Price Management
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight mt-0.5">
                Your Prices on OyaPlan
              </h1>
            </div>

            <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-surface-grey border border-border-default rounded-full text-xs font-bold text-text-secondary">
              <ShieldCheck className="w-4 h-4 text-[#008751]" />
              <span>{priceFreshness}</span>
            </div>
          </div>

          <p className="type-body text-xs sm:text-sm text-text-muted leading-relaxed">
            Customers use this information to understand what an outing at your venue may cost. Keeping it current helps OyaPlan send the right customers to your venue.
          </p>
        </div>

        {/* Action Header: Add Item */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-black text-midnight-lagoon uppercase tracking-tight">
            Menu Items ({menuItems.length})
          </h2>

          <button
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="h-10 px-4 bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all tap-feedback cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingItem ? 'Cancel' : 'Add Item'}</span>
          </button>
        </div>

        {/* Add Item Card */}
        {isAddingItem && (
          <form
            onSubmit={handleAddItem}
            className="bg-white rounded-2xl border border-brand-green/40 p-5 space-y-4 shadow-sm"
          >
            <h3 className="text-xs font-black uppercase text-brand-green tracking-wider">
              Add New Menu Item
            </h3>

            {addError && <p className="text-xs text-red-600 font-bold">{addError}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1 sm:col-span-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Item Name *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Asun Platter"
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs focus:bg-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase text-[10px]">Category *</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
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
                  onChange={(e) => setNewItemPrice(e.target.value)}
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

        {/* Menu Items Table / Cards */}
        <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-6 shadow-xs">
          {/* Food */}
          {foodItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="type-ui-label text-xs font-black text-text-muted uppercase tracking-wider">
                Food &amp; Dining
              </h3>
              <div className="divide-y divide-gray-100">
                {foodItems.map((item) => (
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
                {drinkItems.map((item) => (
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
                {[...activityItems, ...otherItems].map((item) => (
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
            <div className="p-8 text-center space-y-3 bg-[#FAFAF8] rounded-2xl">
              <Tag className="w-8 h-8 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-midnight-lagoon text-sm">No menu items recorded</h4>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Add representative food and drink items above so OyaPlan can estimate squad outing costs.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Structured Mandatory Charges Card */}
        <div className="bg-white rounded-3xl border border-border-default p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border-default/60 pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-green" />
              <h3 className="text-base sm:text-lg font-black text-midnight-lagoon uppercase tracking-tight">
                Mandatory Charges &amp; Fees
              </h3>
            </div>
            {chargesSuccess && (
              <span className="text-xs font-bold text-[#008751] flex items-center gap-1 bg-[#EAFDF3] px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                <span>Saved</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveCharges} className="space-y-4 text-xs font-semibold text-text-primary">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px] block">VAT (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vatPct}
                  onChange={(e) => setVatPct(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px] block">Service Charge (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={serviceChargePct}
                  onChange={(e) => setServiceChargePct(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px] block">Minimum Spend (₦)</label>
                <input
                  type="number"
                  value={minimumSpend}
                  onChange={(e) => setMinimumSpend(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px] block">Corkage Fee (₦)</label>
                <input
                  type="number"
                  value={corkageFee}
                  onChange={(e) => setCorkageFee(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-text-muted uppercase text-[10px] block">Entrance Fee (₦)</label>
                <input
                  type="number"
                  value={entranceFee}
                  onChange={(e) => setEntranceFee(parseInt(e.target.value, 10) || 0)}
                  className="w-full h-11 px-3 rounded-xl border border-border-default bg-[#FAFAF8] text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-text-muted uppercase text-[10px] block">Weekend / Event Notes</label>
              <input
                type="text"
                value={weekendNotes}
                onChange={(e) => setWeekendNotes(e.target.value)}
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
        onSuccess={() => {
          setIsEditModalOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
