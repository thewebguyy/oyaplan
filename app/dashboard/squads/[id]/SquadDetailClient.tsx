'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, ArrowLeft, ArrowRight, Plus, Trash2, Calendar, MapPin, Sparkles, Loader2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanningGroup, PlanningGroupMember } from '@/lib/types';
import { addMemberAction, removeMemberAction, updateGroupAction, deleteGroupAction } from '@/lib/actions/groupActions';
import { toast } from 'sonner';

interface SquadDetailClientProps {
  group: PlanningGroup;
  initialMembers: PlanningGroupMember[];
  plans: any[];
}

const DEFAULT_EMOJIS = ['⚡', '🍲', '🌴', '🍸', '🍕', '🎉', '🥂', '🚀'];

export default function SquadDetailClient({
  group,
  initialMembers,
  plans,
}: SquadDetailClientProps) {
  const router = useRouter();
  const [currentGroup, setCurrentGroup] = useState<PlanningGroup>(group);
  const [members, setMembers] = useState<PlanningGroupMember[]>(initialMembers);
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [editEmoji, setEditEmoji] = useState(group.emoji || '⚡');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMemberName.trim();
    if (!trimmed || members.length >= 20) return;

    setIsAddingMember(true);
    try {
      const res = await addMemberAction({
        groupId: currentGroup.id,
        displayName: trimmed,
      });

      if (res.success && res.data) {
        setMembers([...members, res.data]);
        setNewMemberName('');
        toast.success(`Added ${trimmed} to OyaSquad.`);
      } else {
        toast.error(res.error === 'member_limit_reached' ? 'Maximum 20 members allowed.' : 'Failed to add member.');
      }
    } catch {
      toast.error('Failed to add member.');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    try {
      const res = await removeMemberAction({
        groupId: currentGroup.id,
        memberId,
      });

      if (res.success) {
        setMembers(members.filter((m) => m.id !== memberId));
        toast.success(`Removed ${name}.`);
      } else {
        toast.error('Failed to remove member.');
      }
    } catch {
      toast.error('Failed to remove member.');
    }
  };

  const handleSaveGroupEdit = async () => {
    if (!editName.trim()) return;

    try {
      const res = await updateGroupAction({
        groupId: currentGroup.id,
        name: editName.trim(),
        emoji: editEmoji,
      });

      if (res.success) {
        setCurrentGroup({ ...currentGroup, name: editName.trim(), emoji: editEmoji });
        setIsEditingGroup(false);
        toast.success('OyaSquad updated.');
      } else {
        toast.error('Failed to update OyaSquad.');
      }
    } catch {
      toast.error('Failed to update OyaSquad.');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm(`Are you sure you want to delete ${currentGroup.name}?`)) return;

    setIsDeleting(true);
    try {
      const res = await deleteGroupAction(currentGroup.id);
      if (res.success) {
        toast.success('OyaSquad deleted.');
        router.push('/dashboard');
      } else {
        toast.error('Failed to delete OyaSquad.');
      }
    } catch {
      toast.error('Failed to delete OyaSquad.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary font-bold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header Hero */}
      <div className="bg-white border border-border-default rounded-[24px] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-green/10 flex items-center justify-center text-3xl shrink-0">
              {currentGroup.emoji || '⚡'}
            </div>

            {isEditingGroup ? (
              <div className="space-y-3">
                <div className="flex gap-1 overflow-x-auto py-1 items-center">
                  {DEFAULT_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEditEmoji(e)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                        editEmoji === e
                          ? 'bg-brand-green/20 border border-brand-green'
                          : 'bg-surface-grey'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={60}
                    className="px-3 py-1.5 bg-surface-grey border border-border-default rounded-xl text-sm font-bold focus:outline-none focus:border-brand-green"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveGroupEdit}
                    className="bg-brand-green text-white rounded-xl h-8 px-3 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingGroup(false)}
                    className="h-8 px-2 text-text-muted"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="type-heading text-text-primary">{currentGroup.name}</h1>
                  <button
                    onClick={() => setIsEditingGroup(true)}
                    className="text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-surface-grey transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-1 flex items-center gap-2">
                  <span>{members.length} {members.length === 1 ? 'member' : 'members'}</span>
                  <span>•</span>
                  <span>{plans.length} {plans.length === 1 ? 'outing' : 'outings'} planned</span>
                </p>
              </div>
            )}
          </div>

          {/* Primary Action: Plan Again */}
          <Link
            href={`/?squad=${members.length > 0 ? members.length : 4}&group=${currentGroup.id}`}
            className="w-full sm:w-auto"
          >
            <Button className="w-full sm:w-auto bg-brand-green hover:bg-brand-green-70 text-white rounded-full type-label h-12 px-6 shadow-none border-none tap-feedback flex items-center justify-center gap-2 font-bold text-sm">
              <span>Plan Again with this Squad</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Members Roster Column */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white border border-border-default rounded-[20px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="type-subheading text-text-primary text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-green" />
                <span>Squad Members</span>
              </h2>
              <span className="text-xs font-bold text-text-muted">{members.length}/20</span>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 bg-surface-grey rounded-xl border border-border-default/50 text-xs"
                >
                  <span className="font-bold text-text-primary truncate">{m.display_name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(m.id, m.display_name)}
                    className="text-text-muted hover:text-red-500 p-1 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {members.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-2">
                  No members added yet.
                </p>
              )}
            </div>

            {/* Add Member Form */}
            {members.length < 20 && (
              <form onSubmit={handleAddMember} className="flex gap-2 pt-2 border-t border-border-default/60">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Add friend's name"
                  maxLength={60}
                  className="flex-1 px-3 py-2 bg-surface-grey rounded-xl border border-border-default text-xs focus:outline-none focus:border-brand-green"
                />
                <Button
                  type="submit"
                  disabled={!newMemberName.trim() || isAddingMember}
                  size="sm"
                  className="bg-brand-green text-white rounded-xl text-xs px-3"
                >
                  {isAddingMember ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                </Button>
              </form>
            )}
          </div>

          {/* Delete Squad danger button */}
          <div className="pt-2 text-center">
            <button
              onClick={handleDeleteGroup}
              disabled={isDeleting}
              className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete this OyaSquad'}
            </button>
          </div>
        </div>

        {/* Plan History Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-border-default rounded-[20px] p-5 sm:p-6 space-y-4">
            <h2 className="type-subheading text-text-primary text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-green" />
              <span>Outing History with this Squad</span>
            </h2>

            {plans.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Calendar className="w-10 h-10 text-text-muted/40 mx-auto" />
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  You haven&apos;t generated any plans with this OyaSquad yet. Start an outing plan to build your squad memory!
                </p>
                <Link
                  href={`/?squad=${members.length > 0 ? members.length : 4}&group=${currentGroup.id}`}
                  className="inline-block pt-1"
                >
                  <Button size="sm" className="bg-brand-green text-white rounded-full text-xs font-bold px-4">
                    Create First Plan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((p) => {
                  const spotName = Array.isArray(p.spot) ? p.spot[0]?.name : p.spot?.name;
                  const spotAddress = Array.isArray(p.spot) ? p.spot[0]?.address : p.spot?.address;
                  const costPerPerson = p.squad_size > 0 ? Math.round(p.total_cost / p.squad_size) : p.total_cost;

                  return (
                    <Link
                      key={p.id}
                      href={`/plan/${p.id}`}
                      className="block p-4 bg-surface-grey/80 hover:bg-surface-grey border border-border-default/60 hover:border-brand-green rounded-2xl transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-md">
                            {p.vibe || 'Outing'}
                          </span>
                          <h3 className="type-subheading text-text-primary font-bold text-sm mt-1.5 group-hover:text-brand-green transition-colors">
                            {spotName || 'Lagos Outing'}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{spotAddress || 'Lagos'}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-brand-green block">
                            ₦{p.total_cost.toLocaleString('en-NG')}
                          </span>
                          <span className="text-[11px] text-text-muted block">
                            ~₦{costPerPerson.toLocaleString('en-NG')}/person
                          </span>
                          <span className="text-[10px] text-text-muted/80 block mt-1">
                            {new Date(p.created_at).toLocaleDateString('en-GB', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
