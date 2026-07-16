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
      className="bg-[#FAFAFA] border-2 border-black rounded-[8px] overflow-hidden shadow-[0_8px_0_0_#000000] relative mx-auto max-w-lg w-full animate-slam"
      style={{ borderTopWidth: "8px", borderTopColor: neonColor }}
    >
      <div className="p-8 text-center space-y-4">
        <span className="block type-label text-text-muted uppercase tracking-widest text-[10px] font-black">You'll likely spend</span>
        <h2 className="type-display text-5xl sm:text-6xl text-black font-sans font-black tracking-[-0.04em]">
          ₦{totalCost.toLocaleString()}
        </h2>
        <div className="flex justify-center pt-2">
          <TrustBadge status={trustStatus} freshnessText={freshnessText} />
        </div>
      </div>
    </div>
  );
}
