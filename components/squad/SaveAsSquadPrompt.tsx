'use client';

import React, { useState } from 'react';
import { Users, Sparkles, Check, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { linkPlanToSquadAction } from '@/lib/actions/linkPlanToSquadAction';
import { trackEvent } from '@/lib/analytics/trackClient';
import { toast } from 'sonner';

interface SaveAsSquadPromptProps {
  sharedPlanId: string;
  squadSize: number;
  existingGroupId?: string | null;
  initialSquadName?: string | null;
}

export default function SaveAsSquadPrompt({
  sharedPlanId,
  squadSize,
  existingGroupId,
  initialSquadName,
}: SaveAsSquadPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [squadName, setSquadName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSquadName, setSavedSquadName] = useState<string | null>(initialSquadName || null);

  // If already linked to a squad, show the squad attribution badge
  if (existingGroupId || savedSquadName) {
    return (
      <div className="p-3.5 bg-brand-green/5 border border-brand-green/20 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <div>
            <span className="font-bold text-text-primary">
              OyaSquad: {savedSquadName || 'Saved Squad'}
            </span>
            <p className="text-[11px] text-text-muted">
              Outing saved to your squad history.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-brand-green/10 text-brand-green font-bold text-[10px] rounded-full uppercase">
          Linked
        </span>
      </div>
    );
  }

  // Only prompt for groups of 2+ people
  if (squadSize < 2) return null;

  const handleAddMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = memberInput.trim();
    if (trimmed && !members.includes(trimmed) && members.length < 20) {
      setMembers([...members, trimmed]);
      setMemberInput('');
    }
  };

  const handleSaveSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadName.trim()) return;

    let finalMembers = [...members];
    if (memberInput.trim() && !finalMembers.includes(memberInput.trim())) {
      finalMembers.push(memberInput.trim());
    }

    setIsSubmitting(true);
    try {
      const res = await linkPlanToSquadAction({
        sharedPlanId,
        squadName: squadName.trim(),
        emoji: '⚡',
        memberNames: finalMembers,
      });

      if (res.success && res.groupId) {
        setSavedSquadName(res.squadName || squadName.trim());
        setIsOpen(false);

        trackEvent('group_created', {
          category: 'Planning',
          group_id: res.groupId,
          member_count: finalMembers.length,
          version: '1.0',
        });

        toast.success(`OyaSquad "${squadName.trim()}" created and linked to this plan!`);
      } else {
        toast.error(res.error === 'unauthorized' ? 'Please sign in to save an OyaSquad.' : 'Could not save OyaSquad.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-border-default rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
      {!isOpen ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-green/10 flex items-center justify-center text-sm shrink-0 mt-0.5">
              ⚡
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary">
                Planning with these {squadSize} people again?
              </h4>
              <p className="text-[11px] text-text-muted mt-0.5">
                Save as an OyaSquad so your next linkup takes just 1 tap.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="bg-brand-green/10 hover:bg-brand-green/20 text-brand-green font-bold text-xs rounded-full h-8 px-3.5 shadow-none border-none tap-feedback self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Save as OyaSquad</span>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSaveSquad} className="space-y-3 pt-1 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-border-default/60">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <span>⚡</span>
              <span>Name your OyaSquad</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-primary p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={squadName}
            onChange={(e) => setSquadName(e.target.value)}
            placeholder="e.g. Friday Linkup, Lekki Boys, Chow Gang"
            maxLength={60}
            required
            autoFocus
            className="w-full px-3 py-2 bg-surface-grey rounded-xl border border-border-default text-xs font-medium focus:outline-none focus:border-brand-green"
          />

          <div className="flex gap-1.5">
            <input
              type="text"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddMember();
                }
              }}
              placeholder="Add friend's name (optional)"
              maxLength={60}
              className="flex-1 px-3 py-1.5 bg-surface-grey rounded-xl border border-border-default text-xs focus:outline-none focus:border-brand-green"
            />
            <button
              type="button"
              onClick={() => handleAddMember()}
              disabled={!memberInput.trim()}
              className="px-3 py-1.5 bg-surface-grey border border-border-default rounded-xl text-xs font-bold text-text-secondary disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {members.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 bg-brand-green/10 text-brand-green text-[11px] font-bold rounded-full inline-flex items-center gap-1"
                >
                  {m}
                  <button
                    type="button"
                    onClick={() => setMembers(members.filter((_, i) => i !== idx))}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-xs text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={!squadName.trim() || isSubmitting}
              size="sm"
              className="bg-brand-green hover:bg-brand-green-70 text-white rounded-full text-xs font-bold px-4 h-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Squad</span>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
