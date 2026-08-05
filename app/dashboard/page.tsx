import { SavedPlanService } from '@/lib/services/identity/savedPlanService';
import Link from 'next/link';
import { ArrowRight, MapPin, Calendar, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';


export const dynamic = 'force-dynamic';

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

export default async function DashboardPage() {
  const { data: savedPlans, success, error } = await SavedPlanService.getSavedPlans();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="type-display text-text-primary">Saved Plans</h1>
          <p className="type-body text-text-muted mt-2">Your upcoming Lagos outings & price breakdowns.</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-grey p-1.5 rounded-full border border-border-default w-fit">
          <Link href="/saved">
            <span className="px-4 py-1.5 text-text-secondary hover:text-text-primary font-extrabold text-xs rounded-full transition-colors">
              Saved Spots →
            </span>
          </Link>
          <span className="px-4 py-1.5 bg-midnight-lagoon text-white font-extrabold text-xs rounded-full">
            Saved Plans ({savedPlans?.length || 0})
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="type-subheading text-text-primary">Saved Plans</h2>
        
        {error === 'unauthorized' ? (
          <div className="bg-white border border-border-default rounded-[20px] p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-brand-green/5 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="type-heading text-text-primary">Sign in to view your Saved Plans</h3>
            <p className="type-body text-text-muted max-w-sm mx-auto">
              Save your favourite Lagos outing plans and access them anytime across devices.
            </p>
            <Link href="/" className="inline-block mt-4">
              <Button className="bg-brand-green hover:bg-brand-green-70 text-white rounded-[16px] type-label h-12 px-8 shadow-none border-none tap-feedback">
                Go to Home
              </Button>
            </Link>
          </div>
        ) : !success ? (
          <div className="bg-white border border-border-default rounded-[20px] p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="type-heading text-text-primary">We couldn't load this right now.</h3>
            <Link href="/dashboard" className="inline-block mt-4">
              <Button className="bg-brand-green hover:bg-brand-green-70 text-white rounded-[16px] type-label h-12 px-8 shadow-none border-none tap-feedback">
                Try again
              </Button>
            </Link>
          </div>
        ) : !savedPlans || savedPlans.length === 0 ? (
          <div className="bg-white border border-border-default rounded-[20px] p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-brand-green/5 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="type-heading text-text-primary">Nothing saved yet.</h3>
            <p className="type-body text-text-muted max-w-sm mx-auto">
              Your next outing starts here.
            </p>
            <Link href="/" className="inline-block mt-4">
              <Button className="bg-brand-green hover:bg-brand-green-70 text-white rounded-[16px] type-label h-12 px-8 shadow-none border-none tap-feedback">
                Start Planning
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-brand-green/5 border border-brand-green/20 rounded-[16px] flex items-center justify-between text-xs text-brand-green font-bold">
              <span>💡 Step 1: Click any plan to review menu prices → Step 2: Share with your squad on WhatsApp!</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {savedPlans.map((saveItem, index) => {
                const planArray = saveItem.shared_plans;
                const plan = (Array.isArray(planArray) ? planArray[0] : planArray) as SavedPlanEntry | null | undefined;
                if (!plan) return null;

                const spotName = Array.isArray(plan.spot) ? plan.spot[0]?.name : plan.spot?.name;
                const spotAddress = Array.isArray(plan.spot) ? plan.spot[0]?.address : plan.spot?.address;
                
                return (
                  <div 
                    key={plan.id || index}
                    className="bg-white border border-border-default rounded-[16px] p-5 hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)] transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-1 bg-surface-grey rounded-md type-caption uppercase tracking-wider text-text-muted font-bold">
                          {plan.vibe}
                        </span>
                        <span className="type-label text-brand-green font-[900]">
                          ₦{plan.total_cost.toLocaleString('en-NG')}
                        </span>
                      </div>
                      <Link href={`/plan/${plan.id}`} className="block space-y-1">
                        <h3 className="type-subheading text-text-primary line-clamp-1 group-hover:text-brand-green transition-colors">
                          {spotName || "Outing Plan"}
                        </h3>
                        <div className="flex items-center gap-1.5 type-caption text-text-muted">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{spotAddress || "Lagos"}</span>
                        </div>
                      </Link>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border-default flex items-center justify-between gap-2">
                      <span className="type-caption text-text-muted">
                        Saved {new Date(saveItem.saved_at).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Check out our Lagos outing plan on OyaPlan (${spotName || 'Outing'}): https://oyaplan.app/plan/${plan.id}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 rounded-lg type-caption font-bold flex items-center gap-1.5 transition-colors"
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
    </div>
  );
}
