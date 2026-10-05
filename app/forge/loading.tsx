"use client";

import React from "react";
import { ThermalReceiptPrint } from "@/components/motion/ThermalReceiptPrint";
import { DanfoTapeLoader } from "@/components/cultural/DanfoTapeLoader";

/**
 * Forge Loading State:
 * Shows the Thermal Receipt Print animation tallying the Outside Math,
 * paired with the bold Danfo Tape Loader.
 */
export default function ForgeLoading() {
  return (
    <main className="min-h-[100dvh] bg-[#F6F6F2] py-16 px-4 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md mx-auto space-y-8 text-center">
        {/* Danfo Stripe Loader */}
        <DanfoTapeLoader
          label="Screening Verified Lagos Menus & Transit..."
          size="md"
        />

        {/* Tactile Thermal Receipt Print State */}
        <ThermalReceiptPrint
          targetTotal={45000}
          venueName="Curating Lagos Spots..."
        />

        <p className="text-xs font-mono text-[#777777] max-w-xs mx-auto leading-relaxed">
          Zero bill shock: tallying dining, service charge, and round-trip ride fares before you step out.
        </p>
      </div>
    </main>
  );
}
