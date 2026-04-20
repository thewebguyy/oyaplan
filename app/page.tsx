import ForgeForm from "@/components/ForgeForm";
import { supabase } from "@/lib/supabase";
import { Area } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getAreas() {
  const { data: areas, error } = await supabase
    .from("areas")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching areas:", error);
    // Fallback areas if DB is not seeded yet
    return [
      { id: "1", name: "Ikeja", slug: "ikeja" },
      { id: "2", name: "Lekki Phase 1", slug: "lekki-phase-1" },
      { id: "3", name: "Victoria Island", slug: "vi" },
      { id: "4", name: "Surulere", slug: "surulere" },
    ];
  }
  return areas;
}

export default async function LandingPage() {
  const areas = await getAreas();

  return (
    <main className="min-h-screen bg-[#008751] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase bg-white/20 rounded-full border border-white/30 backdrop-blur-sm">
            100% Lagos Deterministic Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
            Stop the group chat wahala. <br />
            <span className="text-[#FCD116]">Get one complete plan in 60s.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            Input 4 simple fields. Get the exact food cost, transport estimate, and "why it fits" note. Copy to WhatsApp and go.
          </p>

          {/* Form */}
          <div className="mt-12">
            <ForgeForm areas={areas} />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#FCD116]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Social Proof / Levels 3 Features */}
      <div className="bg-white text-gray-900 py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-black text-[#008751]">60s</div>
            <p className="font-bold uppercase text-xs tracking-widest text-gray-400">Planning Time</p>
            <p className="text-sm text-gray-600">Faster than your squad's fastest replies.</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-black text-[#008751]">100%</div>
            <p className="font-bold uppercase text-xs tracking-widest text-gray-400">Price Accuracy</p>
            <p className="text-sm text-gray-600">Deterministic estimates for Lagos mainland & islands.</p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-black text-[#008751]">1 Tap</div>
            <p className="font-bold uppercase text-xs tracking-widest text-gray-400">WhatsApp Copy</p>
            <p className="text-sm text-gray-600">Ready-to-paste text for the group chat.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-white/40 text-sm">
        &copy; 2026 OyaPlan.com • Built for the Lagos Squad.
      </footer>
    </main>
  );
}
