'use client';

import { useState, useEffect } from 'react';
import { X, Check, Clock, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/trackClient';
import { submitActualSpend } from '@/lib/actions/submitActualSpend';
import {
  getEligibleFeedback,
  snoozeFeedback,
  dismissFeedback,
  PendingFeedbackItem
} from '@/lib/storage/feedbackQueue';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function SpendIntelligencePrompt() {
  const [mounted, setMounted] = useState(false);
  const [item, setItem] = useState<PendingFeedbackItem | null>(null);
  
  // Stages: 'idle' | 'stage1' (Did you go?) | 'stage2' (What did you spend?) | 'submitting' | 'success'
  const [stage, setStage] = useState<'idle' | 'stage1' | 'stage2' | 'submitting' | 'success'>('idle');
  
  const [actualSpend, setActualSpend] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Check queue on mount
  useEffect(() => {
    setMounted(true);
    const eligible = getEligibleFeedback();
    if (eligible) {
      setItem(eligible);
      setStage('stage1');
      trackEvent('feedback_prompt_shown', {
        category: 'Feedback',
        plan_id: eligible.planId,
        spot_id: eligible.spotId,
        version: '1.0'
      });
    }
  }, []);

  if (!mounted || stage === 'idle' || !item) {
    return null;
  }

  const handleDismiss = () => {
    snoozeFeedback(item.planId);
    trackEvent('feedback_prompt_dismissed', {
      category: 'Feedback',
      plan_id: item.planId,
      spot_id: item.spotId,
      version: '1.0'
    });
    setStage('idle');
  };

  const handleDidGo = () => {
    trackEvent('outing_confirmed', {
      category: 'Feedback',
      plan_id: item.planId,
      spot_id: item.spotId,
      version: '1.0'
    });
    trackEvent('actual_spend_started', {
      category: 'Feedback',
      plan_id: item.planId,
      spot_id: item.spotId,
      version: '1.0'
    });
    setStage('stage2');
  };

  const handleNotYet = () => {
    snoozeFeedback(item.planId);
    trackEvent('outing_not_yet', {
      category: 'Feedback',
      plan_id: item.planId,
      spot_id: item.spotId,
      version: '1.0'
    });
    setStage('idle');
  };

  const handleDidNotGo = () => {
    dismissFeedback(item.planId);
    trackEvent('outing_not_happened', {
      category: 'Feedback',
      plan_id: item.planId,
      spot_id: item.spotId,
      version: '1.0'
    });
    setStage('idle');
  };

  const handleSubmitSpend = async () => {
    const amount = parseInt(actualSpend.replace(/\D/g, ''), 10);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setStage('submitting');
    setError(null);

    const result = await submitActualSpend({
      sharedPlanId: item.planId,
      spotId: item.spotId,
      estimatedTotal: item.estimatedTotal,
      actualTotal: amount,
      notes: notes || undefined
    });

    if (result.success) {
      dismissFeedback(item.planId);
      trackEvent('actual_spend_submitted', {
        category: 'Feedback',
        shared_plan_id: item.planId,
        spot_id: item.spotId,
        actual_total: amount,
        estimated_total: item.estimatedTotal,
        version: '1.0'
      });
      setStage('success');
      setTimeout(() => setStage('idle'), 3000);
    } else {
      // Data safety: If network fails, it stays in the queue.
      setError(result.error || 'Failed to submit. Please try again.');
      setStage('stage2');
      trackEvent('actual_spend_submission_failed', {
        category: 'Feedback',
        shared_plan_id: item.planId,
        spot_id: item.spotId,
        error: result.error || 'unknown',
        version: '1.0'
      });
    }
  };

  const parsedActual = parseInt(actualSpend.replace(/\D/g, ''), 10);
  const difference = !isNaN(parsedActual) ? parsedActual - item.estimatedTotal : null;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100vw-32px)] md:w-[380px] bg-white rounded-[16px] shadow-2xl border border-surface-grey z-50 overflow-hidden flex flex-col pointer-events-auto transition-all animate-in slide-in-from-bottom-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-grey bg-[#FAFAF8]">
        <h3 className="font-outfit font-semibold text-text-primary text-[15px]">
          {stage === 'stage1' ? 'Checking in' : stage === 'stage2' ? 'Cost Comparison' : 'Thank you!'}
        </h3>
        {stage !== 'success' && stage !== 'submitting' && (
          <button onClick={handleDismiss} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* STAGE 1: Did you go? */}
        {stage === 'stage1' && (
          <>
            <p className="text-text-primary text-[15px] leading-relaxed">
              Did you end up going to <strong className="font-semibold">{item.spotName}</strong>?
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <Button onClick={handleDidGo} className="w-full bg-brand-green hover:bg-[#007040] text-white rounded-[12px] h-12 font-medium">
                <Check className="w-4 h-4 mr-2" /> Yes, I went
              </Button>
              <div className="flex gap-2">
                <Button onClick={handleNotYet} variant="outline" className="flex-1 rounded-[12px] h-11 text-text-secondary">
                  <Clock className="w-4 h-4 mr-2" /> Not yet
                </Button>
                <Button onClick={handleDidNotGo} variant="outline" className="flex-1 rounded-[12px] h-11 text-text-secondary">
                  <XCircle className="w-4 h-4 mr-2" /> Didn't go
                </Button>
              </div>
            </div>
          </>
        )}

        {/* STAGE 2: Spend Collection */}
        {stage === 'stage2' && (
          <>
            <div className="bg-[#FAFAF8] rounded-[12px] p-4 flex flex-col gap-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">OyaPlan estimated:</span>
                <span className="font-mono font-medium text-text-primary">{formatNaira(item.estimatedTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-text-primary font-medium">You actually spent:</span>
                <div className="relative w-1/2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₦</span>
                  <input 
                    type="text" 
                    value={actualSpend}
                    onChange={(e) => setActualSpend(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-border-default rounded-[8px] text-right font-mono focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                  />
                </div>
              </div>
              
              {difference !== null && (
                <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-border-default">
                  <span className="text-text-secondary">Difference:</span>
                  <span className={`font-mono font-medium ${difference > 0 ? 'text-red-600' : difference < 0 ? 'text-brand-green' : 'text-text-secondary'}`}>
                    {difference > 0 ? '+' : ''}{formatNaira(difference)}
                  </span>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary font-medium pl-1">Optional context (e.g. "Bought extra drinks")</label>
              <input 
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                className="w-full px-3 py-2 bg-white border border-border-default rounded-[8px] text-sm focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                placeholder="Anything different from the plan?"
              />
            </div>

            <Button 
              onClick={handleSubmitSpend}
              disabled={!parsedActual || parsedActual <= 0}
              className="w-full mt-2 bg-charcoal hover:bg-black text-white rounded-[12px] h-12 font-medium"
            >
              Submit Observation <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {/* SUBMITTING */}
        {stage === 'submitting' && (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
            <p className="text-sm text-text-secondary">Recording observation...</p>
          </div>
        )}

        {/* SUCCESS */}
        {stage === 'success' && (
          <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
            <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-brand-green" />
            </div>
            <div>
              <p className="text-[15px] font-medium text-text-primary">Observation recorded</p>
              <p className="text-sm text-text-secondary mt-1">This helps improve future estimates.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
