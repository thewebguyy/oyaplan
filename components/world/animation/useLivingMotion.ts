import { useState, useEffect } from "react";

export function useLivingMotion() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Only track mouse movement on desktop to preserve performance on mobile devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates around the screen center (-0.5 to 0.5)
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;

      // Apply low-pass filtering / damping
      setParallax({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return parallax;
}
