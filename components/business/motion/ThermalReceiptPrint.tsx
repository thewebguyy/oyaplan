'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Printer, X } from 'lucide-react';

interface ThermalReceiptPrintProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category: string;
  status: string;
  details?: Array<{ label: string; value: string }>;
  venueName: string;
}

export function ThermalReceiptPrint({
  isOpen,
  onClose,
  title,
  category,
  status,
  details = [],
  venueName,
}: ThermalReceiptPrintProps) {
  if (!isOpen) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-sm bg-[#FFFDF9] text-[#111111] rounded-2xl shadow-2xl border-2 border-[#111111] p-6 font-mono text-xs overflow-hidden"
      >
        {/* Top Paper Tear / Jagged Edge Effect */}
        <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#008751]" />
            <span className="font-black tracking-wider text-[11px] uppercase">
              OPERATIONAL RECEIPT
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F0ECE1] transition-colors tap-feedback"
            aria-label="Close receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="space-y-3">
          <div className="text-center space-y-1 py-1">
            <span className="inline-block px-2 py-0.5 rounded bg-[#008751] text-white text-[10px] font-bold uppercase tracking-wider">
              UPDATE RECEIVED
            </span>
            <h3 className="font-serif font-black text-lg text-[#111111] uppercase tracking-tight">
              {venueName}
            </h3>
            <p className="text-[10px] text-[#555555]">
              {dateStr} • {timeStr} WAT
            </p>
          </div>

          <div className="border-t border-b border-dashed border-[#111111] py-3 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#666666]">CHANGE:</span>
              <span className="font-bold text-[#111111]">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">DOMAIN:</span>
              <span className="font-bold text-[#111111]">{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#666666]">STATUS:</span>
              <span className="font-bold text-[#008751]">{status}</span>
            </div>

            {details.map((d, i) => (
              <div key={i} className="flex justify-between text-[10px] pt-0.5">
                <span className="text-[#777777]">{d.label}:</span>
                <span className="font-semibold text-[#111111] truncate max-w-[180px]">{d.value}</span>
              </div>
            ))}
          </div>

          <p className="text-[9px] text-[#777777] text-center leading-normal pt-1">
            Changes are committed to the OyaPlan Lagos intelligence engine. Verified pricing refreshes immediately.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#111111] text-[#F6C642] font-bold text-xs hover:bg-[#222222] transition-colors tap-feedback mt-2"
          >
            Acknowledge &amp; Return
          </button>
        </div>
      </motion.div>
    </div>
  );
}
