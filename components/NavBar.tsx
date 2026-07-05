"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronLeft, User, LogOut, Loader2, Bookmark } from "lucide-react";
import { useAuth } from "./providers/AuthProvider";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading, openModal, signOut } = useAuth();

  // Hide on feedback and list-your-spot pages (if standalone)
  if (pathname === "/feedback" || pathname === "/list-your-spot" || pathname === "/suggest-a-spot") return null;

  const links = [
    { name: "Plan", href: "/" },
    { name: "Explore", href: "/explore" },
    { name: "List Your Spot", href: "/list-your-spot", desktopOnly: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-[56px] bg-white border-b border-border-default z-50 flex items-center justify-between px-4 md:px-6">
      {/* Left: Back (Mobile) + Wordmark */}
      <div className="flex items-center gap-1 md:gap-0">
        {pathname !== "/" && (
          <button 
            onClick={() => router.back()} 
            className="md:hidden p-2 -ml-2 text-text-primary hover:text-brand-green transition-colors tap-feedback"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <Link href="/" className="flex items-center tap-feedback">
          <span className="text-[20px] font-[800] tracking-tight">
            <span className="text-text-primary">Oya</span>
            <span className="text-brand-green">Plan</span>
          </span>
        </Link>
      </div>

      {/* Center: Tagline (Desktop) */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
        <span className="type-label text-text-muted opacity-80">Lagos Squad Planner</span>
      </div>

      {/* Right: Links (Desktop) / CTA (Mobile) */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:flex items-center gap-6">
          {links.map((link, idx) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <div key={link.href} className="flex items-center">
                <Link
                  href={link.href}
                  className={`type-label relative h-[56px] flex items-center transition-all duration-150 ${
                    isActive 
                      ? "text-brand-green" 
                      : "text-text-secondary hover:text-brand-green"
                  }`}
                >
                  {link.name}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-brand-green transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`} style={{ transitionTimingFunction: 'var(--motion-considered)' }} />
                </Link>
                {idx === 1 && !link.desktopOnly && (
                  <div className="ml-6 h-4 w-[1px] bg-border-default" />
                )}
              </div>
            );
          })}
        </div>

          {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-surface-grey animate-pulse"></div>
          ) : session ? (
            <div className="relative group">
              <button 
                type="button"
                aria-label="User profile dropdown"
                className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center tap-feedback"
              >
                <User className="w-5 h-5" />
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border-default rounded-[12px] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 py-2">
                <Link href="/dashboard" className="w-full text-left px-4 py-2 type-body text-text-primary hover:bg-surface-grey flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-text-muted" />
                  Saved Plans
                </Link>
                <div className="h-[1px] bg-border-default my-2"></div>
                <button 
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 type-body text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => openModal()}
              variant="outline" 
              className="h-10 rounded-full type-label px-5 border-border-default hover:bg-surface-grey"
            >
              Sign In
            </Button>
          )}

        {/* Mobile CTA */}
        <div className="md:hidden ml-4">
          {pathname !== "/explore" ? (
            <Link href="/explore">
              <Button className="bg-brand-yellow text-text-primary font-[900] rounded-full type-label h-10 px-5 tap-feedback border-none hover:bg-brand-yellow/90">
                Explore
              </Button>
            </Link>
          ) : (
            <Link href="/">
              <Button className="bg-brand-green text-white font-[900] rounded-full type-label h-10 px-5 tap-feedback border-none hover:bg-brand-green-70">
                Plan Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
