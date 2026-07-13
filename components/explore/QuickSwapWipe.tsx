"use client";

import { ReactNode, useEffect, useState } from "react";

export default function QuickSwapWipe({
  pathname,
  children
}: {
  pathname: string;
  children: ReactNode;
}) {
  const [key, setKey] = useState(pathname);

  useEffect(() => {
    setKey(pathname);
  }, [pathname]);

  return (
    <div 
      key={key} 
      className="w-full h-full animate-wipe-down"
      style={{
        // Define keyframes in globals.css, or inline them
        animation: "wipe-down 0.15s cubic-bezier(0, 0, 0.2, 1) forwards"
      }}
    >
      {children}
    </div>
  );
}
