import Metadata from "next";
import Link from "next/link";
import { ArrowLeft, Scale, Mail, ShieldAlert, FileCheck } from "lucide-react";

export const metadata = {
  title: "Terms of Service | OyaPlan",
  description: "Terms and conditions governing the use of OyaPlan outing planning platform.",
};

export default function TermsOfServicePage() {
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

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#008751]/10 text-[#008751] flex items-center justify-center font-black">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#008751]">Legal Agreement</span>
              <h1 className="text-3xl sm:text-4xl font-black text-midnight-lagoon tracking-tight">Terms of Service</h1>
            </div>
          </div>

          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Last Updated: August 2026 • OyaPlan Technologies Limited
          </p>
        </div>

        {/* Terms Body */}
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-10 shadow-sm space-y-8 text-sm sm:text-base leading-relaxed text-[#4B5563]">
          
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">1. Agreement to Terms</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and <strong>OyaPlan Technologies Limited</strong> (&quot;OyaPlan&quot;, &quot;we&quot;, &quot;us&quot;). By accessing or using <strong>oyaplan.com</strong>, generating outing plans, or creating an account, you agree to be bound by these Terms and our <Link href="/privacy" className="text-[#008751] font-bold hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">2. Eligibility & Account Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>You must be at least 18 years of age to participate in the OyaPlan platform or beta programs.</li>
              <li>You are responsible for maintaining the confidentiality of your authentication details and for all activities associated with your account.</li>
              <li>You agree to provide accurate information and refrain from impersonating any person or entity.</li>
            </ul>
          </section>

          <section className="space-y-3 border-l-4 border-[#FCC630] pl-4 py-2 bg-[#FEFCE8] rounded-r-xl">
            <h2 className="text-lg font-extrabold text-[#854D0E]">3. Cost Estimates & Pricing Disclaimer</h2>
            <p className="text-sm font-medium text-[#1A1A1A] leading-relaxed">
              OyaPlan provides venue cost calculations and transport fare estimates based on verified menus, typical prices, and historical transport rates. However, actual costs at third-party venues may vary due to menu updates, holiday surges, service fees, or ride-hailing demand fluctuations.
            </p>
            <p className="text-xs font-bold text-[#854D0E] mt-1 uppercase tracking-wider">
              Estimates are provided for planning guidance and do not constitute a financial guarantee.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">4. Acceptable Use</h2>
            <p>You agree not to use OyaPlan to:</p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li>Probe, scan, or test the vulnerability of our systems or bypass rate-limiting defenses.</li>
              <li>Scrape, crawl, or harvest venue prices or software assets without written permission.</li>
              <li>Submit false pricing evidence, spam reviews, or fraudulent venue recommendations.</li>
              <li>Violate any local, state, or national laws of the Federal Republic of Nigeria.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">5. Intellectual Property</h2>
            <p>
              The OyaPlan platform, algorithmic matching formulas, software design, copy, logos, and visual elements are the exclusive intellectual property of OyaPlan Technologies Limited. Nothing in these Terms grants you ownership of any OyaPlan assets or trademarks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, OyaPlan Technologies Limited shall not be liable for any indirect, incidental, special, or consequential damages arising out of your reliance on venue information, transport estimates, third-party service availability, or outing decisions made during app usage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">7. Service Modifications & Termination</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice. We reserve the right to suspend or terminate account access for users who violate these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">8. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict of law principles. Any legal proceedings shall be subject to the exclusive jurisdiction of courts located in Lagos State, Nigeria.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">9. Contact Us</h2>
            <p>
              For questions regarding these Terms of Service, please contact our team:
            </p>
            <div className="pt-2">
              <a
                href="mailto:hello@oyaplan.com"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#008751] hover:underline"
              >
                <Mail className="w-4 h-4" />
                hello@oyaplan.com
              </a>
              <p className="text-xs text-text-muted mt-1 font-medium">
                OyaPlan Technologies Limited • Lagos, Nigeria
              </p>
            </div>
          </section>

        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E7EB] pt-6 text-xs font-bold text-[#6B7280]">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#008751] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/beta" className="hover:text-[#008751] transition-colors">
              Founding Beta Terms
            </Link>
          </div>
          <span>&copy; {new Date().getFullYear()} OyaPlan Technologies Limited</span>
        </div>

      </div>
    </main>
  );
}
