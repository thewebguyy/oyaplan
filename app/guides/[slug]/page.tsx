import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { PLANNING_GUIDES } from "@/lib/config/guides";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PLANNING_GUIDES.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = PLANNING_GUIDES.find((g) => g.slug === slug);
  if (!guide) return {};

  return {
    title: `${guide.title} — OyaPlan Guide`,
    description: guide.description,
  };
}

export default async function GuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = PLANNING_GUIDES.find((g) => g.slug === slug);

  if (!guide) {
    notFound();
  }

  // Parse params to show what the user is getting
  const searchParams = new URLSearchParams(guide.forgeParams);
  const budget = searchParams.get("budget");
  const vibe = searchParams.get("vibe");
  const squad = searchParams.get("squad");
  const area = searchParams.get("area")?.replace("-", " ");

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-12 bg-white-sand section-editorial min-h-screen">
      <div className="space-y-4">
        <Link href="/guides">
          <button className="type-label text-text-secondary hover:text-midnight-lagoon transition-colors flex items-center gap-2 tap-feedback py-2 hover:underline decoration-lasgidi-yellow underline-offset-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Guides
          </button>
        </Link>
        <h1 className="type-display-product text-text-primary text-3xl sm:text-4xl font-black">
          {guide.title}
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          {guide.description}
        </p>
      </div>

      <div className="bg-white border border-border-default/50 rounded-[32px] p-6 sm:p-8 space-y-6 shadow-lagoon-soft">
        <h3 className="type-heading text-lg">Guide Configuration</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {budget && (
            <div>
              <p className="type-caption text-text-muted">Target Budget</p>
              <p className="type-body font-bold text-text-primary">₦{parseInt(budget).toLocaleString()}</p>
            </div>
          )}
          {vibe && (
            <div>
              <p className="type-caption text-text-muted">Vibe Mode</p>
              <p className="type-body font-bold text-text-primary capitalize">{vibe}</p>
            </div>
          )}
          {squad && (
            <div>
              <p className="type-caption text-text-muted">Squad size</p>
              <p className="type-body font-bold text-text-primary">{squad} people</p>
            </div>
          )}
          {area && (
            <div>
              <p className="type-caption text-text-muted">Target Area</p>
              <p className="type-body font-bold text-text-primary capitalize">{area}</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-border-default/30">
          <Link href={`/forge${guide.forgeParams}&fresh=true`}>
            <Button className="w-full bg-lasgidi-yellow text-midnight-lagoon font-[900] h-12 rounded-[12px] shadow-none flex items-center justify-center gap-2 hover:bg-[#E2B63B] transition-colors" style={{ transitionDuration: 'var(--duration-hover)' }}>
              <Play className="w-4 h-4 fill-white" />
              Start Planning with this Guide
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
