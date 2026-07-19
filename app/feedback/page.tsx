import { getActiveAreas } from "@/lib/queries/areas";
import FeedbackForm from "./FeedbackForm";

export default async function FeedbackPage() {
  const { data: areas } = await getActiveAreas();

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Brand Header */}
      <div className="bg-[#008751] py-8 px-6 text-center border-b border-white/10 shadow-lg shadow-[#008751]/10">
        <span className="text-2xl font-black tracking-tighter text-white block">OyaPlan</span>
        <p className="text-white/80 text-sm font-medium mt-1">
          You&apos;re helping shape OyaPlan. Thank you.
        </p>
      </div>

      <FeedbackForm areas={areas ?? []} />
    </main>
  );
}
