import { Heart, Gift, Users, Wallet, Sun, Briefcase, GlassWater, Coffee } from "lucide-react";
import { ReactNode } from "react";

export interface Collection {
  id: string;
  title: string;
  icon: any; // We'll just instantiate the icon in the component or use strings
  gradient: string;
  forgeParams: string;
}

export const COLLECTIONS = [
  {
    id: "date-night",
    title: "Date Night",
    iconName: "Heart",
    gradient: "from-pink-500 to-rose-500",
    forgeParams: "?vibe=date-night&budget=30000"
  },
  {
    id: "birthday",
    title: "Birthday",
    iconName: "Gift",
    gradient: "from-purple-500 to-indigo-500",
    forgeParams: "?vibe=party&squad=5"
  },
  {
    id: "team-hangout",
    title: "Team Hangout",
    iconName: "Users",
    gradient: "from-blue-500 to-cyan-500",
    forgeParams: "?vibe=chill&squad=6"
  },
  {
    id: "under-20k",
    title: "Under ₦20k",
    iconName: "Wallet",
    gradient: "from-emerald-500 to-teal-500",
    forgeParams: "?budget=20000"
  },
  {
    id: "sunday-plans",
    title: "Sunday Plans",
    iconName: "Sun",
    gradient: "from-amber-400 to-orange-500",
    forgeParams: "?vibe=brunch"
  },
  {
    id: "after-work",
    title: "After Work",
    iconName: "Briefcase",
    gradient: "from-slate-600 to-slate-800",
    forgeParams: "?vibe=drinks"
  },
  {
    id: "first-date",
    title: "First Date",
    iconName: "GlassWater",
    gradient: "from-fuchsia-500 to-pink-600",
    forgeParams: "?vibe=casual&budget=15000&squad=2"
  },
  {
    id: "quick-lunch",
    title: "Quick Lunch",
    iconName: "Coffee",
    gradient: "from-orange-400 to-red-500",
    forgeParams: "?vibe=foodie&budget=10000"
  }
];
