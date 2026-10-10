'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Copy, Check, MessageSquare, X, ShieldCheck, Sparkles, Printer } from 'lucide-react';
import { triggerHaptic } from '@/lib/ui/haptics';

interface PreReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName: string;
  squadSize: number;
  totalCost: number;
  foodCost?: number;
  transportCost?: number;
  startArea?: string;
  planCode?: string;
}

export function PreReceiptModal({
  isOpen,
  onClose,
  venueName,
  squadSize,
  totalCost,
  foodCost,
  transportCost,
  startArea = 'Lekki Phase 1',
  planCode = 'OYA-LAGOS-2026',
}: PreReceiptModalProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const perHead = Math.ceil(totalCost / Math.max(1, squadSize));
  const estimatedFood = foodCost || Math.round(totalCost * 0.7);
  const estimatedTransport = transportCost || Math.round(totalCost * 0.3);

  const formattedTotal = totalCost.toLocaleString('en-NG');
  const formattedPerHead = perHead.toLocaleString('en-NG');
  const formattedFood = estimatedFood.toLocaleString('en-NG');
  const formattedTransport = estimatedTransport.toLocaleString('en-NG');

  const currentDateStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  const currentTimeStr = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getReceiptText = () => {
    return (
      `==============================\n` +
      `  OYAPLAN LAGOS OUTING RECEIPT \n` +
      `  "Know Before You Leave Home" \n` +
      `==============================\n` +
      `DATE: ${currentDateStr} ${currentTimeStr} WAT\n` +
      `REF: #${planCode}\n` +
      `------------------------------\n` +
      `VENUE: ${venueName.toUpperCase()}\n` +
      `HUB: ${startArea.toUpperCase()}\n` +
      `HEADCOUNT: ${squadSize} PAX\n` +
      `------------------------------\n` +
      `FOOD & DRINKS: ₦${formattedFood}\n` +
      `ROUND-TRIP UBER: ₦${formattedTransport}\n` +
      `COVER / SURPRISE FEES: ₦0\n` +
      `------------------------------\n` +
      `TOTAL DAMAGE: ₦${formattedTotal}\n` +
      `DAMAGE PER HEAD: ₦${formattedPerHead}\n` +
      `==============================\n` +
      `  [ STAMP: OYAPLAN CERTIFIED ]\n` +
      `  NO EXTRA BILLING ALLOWED!\n` +
      `==============================\n` +
      `Plan & lock it: https://oyaplan.vercel.app`
    );
  };

  const handleCopyText = async () => {
    triggerHaptic('selection');
    try {
      await navigator.clipboard.writeText(getReceiptText());
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWhatsAppShare = () => {
    triggerHaptic('success');
    const msg = encodeURIComponent(getReceiptText());
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleDownloadReceipt = async () => {
    triggerHaptic('heavy');
    setIsGeneratingImage(true);
    try {
      // Lazy load html2canvas or use standard SVG/Canvas draw
      const element = receiptRef.current;
      if (!element) return;

      // Use modern Canvas API or SVG data URI representation
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = 450;
      const height = 620;
      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        // Draw vintage paper receipt background
        ctx.fillStyle = '#FAFAF6';
        ctx.fillRect(0, 0, width, height);

        // Header pattern
        ctx.fillStyle = '#111111';
        ctx.font = '900 18px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OYAPLAN OFFICIAL RECEIPT', width / 2, 40);

        ctx.font = '600 12px "Space Mono", monospace';
        ctx.fillStyle = '#555555';
        ctx.fillText('LAGOS OUTING DAMAGE PRE-RECEIPT', width / 2, 60);

        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(30, 80);
        ctx.lineTo(width - 30, 80);
        ctx.stroke();

        // Details
        ctx.setLineDash([]);
        ctx.textAlign = 'left';
        ctx.font = 'bold 13px "Space Mono", monospace';
        ctx.fillStyle = '#111111';

        ctx.fillText(`DATE: ${currentDateStr} ${currentTimeStr}`, 30, 110);
        ctx.fillText(`REF CODE: #${planCode}`, 30, 130);
        ctx.fillText(`VENUE: ${venueName}`, 30, 150);
        ctx.fillText(`HEADCOUNT: ${squadSize} PAX`, 30, 170);

        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.moveTo(30, 190);
        ctx.lineTo(width - 30, 190);
        ctx.stroke();

        ctx.fillText(`DINING ESTIMATE:`, 30, 220);
        ctx.textAlign = 'right';
        ctx.fillText(`NGN ${formattedFood}`, width - 30, 220);

        ctx.textAlign = 'left';
        ctx.fillText(`ROUND-TRIP UBER:`, 30, 245);
        ctx.textAlign = 'right';
        ctx.fillText(`NGN ${formattedTransport}`, width - 30, 245);

        ctx.textAlign = 'left';
        ctx.fillText(`HIDDEN FEES:`, 30, 270);
        ctx.textAlign = 'right';
        ctx.fillText(`NGN 0 (VERIFIED)`, width - 30, 270);

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.moveTo(30, 295);
        ctx.lineTo(width - 30, 295);
        ctx.stroke();

        ctx.font = '900 15px "Space Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`TOTAL DAMAGE:`, 30, 330);
        ctx.textAlign = 'right';
        ctx.fillText(`NGN ${formattedTotal}`, width - 30, 330);

        ctx.font = '900 16px "Space Mono", monospace';
        ctx.fillStyle = '#008751';
        ctx.textAlign = 'left';
        ctx.fillText(`DAMAGE / HEAD:`, 30, 365);
        ctx.textAlign = 'right';
        ctx.fillText(`NGN ${formattedPerHead}`, width - 30, 365);

        // Big Stamp
        ctx.save();
        ctx.translate(width / 2, 450);
        ctx.rotate((-12 * Math.PI) / 180);
        ctx.strokeStyle = '#D92D20';
        ctx.lineWidth = 4;
        ctx.strokeRect(-160, -35, 320, 70);

        ctx.fillStyle = '#D92D20';
        ctx.font = '900 16px "Space Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('OYAPLAN CERTIFIED', 0, -10);
        ctx.font = 'bold 12px "Space Mono", sans-serif';
        ctx.fillText('NO EXTRA BILLING ALLOWED!', 0, 15);
        ctx.restore();

        // Footer Barcode visual
        ctx.fillStyle = '#111111';
        for (let i = 40; i < width - 40; i += 6) {
          const w = (i % 4) + 2;
          ctx.fillRect(i, 530, w, 40);
        }

        ctx.font = '10px "Space Mono", monospace';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        ctx.fillText('POWERED BY OYAPLAN • OUTING INTEL LAGOS', width / 2, 595);

        // Trigger Download
        const link = document.createElement('a');
        link.download = `oyaplan-pre-receipt-${planCode}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch {
      // Fallback to text copy
      handleCopyText();
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white border-3 border-[#111111] rounded-3xl p-5 sm:p-6 shadow-[10px_10px_0px_0px_#111111] space-y-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#111111] border border-[#111111] transition-all tap-feedback"
            aria-label="Close Pre-Receipt"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#111111]" />
            <h2 className="text-lg font-black font-display uppercase tracking-tight text-[#111111]">
              WhatsApp Pre-Receipt
            </h2>
          </div>

          <p className="text-xs text-[#555555] font-medium">
            Drop this receipt in your group chat to lock the budget and prevent surprise billing stories!
          </p>

          {/* Supermarket Thermal Receipt Visual */}
          <div
            ref={receiptRef}
            className="relative bg-[#FAFAF6] border-2 border-[#111111] rounded-xl p-5 font-mono text-xs text-[#111111] shadow-inner space-y-3 overflow-hidden selection:bg-[#F9E828]"
          >
            {/* Top receipt zig-zag visual border */}
            <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-[#111111]/30">
              <div className="font-black text-sm uppercase tracking-wider text-[#111111]">
                OYAPLAN OUTING RECEIPT
              </div>
              <div className="text-[10px] text-[#666666] font-bold">
                KNOW WHAT YOU&apos;LL SPEND BEFORE LEAVING HOME
              </div>
              <div className="text-[10px] text-[#888888]">
                {currentDateStr} {currentTimeStr} WAT • #{planCode}
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between font-bold">
                <span>VENUE:</span>
                <span className="text-right truncate max-w-[180px]">{venueName}</span>
              </div>
              <div className="flex justify-between text-[#555555]">
                <span>LOCATION:</span>
                <span>{startArea}</span>
              </div>
              <div className="flex justify-between text-[#555555]">
                <span>HEADCOUNT:</span>
                <span>{squadSize} PAX</span>
              </div>
            </div>

            <div className="border-t border-dashed border-[#111111]/30 pt-2 space-y-1">
              <div className="flex justify-between">
                <span>DINING ESTIMATE:</span>
                <span className="font-bold">₦{formattedFood}</span>
              </div>
              <div className="flex justify-between">
                <span>ROUND-TRIP UBER:</span>
                <span className="font-bold">₦{formattedTransport}</span>
              </div>
              <div className="flex justify-between text-[#008751]">
                <span>HIDDEN SURPRISES:</span>
                <span className="font-bold">₦0 (VERIFIED)</span>
              </div>
            </div>

            {/* Total Section */}
            <div className="border-t-2 border-[#111111] pt-2 pb-1 space-y-1">
              <div className="flex justify-between text-sm font-black">
                <span>TOTAL DAMAGE:</span>
                <span>₦{formattedTotal}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#008751] bg-[#008751]/10 p-1.5 rounded-lg border border-[#008751]/30">
                <span>DAMAGE / HEAD:</span>
                <span>₦{formattedPerHead}</span>
              </div>
            </div>

            {/* THE BIG STAMP */}
            <div className="relative py-4 flex items-center justify-center">
              <div className="transform -rotate-6 border-4 border-red-600 rounded-xl px-4 py-2 text-center text-red-600 bg-red-50/80 shadow-md">
                <div className="font-black text-sm uppercase tracking-widest flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-red-600 inline" />
                  <span>OYA PLAN CERTIFIED</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider">
                  NO BILLING ALLOWED ON OUTING
                </div>
              </div>
            </div>

            {/* Barcode graphic */}
            <div className="pt-2 text-center space-y-1">
              <div className="flex justify-center gap-1 h-8 opacity-80 overflow-hidden">
                {[4, 2, 6, 2, 4, 8, 2, 4, 2, 6, 4, 2, 8, 4, 2, 6, 2, 4, 8, 4, 2, 6, 4].map((w, i) => (
                  <span key={i} className="bg-[#111111] h-full" style={{ width: `${w}px` }} />
                ))}
              </div>
              <div className="text-[9px] text-[#888888] tracking-widest font-mono">
                * OYAPLAN-VERIFIED-OUTING-MATH *
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleWhatsAppShare}
              className="w-full h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-display font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer tap-feedback"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Send Pre-Receipt to WhatsApp Group →</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadReceipt}
                disabled={isGeneratingImage}
                className="h-11 bg-[#111111] hover:bg-black text-[#F9E828] font-display font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer tap-feedback"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'Saving...' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handleCopyText}
                className="h-11 bg-white hover:bg-[#F6F6F2] text-[#111111] font-display font-black text-xs uppercase tracking-wider rounded-2xl border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer tap-feedback"
              >
                {copiedText ? <Check className="w-4 h-4 text-[#008751]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
