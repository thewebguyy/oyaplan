import Metadata from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail, Lock, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | OyaPlan",
  description: "How OyaPlan Technologies Limited collects, protects, and handles your data.",
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
              <span className="text-xs font-black uppercase tracking-wider text-[#008751]">Legal & Security</span>
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
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">1. Introduction</h2>
            <p>
              At <strong>OyaPlan Technologies Limited</strong> (&quot;OyaPlan&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and safeguard your information when you visit <strong>oyaplan.com</strong>, use our Lagos outing planner, or participate in our Founding Beta program.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">2. Information We Collect</h2>
            <p>We only collect information strictly necessary to provide cost-transparent outing recommendations and maintain secure account access:</p>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>
                <strong>Account & Contact Information:</strong> Your email address and display name provided during authentication (via Supabase Auth) or beta registration.
              </li>
              <li>
                <strong>Planning Inputs & Preferences:</strong> Anonymized outing criteria you enter into the planner, such as starting location (e.g. Lekki, Yaba, Ikeja), squad size, budget range, and vibe selections.
              </li>
              <li>
                <strong>Beta Feedback & Spend Data:</strong> Feedback, ratings, and voluntary actual spend reports submitted to help calibrate our pricing intelligence algorithms.
              </li>
              <li>
                <strong>Technical & Usage Data:</strong> IP address, device type, browser information, and referral sources to prevent fraud, enforce rate limits, and optimize mobile network performance.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">3. How We Use Your Information</h2>
            <p>We process your information for the following specific purposes:</p>
            <ul className="list-disc pl-5 space-y-2 font-medium">
              <li>To calculate accurate venue recommendations, transport estimates, and budget buffers.</li>
              <li>To manage your saved plans and authenticated user profile.</li>
              <li>To verify beta tester access and assign founding tester badges.</li>
              <li>To detect and prevent technical abuse, rate-limit violations, and security threats.</li>
              <li>To analyze product performance and improve our pricing models.</li>
            </ul>
          </section>

          <section className="space-y-3 border-l-4 border-[#008751] pl-4 py-1 bg-[#F0FDF4] rounded-r-xl">
            <h2 className="text-lg font-extrabold text-[#008751]">Our Strict Data Promise</h2>
            <p className="text-sm font-semibold text-[#1A1A1A]">
              We do not sell, rent, or trade your personal data to third parties. We do not use your private planning data for invasive cross-site advertisement targeting.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">4. Cookies & Session Storage</h2>
            <p>
              OyaPlan uses essential cookies and local browser storage to keep you signed in, preserve your planning criteria between pages, and enforce security policies. You can disable cookies in your browser settings, though certain features like saved plans may require authentication cookies to function properly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">5. Third-Party Infrastructure</h2>
            <p>
              We partner with trusted infrastructure providers to deliver a fast, reliable mobile experience:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-medium">
              <li><strong>Supabase:</strong> Cloud database, authentication, and security infrastructure.</li>
              <li><strong>Vercel:</strong> Application hosting and global edge distribution network.</li>
              <li><strong>Sentry:</strong> Anonymous error reporting to catch crashes in real-time.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">6. Data Retention & Your Rights</h2>
            <p>
              You retain full control over your data. You may request access to your stored profile data or request complete account deletion at any time by contacting us. Upon receiving a valid request, we will delete your account records within 30 days, except where retention is required by applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-[#1A1A1A]">7. Contact Us</h2>
            <p>
              If you have any questions, concerns, or data requests regarding this Privacy Policy, please reach out to our legal and support team:
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
