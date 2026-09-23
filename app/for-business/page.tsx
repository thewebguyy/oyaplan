import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Receipt, 
  Users, 
  Eye, 
  MessageSquare, 
  Clock, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'OyaPlan for Business — Help People Confidently Choose Your Venue',
  description: 'OyaPlan helps people discover businesses, understand what they will probably spend, and plan real outings. Keep your information accurate and see how people plan to spend.',
};

export default function ForBusinessPage() {
  return (
    <div className="min-h-[100dvh] bg-[#FAFAF8] text-[#010528] antialiased selection:bg-[#008751]/10 selection:text-[#008751]">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-border-default/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/for-business" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#008751] text-white flex items-center justify-center font-black text-sm shadow-xs transition-transform group-hover:scale-105">
              O
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-base text-[#010528] tracking-tight">OyaPlan</span>
              <span className="text-[11px] font-bold text-[#008751] uppercase tracking-wider bg-[#EAFDF3] px-2 py-0.5 rounded-md border border-[#A3F3C6]/60">
                for Business
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/account?next=/business"
              className="text-xs font-bold text-[#010528] hover:text-[#008751] px-3 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/business/claim"
              className="h-10 px-4 bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Claim Business</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-[#008751] text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Supply Relationship Layer</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#010528] uppercase tracking-tight leading-[1.1]">
            Help people confidently choose your business.
          </h1>

          <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto font-medium">
            OyaPlan helps people discover businesses, understand what they&apos;ll probably spend, and plan real outings. Keep your information accurate and see how people are planning to spend.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/business/claim" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-13 px-8 bg-[#008751] hover:bg-[#007043] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer">
                <span>Claim Your Business</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/account?next=/business" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-13 px-7 bg-white hover:bg-gray-50 border border-border-default text-[#010528] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs">
                Sign In to Business Portal
              </button>
            </Link>
          </div>

          <p className="text-[11px] text-text-muted">
            Free to claim. We do not charge listing fees or mandatory subscriptions.
          </p>
        </div>
      </section>

      {/* 4 Concrete Value Pillars */}
      <section className="py-12 px-4 sm:px-6 bg-white border-y border-border-default/60">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="type-ui-label text-xs font-black text-[#008751] uppercase tracking-wider">
              Why OyaPlan for Business
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#010528] uppercase tracking-tight">
              Built around your recurring operational needs
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              We don&apos;t build generic restaurant software. We solve the specific problems that prevent customers from choosing you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="p-7 rounded-3xl bg-[#FAFAF8] border border-border-default space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAFDF3] text-[#008751] flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#010528] uppercase tracking-tight">
                Keep your information accurate
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                Prices and mandatory fees change. Update menu prices, opening hours, VAT, service charges, corkage, and temporary operational changes in under 60 seconds from your phone.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-7 rounded-3xl bg-[#FAFAF8] border border-border-default space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#010528] uppercase tracking-tight">
                Help customers know what to expect
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                Customers hesitate when pricing is uncertain. OyaPlan makes your typical spend transparent before people leave home, so planners arrive ready to spend with budget confidence.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-7 rounded-3xl bg-[#FAFAF8] border border-border-default space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#010528] uppercase tracking-tight">
                See real planning demand
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                Understand when Lagos squads are including your venue in outings, what group sizes they have, and what budgets they are planning around. Honest data without fabricated vanity metrics.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-7 rounded-3xl bg-[#FAFAF8] border border-border-default space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#008751] flex items-center justify-center shadow-xs">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-[#010528] uppercase tracking-tight">
                See how customers see you
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-normal">
                Never wonder what information is circulating online. One click opens your public OyaPlan listing, showing you exactly what planners see on their screens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mutual Value Loop Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="type-ui-label text-xs font-black text-[#008751] uppercase tracking-wider">
              The OyaPlan Trust Loop
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#010528] uppercase tracking-tight">
              How accurate information drives better outings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-border-default space-y-2 text-center sm:text-left">
              <span className="text-xs font-black text-[#008751] font-mono">01</span>
              <h4 className="font-bold text-sm text-[#010528] uppercase">Accurate Data</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Venue confirms prices, hours, and mandatory charges.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border-default space-y-2 text-center sm:text-left">
              <span className="text-xs font-black text-[#008751] font-mono">02</span>
              <h4 className="font-bold text-sm text-[#010528] uppercase">Cost Confidence</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Planners know what they will spend before leaving home.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border-default space-y-2 text-center sm:text-left">
              <span className="text-xs font-black text-[#008751] font-mono">03</span>
              <h4 className="font-bold text-sm text-[#010528] uppercase">Real Outings</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Squads visit and spend without unexpected budget friction.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border-default space-y-2 text-center sm:text-left">
              <span className="text-xs font-black text-[#008751] font-mono">04</span>
              <h4 className="font-bold text-sm text-[#010528] uppercase">Visible Demand</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Venue sees actual planning demand and squad dynamics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp First-Class Pathway */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-border-default p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#008751] uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Direct Partner Support</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#010528] uppercase tracking-tight">
                Prefer WhatsApp over a portal?
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                We understand how Lagos hospitality runs. Our partner team is accessible on WhatsApp to help you claim your venue, update prices, or answer questions.
              </p>
            </div>

            <a
              href="https://wa.me/2348000000000?text=Hi%20OyaPlan,%20I%20manage%20a%20venue%20in%20Lagos%20and%20would%20like%20to%20claim%20my%20listing"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 h-12 px-6 bg-[#EAFDF3] hover:bg-[#d5f9e3] text-[#008751] border border-[#A3F3C6] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 bg-[#010528] text-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
            Take control of how people plan around your venue.
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Review your pre-populated listing, confirm your pricing, and connect with people making real spending decisions.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/business/claim" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-12 px-8 bg-[#008751] hover:bg-[#007043] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer">
                Claim Your Business Listing
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-border-default/60 text-center text-xs text-text-muted">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#010528]">OyaPlan for Business</span>
            <span>·</span>
            <span>Lagos, Nigeria</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/explore" className="hover:text-[#010528] transition-colors">
              Explore Venues
            </Link>
            <Link href="/account" className="hover:text-[#010528] transition-colors">
              Planner Account
            </Link>
            <Link href="/business/claim" className="hover:text-[#010528] transition-colors">
              Claim Venue
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
