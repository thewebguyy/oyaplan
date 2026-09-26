"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  ChevronLeft, 
  Menu, 
  X, 
  User, 
  Bookmark, 
  Building2, 
  LogOut, 
  Settings, 
  Activity, 
  Compass, 
  Heart,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileText,
  Shield,
  Layers
} from "lucide-react";
import { useAuth } from "./providers/AuthProvider";
import { Avatar } from "./ui/avatar";
import ClientOnly from "./ClientOnly";
import { BusinessMarketingHeader } from "./business/BusinessMarketingHeader";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, user, avatarUrl, displayName, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Handle escape key to close menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Hide on standalone flow pages
  if (pathname === "/feedback" || pathname === "/list-your-spot" || pathname === "/suggest-a-spot") {
    return null;
  }

  // Dedicated auth routes don't show the standard navbar
  if (pathname === "/login" || pathname === "/login/planner" || pathname === "/login/business" || pathname === "/account/finish-signup") {
    return null;
  }

  // Venue management workspace has its own internal BusinessShell layout and header
  const isBusinessWorkspace = pathname?.startsWith("/business/") && !pathname?.startsWith("/business/claim");
  if (isBusinessWorkspace) return null;

  // Business public & claim routes get the dedicated BusinessMarketingHeader
  const isPublicBusiness = pathname === "/for-business" || pathname === "/business" || pathname?.startsWith("/business/claim") || pathname?.startsWith("/partner");
  if (isPublicBusiness) {
    return <BusinessMarketingHeader />;
  }

  // Dynamic link builder to preserve search parameters between Plan and Explore
  const getPreservedHref = (href: string) => {
    if (href !== "/" && href !== "/explore") return href;
    const params = new URLSearchParams();
    const budget = searchParams.get("budget");
    const squad = searchParams.get("squad") || searchParams.get("squadSize");
    const vibe = searchParams.get("vibe");
    const area = searchParams.get("area") || searchParams.get("startArea");
    const pinned = searchParams.get("pinned") || searchParams.get("pinnedSpotId");

    if (budget) params.set("budget", budget);
    if (squad) params.set("squad", squad);
    if (vibe) params.set("vibe", vibe);
    if (area) params.set("area", area);
    if (pinned) params.set("pinned", pinned);

    const qs = params.toString();
    return qs ? `${href}?${qs}` : href;
  };

  const navLinks = [
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Saved Spots", href: "/saved", icon: Heart },
  ];

  const effectiveDisplayName = displayName || user?.email?.split("@")[0] || "Planner";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-[56px] bg-white/95 backdrop-blur-md border-b border-border-default z-50 transition-colors">
        <nav className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          
          {/* Left: Back button (Mobile only if deep route) + Logo */}
          <div className="flex items-center gap-1 sm:gap-4">
            {pathname !== "/" && pathname !== "/explore" && (
              <button 
                onClick={() => router.back()} 
                className="md:hidden p-2 -ml-2 text-text-primary hover:text-brand-green transition-colors tap-feedback min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <Link href="/" className="flex items-center shrink-0 tap-feedback focus-visible:outline-2 focus-visible:outline-[#008751] rounded-lg">
              <Image
                src="/logo.png"
                alt="OyaPlan"
                width={610}
                height={143}
                className="h-7 w-auto object-contain shrink-0"
                style={{ width: "auto", height: "26px" }}
                priority
              />
            </Link>

            {/* Desktop Left-Center Navigation Links */}
            <div className="hidden md:flex items-center gap-1 ml-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={getPreservedHref(link.href)}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "text-[#008751] bg-[#008751]/10"
                        : "text-text-secondary hover:text-midnight-lagoon hover:bg-surface-grey"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Navigation (Desktop & Mobile trigger) */}
          <div className="flex items-center gap-3">
            
            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/for-business"
                className="text-xs font-bold text-text-secondary hover:text-[#008751] transition-colors px-3 py-1.5 rounded-full hover:bg-surface-grey"
              >
                For Businesses ↗
              </Link>

              <ClientOnly fallback={<div className="w-9 h-9 rounded-full bg-surface-grey animate-pulse" />}>
                {session ? (
                  /* Authenticated Avatar Menu */
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setProfileDropdownOpen((prev) => !prev)}
                      aria-label="Open user menu"
                      aria-haspopup="menu"
                      aria-expanded={profileDropdownOpen}
                      className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#008751]/20 transition-all tap-feedback focus-visible:outline-2 focus-visible:outline-[#008751] min-h-[44px] min-w-[44px] justify-center"
                    >
                      <Avatar 
                        name={effectiveDisplayName} 
                        src={avatarUrl} 
                        size="sm" 
                        className="w-8 h-8 cursor-pointer"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {profileDropdownOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#EAE4DC] rounded-[20px] shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      >
                        {/* User Header */}
                        <div className="px-4 py-2.5 border-b border-border-default/60">
                          <p className="text-xs font-black text-midnight-lagoon truncate">
                            {effectiveDisplayName}
                          </p>
                          <p className="text-[11px] text-text-muted truncate">
                            {user?.email}
                          </p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/account"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#FAF7F2] hover:text-[#008751] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <User className="w-4 h-4 text-text-muted" />
                              <span>Profile</span>
                            </div>
                          </Link>

                          <Link
                            href="/saved"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#FAF7F2] hover:text-[#008751] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Heart className="w-4 h-4 text-text-muted" />
                              <span>Saved Spots</span>
                            </div>
                          </Link>

                          <Link
                            href="/saved?tab=plans"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#FAF7F2] hover:text-[#008751] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Bookmark className="w-4 h-4 text-text-muted" />
                              <span>Saved Plans</span>
                            </div>
                          </Link>

                          <Link
                            href="/settings"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-primary hover:bg-[#FAF7F2] hover:text-[#008751] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Settings className="w-4 h-4 text-text-muted" />
                              <span>Settings</span>
                            </div>
                          </Link>
                        </div>

                        <div className="h-[1px] bg-border-default/60 my-1" />

                        <div className="py-1">
                          <Link
                            href="/for-business"
                            role="menuitem"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-midnight-lagoon hover:bg-[#FAF7F2] flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Building2 className="w-4 h-4 text-midnight-lagoon" />
                              <span>For Businesses</span>
                            </div>
                            <span className="text-[9px] font-bold text-[#008751] bg-[#EAFDF3] px-1.5 py-0.5 rounded">
                              Venues
                            </span>
                          </Link>
                        </div>

                        <div className="h-[1px] bg-border-default/60 my-1" />

                        <div className="py-1">
                          <button
                            role="menuitem"
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              signOut();
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-red-500" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Anonymous Sign In Button */
                  <Link
                    href={`/login${pathname !== "/" ? `?returnTo=${encodeURIComponent(pathname)}` : ""}`}
                    className="h-9 px-4 rounded-full bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold flex items-center justify-center transition-all shadow-xs tap-feedback"
                  >
                    Log In
                  </Link>
                )}
              </ClientOnly>
            </div>

            {/* Mobile Menu Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="md:hidden p-2 rounded-xl text-midnight-lagoon hover:bg-surface-grey transition-colors tap-feedback focus-visible:outline-2 focus-visible:outline-[#008751] min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Redesigned OyaPlan Mobile Utility Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Full-Height Drawer Surface */}
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            className="fixed inset-y-0 right-0 w-full max-w-[360px] bg-[#FAF9F6] shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-right duration-250 ease-out overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#FAF9F6]/95 backdrop-blur-md px-5 py-4 border-b border-[#EAE4DC] flex items-center justify-between z-10">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center tap-feedback"
              >
                <Image
                  src="/logo.png"
                  alt="OyaPlan"
                  width={610}
                  height={143}
                  className="h-6 w-auto object-contain"
                  priority
                />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#6B7280] hover:text-[#1A1A1A] rounded-xl hover:bg-surface-grey transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-5 space-y-6 flex-1">
              
              {/* Authenticated User Status or Sign-in Prompt */}
              {session ? (
                <div className="p-4 bg-white rounded-2xl border border-[#EAE4DC] shadow-2xs flex items-center gap-3">
                  <Avatar name={effectiveDisplayName} src={avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-midnight-lagoon truncate">
                      {effectiveDisplayName}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {user?.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-[#EAFDF3] rounded-2xl border border-[#A3F3C6] space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-wider text-[#00603A]">
                      Budget Confidence
                    </p>
                    <p className="text-xs text-[#00603A]/90 font-medium">
                      Plan outings, save spots, and share accurate costs with your squad.
                    </p>
                  </div>
                  <Link
                    href={`/login${pathname !== "/" ? `?returnTo=${encodeURIComponent(pathname)}` : ""}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full h-11 rounded-xl bg-[#008751] hover:bg-[#007043] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs tap-feedback"
                  >
                    <span>Log In / Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* SECTION 1 — YOUR OYAPLAN (For authenticated users) */}
              {session && (
                <div className="space-y-2">
                  <div className="px-2 text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                    Your OyaPlan
                  </div>
                  <div className="bg-white rounded-2xl border border-[#EAE4DC] p-1.5 space-y-0.5">
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
                    >
                      <User className="w-4 h-4 text-[#008751]" />
                      <span>Account Profile</span>
                    </Link>

                    <Link
                      href="/saved"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
                    >
                      <Heart className="w-4 h-4 text-[#008751]" />
                      <span>Saved Spots</span>
                    </Link>

                    <Link
                      href="/saved?tab=plans"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
                    >
                      <Bookmark className="w-4 h-4 text-[#008751]" />
                      <span>Saved Plans</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
                    >
                      <Settings className="w-4 h-4 text-[#6B7280]" />
                      <span>Settings</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* SECTION 2 — EXPLORE OYAPLAN */}
              <div className="space-y-2">
                <div className="px-2 text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                  Explore &amp; Plan
                </div>
                <div className="bg-white rounded-2xl border border-[#EAE4DC] p-1.5 space-y-0.5">
                  <Link
                    href="/explore"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      <Compass className="w-4 h-4 text-[#008751]" />
                      <span>Explore Places</span>
                    </div>
                    <span className="text-[10px] text-text-muted font-semibold">Lagos</span>
                  </Link>

                  <Link
                    href="/forge"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-[#FCC630]" />
                      <span>Plan an Outing</span>
                    </div>
                    <span className="text-[10px] text-[#008751] font-bold">Fast</span>
                  </Link>

                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-midnight-lagoon hover:bg-[#FAF7F2] transition-colors min-h-[44px]"
                  >
                    <Layers className="w-4 h-4 text-[#008751]" />
                    <span>Why OyaPlan Exists</span>
                  </Link>
                </div>
              </div>

              {/* SECTION 3 — FOR BUSINESS */}
              <div className="bg-white rounded-2xl border border-[#008751]/20 p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#008751]" />
                    <span className="text-xs font-black text-midnight-lagoon">OyaPlan for Business</span>
                  </div>
                  <span className="text-[9px] font-extrabold text-[#008751] bg-[#008751]/10 px-2 py-0.5 rounded">
                    Operators
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Help people confidently choose your business with verified menu pricing and direct squad discovery.
                </p>
                <Link
                  href="/for-business"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-10 rounded-xl bg-midnight-lagoon hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors tap-feedback"
                >
                  <span>For Business</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* SECTION 4 — COMPANY & HELP */}
              <div className="space-y-2">
                <div className="px-2 text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                  Company &amp; Support
                </div>
                <div className="bg-white rounded-2xl border border-[#EAE4DC] p-1.5 space-y-0.5">
                  <Link
                    href="/feedback"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4B5563] hover:bg-[#FAF7F2] transition-colors min-h-[40px]"
                  >
                    <HelpCircle className="w-4 h-4 text-[#6B7280]" />
                    <span>Feedback &amp; Help</span>
                  </Link>

                  <Link
                    href="/privacy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4B5563] hover:bg-[#FAF7F2] transition-colors min-h-[40px]"
                  >
                    <Shield className="w-4 h-4 text-[#6B7280]" />
                    <span>Privacy Policy</span>
                  </Link>

                  <Link
                    href="/terms"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4B5563] hover:bg-[#FAF7F2] transition-colors min-h-[40px]"
                  >
                    <FileText className="w-4 h-4 text-[#6B7280]" />
                    <span>Terms of Service</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* Bottom Actions & Footer */}
            <div className="p-5 border-t border-[#EAE4DC] bg-white space-y-3 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
              {session && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full h-11 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 flex items-center justify-center gap-2 transition-colors tap-feedback min-h-[44px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              )}

              <div className="flex items-center justify-between text-[11px] text-text-muted px-1">
                <span>Lagos, Nigeria</span>
                <span>•</span>
                <span>© {new Date().getFullYear()} OyaPlan</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
