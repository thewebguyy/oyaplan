/**
 * Generates premium-looking initials from a display name or email.
 * - For emails, returns the first letter (e.g. planner@email.com -> P)
 * - For single names, returns up to 2 letters of the name (e.g. Bode -> BO)
 * - For multiple names, returns first letter of first two words (e.g. Bode Olusegun -> BO)
 */
export function getInitials(name?: string | null): string {
  if (!name) return "O"; // Default fallback (e.g. OyaPlan)

  const cleanName = name.trim();

  // If it's an email, just grab the first letter capitalized
  if (cleanName.includes("@")) {
    return cleanName.charAt(0).toUpperCase();
  }

  const parts = cleanName.split(/[\s_-]+/).filter(Boolean);

  if (parts.length === 0) return "O";

  if (parts.length === 1) {
    // Single word: grab first two letters if possible
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Multiple words: grab first letter of first two words
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}
