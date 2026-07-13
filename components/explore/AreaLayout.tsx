import { ReactNode } from "react";
import DossierDropWrapper from "../DossierDropWrapper";

interface AreaLayoutProps {
  slug: string;
  areaName: string;
  description: string;
  spotsCount: number;
  children: ReactNode;
}

export default function AreaLayout({ slug, areaName, description, spotsCount, children }: AreaLayoutProps) {
  let template: "premium-void" | "linear-strip" | "dense-hub" | "standard-grid" = "standard-grid";

  const lowerSlug = slug.toLowerCase();
  if (lowerSlug === "vi" || lowerSlug === "ikoyi" || lowerSlug === "victoria-island") {
    template = "premium-void";
  } else if (lowerSlug === "lekki-phase-1" || lowerSlug === "lekki" || lowerSlug === "ajah" || lowerSlug === "epe") {
    template = "linear-strip";
  } else if (lowerSlug === "yaba" || lowerSlug === "surulere" || lowerSlug === "ikeja" || lowerSlug === "lagos-island") {
    template = "dense-hub";
  }

  if (template === "premium-void") {
    return (
      <div className="w-full bg-white text-text-primary">
        <div className="min-h-[40vh] flex flex-col justify-end px-6 sm:px-12 pb-12 pt-24 max-w-5xl mx-auto border-b border-black/10">
          <h1 className="font-sans font-black text-5xl md:text-7xl tracking-[-0.04em] uppercase leading-none mb-4">{areaName}</h1>
          <p className="type-body text-text-secondary max-w-xl text-md sm:text-lg font-medium">{description}</p>
          <span className="type-caption text-text-muted mt-3 uppercase tracking-widest text-[9px] font-black">{spotsCount} Premium Voids Active</span>
        </div>

        <div className="max-w-5xl mx-auto px-6 sm:px-12 py-16">
          <DossierDropWrapper className="grid grid-cols-1 sm:grid-cols-2 gap-12 dossier-grid">
            {children}
          </DossierDropWrapper>
        </div>
      </div>
    );
  }

  if (template === "linear-strip") {
    return (
      <div className="w-full bg-white text-text-primary">
        <div className="py-12 px-6 max-w-4xl mx-auto border-b-2 border-black">
          <h1 className="font-sans font-black text-4xl sm:text-5xl tracking-tight uppercase leading-none">{areaName}</h1>
          <p className="type-body text-text-muted mt-2 text-sm sm:type-body">{description}</p>
          <span className="text-[9px] font-mono tracking-widest text-text-muted block mt-4 uppercase font-bold">// Linear Strip Stream &bull; {spotsCount} Nodes</span>
        </div>

        <DossierDropWrapper className="max-w-4xl mx-auto px-6 py-12 space-y-12 dossier-grid">
          {children}
        </DossierDropWrapper>
      </div>
    );
  }

  if (template === "dense-hub") {
    return (
      <div className="w-full bg-white text-text-primary">
        <div className="p-6 border-b border-black">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-sans font-black text-3xl sm:text-4xl tracking-tight uppercase leading-none">{areaName}</h1>
              <p className="type-caption text-text-muted mt-1.5">{description}</p>
            </div>
            <span className="bg-black text-white text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-[4px] self-start sm:self-auto font-black">
              DENSE MATRIX // {spotsCount} ITEMS
            </span>
          </div>
        </div>

        <div className="w-full">
          {/* Grid layout with internal borders */}
          <DossierDropWrapper className="grid grid-cols-1 sm:grid-cols-2 border-b border-black divide-y sm:divide-y-0 sm:divide-x divide-black/15 dossier-grid">
            {children}
          </DossierDropWrapper>
        </div>
      </div>
    );
  }

  // Standard Grid (Fallback)
  return (
    <div className="w-full bg-white text-text-primary">
      <div className="bg-surface-grey border-b border-border-default py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-sans font-black text-4xl tracking-tight uppercase leading-none mb-2">{areaName}</h1>
          <p className="type-body text-text-muted">{description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <DossierDropWrapper className="grid grid-cols-1 sm:grid-cols-2 gap-8 dossier-grid">
          {children}
        </DossierDropWrapper>
      </div>
    </div>
  );
}
