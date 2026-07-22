export interface VibeConfig {
  userLabel: string;
  receiptCopy: string;
  receiptFull: string;
}

export const VIBE_DISPLAY_NAMES: Record<string, VibeConfig> = {
  "date-night": {
    userLabel: "💕 Date Night",
    receiptCopy: "Date Night",
    receiptFull: "Hits your chosen Date Night vibe",
  },
  dinner: {
    userLabel: "💕 Date Night",
    receiptCopy: "Date Night",
    receiptFull: "Hits your chosen Date Night vibe",
  },
  chill: {
    userLabel: "👥 Squad Linkup",
    receiptCopy: "Squad Linkup",
    receiptFull: "Hits your chosen Squad Linkup vibe",
  },
  "squad-linkup": {
    userLabel: "👥 Squad Linkup",
    receiptCopy: "Squad Linkup",
    receiptFull: "Hits your chosen Squad Linkup vibe",
  },
  party: {
    userLabel: "🎉 Birthday Turn Up",
    receiptCopy: "Birthday Turn Up",
    receiptFull: "Hits your chosen Birthday Turn Up vibe",
  },
  birthday: {
    userLabel: "🎉 Birthday Turn Up",
    receiptCopy: "Birthday Turn Up",
    receiptFull: "Hits your chosen Birthday Turn Up vibe",
  },
  quick: {
    userLabel: "⚡ Quick Bites",
    receiptCopy: "Quick Bites",
    receiptFull: "Hits your chosen Quick Bites vibe",
  },
  "quick-link": {
    userLabel: "⚡ Quick Bites",
    receiptCopy: "Quick Bites",
    receiptFull: "Hits your chosen Quick Bites vibe",
  },
  foodie: {
    userLabel: "🍲 Serious Chop",
    receiptCopy: "Serious Chop",
    receiptFull: "Hits your chosen Serious Chop vibe",
  },
  brunch: {
    userLabel: "🥞 Brunch Vibe",
    receiptCopy: "Brunch Vibe",
    receiptFull: "Hits your chosen Brunch vibe",
  },
};

export function getVibeConfig(vibeKey: string | null | undefined): VibeConfig {
  if (!vibeKey) {
    return {
      userLabel: "💕 Outing Vibe",
      receiptCopy: "Outing",
      receiptFull: "Hits your chosen outing vibe",
    };
  }

  const normalized = vibeKey.toLowerCase().trim();
  return (
    VIBE_DISPLAY_NAMES[normalized] || {
      userLabel: `${vibeKey} Vibe`,
      receiptCopy: `${vibeKey} Outing`,
      receiptFull: `Hits your chosen ${vibeKey} vibe`,
    }
  );
}
