export type TimeOfDay = "morning" | "afternoon" | "golden-hour" | "night";

export function resolveTimeState(hour?: number): TimeOfDay {
  const currentHour = hour !== undefined ? hour : new Date().getHours();
  if (currentHour >= 5 && currentHour < 11) return "morning";
  if (currentHour >= 11 && currentHour < 16) return "afternoon";
  if (currentHour >= 16 && currentHour < 19) return "golden-hour";
  return "night";
}
