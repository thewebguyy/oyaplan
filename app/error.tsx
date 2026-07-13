"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center antialiased">
      <div className="space-y-8 max-w-md">
        <span className="text-2xl font-[900] tracking-tighter">
          <span className="text-brand-green">Oya</span>
          <span className="text-intent-yellow">Plan</span>
        </span>
        
        <div className="space-y-3">
          <h1 className="type-heading text-text-primary">Something went wrong on our end.</h1>
          <p className="type-body text-text-secondary">
            Lagos traffic hit different today. Try again in a moment.
          </p>
        </div>

        <Button 
          onClick={() => reset()}
          className="bg-brand-green hover:bg-brand-green-70 text-white h-[56px] px-10 rounded-[12px] type-subheading tap-feedback shadow-none border-none"
        >
          Try Again
        </Button>
      </div>
    </main>
  );
}
