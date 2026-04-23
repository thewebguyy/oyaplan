"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

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

        {/* Mobile CTA */}
        <div className="md:hidden">
          {pathname !== "/explore" ? (
            <Link href="/explore">
              <Button className="bg-brand-yellow text-text-primary font-[900] rounded-full type-label h-8 px-4 tap-feedback border-none hover:bg-brand-yellow/90">
                Explore
              </Button>
            </Link>
          ) : (
            <Link href="/">
              <Button className="bg-brand-green text-white font-[900] rounded-full type-label h-8 px-4 tap-feedback border-none hover:bg-brand-green-70">
                Plan Now
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
