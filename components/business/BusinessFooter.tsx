"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Lock, Phone, HelpCircle } from "lucide-react";

export function BusinessFooter() {
  return (
    <footer className="bg-[#0B1E14] text-white border-t border-[#1B3828] py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & Designation */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/for-business" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="OyaPlan"
                width={610}
                height={143}
                className="h-6 w-auto object-contain brightness-0 invert"
              />
              <span className="text-xs font-bold text-emerald-400 pl-2 border-l border-emerald-800">
                For Business
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The official portal for Lagos hospitality venues to manage prices, menus, and house policies, and turn planning intent into direct reservations.
            </p>
            <div className="pt-2">
              <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
                Lagos, Nigeria • Free Listing
              </span>
            </div>
          </div>

          {/* Nav Column 1: For Operators */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              For Operators
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/business/claim" className="hover:text-white transition-colors">
                  List Your Venue — Free
                </Link>
              </li>
              <li>
                <a href="/for-business#reservations" className="hover:text-white transition-colors">
                  How Reservations Work
                </a>
              </li>
              <li>
                <a href="/for-business#marketplace-relationship" className="hover:text-white transition-colors">
                  Marketplace Relationship
                </a>
              </li>
              <li>
                <Link href="/account?next=/business&context=business" className="hover:text-white transition-colors">
                  Business Sign In
                </Link>
              </li>
              <li>
                <Link href="/for-business#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Column 2: Ecosystem */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Marketplace
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1 text-emerald-400">
                  <span>Consumer Outing Planner</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Explore Lagos Venues
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/2348000000000?text=Hi%20OyaPlan%20Business%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>WhatsApp Operator Line</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Action Column */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Get Started
            </p>
            <Link
              href="/business/claim"
              className="w-full h-10 px-4 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Bottom Legal / Copyright */}
        <div className="pt-8 border-t border-[#1B3828] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} OyaPlan Technologies. Built for Lagos.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              Marketplace
            </Link>
            <Link href="/for-business" className="hover:text-slate-300 transition-colors">
              Business
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
