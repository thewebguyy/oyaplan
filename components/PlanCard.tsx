import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Utensils, Car, Info } from "lucide-react";
import { Plan } from "@/lib/types";
import WhatsAppCopyButton from "./WhatsAppCopyButton";

interface PlanCardProps {
  plan: Plan;
  index: number;
  isTopPick?: boolean;
}

export default function PlanCard({ plan, index, isTopPick }: PlanCardProps) {
  return (
    <Card className={`overflow-hidden border-2 shadow-lg hover:shadow-xl transition-shadow bg-white ${isTopPick ? 'border-[#008751]' : 'border-[#008751]/10'}`}>
      <CardHeader className={`${isTopPick ? 'bg-[#008751] text-white' : 'bg-[#008751]/5 text-gray-900 border-b border-[#008751]/10'} ${isTopPick ? 'p-6' : 'p-4'}`}>
        <div className="flex justify-between items-start mb-2">
          {isTopPick ? (
            <Badge className="bg-white text-[#008751] font-bold uppercase tracking-wider">Best Match</Badge>
          ) : (
            <Badge className="bg-[#008751] text-white">Plan {index + 1}</Badge>
          )}
          <div className="text-right">
            <span className={`text-sm ${isTopPick ? 'text-white/80' : 'text-gray-500'}`}>Landed Cost</span>
            <p className={`font-bold ${isTopPick ? 'text-3xl text-white' : 'text-xl text-[#008751]'}`}>
              ₦{plan.totalCost.toLocaleString()}
            </p>
          </div>
        </div>
        <CardTitle className={`font-bold ${isTopPick ? 'text-3xl' : 'text-xl mt-2'}`}>
          {plan.spot.name}
        </CardTitle>
        <div className={`flex items-center gap-1 text-sm ${isTopPick ? 'text-white/90' : 'text-gray-600'}`}>
          <MapPin className="w-4 h-4" />
          {plan.spot.address}
        </div>
      </CardHeader>
      
      <CardContent className={`space-y-4 ${isTopPick ? 'pt-6' : 'pt-4'}`}>
        <div className="w-full">
          <WhatsAppCopyButton plan={plan} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 bg-gray-50 rounded-lg border border-gray-100`}>
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">
              <Utensils className="w-3 h-3" />
              Food/Drinks
            </div>
            <p className={`font-bold ${isTopPick ? 'text-lg' : 'text-base'}`}>₦{plan.foodCost.toLocaleString()}</p>
          </div>
          <div className={`p-3 bg-gray-50 rounded-lg border border-gray-100`}>
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">
              <Car className="w-3 h-3" />
              Transport
            </div>
            <p className={`font-bold ${isTopPick ? 'text-lg' : 'text-base'}`}>₦{plan.transportCost.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2 items-start opacity-80 pt-2">
          <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-500 italic">
            "{plan.whyItFits}"
          </p>
        </div>
      </CardContent>

      <CardFooter className="bg-white border-t border-gray-50 flex justify-between items-center py-3">
        <span className="text-[10px] text-gray-400 italic">
          Prices verified {new Date(plan.spot.price_updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} via {plan.spot.price_source}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Prices accurate?</span>
          <button className="text-gray-400 hover:text-green-600 transition-colors">👍</button>
          <button className="text-gray-400 hover:text-red-600 transition-colors">👎</button>
        </div>
      </CardFooter>
    </Card>
  );
}
