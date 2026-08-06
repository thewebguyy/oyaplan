import Metadata from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail, Lock, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | OyaPlan",
  description: "How OyaPlan Technologies Limited collects, protects, and handles your data under NDPR guidelines.",
};

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#008751]">Legal &amp; Security</span>
              <h1 className="text-3xl sm:text-4xl font-black text-midnight-lagoon tracking-tight">Privacy Policy</h1>
            </div>
          </div>

          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Last Updated: August 2026 • OyaPlan Technologies Limited
          </p>
        </div>

        {/* Policy Body */}
        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-6 sm:p-10 shadow-sm space-y-8 text-sm sm:text-base leading-relaxed text-[#4B5563]">
          
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">1. Introduction &amp; Compliance</h2>
            <p>
              At <strong>OyaPlan Technologies Limited</strong> (&quot;OyaPlan&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we respect your privacy and are committed to protecting your personal data in accordance with the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and international data privacy principles. This policy explains how we collect, use, and protect your information across <strong>oyaplan.com</strong> and our beta services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">2. Information We Collect</h2>
            <p>We collect only data necessary to deliver verified outing plans and secure account access:</p>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>
                <strong>Account Identity Data:</strong> Email address and display name created during sign-in via Supabase Authentication.
              </li>
              <li>
                <strong>Planning Inputs:</strong> Anonymous criteria entered into the planner, including starting location, squad size, budget range, and vibe selections.
              </li>
              <li>
                <strong>Beta Feedback &amp; Spend Intelligence:</strong> Voluntary actual spend submissions and venue reviews submitted to calibrate transport and menu pricing accuracy.
              </li>
              <li>
                <strong>Technical Logs:</strong> IP address, device type, browser user-agent, and request timestamps to prevent abuse, enforce rate limits, and secure our network.
              </li>
            </ul>
          </section>

          <section className="space-y-3 border-l-4 border-[#008751] pl-4 py-2 bg-[#F0FDF4] rounded-r-xl">
            <h2 className="text-lg font-extrabold text-[#008751]">No Data Selling Promise</h2>
            <p className="text-sm font-semibold text-[#1A1A1A]">
              We never sell, rent, or trade your personal information or squad outing plans to third parties or advertising networks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">3. Cookies &amp; Session Storage</h2>
            <p>
              We use essential HTTP cookies and browser session storage strictly to maintain authenticated sessions, preserve planning selections between screens, and protect forms against cross-site request forgery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">4. Third-Party Infrastructure</h2>
            <p>Your data is processed using secure cloud service providers:</p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li><strong>Supabase Inc.:</strong> Encrypted cloud database and authentication provider.</li>
              <li><strong>Vercel Inc.:</strong> Hosting infrastructure and global edge network.</li>
              <li><strong>Sentry:</strong> Anonymous runtime error reporting.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">5. Data Retention &amp; Your NDPA Rights</h2>
            <p>Under the Nigeria Data Protection Act, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li>Access all personal data stored under your account.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request complete erasure of your account and associated profile data.</li>
              <li>Object to processing or request data portability.</li>
            </ul>
            <p className="pt-1">
              Account deletion requests are processed within 30 days of email verification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">6. Contact Us</h2>
            <p>For privacy inquiries or data rights requests, contact our compliance team:</p>
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

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E7EB] pt-6 text-xs font-bold text-[#6B7280]">
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-[#008751] transition-colors">
              Terms of Service
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
