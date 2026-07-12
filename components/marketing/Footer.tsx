import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-border-default bg-surface-grey">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-bold text-xl tracking-tight text-text-primary">OyaPlan</span>
            </Link>
            <p className="text-sm text-text-muted">
              Built for reality. Plan outings you can actually afford.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/app" className="text-sm text-text-secondary hover:text-brand-green transition-colors">
                  Download App
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-sm text-text-secondary hover:text-brand-green transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#why-oyaplan" className="text-sm text-text-secondary hover:text-brand-green transition-colors">
                  Why OyaPlan
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/company" className="text-sm text-text-secondary hover:text-brand-green transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/company#careers" className="text-sm text-text-secondary hover:text-brand-green transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-text-secondary hover:text-brand-green transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#faq" className="text-sm text-text-secondary hover:text-brand-green transition-colors">
                  FAQ
                </Link>
              </li>
              <li className="pt-4 mt-4 border-t border-border-default">
                <Link href="/privacy" className="text-sm text-text-secondary hover:text-brand-green transition-colors block mb-3">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-text-secondary hover:text-brand-green transition-colors block">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border-default">
          <p className="text-sm text-text-muted mb-4 md:mb-0">
            © {new Date().getFullYear()} OyaPlan. Built for reality.
          </p>
        </div>
      </div>
    </footer>
  );
}
