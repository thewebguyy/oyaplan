"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";

const KNOWN_ERRORS: Record<string, string> = {
  spots_unavailable:
    "We had trouble loading spots. Please try again — it usually resolves in seconds.",
  rate_limited:
    "You're planning fast! Please wait a moment and try again.",
  unauthorized_dashboard:
    "Sign in to see your Saved Plans.",
  no_match:
    "We couldn't find a plan fitting those exact preferences. Try broadening your budget or area.",
};

export default function ErrorBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const errorCode = searchParams.get("error") ?? "";
  const message = KNOWN_ERRORS[errorCode];

  if (!message) return null;

  const dismiss = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    router.replace(`/${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  return (
    <div className="bg-red-50 border-b border-red-100 px-4 py-3 flex items-center justify-between animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <span className="type-caption">⚠️</span>
        <p className="type-caption text-red-800 font-[600]">
          {message}
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="p-1 hover:bg-red-100 rounded-md transition-colors"
      >
        <X className="w-4 h-4 text-red-800" />
      </button>
    </div>
  );
}
