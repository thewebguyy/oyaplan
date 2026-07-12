import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "OyaPlan | Plan outings you can actually afford",
  description: "OyaPlan helps you discover, compare, and save realistic plans for dates, hangouts, birthdays, and group outings without wasting time or money.",
};

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Section */}
      <section className="w-full py-20 md:py-32 bg-background border-b border-border-default">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary tracking-tight mb-6 leading-tight">
            Plan outings you can <br className="hidden md:block" /> actually afford.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-3xl mx-auto leading-relaxed">
            OyaPlan helps you discover, compare, and save realistic plans for dates, hangouts, birthdays, and group outings without wasting time or money.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/waitlist" className="w-full sm:w-auto bg-brand-green text-white hover:bg-brand-green/90 shadow-md transition-transform hover:-translate-y-0.5 h-14 px-10 text-lg rounded-xl inline-flex items-center justify-center font-medium whitespace-nowrap">Join the waitlist</Link>
            <Link href="#how-it-works" className="w-full sm:w-auto border border-border-strong text-text-primary hover:bg-surface-grey h-14 px-10 text-lg rounded-xl inline-flex items-center justify-center font-medium whitespace-nowrap">See how it works</Link>
          </div>
          {/* Trust Strip */}
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-text-muted bg-surface-grey inline-flex px-4 py-2 rounded-full mx-auto">
            <span className="text-brand-green">✓</span> Trusted by 1,000+ early planners
            <span className="mx-2">•</span> 
            <span className="text-brand-green">✓</span> Verified venues only
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="w-full py-24 bg-surface-grey border-b border-border-default">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">
              Planning shouldn't feel like a financial trap.
            </h2>
            <p className="text-lg text-text-secondary">
              Existing tools show you places you can't afford and leave group decisions messy. We fix that.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background shadow-sm border-border-default p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl">Hidden Prices</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-text-secondary">Menus without prices and surprise minimum spends ruin the vibe.</p>
              </CardContent>
            </Card>
            <Card className="bg-background shadow-sm border-border-default p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl">Endless Tabs</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-text-secondary">You waste hours jumping between five different apps just to find one good spot.</p>
              </CardContent>
            </Card>
            <Card className="bg-background shadow-sm border-border-default p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl">Group Chaos</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-text-secondary">Trying to herd cats while everyone silently debates the budget is exhausting.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className="w-full py-24 bg-background border-b border-border-default">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-16 tracking-tight">
            Four simple steps to a confident plan.
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-left">
            <div className="relative">
              <div className="text-brand-green font-bold text-5xl mb-4 opacity-20 absolute -top-8 -left-4">1</div>
              <h3 className="text-xl font-bold text-text-primary mb-2 relative z-10">Set your budget.</h3>
              <p className="text-text-secondary relative z-10">Tell us what you can actually spend. No judgment.</p>
            </div>
            <div className="relative">
              <div className="text-brand-green font-bold text-5xl mb-4 opacity-20 absolute -top-8 -left-4">2</div>
              <h3 className="text-xl font-bold text-text-primary mb-2 relative z-10">Choose the outing type.</h3>
              <p className="text-text-secondary relative z-10">Looking for a quiet date, a loud birthday, or a chill hangout?</p>
            </div>
            <div className="relative">
              <div className="text-brand-green font-bold text-5xl mb-4 opacity-20 absolute -top-8 -left-4">3</div>
              <h3 className="text-xl font-bold text-text-primary mb-2 relative z-10">Compare realistic options.</h3>
              <p className="text-text-secondary relative z-10">See vetted venues that actually fit your math.</p>
            </div>
            <div className="relative">
              <div className="text-brand-green font-bold text-5xl mb-4 opacity-20 absolute -top-8 -left-4">4</div>
              <h3 className="text-xl font-bold text-text-primary mb-2 relative z-10">Save, share, and decide.</h3>
              <p className="text-text-secondary relative z-10">Get group buy-in instantly and commit with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trust Section */}
      <section className="w-full py-24 bg-surface-grey border-b border-border-default">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 tracking-tight">
              Built on transparency, not aesthetics.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-background p-6 rounded-2xl border border-border-default shadow-sm flex gap-4">
              <div className="bg-brand-green/10 p-3 rounded-lg text-brand-green h-fit shrink-0">✓</div>
              <div>
                <h3 className="font-bold text-lg text-text-primary mb-1">Verified Venues</h3>
                <p className="text-text-secondary">No bait-and-switch. If we list it, we've vetted it.</p>
              </div>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border-default shadow-sm flex gap-4">
              <div className="bg-brand-green/10 p-3 rounded-lg text-brand-green h-fit shrink-0">✓</div>
              <div>
                <h3 className="font-bold text-lg text-text-primary mb-1">Budget-Aware</h3>
                <p className="text-text-secondary">Our algorithm only shows you what you can comfortably afford.</p>
              </div>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border-default shadow-sm flex gap-4">
              <div className="bg-brand-green/10 p-3 rounded-lg text-brand-green h-fit shrink-0">✓</div>
              <div>
                <h3 className="font-bold text-lg text-text-primary mb-1">Transparent Price Ranges</h3>
                <p className="text-text-secondary">Know exactly what a meal or drink costs before you arrive.</p>
              </div>
            </div>
            <div className="bg-background p-6 rounded-2xl border border-border-default shadow-sm flex gap-4">
              <div className="bg-brand-green/10 p-3 rounded-lg text-brand-green h-fit shrink-0">✓</div>
              <div>
                <h3 className="font-bold text-lg text-text-primary mb-1">Shareable Plans</h3>
                <p className="text-text-secondary">Stop arguing in group chats. Share a link, vote, and lock it in.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA Section */}
      <section className="w-full py-32 bg-background">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">
            Ready to plan outings that actually happen?
          </h2>
          <p className="text-xl text-text-secondary mb-10">
            Stop guessing. Start committing.
          </p>
          <Link href="/waitlist" className="bg-brand-green text-white hover:bg-brand-green/90 shadow-md transition-transform hover:-translate-y-0.5 w-full sm:w-auto h-14 px-10 text-lg rounded-xl inline-flex items-center justify-center font-medium whitespace-nowrap">Join the waitlist</Link>
        </div>
      </section>
    </div>
  );
}
