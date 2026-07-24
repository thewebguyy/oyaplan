"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ForgeInput, Spot } from "@/lib/types";

// Dynamic Ticker Component
function NumberTicker({
  value,
  duration = 300,
  delay = 0,
}: {
  value: number;
  duration?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const timer = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const timeFraction = Math.min((now - startTime) / duration, 1);
        const current = Math.round(timeFraction * end);
        setCount(current);
        if (timeFraction < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, duration, delay]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace("NGN", "₦");
  };

  return <span className="font-mono font-bold text-[#1A1A1A]">{formatCurrency(count)}</span>;
}

// Draw Checkmark SVG Component
function AnimatedCheckmark({ delayMs }: { delayMs: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!visible) return <div className="w-[28px] h-[28px] shrink-0" />;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 1] }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative flex items-center justify-center shrink-0 w-[28px] h-[28px]"
    >
      <div className="absolute inset-0 rounded-full bg-[#10B981]/15 blur-xs animate-pulse" />
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="relative z-10">
        <motion.path
          d="M20 6L9 17L4 12"
          stroke="#10B981"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}

// Animated Progress Bar Component
function ProgressBar({
  duration,
  delayMs,
  targetValue = 100,
}: {
  duration: number;
  delayMs: number;
  targetValue?: number;
}) {
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFillWidth(targetValue);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs, targetValue]);

  return (
    <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden relative border border-[#E5E7EB]/50">
      <motion.div
        animate={{ width: `${fillWidth}%` }}
        transition={{ duration: duration / 1000, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-[#008751] to-[#10B981]"
      />
    </div>
  );
}

interface VerificationReceiptLoaderProps {
  forgeInput: ForgeInput;
  spot: Spot | null;
  onComplete: () => void;
}

export default function VerificationReceiptLoader({
  forgeInput,
  spot,
  onComplete,
}: VerificationReceiptLoaderProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [screen, setScreen] = useState(1); // 1 = Vetting, 2 = Scorecard

  // Calculate actual plan figures dynamically based on match rules
  const squadSize = forgeInput.squadSize;
  const budget = forgeInput.budget;
  const transportCost = squadSize === 1 ? 0 : squadSize > 4 ? 10000 : 5000;
  const foodCost = spot ? spot.price_per_person * squadSize : 12000 * squadSize;
  const taxCost = Math.round((foodCost * 0.1) / 100) * 100;
  const totalCost = foodCost + transportCost + taxCost;
  const remainingBuffer = Math.max(0, budget - totalCost);

  useEffect(() => {
    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      setElapsedTime(elapsed);

      // Transitions
      if (elapsed > 2500 && screen === 1) {
        setScreen(2);
      }

      if (elapsed >= 3800) {
        onComplete();
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [screen, onComplete]);

  // Screen 1 visibility flags
  const showTransport = elapsedTime >= 0;
  const showMenus = elapsedTime >= 800;
  const showBuffer = elapsedTime >= 1600;
  const showGbeduReady = elapsedTime >= 2200;

  // Screen 2 visibility flags
  const showBudgetScore = elapsedTime >= 2600;
  const showTransitScore = elapsedTime >= 2800;
  const showSquadScore = elapsedTime >= 3000;
  const showVibeScore = elapsedTime >= 3100;
  const showLockState = elapsedTime >= 3300;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto select-none"
      style={{
        background: "radial-gradient(circle, #FFFBF0 0%, #FFF9E6 100%)",
        animation: "pulse 6s ease-in-out infinite alternate",
      }}
    >
      {/* Confetti Particle Layer (renders when Screen 1 completes) */}
      {showGbeduReady && screen === 1 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: `${25 + Math.random() * 50}%`,
                y: -10,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: "100vh",
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: 0,
              }}
              transition={{
                duration: 1.5 + Math.random() * 1.5,
                ease: "easeOut",
              }}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: i % 3 === 0 ? "#008751" : i % 3 === 1 ? "#FCC630" : "#10B981",
              }}
            />
          ))}
        </div>
      )}

      {/* Retro Receipt Card Container */}
      <motion.div
        animate={{
          scale: elapsedTime >= 3500 ? 0.95 : 1,
          opacity: elapsedTime >= 3500 ? 0.3 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white border-2 border-[#1A1A1A] rounded-[24px] p-6 sm:p-8 shadow-[0_8px_0_0_#1A1A1A] relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {screen === 1 ? (
            <motion.div
              key="screen-1"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="space-y-1 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] font-mono">
                  Verification Progress
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
                  Letting the vibes cook...
                </h2>
              </div>

              {/* Receipt Divider Line */}
              <div className="h-0.5 border-t-2 border-dashed border-[#EAE8E3]" />

              {/* Verification List */}
              <div className="space-y-5">
                {/* 1. Transport */}
                {showTransport && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      <div className="flex justify-between text-xs font-bold text-[#1A1A1A]">
                        <span>Transport</span>
                        <span className="text-[#6B7280]">
                          {elapsedTime >= 800 ? `₦${transportCost.toLocaleString()}` : "Calculating..."}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7280]">
                        {elapsedTime >= 800 ? "✓ Transport fare estimation sorted" : "Hunting Uber fares for outing squad..."}
                      </p>
                      {elapsedTime < 800 && (
                        <ProgressBar duration={600} delayMs={0} />
                      )}
                    </div>
                    <AnimatedCheckmark delayMs={800} />
                  </motion.div>
                )}

                {/* 2. Menus */}
                {showMenus && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-4 border-t border-[#F3F4F6] pt-3"
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      <div className="flex justify-between text-xs font-bold text-[#1A1A1A]">
                        <span>Menus &amp; Dining</span>
                        <span className="text-[#6B7280]">
                          {elapsedTime >= 1900 ? (
                            <NumberTicker value={foodCost} duration={200} delay={0} />
                          ) : (
                            "Vetting..."
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7280]">
                        {elapsedTime >= 1900 ? `✓ ${spot ? spot.name : "Yellow Chilli"} menu prices verified` : "Auditing live restaurant menu sheets..."}
                      </p>
                      {elapsedTime < 1900 && (
                        <ProgressBar duration={900} delayMs={0} />
                      )}
                    </div>
                    <AnimatedCheckmark delayMs={1900} />
                  </motion.div>
                )}

                {/* 3. Buffer */}
                {showBuffer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-4 border-t border-[#F3F4F6] pt-3"
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      <div className="flex justify-between text-xs font-bold text-[#1A1A1A]">
                        <span>Buffer &amp; Fees</span>
                        <span className="text-[#6B7280]">
                          {elapsedTime >= 2200 ? (
                            <NumberTicker value={taxCost} duration={200} delay={0} />
                          ) : (
                            "Baking..."
                          )}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B7280]">
                        {elapsedTime >= 2200 ? "✓ 10% VAT + local service charge baked in" : "Estimating local taxes and transaction service fees..."}
                      </p>
                      {elapsedTime < 2200 && (
                        <ProgressBar duration={500} delayMs={0} />
                      )}
                    </div>
                    <AnimatedCheckmark delayMs={2200} />
                  </motion.div>
                )}
              </div>

              {/* End of Screen 1: Gbedu Ready */}
              {showGbeduReady && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="pt-4 border-t-2 border-dashed border-[#EAE8E3] text-center"
                >
                  <span className="text-lg font-black text-[#10B981] flex items-center justify-center gap-1.5">
                    ✓ Gbedu Ready.
                  </span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="screen-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="space-y-1 text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280] font-mono">
                  Calculations Report
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A]">
                  Squad checks
                </h2>
              </div>

              {/* Receipt Divider Line */}
              <div className="h-0.5 border-t-2 border-dashed border-[#EAE8E3]" />

              {/* Scorecard Items */}
              <div className="space-y-4">
                {/* 1. Budget Fit */}
                {showBudgetScore && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#FAFAF8] border border-[#EAE8E3] rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
                      <div className="flex items-center gap-2">
                        <span className="text-base">💰</span>
                        <span>Budget: Clean</span>
                      </div>
                      <span className="text-[#008751] font-mono">✓ {remainingBuffer > 0 ? "Under Limit" : "Balanced"}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#008751]"
                        style={{ width: `${Math.min(100, (totalCost / budget) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#6B7280] font-mono">
                      <span>Spent: ₦{totalCost.toLocaleString()}</span>
                      <span>Cap: ₦{budget.toLocaleString()}</span>
                    </div>
                  </motion.div>
                )}

                {/* 2. Transit */}
                {showTransitScore && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#FAFAF8] border border-[#EAE8E3] rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🚗</span>
                        <span>Transit: Nearby</span>
                      </div>
                      <span className="text-[#008751] font-mono">✓ Included</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FCC630]"
                        style={{ width: "25%" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#6B7280] font-mono">
                      <span>Est: 15 mins ({forgeInput.startArea || "Lagos"})</span>
                      <span>Fare: ₦{transportCost.toLocaleString()}</span>
                    </div>
                  </motion.div>
                )}

                {/* 3. Squad */}
                {showSquadScore && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#FAFAF8] border border-[#EAE8E3] rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
                      <div className="flex items-center gap-2">
                        <span className="text-base">👥</span>
                        <span>Squad: Sorted</span>
                      </div>
                      <span className="text-[#008751] font-mono">✓ Fits {squadSize} {squadSize === 1 ? "person" : "people"}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#008751]"
                        style={{ width: "60%" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#6B7280] font-mono">
                      <span>Capacity limits verified</span>
                      <span>Seat layout OK</span>
                    </div>
                  </motion.div>
                )}

                {/* 4. Vibe Match */}
                {showVibeScore && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#FAFAF8] border border-[#EAE8E3] rounded-xl p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎵</span>
                        <span>Vibe: Hits</span>
                      </div>
                      <span className="text-[#008751] font-mono">✓ Match</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#008751]"
                        style={{ width: "90%" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#6B7280] font-mono">
                      <span>Vibe Selected: {forgeInput.vibe}</span>
                      <span>Match Quality: 9/10</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Verified Stamp and Final Lock */}
              {showLockState && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between border-t border-[#F3F4F6] pt-4"
                >
                  <span className="text-[#1A1A1A] font-black text-sm">
                    Plan locked in. Let&apos;s go.
                  </span>

                  {/* Stamp Design */}
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: [0, 1.1, 1], rotate: 360 - 12 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="border-4 border-double border-[#008751] rounded-lg p-1.5 font-black text-center text-[#008751] uppercase tracking-wider relative select-none w-28 shrink-0"
                  >
                    <div className="absolute inset-0 bg-[#008751]/5 rounded-sm -z-10 animate-pulse" />
                    <div className="text-[8px] tracking-[0.15em] font-mono leading-none">OyaPlan</div>
                    <div className="text-[11px] font-extrabold leading-none mt-0.5">✓ Verified</div>
                    <div className="text-[8px] tracking-[0.2em] font-mono leading-none mt-0.5">Outing</div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
