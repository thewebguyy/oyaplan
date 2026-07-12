"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-default bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight text-text-primary">OyaPlan</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="#product" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Product
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#why-oyaplan" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Why OyaPlan
            </Link>
            <Link href="/company" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Company
            </Link>
            <Link href="#faq" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              FAQ
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/app" className="bg-brand-green text-text-on-green hover:bg-brand-green/90 font-semibold h-10 px-6 rounded-lg shadow-sm inline-flex items-center justify-center text-sm whitespace-nowrap transition-all">Download App</Link>
        </div>
      </div>
    </header>
  );
}
