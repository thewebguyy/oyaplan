export interface PlanningGuide {
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  forgeParams: string;
}

export const PLANNING_GUIDES: PlanningGuide[] = [
  {
    slug: "lagos-island-date-night",
    title: "Lagos Island Date Night under ₦50k",
    description: "The best romantic spots on the island that won't break the bank.",
    forgeParams: "?vibe=date-night&budget=50000&area=victoria-island&squad=2"
  },
  {
    slug: "ikeja-group-hangout",
    title: "Ikeja Group Hangouts",
    description: "Perfect places for 5+ people to chill on the mainland.",
    forgeParams: "?vibe=chill&budget=20000&area=ikeja&squad=5"
  },
  {
    slug: "lekki-brunch-spots",
    title: "Lekki Sunday Brunch",
    description: "Top brunch spots in Lekki with the best aesthetics and food.",
    forgeParams: "?vibe=brunch&budget=30000&area=lekki&squad=3"
  },
  {
    slug: "budget-friendly-foodies",
    title: "Hidden Foodie Gems (Under ₦15k)",
    description: "Incredible food without the premium price tag. Any area.",
    forgeParams: "?vibe=foodie&budget=15000&squad=2"
  }
];
