import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-[100dvh] bg-[#FAF7F2] text-midnight-lagoon antialiased selection:bg-brand-green/10 selection:text-brand-green">
      {/* Hero Section */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFDF3] border border-[#A3F3C6] text-[#0A7C3F] text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>For Lagos Venues & Spots</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-midnight-lagoon tracking-tight leading-[1.15]">
            Help people confidently choose your business.
          </h1>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto font-normal">
            OyaPlan helps Lagos squads discover spots, understand what they&apos;ll probably spend, and plan real outings. Keep your details accurate and see how people plan around your space.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/business/claim" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-12 px-7 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer tap-feedback">
                <span>Claim Your Business</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/account?next=/business" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-12 px-6 bg-white hover:bg-gray-50 border border-border-default text-midnight-lagoon text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs tap-feedback">
                Sign In to Business Portal
              </button>
            </Link>
          </div>

          <p className="text-xs text-text-muted">
            Free to claim. We do not charge listing fees or mandatory subscriptions.
          </p>
        </div>
      </section>

      {/* 4 Concrete Value Pillars */}
      <section className="py-14 px-4 sm:px-6 bg-white border-y border-border-default">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">
              Why OyaPlan for Business
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight-lagoon tracking-tight">
              Built around your recurring operational needs
            </h2>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              We solve the specific ambiguity that prevents customers from deciding to leave home and choose you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAFDF3] text-[#0A7C3F] flex items-center justify-center border border-[#A3F3C6]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-midnight-lagoon">
                Keep your information accurate
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Prices and mandatory fees change. Update menu items, opening hours, VAT, service charges, corkage, and temporary operational changes in under 60 seconds from your phone.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-midnight-lagoon">
                Help customers know what to expect
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Customers hesitate when pricing is uncertain. OyaPlan makes typical spend transparent before people leave home, so planners arrive ready to spend with budget confidence.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-midnight-lagoon">
                See real planning demand
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Understand when Lagos squads include your venue in outings, what group sizes they have, and what budgets they are planning around. Honest signals without fabricated vanity metrics.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#EAE4DC] space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A7C3F] flex items-center justify-center border border-emerald-200">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-midnight-lagoon">
                See how customers see you
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Never wonder what information is circulating online. One click opens your public OyaPlan listing, showing you exactly what planners see on their screens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The OyaPlan Trust Loop */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">
              The OyaPlan Trust Loop
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-midnight-lagoon tracking-tight">
              How accurate information drives better outings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-border-default space-y-2">
              <span className="text-xs font-bold text-brand-green font-mono">01</span>
              <h4 className="font-bold text-sm text-midnight-lagoon">Accurate Data</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Venue confirms prices, hours, and mandatory charges.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border-default space-y-2">
              <span className="text-xs font-bold text-brand-green font-mono">02</span>
              <h4 className="font-bold text-sm text-midnight-lagoon">Cost Confidence</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Planners know what they will spend before leaving home.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border-default space-y-2">
              <span className="text-xs font-bold text-brand-green font-mono">03</span>
              <h4 className="font-bold text-sm text-midnight-lagoon">Real Outings</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Squads visit and spend without unexpected budget friction.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-border-default space-y-2">
              <span className="text-xs font-bold text-brand-green font-mono">04</span>
              <h4 className="font-bold text-sm text-midnight-lagoon">Useful Demand</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Venue sees genuine planning intent and verified spend data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lagos WhatsApp Support Channel */}
      <section className="py-12 px-4 sm:px-6 bg-white border-t border-border-default">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAFDF3] text-brand-green flex items-center justify-center mx-auto border border-[#A3F3C6]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-midnight-lagoon tracking-tight">
            Prefer to chat on WhatsApp?
          </h3>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Our Lagos operations team works directly with managers and owners over WhatsApp to verify listings, update menus, and assist with claim verification.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/2348000000000?text=Hi%20OyaPlan%2C%20I%20own%20a%20venue%20in%20Lagos%20and%20want%20to%20learn%20more%20about%20listing%20accuracy."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-green hover:bg-[#007043] text-white text-xs font-bold uppercase tracking-wider transition-all tap-feedback"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message OyaPlan on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-[#FAF7F2] border-t border-border-default text-center text-xs text-text-muted">
        <p>© {new Date().getFullYear()} OyaPlan for Business · Lagos, Nigeria</p>
      </footer>
    </div>
  );
}
