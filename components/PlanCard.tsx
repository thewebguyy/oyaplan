import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Utensils, Car, Info, ThumbsUp, ThumbsDown, Activity, Sparkles } from "lucide-react";
import { Plan, ForgeInput } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import WhatsAppCopyButton from "./WhatsAppCopyButton";

interface PlanCardProps {
  plan: Plan;
  index: number;
  input: ForgeInput;
  isTopPick?: boolean;
  originalBudget?: number;
}

export default function PlanCard({ plan, index, input, isTopPick, originalBudget }: PlanCardProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleFeedback = async (type: 'up' | 'down') => {
    setFeedbackGiven(true);
    try {
      await supabase.from('price_flags').insert({
        spot_id: plan.spot.id,
        flag_type: type
      });
    } catch (e) {
      console.error("Feedback error:", e);
    }
  };

  const hasFood = plan.spot.has_food !== false;

  // Budget Stretch Logic
  const diff = originalBudget ? originalBudget - plan.totalCost : 0;
  const showIndicator = originalBudget && diff >= 2000;

  const getSuggestion = () => {
    const vibe = plan.spot.vibe_tags[0];
    const suggestions: Record<string, string> = {
      Chill: "an extra round of drinks",
      Foodie: "dessert and a starter",
      Party: "transport home or cover charge",
      Quick: "takeaway on the way back",
      Dinner: "a bottle for the table",
      Brunch: "cocktails or a smoothie bowl",
    };
    return suggestions[vibe] || "something extra for the squad";
  };

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
          <WhatsAppCopyButton plan={plan} input={input} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-3 bg-gray-50 rounded-lg border border-gray-100`}>
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 uppercase tracking-wider font-semibold">
              {hasFood ? <Utensils className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
              {hasFood ? "Food/Drinks" : "Entry/Activity"}
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

        <div className="space-y-4">
          <div className="flex gap-2 items-start opacity-80">
            <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-500 italic">
              "{plan.whyItFits}"
            </p>
          </div>

          {showIndicator && (
            <div className={`flex items-center gap-2 rounded-xl transition-all ${diff >= 10000 ? 'bg-green-50 px-4 py-2 border border-green-100' : ''}`}>
              <Sparkles className={`w-4 h-4 text-[#008751] ${diff >= 10000 ? 'animate-pulse' : ''}`} />
              <p className={`font-bold text-[#008751] ${diff >= 10000 ? 'text-sm' : 'text-xs'}`}>
                ₦{diff.toLocaleString()} left over — enough for {getSuggestion()}.
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-white border-t border-gray-50 flex justify-between items-center py-3">
        <div className="flex flex-col gap-1">
          {plan.spot.price_updated_at && plan.spot.price_source ? (
            <span className="text-[10px] text-gray-400 italic">
              Prices verified {new Date(plan.spot.price_updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} via {plan.spot.price_source}
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 italic">Prices estimated</span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {feedbackGiven ? (
            <span className="text-[11px] font-bold text-[#008751] animate-in fade-in slide-in-from-right-1">Thanks for the feedback</span>
          ) : (
            <>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Price right?</span>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleFeedback('up')}
                  className="p-1.5 hover:bg-green-50 rounded text-gray-400 hover:text-[#008751] transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleFeedback('down')}
                  className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

