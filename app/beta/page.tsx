import Metadata from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, Mail, Heart, Shield, MessageSquare, Lock, AlertTriangle } from "lucide-react";
import { BetaBadge } from "@/components/ui/BetaBadge";

export const metadata = {
  title: "Founding Beta Terms & Conditions | OyaPlan",
  description: "Terms and conditions for OyaPlan Founding Beta Testers.",
};

export default function BetaTermsPage() {
  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] text-[#1A1A1A] pt-12 pb-24 px-4 sm:px-6 md:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-[#008751] transition-colors tap-feedback"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to OyaPlan
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BetaBadge badgeType="founding_beta" size="sm" showTooltip={false} />
                <span className="text-xs font-black uppercase tracking-wider text-[#008751]">Beta Agreement</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-midnight-lagoon tracking-tight">
                Founding Beta Tester Terms &amp; Conditions
              </h1>
            </div>
          </div>

          <p className="text-sm font-medium text-text-muted leading-relaxed">
            Welcome to the OyaPlan Founding Beta. Before you dive in, here&apos;s what to expect and what we&apos;re asking of you.
          </p>
        </div>

        {/* Beta Terms Card Container */}
        <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-6 sm:p-10 shadow-sm space-y-8 text-sm sm:text-base leading-relaxed text-[#4B5563]">
          
          {/* Section 1 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <span className="w-7 h-7 rounded-xl bg-[#008751]/10 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">1</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A]">This is a work in progress</h2>
            </div>
            <p className="pl-9 font-medium">
              You&apos;re using OyaPlan before it&apos;s finished. Bugs, glitches, wrong prices, and things that just don&apos;t work yet are expected, that&apos;s exactly why we want you testing it. If something breaks or looks off, that&apos;s useful information for us, not a failure on your part for finding it.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2 border-l-4 border-[#FCC630] pl-4 py-2 bg-[#FEFCE8] rounded-r-2xl">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <span className="w-7 h-7 rounded-xl bg-[#FCC630] text-[#1A1A1A] flex items-center justify-center font-black text-xs shrink-0">2</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A]">Estimates aren&apos;t guarantees</h2>
            </div>
            <div className="space-y-2 text-sm sm:text-base font-medium text-[#4B5563]">
              <p>
                Every price you see is labelled <strong>Verified</strong> (checked recently) or <strong>Estimated</strong> (based on typical costs). We work hard to keep these accurate, but actual prices at a venue can still be different from what&apos;s shown, a menu changes, a place has a busy-night surge, transport costs more than expected. Please don&apos;t treat any number in the app as a promise.
              </p>
              <p className="text-xs font-bold text-[#854D0E] uppercase tracking-wider">
                Because this is a beta product, OyaPlan isn&apos;t responsible for any losses, expenses, or decisions made based on information shown in the app during the testing period.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <span className="w-7 h-7 rounded-xl bg-[#008751]/10 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">3</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A]">Tell us how it actually went</h2>
            </div>
            <p className="pl-9 font-medium">
              After you use a plan for a real outing, we&apos;d genuinely love to know what you actually spent versus what we estimated, even if it matched exactly, or especially if it didn&apos;t. This is one of the most useful things you can share with us: it&apos;s how we make the estimates better for the next person. A quick message or a filled-in feedback form works great.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <span className="w-7 h-7 rounded-xl bg-[#008751]/10 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">4</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A]">Keep it between us for now</h2>
            </div>
            <ul className="pl-9 list-disc space-y-2 font-medium">
              <li>Please don&apos;t post public screenshots, screen recordings, or detailed descriptions of the app or its features before we launch publicly, a quick heads-up to us first is all we ask if you want to share something.</li>
              <li>Sharing with a friend one-on-one to get their thoughts is fine. Posting it on social media, a blog, or anywhere public isn&apos;t, until we say it&apos;s OK.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <span className="w-7 h-7 rounded-xl bg-[#008751]/10 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">5</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A]">Your data</h2>
            </div>
            <p className="pl-9 font-medium">
              We handle your personal information according to our <Link href="/privacy" className="text-[#008751] font-bold hover:underline">Privacy Policy</Link>. We collect what we need to run the app (like your phone number or email for account verification), we don&apos;t sell your data, and you can ask us to delete your account at any time.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <span className="w-7 h-7 rounded-xl bg-[#008751]/10 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">6</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A]">Your feedback</h2>
            </div>
            <ul className="pl-9 list-disc space-y-2 font-medium">
              <li>Anything you tell us, bug reports, suggestions, complaints, ideas, helps us build a better product, and we may use it to improve OyaPlan.</li>
              <li>If we build something based on your idea, that&apos;s genuinely exciting for us, but it doesn&apos;t create any ownership claim or extra compensation beyond the beta tester perks we&apos;ve already offered you.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <span className="w-7 h-7 rounded-xl bg-[#008751]/10 text-[#008751] flex items-center justify-center font-black text-xs shrink-0">7</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A]">A few practical things</h2>
            </div>
            <ul className="pl-9 list-disc space-y-2 font-medium">
              <li>Features may change, break, or disappear without warning during beta, we&apos;re actively building, not running a finished product.</li>
              <li>You need to be 18 or older to take part.</li>
              <li>You can stop being a beta tester at any time, no hard feelings, just let us know.</li>
              <li>We can also pause or end the beta program if we need to, and we&apos;ll tell you if that happens.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-2 border-l-4 border-[#008751] pl-4 py-2 bg-[#F0FDF4] rounded-r-2xl">
            <div className="flex items-center gap-2 text-[#1A1A1A]">
              <span className="w-7 h-7 rounded-xl bg-[#008751] text-white flex items-center justify-center font-black text-xs shrink-0">8</span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#008751]">Be kind</h2>
            </div>
            <p className="text-sm sm:text-base font-medium text-[#1A1A1A] leading-relaxed">
              We&apos;re a small team building something new, and your honest feedback, including the critical stuff, genuinely makes OyaPlan better. All we ask is that you keep it constructive. We&apos;ll do the same with you.
            </p>
          </section>

          {/* Legal Supplement Note */}
          <div className="pt-6 border-t border-[#E5E7EB] text-xs sm:text-sm font-semibold text-text-muted space-y-3">
            <p className="text-[#1A1A1A]">
              By using OyaPlan during the beta, you&apos;re agreeing to this page along with our full{" "}
              <Link href="/terms" className="text-[#008751] font-bold hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#008751] font-bold hover:underline">
                Privacy Policy
              </Link>
              , which cover the more detailed legal stuff.
            </p>
            <p className="text-[#854D0E] font-bold">
              Questions any time, just reply to any of our emails or message us directly. We read everything.
            </p>
            <p className="pt-2 text-xs font-black text-[#1A1A1A] uppercase tracking-wider">
              Signed, OyaPlan Technologies Limited
            </p>
          </div>

        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E7EB] pt-6 text-xs font-bold text-[#6B7280]">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#008751] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#008751] transition-colors">
              Terms of Service
            </Link>
          </div>
          <span>&copy; {new Date().getFullYear()} OyaPlan Technologies Limited</span>
        </div>

      </div>
    </main>
  );
}
