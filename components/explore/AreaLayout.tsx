import { ReactNode } from "react";
import DossierDropWrapper from "../DossierDropWrapper";

interface AreaLayoutProps {
  slug: string;
  areaName: string;
  description: string;
  characterProfile?: string;
  whatPeopleComeHereFor?: string;
  typicalSpend?: string;
  spotsCount: number;
  children: ReactNode;
}

export default function AreaLayout({ slug, areaName, description, characterProfile, whatPeopleComeHereFor, typicalSpend, spotsCount, children }: AreaLayoutProps) {
  return (
    <div className="w-full bg-white text-text-primary min-h-screen">
      <div className="px-6 py-20 lg:py-24 max-w-2xl mx-auto text-center lg:text-left">
        <h1 className="font-serif italic text-5xl lg:text-6xl tracking-tight text-black mb-6">
          {areaName}
        </h1>
        {characterProfile && (
          <p className="type-body text-text-primary text-lg lg:text-xl font-medium leading-relaxed mb-6">
            {characterProfile}
          </p>
        )}
        <p className="type-caption text-text-muted mt-2 text-sm max-w-lg mx-auto lg:mx-0">
          {description}
        </p>
        <div className="mt-12 flex flex-col gap-6 lg:gap-8 pt-8 border-t border-border-default">
          {whatPeopleComeHereFor && (
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-text-muted block mb-2">What people come here for</span>
              <p className="type-body text-text-primary text-sm max-w-sm">{whatPeopleComeHereFor}</p>
            </div>
          )}
          {typicalSpend && (
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-text-muted block mb-2">Typical Outing Spend</span>
              <p className="font-mono text-lg font-black text-brand-green">{typicalSpend}</p>
            </div>
          )}
        </div>
        
        <div className="mt-12 flex items-center justify-center lg:justify-start gap-4">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-text-muted">
            {spotsCount} Verified Places
          </span>
        </div>
      </div>

      <div className="px-6 py-12 max-w-2xl mx-auto">
        <DossierDropWrapper className="grid grid-cols-1 gap-12 dossier-grid">
          {children}
        </DossierDropWrapper>
      </div>
    </div>
  );
}
