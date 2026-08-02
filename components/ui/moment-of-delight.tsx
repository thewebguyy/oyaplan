'use client';

import { useEffect, useState } from 'react';

export function MomentOfDelight({
  triggerKey,
  message,
}: {
  triggerKey: string;
  message: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Listen for custom event
    const handleTrigger = (e: CustomEvent) => {
      if (e.detail?.key === triggerKey) {
        const hasTriggered = localStorage.getItem(`delight_${triggerKey}`);
        if (!hasTriggered) {
          localStorage.setItem(`delight_${triggerKey}`, 'true');
          setShow(true);
          setTimeout(() => setShow(false), 2500); // Give it time to animate out
        }
      }
    };

    window.addEventListener('trigger_delight', handleTrigger as EventListener);
    return () => window.removeEventListener('trigger_delight', handleTrigger as EventListener);
  }, [triggerKey]);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-[100px] flex items-center justify-center z-[500] pointer-events-none">
      <div 
        className="bg-brand-green text-white px-6 py-3 rounded-full shadow-lg font-medium text-sm flex items-center gap-2"
        style={{
          animation: 'delight-pop 2.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}
      >
        <span>✨</span> {message}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes delight-pop {
          0% { transform: scale(0.8) translateY(20px); opacity: 0; }
          15% { transform: scale(1.05) translateY(0); opacity: 1; }
          25% { transform: scale(1) translateY(0); opacity: 1; }
          85% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(0.9) translateY(-10px); opacity: 0; }
        }
      `}} />
    </div>
  );
}

// Utility to trigger it
export function triggerMoment(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('trigger_delight', { detail: { key } }));
  }
}
