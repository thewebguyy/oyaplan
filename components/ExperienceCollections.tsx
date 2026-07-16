import Link from "next/link";
import { Heart, Gift, Users, Wallet, Sun, Briefcase, GlassWater, Coffee } from "lucide-react";
import { COLLECTIONS } from "@/lib/config/collections";

const iconMap: Record<string, any> = {
  Heart, Gift, Users, Wallet, Sun, Briefcase, GlassWater, Coffee
};

export default function ExperienceCollections() {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="type-heading text-xl">Popular Collections</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {COLLECTIONS.map((collection) => {
          const Icon = iconMap[collection.iconName];
          return (
            <Link
              key={collection.id}
              href={`/forge${collection.forgeParams}`}
              className="group relative h-28 sm:h-32 rounded-2xl overflow-hidden tap-feedback"
            >
              {/* Abstract Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-90 transition-opacity group-hover:opacity-100`} />
              
              {/* Icon & Text */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {Icon && <Icon className="w-5 h-5 text-white" />}
                </div>
                <span className="type-ui-label text-white font-bold text-sm sm:text-base leading-tight drop-shadow-sm">
                  {collection.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
