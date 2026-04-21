"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function ErrorBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "spots_unavailable") {
      setShow(true);
    }
  }, [searchParams]);

  const dismiss = () => {
    setShow(false);
    // Remove error param from URL without reload
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    router.replace(`/${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  };

  if (!show) return null;

  return (
    <div className="bg-[#FEF2F2] border-b border-red-100 px-4 py-3 flex items-center justify-between animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <span className="text-[14px]">⚠️</span>
        <p className="type-caption text-[#991B1B] font-[600]">
          We had trouble loading spots. Please try again — it usually resolves in seconds.
        </p>
      </div>
      <button 
        onClick={dismiss}
        className="p-1 hover:bg-red-100 rounded-md transition-colors"
      >
        <X className="w-4 h-4 text-[#991B1B]" />
      </button>
    </div>
  );
}
