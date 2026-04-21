import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center antialiased">
      <div className="space-y-8 max-w-md">
        <span className="text-2xl font-[900] tracking-tighter">
          <span className="text-brand-green">Oya</span>
          <span className="text-brand-yellow">Plan</span>
        </span>
        
        <div className="space-y-3">
          <h1 className="type-heading text-text-primary">This plan doesn't exist.</h1>
          <p className="type-body text-text-secondary">
            Maybe it was deleted, or the link was wrong. Come plan a new one.
          </p>
        </div>

        <Link href="/">
          <Button 
            className="bg-brand-green hover:bg-brand-green-70 text-white h-[56px] px-10 rounded-[12px] type-subheading tap-feedback shadow-none border-none"
          >
            Plan a new outing →
          </Button>
        </Link>
      </div>
    </main>
  );
}
