"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ArrowUpRight,
  Menu,
  X,
  Utensils,
  Moon,
  Sparkles,
  Compass,
  Building2,
  Clock,
  TrendingUp,
  ShieldCheck,
  HelpCircle,
  Phone,
  FileText,
  Lock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export function BusinessMarketingHeader() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<"types" | "features" | null>(null);
  const [utilityMenuOpen, setUtilityMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileSubMenu, setMobileSubMenu] = useState<"types" | "features" | null>(null);

  const headerRef = useRef<HTMLElement>(null);

  // Close menus on outside click or route change
  useEffect(() => {
    setActiveMenu(null);
    setUtilityMenuOpen(false);
    setMobileDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setUtilityMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const businessTypeGroups = [
    {
      group: "DINING",
      icon: Utensils,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      items: [
        { name: "Restaurants", desc: "Full-service dining, bistros, and grills across Lagos", href: "/for-business#dining" },
        { name: "Cafés", desc: "Coffee spots, breakfast spots, and daytime spaces", href: "/for-business#dining" },
      ],
    },
    {
      group: "NIGHTLIFE",
      icon: Moon,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
      items: [
        { name: "Lounges & Bars", desc: "Cocktail lounges, wine bars, and high-energy spots", href: "/for-business#nightlife" },
        { name: "Clubs", desc: "Late-night venues, dance floors, and nightlife hubs", href: "/for-business#nightlife" },
        { name: "Rooftops", desc: "Skyline views, sunset dining, and terrace venues", href: "/for-business#nightlife" },
      ],
    },
    {
      group: "EXPERIENCES",
      icon: Sparkles,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      items: [
        { name: "Activities & Fun", desc: "Arcades, bowling, paint & sip, and interactive spots", href: "/for-business#experiences" },
        { name: "Cinema & Theater", desc: "Screenings, live performances, and arts centers", href: "/for-business#experiences" },
        { name: "Spa & Wellness", desc: "Day spas, wellness retreats, and relaxation spots", href: "/for-business#experiences" },
      ],
    },
    {
      group: "OUTDOOR",
      icon: Compass,
      color: "text-sky-700 bg-sky-50 border-sky-200",
      items: [
        { name: "Beaches & Waterfronts", desc: "Private beach clubs, resorts, and waterfront dining", href: "/for-business#outdoor" },
        { name: "Nature & Parks", desc: "Canopy walks, conservation centers, and garden spaces", href: "/for-business#outdoor" },
      ],
    },
  ];

  const featureGroups = [
    {
      group: "GET DISCOVERED",
      desc: "How guests find you",
      items: [
        { name: "Business Profile", desc: "Accurate photos, location, and ambiance details", status: "Available" },
        { name: "Free Listing", desc: "Show up when Lagosians budget and plan outings", status: "Available" },
        { name: "Vibe & Category Fit", desc: "Audience and occasion tags tailored for real venues", status: "Available" },
      ],
    },
    {
      group: "GET CHOSEN",
      desc: "Clear prices & rules",
      items: [
        { name: "Menus & Pricing", desc: "Keep dishes, bottles, and minimum spends accurate", status: "Available" },
        { name: "Price Transparency", desc: "Taxes, service charges, and corkage stated upfront", status: "Available" },
        { name: "House Rules", desc: "Clear dress codes, cake fees, and celebration rules", status: "Available" },
        { name: "Budget Accuracy", desc: "Appear in squad budgets with realistic per-person estimates", status: "Available" },
      ],
    },
    {
      group: "GET BOOKED",
      desc: "Table bookings & deposits",
      items: [
        { name: "Reservation Requests", desc: "Receive table booking requests directly from squads", status: "In Development" },
        { name: "Direct Deposits", desc: "Guests pay table deposits directly to your venue", status: "Available" },
        { name: "Guest Check-In", desc: "Verify guest plan codes quickly when they arrive", status: "Available" },
      ],
    },
    {
      group: "LEARN & IMPROVE",
      desc: "Real spend & feedback",
      items: [
        { name: "Weekend Interest", desc: "See how many squads add you to their plans", status: "Available" },
        { name: "Group Trends", desc: "See typical group sizes and budgets for your spot", status: "Available" },
        { name: "Guest Bill Feedback", desc: "Real post-visit bill feedback from planners", status: "Available" },
        { name: "Listing Updates", desc: "Keep hours, photos, and policies up to date", status: "Available" },
      ],
    },
  ];

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#EAE4DC] text-[#111111] shadow-xs transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* ── Left: Dedicated Business Wordmark with Original Logo ── */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/for-business" className="flex items-center gap-2.5 tap-feedback group">
            <Image
              src="/logo.png"
              alt="OyaPlan"
              width={610}
              height={143}
              className="h-7 w-auto object-contain shrink-0"
              style={{ width: "auto", height: "26px" }}
              priority
            />
            <div className="flex items-center gap-1.5 pl-2.5 border-l border-black/15">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#008751] bg-[#008751]/10 border border-[#008751]/25 px-2 py-0.5 rounded uppercase">
                THE PULSE
              </span>
            </div>
          </Link>

          {/* ── Desktop Primary Navigation (Mega Menu Triggers) ── */}
          <nav className="hidden lg:flex items-center gap-2 font-mono">
            {/* Business Types Trigger */}
            <button
              onClick={() => setActiveMenu(activeMenu === "types" ? null : "types")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all tap-feedback ${
                activeMenu === "types"
                  ? "bg-black/10 text-black"
                  : "text-slate-700 hover:text-black hover:bg-black/5"
              }`}
              aria-expanded={activeMenu === "types"}
            >
              <span>01 VENUES</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeMenu === "types" ? "rotate-180 text-[#008751]" : "text-slate-400"
                }`}
              />
            </button>

            {/* Features Trigger */}
            <button
              onClick={() => setActiveMenu(activeMenu === "features" ? null : "features")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all tap-feedback ${
                activeMenu === "features"
                  ? "bg-black/10 text-black"
                  : "text-slate-700 hover:text-black hover:bg-black/5"
              }`}
              aria-expanded={activeMenu === "features"}
            >
              <span>02 CAPABILITIES</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeMenu === "features" ? "rotate-180 text-[#008751]" : "text-slate-400"
                }`}
              />
            </button>
          </nav>
        </div>

        {/* ── Right Actions: Floor Login, Claim CTA, Menu ── */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Access The Floor */}
          <Link
            href="/login/business"
            className="flex items-center gap-1 text-xs font-mono font-bold text-slate-700 hover:text-[#008751] transition-colors px-3 py-2 rounded-xl hover:bg-black/5 tap-feedback"
            title="Access The Floor"
          >
            <span>ACCESS THE FLOOR</span>
          </Link>

          {/* Business Get Started CTA */}
          <Link
            href="/business/claim"
            className="h-9 sm:h-10 px-4 sm:px-5 bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold font-mono rounded-xl flex items-center gap-2 transition-all shadow-xs tap-feedback cursor-pointer uppercase tracking-wider"
          >
            <span>CLAIM VENUE</span>
          </Link>

          {/* Desktop Utility Menu Trigger */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setUtilityMenuOpen(!utilityMenuOpen)}
              className={`p-2 rounded-xl transition-all tap-feedback ${
                utilityMenuOpen
                  ? "bg-black/10 text-black"
                  : "text-slate-700 hover:text-black hover:bg-black/5"
              }`}
              aria-label="Toggle utility menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop Utility Dropdown */}
            {utilityMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#18191B] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-[#F7F5EE]">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E575]">
                    HOSPITALITY COMMAND CENTER
                  </p>
                </div>
                <Link
                  href="/login/business"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 rounded-xl transition-colors font-mono"
                >
                  <Lock className="w-3.5 h-3.5 text-[#008751]" />
                  <span>Access The Floor</span>
                </Link>
                <Link
                  href="/business/claim"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 rounded-xl transition-colors font-mono"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00E575]" />
                  <span>Claim Lagos Venue</span>
                </Link>
                <a
                  href="https://wa.me/2348000000000?text=Hi%20OyaPlan%20Business%20Team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Concierge</span>
                </a>
                <Link
                  href="/for-business#faq"
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>FAQ & Support</span>
                </Link>
                <div className="border-t border-slate-100 my-1 pt-1">
                  <Link
                    href="/"
                    className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-brand-green hover:bg-[#EAFDF3] rounded-xl transition-colors"
                  >
                    <span>View Marketplace</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Drawer Hamburger */}
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors tap-feedback"
            aria-label="Open mobile navigation"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Desktop Mega Menu: Business Types ── */}
      {activeMenu === "types" && (
        <div className="hidden lg:block absolute top-full left-0 right-0 bg-white border-b border-border-default shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Editorial Column */}
              <div className="col-span-3 pr-6 border-r border-slate-100 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  Categorization Engine
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Where does your venue fit?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Lagos planners filter by vibe, budget, and neighborhood. Learn how your venue is represented on OyaPlan.
                </p>
                <div className="pt-3">
                  <Link
                    href="/business/claim"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline"
                  >
                    <span>Claim your spot now</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Center 4 Category Groups */}
              <div className="col-span-9 grid grid-cols-4 gap-6">
                {businessTypeGroups.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.group} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg border ${group.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                          {group.group}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block p-2.5 rounded-xl hover:bg-slate-50 transition-colors group/item"
                          >
                            <p className="text-xs font-bold text-slate-900 group-hover/item:text-brand-green transition-colors">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                              {item.desc}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Mega Menu: Features ── */}
      {activeMenu === "features" && (
        <div className="hidden lg:block absolute top-full left-0 right-0 bg-white border-b border-border-default shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Editorial Column */}
              <div className="col-span-3 pr-6 border-r border-slate-100 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  Business Capabilities
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Everything your venue needs to show up right.
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your menu. Your prices. Your hours. The details customers usually have to DM you about, kept accurate in one place.
                </p>
              </div>

              {/* 4 Feature Outcome Columns */}
              <div className="col-span-9 grid grid-cols-4 gap-6">
                {featureGroups.map((group) => (
                  <div key={group.group} className="space-y-3">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 block">
                        {group.group}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {group.desc}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {group.items.map((item) => (
                        <div
                          key={item.name}
                          className="p-2.5 rounded-xl bg-slate-50/50 border border-slate-100 space-y-1"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-slate-900">
                              {item.name}
                            </p>
                            {item.status === "Available" ? (
                              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                Live
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                Soon
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Full-Height Navigation Drawer ── */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-50 overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200">
          <div className="space-y-2">
            <Link
              href="/for-business"
              onClick={() => setMobileDrawerOpen(false)}
              className="block text-base font-bold text-slate-900 py-2 border-b border-slate-100"
            >
              Overview
            </Link>

            {/* Mobile Accordion: Business Types */}
            <div>
              <button
                onClick={() => setMobileSubMenu(mobileSubMenu === "types" ? null : "types")}
                className="w-full flex items-center justify-between text-base font-bold text-slate-900 py-2 border-b border-slate-100"
              >
                <span>Business Types</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileSubMenu === "types" ? "rotate-180 text-brand-green" : "text-slate-400"
                  }`}
                />
              </button>
              {mobileSubMenu === "types" && (
                <div className="py-2 pl-3 space-y-3 bg-slate-50 rounded-xl my-2 p-3">
                  {businessTypeGroups.map((group) => (
                    <div key={group.group} className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {group.group}
                      </p>
                      {group.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileDrawerOpen(false)}
                          className="block text-xs font-semibold text-slate-800 py-1"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Accordion: Features */}
            <div>
              <button
                onClick={() => setMobileSubMenu(mobileSubMenu === "features" ? null : "features")}
                className="w-full flex items-center justify-between text-base font-bold text-slate-900 py-2 border-b border-slate-100"
              >
                <span>Features</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileSubMenu === "features" ? "rotate-180 text-brand-green" : "text-slate-400"
                  }`}
                />
              </button>
              {mobileSubMenu === "features" && (
                <div className="py-2 pl-3 space-y-3 bg-slate-50 rounded-xl my-2 p-3">
                  {featureGroups.map((group) => (
                    <div key={group.group} className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {group.group}
                      </p>
                      {group.items.map((item) => (
                        <div key={item.name} className="flex items-center justify-between py-1">
                          <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                          <span className="text-[9px] text-slate-500">{item.status}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/for-business#faq"
              onClick={() => setMobileDrawerOpen(false)}
              className="block text-base font-bold text-slate-900 py-2 border-b border-slate-100"
            >
              FAQ
            </Link>
          </div>

          <div className="pt-4 space-y-3">
            <Link
              href="/business/claim"
              onClick={() => setMobileDrawerOpen(false)}
              className="w-full h-12 bg-brand-green text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Claim Your Venue</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login/business"
              onClick={() => setMobileDrawerOpen(false)}
              className="w-full h-12 bg-slate-100 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-slate-600" />
              <span>Access The Floor</span>
            </Link>

            <Link
              href="/"
              onClick={() => setMobileDrawerOpen(false)}
              className="w-full h-12 bg-emerald-50 text-brand-green font-bold rounded-xl flex items-center justify-center gap-2 border border-emerald-200"
            >
              <Compass className="w-4 h-4" />
              <span>See OyaPlan as a Customer ↗</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
