"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

export default function NavBar() {
  const pathname = usePathname();

  // Hide on feedback and list-your-spot pages (if standalone)
  if (pathname === "/feedback" || pathname === "/list-your-spot") return null;

  const links = [
    { name: "Plan", href: "/" },
    { name: "Explore", href: "/explore" },
    { name: "List Your Spot", href: "/list-your-spot", desktopOnly: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-[56px] bg-white border-b border-border-default z-50 flex items-center justify-between px-6">
      {/* Left: Wordmark */}
      <Link href="/" className="flex items-center">
        <span className="text-[20px] font-[800] tracking-tight">
          <span className="text-text-primary">Oya</span>
          <span className="text-brand-green">Plan</span>
        </span>
      </Link>

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
                  className={`type-label h-[56px] flex items-center border-b-4 transition-all duration-150 ${
                    isActive 
                      ? "text-brand-green border-brand-green" 
                      : "text-text-secondary border-transparent hover:text-brand-green"
                  }`}
                >
                  {link.name}
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
          <Link href="/">
            <Button className="bg-brand-green hover:bg-brand-green-70 text-white rounded-full type-label h-8 px-4 tap-feedback">
              Plan Now
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
