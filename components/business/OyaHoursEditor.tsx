"use client";

import React, { useState, useEffect } from "react";
import { Clock, Copy } from "lucide-react";

export interface OyaHoursEditorProps {
  initialHours?: Record<string, string> | null;
  onChange: (hours: Record<string, string>) => void;
  disabled?: boolean;
}

interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const DAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

function parseHourString(str?: string): DaySchedule {
  if (!str || str.toLowerCase() === "closed") {
    return { isOpen: false, openTime: "11:00", closeTime: "23:00" };
  }
  // Try to parse standard formats like "11:00 AM - 11:00 PM" or "11:00 - 23:00"
  const parts = str.split("-").map((s) => s.trim());
  if (parts.length === 2) {
    return { isOpen: true, openTime: parts[0], closeTime: parts[1] };
  }
  return { isOpen: true, openTime: "11:00", closeTime: "23:00" };
}

export function OyaHoursEditor({
  initialHours,
  onChange,
  disabled = false,
}: OyaHoursEditorProps) {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const init: Record<string, DaySchedule> = {};
    DAYS.forEach(({ key }) => {
      init[key] = parseHourString(initialHours?.[key]);
    });
    return init;
  });

  // Sync to parent whenever schedule changes
  useEffect(() => {
    const serialized: Record<string, string> = {};
    DAYS.forEach(({ key }) => {
      const day = schedule[key];
      if (!day || !day.isOpen) {
        serialized[key] = "Closed";
      } else {
        serialized[key] = `${day.openTime} - ${day.closeTime}`;
      }
    });
    onChange(serialized);
  }, [schedule, onChange]);

  const handleToggleOpen = (dayKey: string) => {
    if (disabled) return;
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOpen: !prev[dayKey].isOpen,
      },
    }));
  };

  const handleTimeChange = (
    dayKey: string,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    if (disabled) return;
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
  };

  const copyMondayToWeekdays = () => {
    if (disabled) return;
    const mondayConfig = schedule["monday"];
    setSchedule((prev) => ({
      ...prev,
      tuesday: { ...mondayConfig },
      wednesday: { ...mondayConfig },
      thursday: { ...mondayConfig },
      friday: { ...mondayConfig },
    }));
  };

  return (
    <div className="bg-white rounded-2xl border border-border-default/80 p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-green" />
          <h4 className="text-sm font-bold text-text-primary">Opening Hours</h4>
        </div>
        <button
          type="button"
          onClick={copyMondayToWeekdays}
          disabled={disabled}
          className="text-xs font-semibold text-brand-green hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Copy className="w-3 h-3" />
          <span>Copy Mon to Weekdays</span>
        </button>
      </div>

      <div className="divide-y divide-border-default/40">
        {DAYS.map(({ key, label }) => {
          const day = schedule[key];
          return (
            <div
              key={key}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 w-32">
                <input
                  type="checkbox"
                  id={`hours-toggle-${key}`}
                  checked={day.isOpen}
                  onChange={() => handleToggleOpen(key)}
                  disabled={disabled}
                  className="rounded text-brand-green focus:ring-brand-green/30 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor={`hours-toggle-${key}`}
                  className="text-sm font-medium text-text-primary cursor-pointer select-none"
                >
                  {label}
                </label>
              </div>

              {day.isOpen ? (
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={day.openTime}
                    onChange={(e) => handleTimeChange(key, "openTime", e.target.value)}
                    disabled={disabled}
                    placeholder="11:00 AM"
                    className="w-24 sm:w-28 px-2.5 py-1.5 rounded-lg border border-border-default bg-surface-grey text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 text-center font-mono font-medium"
                  />
                  <span className="text-text-muted">to</span>
                  <input
                    type="text"
                    value={day.closeTime}
                    onChange={(e) => handleTimeChange(key, "closeTime", e.target.value)}
                    disabled={disabled}
                    placeholder="11:00 PM"
                    className="w-24 sm:w-28 px-2.5 py-1.5 rounded-lg border border-border-default bg-surface-grey text-text-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30 text-center font-mono font-medium"
                  />
                </div>
              ) : (
                <span className="text-xs text-text-muted italic py-1.5">
                  Closed
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OyaHoursEditor;
