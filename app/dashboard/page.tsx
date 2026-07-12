import { SavedPlanService } from '@/lib/services/identity/savedPlanService';
import Link from 'next/link';
import { ArrowRight, MapPin, Calendar } from 'lucide-react';
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
  const { data: savedPlans, success } = await SavedPlanService.getSavedPlans();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="type-display text-text-primary">Saved Plans</h1>
        <p className="type-body text-text-muted mt-2">Your upcoming outings.</p>
      </div>

      <div className="space-y-4">
        <h2 className="type-subheading text-text-primary">Saved Plans</h2>
        
        {!success ? (
          <div className="bg-white border border-border-default rounded-[20px] p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="type-heading text-text-primary">Couldn&apos;t load your saved plans</h3>
            <p className="type-body text-text-muted max-w-sm mx-auto">
              Something went wrong on our end. Please try again in a moment.
            </p>
            <Link href="/dashboard" className="inline-block mt-4">
              <Button className="bg-brand-green hover:bg-brand-green-70 text-white rounded-full type-label h-12 px-8 shadow-none border-none">
                Try again
              </Button>
            </Link>
          </div>
        ) : !savedPlans || savedPlans.length === 0 ? (
          <div className="bg-white border border-border-default rounded-[20px] p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-brand-green/5 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="type-heading text-text-primary">No saved plans yet</h3>
            <p className="type-body text-text-muted max-w-sm mx-auto">
              Your next great outing starts here.
            </p>
            <Link href="/" className="inline-block mt-4">
              <Button className="bg-brand-green hover:bg-brand-green-70 text-white rounded-full type-label h-12 px-8 shadow-none border-none">
                Start Planning
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {savedPlans.map((saveItem, index) => {
              const planArray = saveItem.shared_plans;
              const plan = (Array.isArray(planArray) ? planArray[0] : planArray) as SavedPlanEntry | null | undefined;
              if (!plan) return null;
              
              return (
                <Link 
                  key={plan.id || index} 
                  href={`/plan/${plan.id}`}
                  className="bg-white border border-border-default rounded-[16px] p-5 hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)] transition-all flex flex-col justify-between group tap-feedback"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-1 bg-surface-grey rounded-md type-caption uppercase tracking-wider text-text-muted">
                        {plan.vibe}
                      </span>
                      <span className="type-label text-brand-green font-[900]">
                        ₦{plan.total_cost.toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div>
                      <h3 className="type-subheading text-text-primary line-clamp-1 group-hover:text-brand-green transition-colors">
                        {Array.isArray(plan.spot) ? plan.spot[0]?.name : plan.spot?.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2 type-caption text-text-muted">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{Array.isArray(plan.spot) ? plan.spot[0]?.address : plan.spot?.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-border-default flex items-center justify-between">
                    <span className="type-caption text-text-muted">
                      Saved {new Date(saveItem.saved_at).toLocaleDateString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-green transition-colors transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
