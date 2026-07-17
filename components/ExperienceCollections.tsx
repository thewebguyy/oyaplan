import Link from "next/link";
import { Heart, Gift, Users, Wallet, Sun, Briefcase, GlassWater, Coffee, type LucideIcon } from "lucide-react";
import { COLLECTIONS } from "@/lib/config/collections";
import RevealOnScroll from "@/components/motion/RevealOnScroll";

const iconMap: Record<string, LucideIcon> = {
  Heart, Gift, Users, Wallet, Sun, Briefcase, GlassWater, Coffee,
};

const IDLE_DELAYS = ["idle-delay-0","idle-delay-1","idle-delay-2","idle-delay-3","idle-delay-4","idle-delay-5","idle-delay-0","idle-delay-1"];

export default function ExperienceCollections() {
  return (
    <RevealOnScroll className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="type-heading text-midnight-lagoon">Popular Collections</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 stagger-children">
        {COLLECTIONS.map((collection, idx) => {
          const Icon = iconMap[collection.iconName];
          const textClass = collection.darkText ? "text-midnight-lagoon" : "text-white";
          const iconBg  = collection.darkText
            ? "bg-midnight-lagoon/10 backdrop-blur-md"
            : "bg-white/20 backdrop-blur-md";
          const idleClass = IDLE_DELAYS[idx] ?? "idle-delay-0";

          return (
            <Link
              key={collection.id}
              href={`/forge${collection.forgeParams}`}
              className="group relative h-36 sm:h-40 rounded-[28px] overflow-hidden tap-feedback card-lift"
              style={{
                boxShadow: `0 8px 24px -8px ${collection.shadowColor}`,
              }}
            >
              {/* Gradient background — drifts independently */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} gradient-drift`}
              />

              {/* Atmospheric radial glow overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_20%,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none" />

              {/* Hover — card tinted border */}
              <div className="absolute inset-0 rounded-[28px] border border-white/10 group-hover:border-white/25 transition-colors pointer-events-none" style={{ transitionDuration: 'var(--duration-lift)' }} />

              {/* Content layer — stationary */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                {/* Icon — floats independently from the card */}
                <div
                  className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center shadow-inner animate-idle-breathe ${idleClass} group-hover:scale-110 transition-transform`}
                  style={{ transitionDuration: 'var(--duration-hover)', transitionTimingFunction: 'var(--ease-spring)' }}
                >
                  {Icon && <Icon className={`w-5 h-5 ${textClass}`} />}
                </div>

                <span
                  className={`type-ui-label ${textClass} font-bold text-sm leading-tight drop-shadow-sm group-hover:translate-x-0.5 transition-transform`}
                  style={{ transitionDuration: 'var(--duration-lift)' }}
                >
                  {collection.title}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </RevealOnScroll>
  );
}

