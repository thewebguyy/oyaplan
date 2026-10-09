'use client';

import React from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OyaSquadSummary } from '@/lib/types';

interface OyaSquadCardProps {
  squad: OyaSquadSummary;
}

export default function OyaSquadCard({ squad }: OyaSquadCardProps) {
  const memberList = squad.members || [];
  const displayMembers = memberList.slice(0, 4);
  const remainingCount = memberList.length - displayMembers.length;

  return (
    <div className="bg-white border border-border-default rounded-[20px] p-5 sm:p-6 hover:border-brand-green hover:shadow-[0px_8px_24px_rgba(0,135,81,0.08)] transition-all flex flex-col justify-between group relative">
      <div className="space-y-4">
        {/* Header: Emoji & Squad Name */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-2xl shrink-0">
              {squad.emoji || '⚡'}
            </div>
            <div>
              <Link href={`/dashboard/squads/${squad.id}`} className="block">
                <h3 className="type-subheading text-text-primary group-hover:text-brand-green transition-colors line-clamp-1 font-bold">
                  {squad.name}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {squad.member_count === 1
                    ? '1 person'
                    : `${squad.member_count || memberList.length} people`}
                </span>
                {squad.plans_count > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {squad.plans_count} {squad.plans_count === 1 ? 'outing' : 'outings'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <Link
            href={`/dashboard/squads/${squad.id}`}
            className="text-xs text-text-muted hover:text-text-primary px-2.5 py-1 bg-surface-grey rounded-full font-medium transition-colors"
          >
            Manage
          </Link>
        </div>

        {/* Member Tags */}
        {memberList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {displayMembers.map((m) => (
              <span
                key={m.id}
                className="px-2.5 py-1 bg-surface-grey text-text-secondary text-xs rounded-full font-semibold border border-border-default/60"
              >
                {m.display_name}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-2 py-1 bg-surface-grey text-text-muted text-xs rounded-full font-medium">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}

        {/* Social Memory / Last Outing */}
        {squad.last_outing ? (
          <div className="p-3 bg-surface-grey/80 rounded-xl border border-border-default/50 text-xs space-y-1">
            <div className="flex items-center justify-between text-text-muted">
              <span className="font-semibold text-text-secondary flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-green" /> Last Outside Linkup
              </span>
              <span>
                {new Date(squad.last_outing.date).toLocaleDateString('en-GB', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between font-bold text-text-primary">
              <span className="truncate max-w-[180px]">{squad.last_outing.venue_name}</span>
              <span className="text-brand-green">
                ~₦{squad.last_outing.cost_per_person.toLocaleString('en-NG')}/head
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-text-muted italic">No Outside damage calculated yet for this squad.</p>
        )}
      </div>

      {/* Primary Action: PLAN AGAIN */}
      <div className="mt-6 pt-4 border-t border-border-default/70 flex items-center justify-between gap-3">
        <span className="text-xs text-text-muted font-medium">
          Ready for Outside?
        </span>

        <Link
          href={`/?squad=${squad.member_count > 0 ? squad.member_count : 4}&group=${squad.id}`}
        >
          <Button
            size="sm"
            className="bg-brand-green hover:bg-brand-green-70 text-white rounded-full type-label h-9 px-4 shadow-none border-none tap-feedback flex items-center gap-1.5 font-bold"
          >
            <span>Calculate Damage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
