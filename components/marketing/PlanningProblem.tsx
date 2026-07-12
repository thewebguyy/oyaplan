export function PlanningProblem() {
  return (
    <section className="w-full py-24 md:py-32 bg-background border-b border-border-default overflow-hidden">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="type-display text-text-primary mb-6">
            Planning is broken.
          </h2>
          <p className="type-body text-text-secondary text-lg md:text-xl max-w-2xl mx-auto">
            You spend hours jumping between apps, only to end up at the same place, 
            spending more than you intended.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-24 relative">
          
          {/* Decorative Divider for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border-default -translate-x-1/2"></div>
          
          {/* Column 1: The Old Way */}
          <div className="flex flex-col items-center">
            <h3 className="type-subheading text-text-muted mb-12 uppercase tracking-widest text-sm font-bold">
              How people plan today
            </h3>
            
            <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
              <div className="w-full bg-surface-grey border border-border-strong rounded-xl py-4 text-center font-medium text-text-secondary shadow-sm">WhatsApp</div>
              <div className="text-text-muted">↓</div>
              <div className="w-full bg-surface-grey border border-border-strong rounded-xl py-4 text-center font-medium text-text-secondary shadow-sm">Instagram</div>
              <div className="text-text-muted">↓</div>
              <div className="w-full bg-surface-grey border border-border-strong rounded-xl py-4 text-center font-medium text-text-secondary shadow-sm">TikTok</div>
              <div className="text-text-muted">↓</div>
              <div className="w-full bg-surface-grey border border-border-strong rounded-xl py-4 text-center font-medium text-text-secondary shadow-sm">Google Maps</div>
              <div className="text-text-muted">↓</div>
              <div className="w-full bg-surface-grey border border-border-strong rounded-xl py-4 text-center font-medium text-text-secondary shadow-sm">Arguments</div>
              <div className="text-text-muted">↓</div>
              <div className="w-full bg-red-50 border border-red-200 rounded-xl py-4 text-center font-medium text-red-600 shadow-sm">Nobody knows the cost</div>
              <div className="text-text-muted">↓</div>
              <div className="w-full bg-red-50 border border-red-200 rounded-xl py-4 text-center font-bold text-red-600 shadow-sm">Nobody decides</div>
            </div>
          </div>

          {/* Column 2: The OyaPlan Way */}
          <div className="flex flex-col items-center">
            <h3 className="type-subheading text-brand-green mb-12 uppercase tracking-widest text-sm font-bold">
              With OyaPlan
            </h3>
            
            <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
              <div className="w-full bg-background border-2 border-brand-green rounded-xl py-4 text-center font-bold text-text-primary shadow-md card-lift">Budget</div>
              <div className="text-brand-green font-bold">↓</div>
              <div className="w-full bg-background border-2 border-brand-green rounded-xl py-4 text-center font-bold text-text-primary shadow-md card-lift">Group</div>
              <div className="text-brand-green font-bold">↓</div>
              <div className="w-full bg-background border-2 border-brand-green rounded-xl py-4 text-center font-bold text-text-primary shadow-md card-lift">Mood</div>
              <div className="text-brand-green font-bold">↓</div>
              <div className="w-full bg-brand-green rounded-xl py-4 text-center font-bold text-text-on-green shadow-lg card-lift">One trusted plan</div>
              <div className="text-brand-green font-bold">↓</div>
              <div className="w-full bg-text-primary rounded-xl py-4 text-center font-black text-background text-lg shadow-xl card-lift">Go</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
