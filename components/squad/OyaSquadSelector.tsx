'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Check, X, Loader2 } from 'lucide-react';
import { OyaSquadSummary } from '@/lib/types';
import { createGroupAction } from '@/lib/actions/groupActions';
import { trackEvent } from '@/lib/analytics/trackClient';

interface OyaSquadSelectorProps {
  selectedGroupId: string | null;
  onSelectSquad: (groupId: string | null, memberCount: number) => void;
  initialSquads?: OyaSquadSummary[];
}

export default function OyaSquadSelector({
  selectedGroupId,
  onSelectSquad,
  initialSquads = [],
}: OyaSquadSelectorProps) {
  const [squads, setSquads] = useState<OyaSquadSummary[]>(initialSquads);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If initial squads not passed, fetch them client-side if user is logged in
  useEffect(() => {
    if (initialSquads.length > 0) {
      setSquads(initialSquads);
    }
  }, [initialSquads]);

  const handleAddMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = memberInput.trim();
    if (trimmed && !members.includes(trimmed) && members.length < 20) {
      setMembers([...members, trimmed]);
      setMemberInput('');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalMembers = [...members];
    if (memberInput.trim() && !finalMembers.includes(memberInput.trim())) {
      finalMembers.push(memberInput.trim());
    }

    setIsSubmitting(true);
    try {
      const res = await createGroupAction({
        name: name.trim(),
        emoji: '⚡',
        memberNames: finalMembers,
      });

      if (res.success && res.data) {
        const count = finalMembers.length || 2;
        const newSquad: OyaSquadSummary = {
          id: res.data.id,
          owner_id: res.data.owner_id,
          name: res.data.name,
          emoji: res.data.emoji,
          created_at: res.data.created_at,
          updated_at: res.data.updated_at,
          member_count: count,
          members: finalMembers.map((m, i) => ({ id: `temp-${i}`, display_name: m })),
          plans_count: 0,
          last_outing: null,
        };

        setSquads([...squads, newSquad]);
        onSelectSquad(newSquad.id, count);
        setShowCreate(false);
        setName('');
        setMembers([]);
        setMemberInput('');

        trackEvent('group_created', {
          category: 'Planning',
          group_id: res.data.id,
          member_count: count,
          version: '1.0',
        });
      }
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  if (squads.length === 0 && !showCreate) {
    return (
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="text-xs text-brand-green font-bold hover:underline flex items-center gap-1 cursor-pointer tap-feedback"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save this squad as an OyaSquad for next time</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-brand-green" />
          <span>Planning with an OyaSquad?</span>
        </span>
        {!showCreate && squads.length < 10 && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="text-[11px] text-brand-green font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>New Squad</span>
          </button>
        )}
      </div>

      {/* Squad Chips */}
      <div className="flex flex-wrap gap-2">
        {squads.map((squad) => {
          const isSelected = selectedGroupId === squad.id;
          const count = squad.member_count > 0 ? squad.member_count : (squad.members?.length || 2);
          return (
            <button
              key={squad.id}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onSelectSquad(null, count);
                } else {
                  onSelectSquad(squad.id, count);
                  trackEvent('group_selected', {
                    category: 'Planning',
                    group_id: squad.id,
                    member_count: count,
                    version: '1.0',
                  });
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer tap-feedback border ${
                isSelected
                  ? 'bg-midnight-lagoon text-white border-midnight-lagoon shadow-xs'
                  : 'bg-surface-grey hover:bg-surface-grey/80 text-text-primary border-border-default'
              }`}
            >
              <span>{squad.emoji || '⚡'}</span>
              <span className="truncate max-w-[140px]">{squad.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-brand-green/10 text-brand-green'
                }`}
              >
                {count}
              </span>
              {isSelected && <Check className="w-3 h-3 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Inline Quick-Create Drawer/Form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="p-3.5 bg-surface-grey rounded-2xl border border-brand-green/30 space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">Quick-create OyaSquad</span>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-text-muted hover:text-text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Squad Name (e.g. Friday Linkup)"
            maxLength={60}
            required
            className="w-full px-3 py-2 bg-white rounded-xl border border-border-default text-xs font-medium focus:outline-none focus:border-brand-green"
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
              placeholder="Add name (e.g. Tolu)"
              maxLength={60}
              className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-border-default text-xs focus:outline-none focus:border-brand-green"
            />
            <button
              type="button"
              onClick={() => handleAddMember()}
              disabled={!memberInput.trim()}
              className="px-3 py-1.5 bg-white border border-border-default rounded-xl text-xs font-bold text-text-secondary disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {members.map((m, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-brand-green/10 text-brand-green text-[11px] font-bold rounded-full inline-flex items-center gap-1"
                >
                  {m}
                  <button
                    type="button"
                    onClick={() => setMembers(members.filter((_, idx) => idx !== i))}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-3 py-1.5 text-xs text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-1.5 bg-brand-green text-white text-xs font-bold rounded-full disabled:opacity-50 flex items-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save & Use</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
