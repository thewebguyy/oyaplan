import React from 'react';

/**
 * EditorialBlock enforces the typography spacing rule:
 * Fraunces headers (type-display-*, type-heading) need room to breathe.
 * This wrapper ensures a minimum 24px (space-y-6) gap between editorial elements.
 */
export function EditorialBlock({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  );
}
