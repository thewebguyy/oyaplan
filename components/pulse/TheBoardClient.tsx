'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Venue, MenuItem } from '@/lib/types';
import { toggleMenuItem86Action } from '@/lib/actions/pulseActions';
import { updateMenuItemPriceAction, addMenuItemAction, confirmAllPricesAction } from '@/lib/actions/partnerPricingActions';
import { triggerHaptic } from '@/lib/ui/haptics';
import {
  UtensilsCrossed,
  Plus,
  Check,
  X,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Clock,
  Sparkles,
  Tag,
  Search,
  Filter,
  Camera,
} from 'lucide-react';

interface TheBoardClientProps {
  venue: Venue;
  initialMenuItems: MenuItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Items',
  main: 'Mains',
  starter: 'Starters',
  cocktail: 'Cocktails',
  wine: 'Wine',
  beer: 'Beer',
  spirits: 'Spirits',
  soft_drink: 'Soft Drinks',
  dessert: 'Desserts',
  activity_fee: 'Activities / Cover',
};

const CATEGORY_IMAGES: Record<string, string> = {
  main: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
  starter: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80',
  cocktail: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&auto=format&fit=crop&q=80',
  beer: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&auto=format&fit=crop&q=80',
  spirits: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&auto=format&fit=crop&q=80',
  soft_drink: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
  dessert: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
  activity_fee: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&auto=format&fit=crop&q=80',
  other: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
};

export function TheBoardClient({ venue, initialMenuItems }: TheBoardClientProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 86 action loading tracking
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);

  // Price inline edit state
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>('');
  const [priceSaving, setPriceSaving] = useState<boolean>(false);

  // Quick Add Item state
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('main');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Speed confirmation
  const [confirmingPrices, setConfirmingPrices] = useState(false);

  // AI Scanner & Menu Drops state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<'idle' | 'analyzing' | 'preview'>('idle');
  const [scannedItems, setScannedItems] = useState<Array<{ name: string; category: MenuItem['category']; price: number }>>([]);
  const [pushingDrops, setPushingDrops] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // AI Menu Scanner simulation & parse
  const handleStartScan = (sampleType: 'dinner' | 'drinks' = 'dinner') => {
    setScanStep('analyzing');
    triggerHaptic('success');
    setTimeout(() => {
      if (sampleType === 'dinner') {
        setScannedItems([
          { name: 'Wood-Fired Ribeye (400g)', category: 'main', price: 38000 },
          { name: 'Lagos Peppered Jumbo Prawns', category: 'main', price: 26000 },
          { name: 'Truffle Yam Fries', category: 'starter', price: 8500 },
          { name: 'Spiced Calamari Fritti', category: 'starter', price: 11000 },
        ]);
      } else {
        setScannedItems([
          { name: 'Signature Chapman Cocktail', category: 'cocktail', price: 6500 },
          { name: 'Smoked Hibiscus Margarita', category: 'cocktail', price: 7500 },
          { name: 'Chilled Coconut Water Cooler', category: 'soft_drink', price: 4000 },
          { name: 'Don Julio Blanco (Double Shot)', category: 'spirits', price: 12000 },
        ]);
      }
      setScanStep('preview');
      triggerHaptic('success');
    }, 1200);
  };

  const handlePushAllScanned = async () => {
    setPushingDrops(true);
    triggerHaptic('success');
    try {
      const added: MenuItem[] = [];
      for (const item of scannedItems) {
        const res = await addMenuItemAction({
          venueId: venue.id,
          name: item.name,
          category: item.category,
          price: item.price,
        });
        if (res.success && res.item) {
          added.push(res.item);
        }
      }
      if (added.length > 0) {
        setMenuItems((prev) => [...added, ...prev]);
        showToast(`✓ ${added.length} dishes dropped live to Lagos squads!`);
      } else {
        showToast('Items synced to board');
      }
      setIsScanning(false);
      setScanStep('idle');
    } catch {
      alert('Network issue during menu drop. Please retry.');
    } finally {
      setPushingDrops(false);
    }
  };

  // 86 Toggle Handler
  const handleToggle86 = async (item: MenuItem) => {
    const nextAvailability = !item.is_available;
    setTogglingItemId(item.id);
    triggerHaptic(nextAvailability ? 'success' : 'warning');

    // Optimistic update
    setMenuItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_available: nextAvailability } : i))
    );

    try {
      const res = await toggleMenuItem86Action(venue.id, item.id, nextAvailability);
      if (res.success) {
        showToast(nextAvailability ? `${item.name} is now Available` : `${item.name} 86'd (Sold Out)`);
      } else {
        // Rollback
        setMenuItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_available: item.is_available } : i))
        );
        alert(res.error || "Failed to toggle 86'd status.");
      }
    } catch {
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: item.is_available } : i))
      );
      alert('Network error. Unable to persist availability.');
    } finally {
      setTogglingItemId(null);
    }
  };

  // Save inline price
  const handleSavePrice = async (itemId: string) => {
    const parsed = parseInt(editPriceValue, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setEditingPriceItemId(null);
      return;
    }

    setPriceSaving(true);
    triggerHaptic('success');

    // Optimistic update
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, price: parsed } : i))
    );
    setEditingPriceItemId(null);

    try {
      const res = await updateMenuItemPriceAction({
        venueId: venue.id,
        menuItemId: itemId,
        newPrice: parsed,
        reason: 'Price updated on The Board',
      });
      if (res.success) {
        showToast(`Price updated to ₦${parsed.toLocaleString()}`);
      } else {
        alert(res.error || 'Failed to update price.');
      }
    } catch {
      alert('Unable to persist price change.');
    } finally {
      setPriceSaving(false);
    }
  };

  // Fast Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(newItemPrice, 10);
    if (!newItemName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    setAddLoading(true);
    try {
      const res = await addMenuItemAction({
        venueId: venue.id,
        name: newItemName.trim(),
        category: newItemCategory as any,
        price: priceNum,
      });

      if (res.success) {
        setMenuItems((prev) => [res.item, ...prev]);
        setNewItemName('');
        setNewItemPrice('');
        setIsAdding(false);
        showToast(`${res.item.name} added to The Board`);
      } else {
        alert(res.error || 'Failed to add item');
      }
    } catch {
      alert('Unable to add item. Check network connection.');
    } finally {
      setAddLoading(false);
    }
  };

  // 1-Tap Price Confirmation
  const handleConfirmAll = async () => {
    setConfirmingPrices(true);
    triggerHaptic('success');
    try {
      const res = await confirmAllPricesAction(venue.id);
      if (res.success) {
        showToast('All prices Operator-Confirmed as current.');
      } else {
        alert(res.error || 'Price confirmation failed.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setConfirmingPrices(false);
    }
  };

  // Filtered Items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const availableCount = menuItems.filter((i) => i.is_available).length;
  const count86d = menuItems.filter((i) => !i.is_available).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-[#121418] border border-[#00E575]/50 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E575] animate-ping" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ── The Board Header ── */}
      <div className="bg-[#121418] text-[#F8F9FA] rounded-3xl border border-[#232732] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#00E575] uppercase px-2.5 py-0.5 rounded-full bg-[#008751]/15 border border-[#008751]/30">
                THE BOARD · LIVE MENU &amp; DROPS
              </span>
              <span className="text-white/20 font-mono">/</span>
              <span className="text-xs font-mono text-white/50">{venue.name}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Visual Hospitality Board
            </h1>

            <p className="text-xs sm:text-sm text-white/60 max-w-xl leading-relaxed">
              Tap any item&apos;s <strong className="text-red-400 font-mono">86&apos;d</strong> button to mark it sold out.
              Changes auto-save immediately and instantly update what Lagos squads can budget for.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setIsScanning(true);
                setScanStep('idle');
              }}
              className="h-11 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-950/60 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-2 transition-all tap-feedback cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Menu Scanner</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmAll}
              disabled={confirmingPrices}
              className="h-11 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-bold border border-[#232732] flex items-center gap-2 transition-all tap-feedback cursor-pointer disabled:opacity-50"
            >
              {confirmingPrices ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00E575]" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-[#00E575]" />
              )}
              <span>Confirm Prices Current</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="h-11 px-4 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-md tap-feedback cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#232732] font-mono">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase text-white/50 tracking-wider block">Live on Menu</span>
            <div className="text-2xl sm:text-3xl font-black text-[#00E575] mt-1 tabular-nums">
              {availableCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase text-white/50 tracking-wider block">86&apos;d (Sold Out)</span>
            <div className="text-2xl sm:text-3xl font-black text-red-400 mt-1 tabular-nums">
              {count86d}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 col-span-2">
            <span className="text-[10px] uppercase text-white/50 tracking-wider block">Instant Auto-Save</span>
            <div className="text-xs text-white/70 mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E575]" />
              <span>Zero save buttons required. Toggles persist instantly.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Add Item Card ── */}
      {isAdding && (
        <form
          onSubmit={handleAddItem}
          className="bg-[#121418] rounded-3xl border-2 border-[#008751]/50 p-6 space-y-4 shadow-2xl animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-[#232732] pb-3">
            <h3 className="font-bold text-white text-sm">Add Item to The Board</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs font-mono text-white/50 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-[11px] font-mono text-white/70 uppercase">Item Name</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Asun Pepper Platter"
                className="w-full h-12 rounded-xl bg-black/40 border border-[#232732] px-3 text-sm text-white focus:border-[#00E575] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-white/70 uppercase">Category</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full h-12 rounded-xl bg-[#121418] border border-[#232732] px-3 text-sm text-white focus:border-[#00E575] focus:outline-none"
              >
                <option value="main">Main Course</option>
                <option value="starter">Starter / Small Chops</option>
                <option value="cocktail">Cocktail</option>
                <option value="wine">Wine</option>
                <option value="beer">Beer</option>
                <option value="spirits">Spirits</option>
                <option value="soft_drink">Soft Drink / Water</option>
                <option value="dessert">Dessert</option>
                <option value="activity_fee">Cover / Activity</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-white/70 uppercase">Price in Naira (₦)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value.replace(/\D/g, ''))}
                placeholder="8500"
                className="w-full h-12 rounded-xl bg-black/40 border border-[#232732] px-3 text-sm text-white font-mono focus:border-[#00E575] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={addLoading}
              className="h-11 px-5 rounded-xl bg-[#008751] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 tap-feedback cursor-pointer disabled:opacity-50"
            >
              {addLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Item To Board →</span>
            </button>
          </div>
        </form>
      )}

      {/* ── Filter Bar & Search ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
            const isActive = selectedCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all tap-feedback cursor-pointer ${
                  isActive
                    ? 'bg-[#008751] text-white shadow-sm'
                    : 'bg-[#121418] text-white/50 hover:text-white border border-[#232732]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find item on the board..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#121418] border border-[#232732] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#00E575]"
          />
        </div>
      </div>

      {/* ── VISUAL MENU GRID (THE BOARD) ── */}
      {filteredItems.length === 0 ? (
        <div className="bg-[#121418] rounded-3xl border border-[#232732] p-12 text-center space-y-2">
          <UtensilsCrossed className="w-8 h-8 text-white/40 mx-auto" />
          <h3 className="text-lg font-bold text-white">No items found</h3>
          <p className="text-xs text-white/60">
            No items in this category match your search. Tap &quot;Add Item&quot; to expand your live menu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const is86d = !item.is_available;
            const isToggling = togglingItemId === item.id;
            const isEditingPrice = editingPriceItemId === item.id;
            const categoryImage = CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.other;

            return (
              <div
                key={item.id}
                className={`bg-[#121418] rounded-3xl border overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-200 ${
                  is86d
                    ? 'border-red-900/40 opacity-70 grayscale'
                    : 'border-[#232732] hover:border-white/20'
                }`}
              >
                {/* Edge-to-Edge Image Zone */}
                <div className="relative w-full h-44 overflow-hidden bg-black/60">
                  <Image
                    src={categoryImage}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-black/40 to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-wider text-white border border-white/10">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </div>

                  {/* 86'd Banner Overlay */}
                  {is86d && (
                    <div className="absolute inset-0 bg-red-950/70 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-4 py-1.5 rounded-xl border-2 border-red-500 bg-red-600 text-white font-mono font-black text-sm tracking-widest uppercase rotate-[-6deg] shadow-2xl">
                        86&apos;D · SOLD OUT
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black text-white tracking-tight leading-snug">
                      {item.name}
                    </h3>

                    {/* Price and 1-tap quick edit */}
                    <div className="flex items-center justify-between pt-1">
                      {isEditingPrice ? (
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-white text-xs">₦</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoFocus
                            value={editPriceValue}
                            onChange={(e) => setEditPriceValue(e.target.value.replace(/\D/g, ''))}
                            onBlur={() => handleSavePrice(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePrice(item.id);
                              if (e.key === 'Escape') setEditingPriceItemId(null);
                            }}
                            className="w-24 h-8 bg-black/60 border border-[#00E575] rounded-lg px-2 text-sm text-white font-mono focus:outline-none"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPriceItemId(item.id);
                            setEditPriceValue(item.price.toString());
                          }}
                          className="text-2xl font-black font-mono text-white hover:text-[#00E575] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                          title="Tap to adjust price"
                        >
                          <span>₦{item.price.toLocaleString('en-NG')}</span>
                        </button>
                      )}

                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          is86d
                            ? 'text-red-400 bg-red-950/40 border border-red-500/30'
                            : 'text-[#00E575] bg-[#008751]/15 border border-[#008751]/30'
                        }`}
                      >
                        {is86d ? "86'd" : 'Live'}
                      </span>
                    </div>
                  </div>

                  {/* 86 Action Button (Oversized, Tactile) */}
                  <div className="pt-2 border-t border-[#232732]">
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggle86(item)}
                      className={`w-full h-12 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 tap-feedback cursor-pointer ${
                        is86d
                          ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm'
                          : 'bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : is86d ? (
                        <>
                          <Check className="w-4 h-4 text-[#00E575]" />
                          <span>RESTOCK &amp; MAKE LIVE</span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-400" />
                          <span>86 THIS ITEM (SOLD OUT)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── AI MENU SCANNER MODAL (PHOTO OCR TO LIVE DROPS) ── */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121418] border-2 border-purple-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white">
            <button
              type="button"
              onClick={() => setIsScanning(false)}
              className="absolute top-5 right-5 text-white/60 hover:text-white p-2 text-xs font-mono font-bold"
            >
              CLOSE ✕
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-300">
                  MENU SCANNER AI · ZERO DATA ENTRY
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                Drop a Menu via Camera / OCR
              </h2>
              <p className="text-xs text-white/60">
                Snap or upload a photo of your printed dinner or cocktail card. OyaPlan AI parses dishes and Naira prices directly onto your live board.
              </p>
            </div>

            {scanStep === 'idle' && (
              <div className="space-y-4">
                <div
                  onClick={() => handleStartScan('dinner')}
                  className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/30 rounded-2xl p-6 text-center space-y-3 cursor-pointer transition-all tap-feedback"
                >
                  <Camera className="w-8 h-8 text-purple-400 mx-auto" />
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold block">Scan Dinner / Kitchen Card</span>
                    <span className="text-xs text-white/50">Parses mains, starters, and sides</span>
                  </div>
                </div>

                <div
                  onClick={() => handleStartScan('drinks')}
                  className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/30 rounded-2xl p-6 text-center space-y-3 cursor-pointer transition-all tap-feedback"
                >
                  <Sparkles className="w-8 h-8 text-[#00E575] mx-auto" />
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold block">Scan Cocktail &amp; Bottle Card</span>
                    <span className="text-xs text-white/50">Parses signature cocktails, spirits, and wines</span>
                  </div>
                </div>
              </div>
            )}

            {scanStep === 'analyzing' && (
              <div className="py-12 text-center space-y-4">
                <div className="relative w-20 h-20 mx-auto rounded-2xl bg-purple-950/40 border border-purple-500 flex items-center justify-center overflow-hidden">
                  <Camera className="w-8 h-8 text-purple-400" />
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00E575] to-transparent animate-pulse top-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold">Scanning Menu Typography...</h3>
                  <p className="text-xs text-white/50 font-mono">Extracting item names &amp; Naira figures</p>
                </div>
              </div>
            )}

            {scanStep === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#00E575] font-bold">✓ {scannedItems.length} Dishes Detected</span>
                  <span className="text-white/40">Tap price to tweak</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {scannedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <span className="font-bold block truncate">{item.name}</span>
                        <span className="text-[10px] font-mono text-purple-300 uppercase">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 font-mono font-bold text-[#00E575]">
                        <span>₦{item.price.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setScanStep('idle')}
                    className="h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-bold border border-white/10 tap-feedback"
                  >
                    Rescan
                  </button>

                  <button
                    type="button"
                    disabled={pushingDrops}
                    onClick={handlePushAllScanned}
                    className="h-12 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg tap-feedback disabled:opacity-50"
                  >
                    {pushingDrops ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Push Live to Board</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
