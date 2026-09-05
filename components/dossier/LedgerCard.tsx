import { TrustBadge, TrustStatus } from "@/components/ui/trust-badge";

interface LedgerCardProps {
  totalCost: number;
  neonColor?: string;
  trustStatus: TrustStatus;
  freshnessText?: string;
}

export function LedgerCard({ totalCost, neonColor = "#000000", trustStatus, freshnessText }: LedgerCardProps) {
  return (
    <div 
      className="bg-white border-2 border-[#111827] rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.08),0_4px_0_0_#111827] relative mx-auto max-w-lg w-full animate-slam"
      style={{ borderTopWidth: "6px", borderTopColor: neonColor || "#008751" }}
    >
      <div className="p-7 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#111827]/5 rounded-full text-[10px] font-black uppercase tracking-widest text-[#4B5563]">
          <span>⚡</span> Total Estimated Outing Spend
        </div>
        <h2 className="type-display text-5xl sm:text-6xl text-[#111827] font-sans font-black tracking-[-0.04em]">
          ₦{totalCost.toLocaleString()}
        </h2>
        <div className="flex justify-center pt-1">
          <TrustBadge status={trustStatus} freshnessText={freshnessText} />
        </div>
      </div>
    </div>
  );
}
