import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Utensils, Car, Info } from "lucide-react";
import { Plan } from "@/lib/types";
import WhatsAppCopyButton from "./WhatsAppCopyButton";

interface PlanCardProps {
  plan: Plan;
  index: number;
}

export default function PlanCard({ plan, index }: PlanCardProps) {
  return (
    <Card className="overflow-hidden border-2 border-[#008751]/10 shadow-lg hover:shadow-xl transition-shadow bg-white">
      <CardHeader className="bg-[#008751]/5 border-b border-[#008751]/10">
        <div className="flex justify-between items-start">
          <Badge className="bg-[#008751] text-white">Plan {index + 1}</Badge>
          <div className="text-right">
            <span className="text-sm text-gray-500">Landed Cost</span>
            <p className="text-xl font-bold text-[#008751]">₦{plan.totalCost.toLocaleString()}</p>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold mt-2">{plan.spot.name}</CardTitle>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          {plan.spot.address}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">
              <Utensils className="w-3 h-3" />
              Food/Drinks
            </div>
            <p className="font-bold text-lg">₦{plan.foodCost.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">
              <Car className="w-3 h-3" />
              Transport
            </div>
            <p className="font-bold text-lg">₦{plan.transportCost.toLocaleString()}</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-800 leading-relaxed italic">
            "{plan.whyItFits}"
          </p>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 pt-6">
        <WhatsAppCopyButton plan={plan} />
      </CardFooter>
    </Card>
  );
}
