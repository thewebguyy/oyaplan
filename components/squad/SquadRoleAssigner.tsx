'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, User, Check, RefreshCw } from 'lucide-react';
import { triggerHaptic } from '@/lib/ui/haptics';

export interface SquadRole {
  id: string;
  title: string;
  emoji: string;
  description: string;
  quote: string;
  badgeBg: string;
  badgeTextColor: string;
}

export const SQUAD_ROLES: SquadRole[] = [
  {
    id: 'minister-enjoyment',
    title: 'Minister of Enjoyment',
    emoji: '👑',
    description: 'The mastermind who planned the outing and selected the spot.',
    quote: '"I have done the math, just turn up!"',
    badgeBg: 'bg-[#111111]',
    badgeTextColor: 'text-[#F9E828]',
  },
  {
    id: 'accountant-general',
    title: 'Accountant-General',
    emoji: '💸',
    description: 'The member who calculates every menu item & checks for hidden VAT.',
    quote: '"Wait o, why is water ₦3,500?"',
    badgeBg: 'bg-[#FFFEE5]',
    badgeTextColor: 'text-[#111111]',
  },
  {
    id: 'timekeeper',
    title: 'Timekeeper',
    emoji: '⏰',
    description: 'Always promises "I\'m on my way" while still in the shower.',
    quote: '"I\'m at Third Mainland Bridge now" (Still in bed)',
    badgeBg: 'bg-[#E5E5DE]',
    badgeTextColor: 'text-[#111111]',
  },
  {
    id: 'chief-hype',
    title: 'Chief Hype Officer',
    emoji: '🔥',
    description: 'First to post on WhatsApp status and capture all the videos.',
    quote: '"Outside is sweet today!"',
    badgeBg: 'bg-[#F9E828]',
    badgeTextColor: 'text-[#111111]',
  },
  {
    id: 'driver-day',
    title: 'Driver of the Day',
    emoji: '🚗',
    description: 'Handles the Uber/Bolt logistics & navigates Lekki traffic.',
    quote: '"Drop your pin, I\'m ordering the ride."',
    badgeBg: 'bg-[#008751]',
    badgeTextColor: 'text-white',
  },
  {
    id: 'protocol-officer',
    title: 'Protocol Officer',
    emoji: '🛡️',
    description: 'Inspects the venue vibe & ensures zero awkward billing stories.',
    quote: '"Table is locked, zero stories."',
    badgeBg: 'bg-[#111111]',
    badgeTextColor: 'text-white',
  },
];

interface MemberWithRole {
  name: string;
  roleId: string;
}

interface SquadRoleAssignerProps {
  squadName?: string;
  initialMembers?: MemberWithRole[];
  onRolesChanged?: (members: MemberWithRole[]) => void;
}

export function SquadRoleAssigner({
  squadName = 'Lekki Crew',
  initialMembers = [
    { name: 'You (Creator)', roleId: 'minister-enjoyment' },
    { name: 'Tolu', roleId: 'accountant-general' },
    { name: 'Amaka', roleId: 'timekeeper' },
    { name: 'Femi', roleId: 'chief-hype' },
  ],
  onRolesChanged,
}: SquadRoleAssignerProps) {
  const [members, setMembers] = useState<MemberWithRole[]>(initialMembers);
  const [activeEditingIndex, setActiveEditingIndex] = useState<number | null>(null);

  const handleAssignRole = (index: number, roleId: string) => {
    triggerHaptic('selection');
    const updated = [...members];
    updated[index] = { ...updated[index], roleId };
    setMembers(updated);
    setActiveEditingIndex(null);
    if (onRolesChanged) onRolesChanged(updated);
  };

  const getRole = (roleId: string): SquadRole => {
    return SQUAD_ROLES.find((r) => r.id === roleId) || SQUAD_ROLES[0];
  };

  return (
    <div className="bg-white border-3 border-[#111111] rounded-3xl p-5 sm:p-6 shadow-[8px_8px_0px_0px_#111111] space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#111111]" />
          <h3 className="text-base sm:text-lg font-black font-display uppercase tracking-tight text-[#111111]">
            Official Squad Titles ({squadName})
          </h3>
        </div>
        <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-[#F9E828] text-[#111111] border border-[#111111] px-2.5 py-0.5 rounded-full shadow-[2px_2px_0px_0px_#111111]">
          Lagos Roles
        </span>
      </div>

      <p className="text-xs text-[#555555] font-medium">
        Assign hilarious official titles to your crew members before stepping outside.
      </p>

      {/* Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {members.map((member, idx) => {
          const role = getRole(member.roleId);
          const isEditing = activeEditingIndex === idx;

          return (
            <div
              key={idx}
              className="relative bg-[#FAFAF6] border-2 border-[#111111] rounded-2xl p-4 shadow-[3px_3px_0px_0px_#111111] space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#111111] text-[#F9E828] flex items-center justify-center font-bold text-sm border border-[#111111]">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#111111] truncate">{member.name}</h4>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#111111] mt-0.5 ${role.badgeBg} ${role.badgeTextColor}`}
                    >
                      <span>{role.emoji}</span>
                      <span>{role.title}</span>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveEditingIndex(isEditing ? null : idx);
                  }}
                  className="p-1.5 rounded-lg bg-white hover:bg-[#F6F6F2] text-[#111111] border border-[#111111] text-[10px] font-bold uppercase transition-all tap-feedback cursor-pointer"
                  title="Change Title"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-[#555555] font-mono italic">
                {role.quote}
              </p>

              {/* Role Dropdown Selector */}
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2 border-t border-dashed border-[#111111]/30 space-y-1.5"
                >
                  <span className="text-[10px] font-mono font-bold text-[#111111] uppercase">
                    Select New Role for {member.name}:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {SQUAD_ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleAssignRole(idx, r.id)}
                        className={`w-full text-left p-2 rounded-xl border border-[#111111] text-xs transition-all flex items-center justify-between cursor-pointer ${
                          member.roleId === r.id
                            ? 'bg-[#111111] text-[#F9E828] font-bold'
                            : 'bg-white text-[#111111] hover:bg-[#FFFEE5]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{r.emoji}</span>
                          <span>{r.title}</span>
                        </span>
                        {member.roleId === r.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
