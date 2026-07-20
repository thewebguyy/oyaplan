import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#010528] text-[#FAFAF8] rounded-t-[28px] sm:rounded-t-[40px] overflow-hidden">
      {/* ── CTA Banner ── */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Know what you'll spend. No surprises.
            </h2>
            <p className="text-white/70 text-lg">
              Start planning your next Lagos outing with confidence.
            </p>
          </div>
          <Link
            href="/explore"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-[#008751] px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Plan an Outing
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
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
              Lagos' verified pricing engine for outings and hangouts.
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
                <Link href="/explore" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Ikeja
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Lekki
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Victoria Island
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Yaba
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: For Venues */}
          <div>
            <h3 className="font-semibold text-white tracking-wide mb-6">For Venues</h3>
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/list-your-spot" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  List your spot
                </Link>
              </li>
              <li>
                <Link href="/list-your-spot" className="text-sm text-white/60 hover:text-[#008751] hover:translate-x-1 transition-all inline-block">
                  Claim your venue
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Legal ── */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} OyaPlan. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-white/40 hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
