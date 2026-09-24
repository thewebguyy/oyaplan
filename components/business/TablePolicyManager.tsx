'use client';

import React, { useState } from 'react';
import { TablePolicy, SeatingType, DayOfWeek } from '@/lib/types';
import { saveTablePoliciesAction } from '@/lib/actions/partnerPricingActions';
import { trackEvent } from '@/lib/analytics/trackClient';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  Users,
  Wine,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TablePolicyManagerProps {
  venueId: string;
  initialPolicies?: TablePolicy[];
  updatedAt?: string | null;
}

const SEATING_LABELS: Record<SeatingType, string> = {
  standard: 'Standard Table / Dining',
  vip_booth: 'VIP Booth / Lounge Area',
  cabana: 'Poolside Cabana / Daybed',
  rooftop: 'Rooftop Table / Deck',
  bar_counter: 'Bar Counter Seating',
  outdoor_terrace: 'Outdoor Terrace',
  private_dining_room: 'Private Dining Room',
};

const ALL_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export function TablePolicyManager({
  venueId,
  initialPolicies = [],
  updatedAt,
}: TablePolicyManagerProps) {
  const router = useRouter();
  const [policies, setPolicies] = useState<TablePolicy[]>(initialPolicies);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [seatingType, setSeatingType] = useState<SeatingType>('vip_booth');
  const [minSpend, setMinSpend] = useState<string>('150000');
  const [mandatoryBottles, setMandatoryBottles] = useState(false);
  const [bottleCount, setBottleCount] = useState<string>('');
  const [isAllDays, setIsAllDays] = useState(true);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['friday', 'saturday']);
  const [startTime, setStartTime] = useState<string>('21:00');
  const [endTime, setEndTime] = useState<string>('03:00');
  const [minSquad, setMinSquad] = useState<string>('4');
  const [maxSquad, setMaxSquad] = useState<string>('10');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setSeatingType('vip_booth');
    setMinSpend('150000');
    setMandatoryBottles(false);
    setBottleCount('');
    setIsAllDays(true);
    setSelectedDays(['friday', 'saturday']);
    setStartTime('21:00');
    setEndTime('03:00');
    setMinSquad('4');
    setMaxSquad('10');
    setNotes('');
    setEditingId(null);
    setIsEditorOpen(false);
    setErrorMsg(null);
  };

  const handleEditClick = (policy: TablePolicy) => {
    setEditingId(policy.id);
    setName(policy.name);
    setSeatingType(policy.seating_type);
    setMinSpend(policy.minimum_spend.toString());
    setMandatoryBottles(policy.mandatory_bottle_policy);
    setBottleCount(policy.bottle_count_minimum?.toString() || '');
    setIsAllDays(policy.applicable_days.includes('all'));
    setSelectedDays(policy.applicable_days.filter((d) => d !== 'all'));
    setStartTime(policy.applicable_start_time || '');
    setEndTime(policy.applicable_end_time || '');
    setMinSquad(policy.min_squad_size?.toString() || '');
    setMaxSquad(policy.max_squad_size?.toString() || '');
    setNotes(policy.notes || '');
    setIsEditorOpen(true);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const spendNum = parseInt(minSpend, 10);
    if (!name.trim()) {
      setErrorMsg('Policy name is required.');
      return;
    }
    if (isNaN(spendNum) || spendNum < 0) {
      setErrorMsg('Minimum spend must be a non-negative number.');
      return;
    }

    const bottleNum = mandatoryBottles ? parseInt(bottleCount, 10) || null : null;
    const minSquadNum = minSquad.trim() ? parseInt(minSquad, 10) : null;
    const maxSquadNum = maxSquad.trim() ? parseInt(maxSquad, 10) : null;

    if (minSquadNum !== null && maxSquadNum !== null && maxSquadNum < minSquadNum) {
      setErrorMsg('Maximum squad size cannot be smaller than minimum squad size.');
      return;
    }

    const applicableDays: DayOfWeek[] = isAllDays ? ['all'] : selectedDays.length > 0 ? selectedDays : ['all'];

    const newPolicy: TablePolicy = {
      version: 1,
      id: editingId || `tp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      seating_type: seatingType,
      minimum_spend: spendNum,
      mandatory_bottle_policy: mandatoryBottles,
      bottle_count_minimum: bottleNum,
      applicable_days: applicableDays,
      applicable_start_time: startTime.trim() || null,
      applicable_end_time: endTime.trim() || null,
      min_squad_size: minSquadNum,
      max_squad_size: maxSquadNum,
      notes: notes.trim() || null,
      verification_status: 'owner_submitted',
      last_verified_at: new Date().toISOString(),
      source: 'owner_portal',
    };

    let updatedList: TablePolicy[];
    if (editingId) {
      updatedList = policies.map((p) => (p.id === editingId ? newPolicy : p));
    } else {
      updatedList = [...policies, newPolicy];
    }

    setSaving(true);
    const res = await saveTablePoliciesAction(venueId, updatedList);
    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to save policy.');
      return;
    }

    trackEvent('table_policy_updated_in_portal', {
      category: 'Operations',
      venue_id: venueId,
      policy_count: updatedList.length,
      version: '1.0',
    });

    setPolicies(updatedList);
    setSavedSuccess(true);
    resetForm();
    setTimeout(() => setSavedSuccess(false), 4000);
    router.refresh();
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm('Remove this table policy? Squad budgets will recalculate without this condition.')) return;
    const updated = policies.filter((p) => p.id !== id);
    setSaving(true);
    const res = await saveTablePoliciesAction(venueId, updated);
    setSaving(false);

    if (res.success) {
      setPolicies(updated);
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Failed to delete policy.');
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border-default p-5 sm:p-6 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-default pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Operational Table Policies
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-[10px] text-text-muted">Version 1 Domain Contract</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-midnight-lagoon mt-0.5">
            Table Minimums, VIP Booths &amp; Bottle Rules
          </h2>
          <p className="text-xs text-text-muted mt-0.5 max-w-xl">
            Specify time-bound minimum spends and bottle rules. OyaPlan uses these to deterministically calculate whether a squad can afford your tables.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsEditorOpen(true);
          }}
          className="h-9 px-3.5 bg-brand-green hover:bg-[#007043] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer tap-feedback shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Table Policy</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Editor Modal / Expandable Form */}
      {isEditorOpen && (
        <form onSubmit={handleSavePolicy} className="bg-[#FAF7F2] rounded-xl border-2 border-brand-green/40 p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#EAE4DC] pb-2.5">
            <h3 className="font-bold text-midnight-lagoon text-xs sm:text-sm">
              {editingId ? 'Edit Table Policy' : 'Create New Table Policy'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-text-muted hover:text-midnight-lagoon"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-secondary block">Policy / Section Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. VIP Lounge Booth, Poolside Cabana"
                className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs text-midnight-lagoon focus:outline-none focus:border-brand-green font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-secondary block">Seating Type *</label>
              <select
                value={seatingType}
                onChange={(e) => setSeatingType(e.target.value as SeatingType)}
                className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green"
              >
                {Object.entries(SEATING_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-secondary block">Minimum Spend (NGN) *</label>
              <input
                type="number"
                min="0"
                step="5000"
                required
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                placeholder="e.g. 150000"
                className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs font-mono font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-secondary block">Min Squad Size</label>
              <input
                type="number"
                min="1"
                value={minSquad}
                onChange={(e) => setMinSquad(e.target.value)}
                placeholder="e.g. 4"
                className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs font-mono font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-secondary block">Max Squad Size</label>
              <input
                type="number"
                min="1"
                value={maxSquad}
                onChange={(e) => setMaxSquad(e.target.value)}
                placeholder="e.g. 10"
                className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs font-mono font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>

          {/* Bottle Policy */}
          <div className="p-3 bg-white rounded-lg border border-[#EAE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mandatoryBottles}
                onChange={(e) => setMandatoryBottles(e.target.checked)}
                className="w-4 h-4 rounded text-brand-green focus:ring-brand-green border-border-default"
              />
              <span className="text-xs font-bold text-midnight-lagoon flex items-center gap-1.5">
                <Wine className="w-3.5 h-3.5 text-[#7A3E1D]" /> Mandatory Bottle Requirement
              </span>
            </label>

            {mandatoryBottles && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-text-secondary">Minimum Bottles Required:</span>
                <input
                  type="number"
                  min="1"
                  value={bottleCount}
                  onChange={(e) => setBottleCount(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-20 h-8 px-2.5 rounded-lg border border-border-default bg-white text-xs font-mono font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green"
                />
              </div>
            )}
          </div>

          {/* Days of Week */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-text-secondary">Applicable Days</label>
              <button
                type="button"
                onClick={() => setIsAllDays(!isAllDays)}
                className="text-[11px] text-brand-green font-bold hover:underline"
              >
                {isAllDays ? 'Select specific days' : 'Apply to all days'}
              </button>
            </div>

            {isAllDays ? (
              <p className="text-xs text-text-muted bg-white p-2.5 rounded-lg border border-[#EAE4DC]">
                This policy applies every day of the week.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {ALL_DAYS.map((d) => {
                  const active = selectedDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-all border ${
                        active
                          ? 'bg-brand-green text-white border-brand-green'
                          : 'bg-white text-text-secondary border-border-default'
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Time Window (Supports Overnight e.g. 21:00 -> 03:00) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-secondary block">Start Time (24h HH:MM)</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs font-mono font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-text-secondary block">End Time (24h HH:MM)</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs font-mono font-bold text-midnight-lagoon focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>
          {startTime && endTime && startTime > endTime && (
            <p className="text-[10px] text-[#7A3E1D] font-medium">
              Overnight window detected: This policy spans midnight from {startTime} to {endTime} the following morning.
            </p>
          )}

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-secondary block">Notes &amp; Inclusions</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes dedicated security and 1 complimentary mixer pitcher"
              className="w-full h-9 px-3 rounded-lg border border-border-default bg-white text-xs text-midnight-lagoon focus:outline-none focus:border-brand-green font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="h-9 px-3.5 text-xs text-text-secondary hover:text-midnight-lagoon font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-4 bg-midnight-lagoon hover:bg-[#07150E] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer tap-feedback shadow-xs disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{editingId ? 'Update Policy' : 'Save Policy'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Policies List */}
      {policies.length === 0 ? (
        <div className="text-center py-8 px-4 bg-[#FAF7F2] rounded-xl border border-dashed border-[#EAE4DC]">
          <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-midnight-lagoon">No special table policies configured</p>
          <p className="text-[11px] text-text-muted mt-0.5">
            Default per-person pricing applies to all tables. Add policies for VIP sections or weekend bottle requirements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {policies.map((policy) => {
            const isOvernight =
              policy.applicable_start_time &&
              policy.applicable_end_time &&
              policy.applicable_start_time > policy.applicable_end_time;

            return (
              <div
                key={policy.id}
                className="bg-white rounded-xl border border-border-default p-4 space-y-3 shadow-2xs hover:border-brand-green/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-midnight-lagoon">{policy.name}</h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 font-medium text-text-secondary">
                        {SEATING_LABELS[policy.seating_type] || policy.seating_type}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-[#7A3E1D] font-mono mt-1">
                      ₦{policy.minimum_spend.toLocaleString()}{' '}
                      <span className="text-[10px] font-sans font-normal text-text-muted">min spend</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditClick(policy)}
                      className="p-1.5 text-text-muted hover:text-midnight-lagoon rounded-lg hover:bg-gray-100"
                      title="Edit policy"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="p-1.5 text-text-muted hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Delete policy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-text-secondary border-t border-border-default/60 pt-2.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-text-muted shrink-0" />
                    <span>
                      {policy.applicable_days.includes('all')
                        ? 'All Days'
                        : policy.applicable_days.map((d) => d.slice(0, 3)).join(', ')}
                    </span>
                  </div>

                  {(policy.applicable_start_time || policy.applicable_end_time) && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-text-muted shrink-0" />
                      <span>
                        {policy.applicable_start_time || 'Anytime'} → {policy.applicable_end_time || 'Close'}
                        {isOvernight && <span className="ml-1 text-[10px] text-[#7A3E1D] font-bold">(Overnight)</span>}
                      </span>
                    </div>
                  )}

                  {(policy.min_squad_size || policy.max_squad_size) && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-text-muted shrink-0" />
                      <span>
                        Squad: {policy.min_squad_size ?? 1} - {policy.max_squad_size ?? 'any'} guests
                      </span>
                    </div>
                  )}

                  {policy.mandatory_bottle_policy && (
                    <div className="flex items-center gap-1.5 text-[#7A3E1D] font-bold">
                      <Wine className="w-3 h-3 shrink-0" />
                      <span>
                        Mandatory: {policy.bottle_count_minimum ? `${policy.bottle_count_minimum} bottles minimum` : 'Bottles required'}
                      </span>
                    </div>
                  )}

                  {policy.notes && <p className="text-[10px] text-text-muted italic pt-0.5">{policy.notes}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
