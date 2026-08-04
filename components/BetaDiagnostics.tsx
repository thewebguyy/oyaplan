"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

interface DiagnosticData {
  env: string;
  authStatus: string;
  userId: string;
  savedPlansCount: number;
  url: string;
}

export default function BetaDiagnostics() {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    const isDev = process.env.NODE_ENV !== "production";
    const hasDebugParam =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("debug") === "1";
    return isDev || hasDebugParam;
  });

  const { session } = useAuth();
  const user = session?.user;
  const isAuthenticated = Boolean(user);

  const data = useMemo<DiagnosticData>(() => {
    let savedPlansCount = 0;
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("oyaplan_saved_ideas") ?? "[]");
        savedPlansCount = Array.isArray(saved) ? saved.length : 0;
      } catch {
        savedPlansCount = 0;
      }
    }

    return {
      env: process.env.NODE_ENV ?? "",
      authStatus: isAuthenticated ? "Authenticated ✅" : "Anonymous 👤",
      userId: user?.id ?? "None",
      savedPlansCount,
      url: typeof window !== "undefined" ? window.location.pathname : "",
    };
  }, [isAuthenticated, user]);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Beta Diagnostics"
      className="fixed bottom-3 right-3 z-50 bg-black/90 text-green-400 font-mono text-[10px] p-3 rounded-lg border border-green-500/30 max-w-xs shadow-2xl pointer-events-auto"
    >
      <div className="flex items-center justify-between border-b border-green-500/20 pb-1 mb-2 font-bold text-white">
        <span>OyaPlan Diagnostics</span>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white px-1">
          ✕
        </button>
      </div>
      <div className="space-y-0.5 font-mono leading-tight">
        <div>
          <span className="text-gray-400">Auth:</span> {data.authStatus}
        </div>
        <div className="truncate">
          <span className="text-gray-400">User ID:</span> {data.userId}
        </div>
        <div>
          <span className="text-gray-400">Saved Plans:</span> {data.savedPlansCount}
        </div>
        <div>
          <span className="text-gray-400">Path:</span> {data.url}
        </div>
      </div>
    </aside>
  );
}
