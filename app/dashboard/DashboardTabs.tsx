'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Calendar, MapPin, Share2, ArrowRight, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OyaSquadSummary } from '@/lib/types';
import OyaSquadList from '@/components/squad/OyaSquadList';

interface SavedPlanSpot {
  name: string;
  address: string;
}

interface SavedPlanEntry {
  id: string;
  total_cost: number;
  vibe: string;
  spot: SavedPlanSpot | SavedPlanSpot[] | null;
}

interface SavedPlanItem {
  saved_at: string;
  shared_plans: SavedPlanEntry | SavedPlanEntry[];
}

interface DashboardTabsProps {
  savedPlans: SavedPlanItem[];
  squads: OyaSquadSummary[];
}

export default function DashboardTabs({ savedPlans, squads }: DashboardTabsProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'plans' | 'squads'>(
    tabParam === 'squads' ? 'squads' : 'plans'
  );

  useEffect(() => {
    if (tabParam === 'squads' || tabParam === 'plans') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="space-y-8">
      {/* Header with Navigation Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="type-display text-text-primary">
            {activeTab === 'plans' ? 'Saved Plans' : 'My OyaSquads'}
          </h1>
          <p className="type-body text-text-muted mt-1 text-sm">
            {activeTab === 'plans'
              ? 'Your upcoming Lagos outings & price breakdowns.'
              : 'The people you regularly go out with. Select them while planning.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-surface-grey p-1.5 rounded-full border border-border-default w-fit self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-1.5 font-extrabold text-xs rounded-full transition-all cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-midnight-lagoon text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Saved Plans ({savedPlans.length})
          </button>

          <button
            onClick={() => setActiveTab('squads')}
            className={`px-4 py-1.5 font-extrabold text-xs rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'squads'
                ? 'bg-midnight-lagoon text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>OyaSquads</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'squads' ? 'bg-brand-green text-white' : 'bg-brand-green/15 text-brand-green'}`}>
              {squads.length}
            </span>
          </button>

          <Link href="/saved">
            <span className="px-3.5 py-1.5 text-text-secondary hover:text-text-primary font-extrabold text-xs rounded-full transition-colors block">
              Saved Spots →
            </span>
          </Link>
        </div>
      </div>

      {/* Tab 1: Saved Plans */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {savedPlans.length === 0 ? (
            <div className="bg-white border border-border-default rounded-[20px] p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-brand-green/5 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="type-heading text-text-primary">Nothing saved yet.</h3>
              <p className="type-body text-text-muted max-w-sm mx-auto text-xs sm:text-sm">
                Your next outing starts here. Plan a budget-verified Lagos outing and save it to access anytime.
              </p>
              <Link href="/" className="inline-block mt-2">
                <Button className="bg-brand-green hover:bg-brand-green-70 text-white rounded-full type-label h-11 px-8 shadow-none border-none tap-feedback font-bold">
                  Start Planning
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-brand-green/5 border border-brand-green/20 rounded-[16px] flex items-center justify-between text-xs text-brand-green font-bold">
                <span>💡 Step 1: Click any plan to review menu prices → Step 2: Share with your squad on WhatsApp!</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {savedPlans.map((saveItem, index) => {
                  const planArray = saveItem.shared_plans;
                  const plan = (Array.isArray(planArray) ? planArray[0] : planArray) as SavedPlanEntry | null | undefined;
                  if (!plan) return null;

                  const spotName = Array.isArray(plan.spot) ? plan.spot[0]?.name : plan.spot?.name;
                  const spotAddress = Array.isArray(plan.spot) ? plan.spot[0]?.address : plan.spot?.address;

                  return (
                    <div
                      key={plan.id || index}
                      className="bg-white border border-border-default rounded-[20px] p-5 hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)] transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="px-2.5 py-1 bg-surface-grey rounded-md type-caption uppercase tracking-wider text-text-muted font-bold text-[10px]">
                            {plan.vibe}
                          </span>
                          <span className="type-label text-brand-green font-[900]">
                            ₦{plan.total_cost.toLocaleString('en-NG')}
                          </span>
                        </div>
                        <Link href={`/plan/${plan.id}`} className="block space-y-1">
                          <h3 className="type-subheading text-text-primary line-clamp-1 group-hover:text-brand-green transition-colors font-bold">
                            {spotName || 'Outing Plan'}
                          </h3>
                          <div className="flex items-center gap-1.5 type-caption text-text-muted text-xs">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{spotAddress || 'Lagos'}</span>
                          </div>
                        </Link>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border-default flex items-center justify-between gap-2">
                        <span className="type-caption text-text-muted text-xs">
                          Saved {new Date(saveItem.saved_at).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out our Lagos outing plan on OyaPlan (${spotName || 'Outing'}): https://oyaplan.app/plan/${plan.id}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 rounded-lg type-caption font-bold flex items-center gap-1.5 transition-colors text-xs"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            Share
                          </a>
                          <Link href={`/plan/${plan.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 px-2 text-text-muted hover:text-brand-green" aria-label="View Plan">
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: OyaSquads */}
      {activeTab === 'squads' && (
        <OyaSquadList initialSquads={squads} />
      )}
    </div>
  );
}
