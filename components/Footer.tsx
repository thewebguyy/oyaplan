import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#111111] text-[#F6F6F2] rounded-t-[20px] sm:rounded-t-[32px] overflow-hidden border-t border-[#222222]">
      {/* ── CTA Banner ── */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-white font-display">
              Know what it will cost before you leave home.
            </h2>
            <p className="text-white/70 text-sm sm:text-base font-medium">
              Start planning your next Lagos outing with total budget confidence.
            </p>
          </div>
          <Link
            href="/explore"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-[#F9E828] px-7 py-3.5 text-sm font-black text-[#111111] shadow-md transition-all hover:bg-[#ebd915] active:scale-95"
          >
            <span>Find Your Spot</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ── SEO Link Farm & Main Footer ── */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo.png"
                alt="OyaPlan"
                width={610}
                height={143}
                className="h-8 w-auto transition-all duration-300 hover:opacity-80"
              />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Lagos&apos; verified pricing engine for outings and hangouts.
            </p>
          </div>

          {/* Column 2: Discover */}
          <div>
            <h3 className="font-semibold text-white tracking-wide mb-6">Discover</h3>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/guides" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Date Night
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Group Hangouts
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Birthdays
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Solo Trips
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Top Areas */}
          <div>
            <h3 className="font-semibold text-white tracking-wide mb-6">Top Areas</h3>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/explore/ikeja" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Ikeja
                </Link>
              </li>
              <li>
                <Link href="/explore/lekki-phase-1" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Lekki
                </Link>
              </li>
              <li>
                <Link href="/explore/vi" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Victoria Island
                </Link>
              </li>
              <li>
                <Link href="/explore/yaba" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Yaba
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Community */}
          <div>
            <h3 className="font-semibold text-white tracking-wide mb-6">Community</h3>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/suggest-a-spot" className="text-sm text-white/60 hover:text-[#F9E828] hover:translate-x-1 transition-all inline-flex items-center gap-1.5">
                  <span>Suggest a Spot</span>
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-white/60 hover:text-[#F9E828] hover:translate-x-1 transition-all inline-block">
                  Lagos Spot Catalog
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="text-sm text-white/60 hover:text-[#F9E828] hover:translate-x-1 transition-all inline-block">
                  Give Beta Feedback
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-white/60 hover:text-[#F9E828] hover:translate-x-1 transition-all inline-block">
                  About OyaPlan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Legal ── */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} OyaPlan Technologies Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-white/40 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/beta" className="text-sm text-[#FCC630] hover:underline font-bold transition-colors">
              Beta Program
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
