import ForgeForm from "@/components/ForgeForm";
import { supabase } from "@/lib/supabase";
import { Area } from "@/lib/types";
import Link from "next/link";

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
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tighter">
            Stop the group chat wahala. <br />
            <span className="text-[#FCD116]">Get one complete plan in 3s.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium">
            Input 4 simple fields. Get the exact food cost, transport estimate, and "why it fits" note. Copy to WhatsApp and go.
          </p>

          {/* Form */}
          <div className="mt-12 px-4 w-full space-y-4">
            <ForgeForm areas={areas} />
            <Link 
              href="/explore" 
              className="inline-block text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              Not sure where to go? Browse by area →
            </Link>
          </div>
        </div>
      </div>

      {/* Social Proof / Recent Plans */}
      <div className="bg-white text-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="font-bold uppercase text-[13px] tracking-widest text-gray-400 mb-6">Recent plans</p>
          <div className="flex flex-col md:flex-row justify-center gap-3">
            <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium">
              Yellow Chilli &middot; Ikeja &middot; <span className="text-[#008751] font-bold">₦19,400</span>
            </div>
            <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium">
              Shiro Lagos &middot; VI &middot; <span className="text-[#008751] font-bold">₦71,500</span>
            </div>
            <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-medium">
              White House &middot; Yaba &middot; <span className="text-[#008751] font-bold">₦5,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-white/60 text-[15px]">
        &copy; 2026 OyaPlan.com &middot; Built in Lagos.
      </footer>
    </main>
  );
}
