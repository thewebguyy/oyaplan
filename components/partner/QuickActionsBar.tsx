import React from 'react';
import Link from 'next/link';
import { Tag, Clock, Camera, CalendarX } from 'lucide-react';

interface QuickActionsBarProps {
  venueId: string;
}

export function QuickActionsBar({ venueId }: QuickActionsBarProps) {
  const actions = [
    {
      label: 'Update prices',
      href: `/partner/${venueId}/pricing`,
      icon: <Tag className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 hover:bg-emerald-100/80',
    },
    {
      label: 'Update hours',
      href: `/partner/${venueId}/onboarding?step=1`,
      icon: <Clock className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 hover:bg-indigo-100/80',
    },
    {
      label: 'Add photos',
      href: `/partner/${venueId}/onboarding?step=4`,
      icon: <Camera className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 hover:bg-amber-100/80',
    },
    {
      label: 'Report closure',
      href: `/partner/${venueId}/closure`,
      icon: <CalendarX className="w-5 h-5 text-rose-600" />,
      bg: 'bg-rose-50 hover:bg-rose-100/80',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((act) => (
        <Link
          key={act.label}
          href={act.href}
          className={`${act.bg} border border-border-default/60 rounded-2xl p-4 flex flex-col items-center text-center gap-2 transition-all tap-feedback shadow-xs cursor-pointer`}
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs">
            {act.icon}
          </div>
          <span className="text-xs font-black text-midnight-lagoon uppercase tracking-tight">
            {act.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
