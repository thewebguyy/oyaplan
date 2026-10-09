'use client';

import React, { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OyaSquadSummary } from '@/lib/types';
import OyaSquadCard from './OyaSquadCard';
import { createGroupAction } from '@/lib/actions/groupActions';
import { trackEvent } from '@/lib/analytics/trackClient';
import { toast } from 'sonner';

interface OyaSquadListProps {
  initialSquads: OyaSquadSummary[];
}

const DEFAULT_EMOJIS = ['🔥', '🍖', '🌶️', '🏖️', '🛥️', '💸', '🎭', '🎨', '🥂', '🌴', '⚡'];

const SQUAD_APPETITE_TAGS = [
  { id: 'soft_life', label: '💸 Soft Life (No Ceiling)' },
  { id: 'mid_range', label: '⚖️ Mid-Range Enjoyment' },
  { id: 'sapa_defense', label: '🛡️ Sapa Defense (Trench-Friendly)' },
  { id: 'suya_chops', label: '🍖 Suya & Chops Budget' },
];


export default function OyaSquadList({ initialSquads }: OyaSquadListProps) {
  const [squads, setSquads] = useState<OyaSquadSummary[]>(initialSquads);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('⚡');
  const [appetiteTag, setAppetiteTag] = useState('mid_range');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMember = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = memberInput.trim();
    if (trimmed && !members.includes(trimmed) && members.length < 20) {
      setMembers([...members, trimmed]);
      setMemberInput('');
    }
  };

  const handleRemoveMember = (idx: number) => {
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // If there is un-added text in the member input, add it
    const finalMembers =
      memberInput.trim() && !members.includes(memberInput.trim())
        ? [...members, memberInput.trim()]
        : [...members];

    setIsSubmitting(true);
    try {
      const res = await createGroupAction({
        name: name.trim(),
        emoji,
        memberNames: finalMembers,
      });

      if (!res.success || !res.data) {
        toast.error(res.error === 'group_limit_reached' ? 'Maximum 10 OyaSquads allowed.' : 'Failed to create OyaSquad.');
        setIsSubmitting(false);
        return;
      }

      const newSquad: OyaSquadSummary = {
        id: res.data.id,
        owner_id: res.data.owner_id,
        name: res.data.name,
        emoji: res.data.emoji,
        created_at: res.data.created_at,
        updated_at: res.data.updated_at,
        member_count: finalMembers.length,
        members: finalMembers.map((m, i) => ({ id: `temp-${i}`, display_name: m })),
        plans_count: 0,
        last_outing: null,
      };

      setSquads([newSquad, ...squads]);
      setIsCreating(false);
      setName('');
      setMembers([]);
      setMemberInput('');
      setEmoji('⚡');

      trackEvent('group_created', {
        category: 'Planning',
        group_id: res.data.id,
        member_count: finalMembers.length,
        version: '1.0',
      });

      toast.success('OyaSquad created! Ready to plan.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-border-default/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-text-primary uppercase tracking-wider">
            Active Enjoyment Roster
          </span>
          <span className="text-xs bg-brand-green/10 text-brand-green font-extrabold px-2.5 py-0.5 rounded-full">
            {squads.length}
          </span>
        </div>

        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-brand-green hover:bg-brand-green-70 text-white rounded-full type-label h-10 px-5 shadow-none border-none tap-feedback flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create OyaSquad</span>
          </Button>
        )}
      </div>

      {/* Inline Create Form */}
      {isCreating && (
        <div className="bg-white border-2 border-brand-green/30 rounded-[20px] p-5 sm:p-6 shadow-sm animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-border-default/60">
            <div className="flex items-center gap-2">
              <span className="text-xl">{emoji}</span>
              <h3 className="type-subheading text-text-primary font-bold">Create New OyaSquad</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-grey transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateSquad} className="space-y-4 pt-4">
            {/* Squad Name & Emoji */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Squad Name
              </label>
              <div className="flex gap-2">
                {/* Emoji Selector */}
                <div className="flex gap-1 overflow-x-auto py-1 items-center scrollbar-none">
                  {DEFAULT_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                        emoji === e
                          ? 'bg-brand-green/15 border-2 border-brand-green scale-105'
                          : 'bg-surface-grey hover:bg-surface-grey/80 border border-transparent'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Outside Gang, Island Hoppers, Mainland Survivors, Owambe Crew, Payday Ballers, Suya & Chill"
                maxLength={60}
                required
                className="w-full px-4 py-3 bg-surface-grey rounded-xl border border-border-default text-text-primary placeholder:text-text-muted/60 text-sm font-medium focus:outline-none focus:border-brand-green"
              />
            </div>

            {/* Squad Financial Vibe / Appetite Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Squad Financial Vibe &amp; Appetite
              </label>
              <div className="flex flex-wrap gap-2">
                {SQUAD_APPETITE_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setAppetiteTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                      appetiteTag === tag.id
                        ? 'bg-midnight-lagoon text-white border-midnight-lagoon'
                        : 'bg-surface-grey text-text-secondary border-border-default hover:border-brand-green/40'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Roster */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Who&apos;s in this squad? (Optional)
              </label>
              <p className="text-[11px] text-text-muted">
                Drop their names or aliases (e.g., Tolu, Big Chief, Amaka). No account needed—just add them and calculate the damage.
              </p>

              <div className="flex gap-2">
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
                  placeholder="e.g. Tolu, Big Chief, Amaka"
                  maxLength={60}

                  className="flex-1 px-4 py-2.5 bg-surface-grey rounded-xl border border-border-default text-text-primary placeholder:text-text-muted/60 text-sm focus:outline-none focus:border-brand-green"
                />
                <Button
                  type="button"
                  onClick={() => handleAddMember()}
                  disabled={!memberInput.trim()}
                  variant="outline"
                  className="rounded-xl text-xs font-bold px-4 h-10 border-border-default text-text-secondary hover:text-text-primary"
                >
                  Add
                </Button>
              </div>

              {members.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {members.map((m, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-green/10 text-brand-green rounded-full text-xs font-bold"
                    >
                      <span>{m}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-default/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreating(false)}
                className="rounded-full text-text-muted hover:text-text-primary text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="bg-brand-green hover:bg-brand-green-70 text-white rounded-full font-bold text-xs h-10 px-6 shadow-none border-none tap-feedback flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save OyaSquad</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Squad Cards Grid or Empty State */}
      {squads.length === 0 && !isCreating ? (
        <div className="bg-white border border-border-default rounded-[20px] p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚡
          </div>
          <h3 className="type-heading text-text-primary">No OyaSquads yet</h3>
          <p className="type-body text-text-muted max-w-md mx-auto text-xs sm:text-sm">
            Save the people you go out with in Lagos (e.g. &ldquo;Friday Foodies&rdquo; or &ldquo;Beach Squad&rdquo;) so you can plan future outings with one click.
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-brand-green hover:bg-brand-green-70 text-white rounded-full type-label h-11 px-6 shadow-none border-none tap-feedback inline-flex items-center gap-2 mt-2 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First OyaSquad</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {squads.map((squad) => (
            <OyaSquadCard key={squad.id} squad={squad} />
          ))}
        </div>
      )}
    </div>
  );
}
