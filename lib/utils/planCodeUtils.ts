/**
 * Normalizes a user-entered plan code.
 * Ensures uppercase and trims whitespace (e.g. "oya-7k4m2p " -> "OYA-7K4M2P").
 * Also adds "OYA-" prefix if operator typed just the 6 alphanumeric characters.
 */
export function normalizePlanCode(rawCode: string): string {
  const cleaned = rawCode.trim().toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return '';
  if (!cleaned.startsWith('OYA-') && cleaned.length === 6) {
    return `OYA-${cleaned}`;
  }
  return cleaned;
}
