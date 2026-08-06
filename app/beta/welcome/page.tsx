import Metadata from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Heart, Award, MessageSquare } from "lucide-react";
import { BetaBadge } from "@/components/ui/BetaBadge";

export const metadata = {
  title: "Welcome to the Founding Beta | OyaPlan",
  description: "Thank you for joining the OyaPlan Founding Beta. Let's shape Lagos outing planning together.",
};

export default function BetaWelcomePage() {
  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] text-[#1A1A1A] pt-12 pb-24 px-4 sm:px-6 md:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Banner Header */}
        <div className="bg-[#008751] rounded-[28px] p-8 sm:p-10 text-white text-center shadow-lg relative overflow-hidden space-y-4">
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center font-black text-2xl shadow-inner">
              🎉
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Welcome to the Founding Beta
            </h1>
            
            <p className="text-white/90 text-sm sm:text-base font-medium max-w-md">
              You&apos;re officially one of the first people helping shape OyaPlan before our public release.
            </p>

            <div className="pt-2">
              <BetaBadge badgeType="founding_beta" size="lg" showTooltip={false} />
            </div>
          </div>

          {/* Subtle background glow */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 30%, #FCC630 0%, transparent 70%)',
            }}
          />
        </div>

        {/* Perks & Expectations Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-[#1A1A1A] uppercase tracking-wider text-center">
            As a Founding Beta Tester:
          </h2>

          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-sm sm:text-base text-[#4B5563] font-medium">
              <span className="w-8 h-8 rounded-xl bg-[#FCC630]/20 text-[#854D0E] flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                🏅
              </span>
              <div>
                <strong className="text-[#1A1A1A]">Permanent Beta Badge:</strong> You&apos;ll keep your Founding Beta Tester badge on your profile forever.
              </div>
            </li>

            <li className="flex items-start gap-3 text-sm sm:text-base text-[#4B5563] font-medium">
              <span className="w-8 h-8 rounded-xl bg-[#008751]/15 text-[#008751] flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                ⭐
              </span>
              <div>
                <strong className="text-[#1A1A1A]">6 Months Free Premium:</strong> Receive 6 months of OyaPlan Premium perks unlocked automatically when launched.
              </div>
            </li>

            <li className="flex items-start gap-3 text-sm sm:text-base text-[#4B5563] font-medium">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                💬
              </span>
              <div>
                <strong className="text-[#1A1A1A]">Direct Influence:</strong> Your bug reports and suggestions directly shape the feature roadmap we build.
              </div>
            </li>
          </ul>

          <div className="border-t border-[#E5E7EB] pt-6 space-y-3">
            <div className="bg-[#FEFCE8] border border-[#FCC630]/60 rounded-2xl p-4 text-xs sm:text-sm font-semibold text-[#854D0E] space-y-1">
              <div className="font-extrabold text-[#1A1A1A] flex items-center gap-1.5">
                <span>🎯</span> Our Biggest Request
              </div>
              <p className="leading-relaxed">
                Plan at least one real outing with OyaPlan and let us know how your actual spend matched our estimate. That&apos;s how we build budget confidence for everyone.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 bg-[#008751] hover:bg-[#007043] text-white font-extrabold text-base rounded-[16px] shadow-md transition-all tap-feedback"
          >
            <span>Start Planning Your First Outing</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="text-xs text-text-muted font-medium text-center">
            By continuing, you agree to our{" "}
            <Link href="/beta" className="text-[#008751] font-bold hover:underline">
              Founding Beta Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#008751] font-bold hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>

      </div>
    </main>
  );
}
