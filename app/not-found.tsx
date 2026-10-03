import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] flex flex-col items-center justify-center p-6 text-center antialiased">
      <div className="space-y-8 max-w-md">
        <span className="text-2xl font-[900] tracking-tighter text-[#111111]">
          Oya<span className="bg-[#F9E828] px-1 rounded-sm">Plan</span>
        </span>
        
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-midnight-lagoon uppercase tracking-tight">
            Page Not Found
          </h1>
          <p className="type-body text-xs sm:text-sm text-text-secondary leading-relaxed">
            The page, venue, or plan you are looking for doesn&apos;t exist or has moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button 
              className="w-full sm:w-auto bg-[#111111] hover:bg-[#2a2a2a] text-white h-[50px] px-8 rounded-xl font-bold text-xs uppercase tracking-wider tap-feedback shadow-none border-none cursor-pointer"
            >
              Back to Home
            </Button>
          </Link>
          <Link href="/explore">
            <Button 
              variant="outline"
              className="w-full sm:w-auto border-[#111111]/20 hover:bg-white text-[#111111] h-[50px] px-8 rounded-xl font-bold text-xs uppercase tracking-wider tap-feedback cursor-pointer"
            >
              Find a Spot
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
