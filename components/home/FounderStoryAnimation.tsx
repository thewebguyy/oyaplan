"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, Heart, AlertTriangle, MapPin, Wallet } from "lucide-react";

export function FounderStoryAnimation() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-[320px] aspect-[9/16] mx-auto rounded-[24px] overflow-hidden bg-white border border-[#E5E7EB] shadow-[0_16px_40px_rgba(0,0,0,0.08)] flex flex-col select-none">
      
      {/* Phone Notch Bar */}
      <div className="w-full bg-[#111827] py-2 px-4 flex items-center justify-between z-20">
        <div className="text-[10px] font-bold text-white/80">9:41</div>
        <div className="w-16 h-3 bg-black rounded-full" />
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
          <div className="w-3 h-2 rounded-sm bg-white/80" />
        </div>
      </div>

      {/* Screen Frame Container */}
      <div className="relative flex-1 w-full bg-[#FAFAF8] overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Frame 1: Instagram/TikTok Scrolling Problem (0-2.8s) */}
          {frame === 0 && (
            <motion.div
              key="frame-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 p-4 flex flex-col justify-between bg-white"
            >
              {/* Instagram Feed Mockup */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1px]">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[9px] font-black">
                        IG
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#1A1A1A]">LagosVibes247</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#008751]">Must Visit 🔥</span>
                </div>

                {/* Animated Post Scrolling */}
                <motion.div 
                  animate={{ y: [0, -18, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="space-y-3"
                >
                  <div className="w-full h-32 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 border border-amber-200/60 p-3 flex flex-col justify-end relative overflow-hidden shadow-inner">
                    <span className="text-xs font-bold text-amber-950">Aesthetic Brunch Spot 🍹</span>
                    <span className="text-[10px] text-amber-800 font-medium">Lekki Phase 1 • No prices tagged</span>
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                      <span className="text-[9px] font-bold text-[#1A1A1A]">14.2k</span>
                    </div>
                  </div>

                  <div className="w-full h-24 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200/60 p-3 flex flex-col justify-end">
                    <span className="text-xs font-bold text-purple-950">Rooftop Lounge 🌟</span>
                    <span className="text-[10px] text-purple-800">Victoria Island • Price: Unknown</span>
                  </div>
                </motion.div>
              </div>

              {/* Status Overlay */}
              <div className="bg-[#111827]/90 text-white rounded-full py-2 px-3 text-center shadow-lg backdrop-blur-md flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold tracking-wide">Scrolling... scrolling...</span>
              </div>
            </motion.div>
          )}

          {/* Frame 2: Menu Price Shock (2.8-5.6s) */}
          {frame === 1 && (
            <motion.div
              key="frame-1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 p-4 flex flex-col justify-between bg-gradient-to-b from-red-50 to-orange-50/50"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" /> Price Shock!
                  </span>
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Unplanned</span>
                </div>

                {/* Shaking Bill Receipt Card */}
                <motion.div 
                  animate={{ x: [-2, 2, -2, 2, 0] }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1 }}
                  className="bg-white border-2 border-red-200 rounded-xl p-4 shadow-md space-y-3 relative"
                >
                  <div className="text-center pb-2 border-b border-dashed border-gray-200">
                    <p className="text-xs font-bold text-[#1A1A1A]">Island Bistro & Lounge</p>
                    <p className="text-[10px] text-gray-500">Saturday Squad Outing</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#374151]">
                    <div className="flex justify-between">
                      <span>2x Cocktail Pitcher</span>
                      <span className="font-bold text-[#1A1A1A]">₦38,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1x Platters</span>
                      <span className="font-bold text-[#1A1A1A]">₦42,000</span>
                    </div>
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>VAT & Service (17.5%)</span>
                      <span>₦14,000</span>
                    </div>
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>Peak Transport</span>
                      <span>₦12,000</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-xs font-black text-[#1A1A1A]">TOTAL BILL:</span>
                    <motion.span 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-base font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-md"
                    >
                      ₦106,000
                    </motion.span>
                  </div>
                </motion.div>
              </div>

              {/* Status Overlay */}
              <div className="bg-red-600 text-white rounded-full py-2 px-3 text-center shadow-lg flex items-center justify-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs font-bold tracking-wide">Expected ₦50k total</span>
              </div>
            </motion.div>
          )}

          {/* Frame 3: OyaPlan Solution (5.6-8.4s) */}
          {frame === 2 && (
            <motion.div
              key="frame-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 p-4 flex flex-col justify-between bg-emerald-50/40"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#008751] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> OyaPlan Verified
                  </span>
                  <span className="text-[10px] bg-[#008751]/10 text-[#008751] font-bold px-2 py-0.5 rounded-full">
                    100% Accuracy
                  </span>
                </div>

                {/* Solution Card */}
                <div className="bg-white border border-[#008751]/20 rounded-xl p-3.5 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between bg-[#FAFAF8] p-2 rounded-lg text-xs">
                    <span className="flex items-center gap-1 text-[#1A1A1A] font-bold">
                      <MapPin className="w-3 h-3 text-[#008751]" /> Lekki Phase 1
                    </span>
                    <span className="flex items-center gap-1 text-[#008751] font-bold">
                      <Wallet className="w-3 h-3" /> ₦50,000
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#008751]" /> Verified Food & Drinks
                      </span>
                      <span className="font-bold text-[#1A1A1A]">₦35,000</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#008751]" /> Estimated Transport
                      </span>
                      <span className="font-bold text-[#1A1A1A]">₦5,000</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#008751]" /> Taxes & Service Charge
                      </span>
                      <span className="font-bold text-[#1A1A1A]">₦4,000</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-600">Total Planned:</span>
                    <span className="text-xs font-black text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded">
                      ₦44,000 (₦6k left)
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Overlay */}
              <div className="bg-[#008751] text-white rounded-full py-2 px-3 text-center shadow-lg flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FCC630]" />
                <span className="text-xs font-bold tracking-wide">Why isn&apos;t there an app for this?</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Frame Indicator Dots */}
      <div className="py-2.5 bg-white border-t border-[#E5E7EB] flex items-center justify-center gap-1.5 z-20">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => setFrame(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              frame === idx ? "w-6 bg-[#008751]" : "w-1.5 bg-gray-300"
            }`}
            aria-label={`Go to frame ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
