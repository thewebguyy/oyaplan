import Link from "next/link";
import { Heart, Gift, Users, Wallet, Sun, Briefcase, GlassWater, Coffee, type LucideIcon } from "lucide-react";
import { COLLECTIONS } from "@/lib/config/collections";

const iconMap: Record<string, LucideIcon> = {
  Heart, Gift, Users, Wallet, Sun, Briefcase, GlassWater, Coffee
};

export default function ExperienceCollections() {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="type-heading text-xl">Popular Collections</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {COLLECTIONS.map((collection, idx) => {
          const Icon = iconMap[collection.iconName];
          // Stagger floating duration slightly per card to prevent synchrony
          const floatDuration = 3 + (idx % 3) * 0.7;
          
          return (
            <Link
              key={collection.id}
              href={`/forge${collection.forgeParams}`}
              className="group relative h-32 sm:h-36 rounded-[32px] overflow-hidden tap-feedback card-lift border border-border-default/80"
              style={{
                boxShadow: "0 10px 30px -15px rgba(1, 5, 40, 0.05)"
              }}
            >
              {/* Unique Atmosphere: Abstract Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-90 transition-opacity duration-300 group-hover:opacity-100`} />
              
              {/* Abstract decorative geometric background shapes */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 blur-xl group-hover:bg-white/10 transition-colors pointer-events-none" />
              
              {/* Icon & Text */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div 
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110"
                  style={{
                    animation: `float-4px ${floatDuration}s ease-in-out infinite`,
                    animationDelay: `${idx * 0.2}s`
                  }}
                >
                  {Icon && <Icon className="w-5 h-5 text-white" />}
                </div>
                <span className="type-ui-label text-white font-bold text-sm sm:text-base leading-tight drop-shadow-sm group-hover:translate-x-1 transition-transform duration-300">
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
