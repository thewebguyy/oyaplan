'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, X, ShieldAlert, ArrowRight, Sparkles, Utensils, MapPin } from 'lucide-react';
import { triggerHaptic } from '@/lib/ui/haptics';

interface BailoutSpot {
  name: string;
  hub: string;
  category: string;
  estDamagePerHead: number;
  savingsPct: number;
}

const SAMPLE_BAILOUT_SPOTS: BailoutSpot[] = [
  {
    name: 'Mega Plaza Food Court',
    hub: 'Victoria Island',
    category: 'Casual Chop & Drinks',
    estDamagePerHead: 14500,
    savingsPct: 35,
  },
  {
    name: 'Yellow Chilli (Lunch Combo)',
    hub: 'Ikoyi',
    category: 'Nigerian Gourmet',
    estDamagePerHead: 18000,
    savingsPct: 25,
  },
  {
    name: 'Danfo Bistro (Quick Bites)',
    hub: 'Lekki Phase 1',
    category: 'Street Comfort Food',
    estDamagePerHead: 12000,
    savingsPct: 45,
  },
];

interface EmergencyBailoutButtonProps {
  currentDamagePerHead?: number;
  onSelectBailoutSpot?: (spotName: string) => void;
  className?: string;
}

export function EmergencyBailoutButton({
  currentDamagePerHead = 35000,
  onSelectBailoutSpot,
  className = '',
}: EmergencyBailoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    triggerHaptic('warning');
    setIsOpen(true);
  };

  return (
    <div className={className}>
      {/* Humorous Emergency Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full py-3 px-4 bg-[#FFFEE5] hover:bg-[#F9E828] text-[#111111] font-display font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer tap-feedback"
      >
        <LifeBuoy className="w-4 h-4 text-red-600 animate-bounce" />
        <span>Budget looking tight? Emergency Bailout Nearby →</span>
      </button>

      {/* Bailout Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white border-3 border-[#111111] rounded-3xl p-5 sm:p-6 shadow-[10px_10px_0px_0px_#111111] space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#111111] border border-[#111111] transition-all tap-feedback"
                aria-label="Close Bailout"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-red-100 border border-red-600 flex items-center justify-center text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-display uppercase tracking-tight text-[#111111]">
                    Emergency Soft-Landing Protocol
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-red-600 uppercase">
                    Bailout Options for tight budgets
                  </span>
                </div>
              </div>

              <div className="bg-[#FFFEE5] border border-[#111111] rounded-xl p-3 text-xs font-mono text-[#111111] leading-relaxed">
                No shame in soft landing! 🌴 Current damage of ~₦
                {currentDamagePerHead.toLocaleString('en-NG')} per head can be trimmed with these 3 verified spots nearby:
              </div>

              {/* Spot Recommendations */}
              <div className="space-y-2.5">
                {SAMPLE_BAILOUT_SPOTS.map((spot, i) => (
                  <div
                    key={i}
                    className="bg-[#FAFAF6] border-2 border-[#111111] rounded-2xl p-3.5 shadow-[3px_3px_0px_0px_#111111] flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-[#111111]">{spot.name}</h4>
                        <span className="text-[9px] font-mono font-bold bg-[#008751] text-white px-1.5 py-0.5 rounded-full">
                          -{spot.savingsPct}% Cost
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#666666]">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-[#111111]" />
                          {spot.hub}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Utensils className="w-3 h-3 text-[#111111]" />
                          {spot.category}
                        </span>
                      </div>
                      <div className="text-xs font-black text-[#008751] font-mono">
                        ~₦{spot.estDamagePerHead.toLocaleString('en-NG')} / person
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('success');
                        if (onSelectBailoutSpot) onSelectBailoutSpot(spot.name);
                        setIsOpen(false);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#111111] hover:bg-black text-[#F9E828] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#111111] flex items-center gap-1 shrink-0 cursor-pointer tap-feedback"
                    >
                      <span>Switch</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
