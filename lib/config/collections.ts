export interface Collection {
  id: string;
  title: string;
  iconName: string;
  gradient: string;
  forgeParams: string;
  /** Inline box-shadow color for the card (nearly invisible at low opacity) */
  shadowColor: string;
  /** True if the card background is light — text should be midnight-lagoon instead of white */
  darkText: boolean;
}

export const COLLECTIONS: Collection[] = [
  {
    id: "date-night",
    title: "Date Night (Chop Eye)",
    iconName: "Heart",
    gradient: "from-[#010528] via-[#021060] to-[#004B8E]",
    forgeParams: "?vibe=date-night&budget=30000",
    shadowColor: "rgba(1,5,40,0.20)",
    darkText: false,
  },
  {
    id: "birthday",
    title: "Birthday Turn Up",
    iconName: "Gift",
    gradient: "from-[#F6C642] via-[#F0B429] to-[#E8A020]",
    forgeParams: "?vibe=party&squad=5",
    shadowColor: "rgba(246,198,66,0.25)",
    darkText: true,
  },
  {
    id: "team-hangout",
    title: "Squad Linkup",
    iconName: "Users",
    gradient: "from-[#004B8E] via-[#005FAE] to-[#0073CC]",
    forgeParams: "?vibe=chill&squad=6",
    shadowColor: "rgba(0,75,142,0.20)",
    darkText: false,
  },
  {
    id: "under-20k",
    title: "₦20k Budget Clean",
    iconName: "Wallet",
    gradient: "from-[#008751] via-[#009B5C] to-[#00B568]",
    forgeParams: "?budget=20000",
    shadowColor: "rgba(0,135,81,0.20)",
    darkText: false,
  },
  {
    id: "sunday-plans",
    title: "Sunday Brunch Vibe",
    iconName: "Sun",
    gradient: "from-[#FEFBEE] via-[#FDF3C0] to-[#F6C642]",
    forgeParams: "?vibe=brunch",
    shadowColor: "rgba(246,198,66,0.18)",
    darkText: true,
  },
  {
    id: "after-work",
    title: "After Work Cool Down",
    iconName: "Briefcase",
    gradient: "from-[#1D1D1F] via-[#252527] to-[#2E2E30]",
    forgeParams: "?vibe=drinks",
    shadowColor: "rgba(29,29,31,0.25)",
    darkText: false,
  },
  {
    id: "first-date",
    title: "First Date Casuals",
    iconName: "GlassWater",
    gradient: "from-[#F6C642] via-[#F5BC30] to-[#F0AE1A]",
    forgeParams: "?vibe=casual&budget=15000&squad=2",
    shadowColor: "rgba(246,198,66,0.22)",
    darkText: true,
  },
  {
    id: "quick-lunch",
    title: "Quick Serious Chop",
    iconName: "Coffee",
    gradient: "from-[#004B8E] via-[#003D72] to-[#010528]",
    forgeParams: "?vibe=foodie&budget=10000",
    shadowColor: "rgba(0,75,142,0.20)",
    darkText: false,
  },
];

