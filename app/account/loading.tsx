export default function AccountLoading() {
  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] pb-24">
      {/* Header Skeleton */}
      <div className="w-full bg-[#008751] rounded-b-[24px] pt-16 pb-12 px-6 flex flex-col items-center text-center animate-pulse">
        <div className="w-20 h-20 bg-white/20 rounded-full mb-3" />
        <div className="w-32 h-6 bg-white/30 rounded-lg mb-2" />
        <div className="w-40 h-4 bg-white/20 rounded-md mb-4" />
        <div className="w-24 h-5 bg-white/25 rounded-full" />
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 -mt-4 space-y-6">
        {/* Subtitle Skeleton */}
        <div className="pt-6 pb-2 text-center flex flex-col items-center gap-2">
          <div className="w-48 h-5 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Stats Strip Skeleton */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#E5E7EB] grid grid-cols-4 gap-2 animate-pulse">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-6 bg-gray-200 rounded" />
            <div className="w-12 h-3 bg-gray-150 rounded" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-6 bg-gray-200 rounded" />
            <div className="w-12 h-3 bg-gray-150 rounded" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-6 bg-gray-200 rounded" />
            <div className="w-12 h-3 bg-gray-150 rounded" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-6 bg-gray-200 rounded" />
            <div className="w-12 h-3 bg-gray-150 rounded" />
          </div>
        </div>

        {/* Action Cards Skeletons */}
        <div className="space-y-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[20px] p-5 border border-[#E5E7EB] flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
                <div className="space-y-2">
                  <div className="w-28 h-4 bg-gray-200 rounded" />
                  <div className="w-36 h-3 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="w-5 h-5 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>

        {/* Ticket Skeleton */}
        <div className="bg-[#FFF9C4]/60 rounded-[24px] p-6 space-y-4 border border-amber-200/50 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-200/60 shrink-0" />
            <div className="space-y-1.5">
              <div className="w-28 h-4 bg-amber-300/50 rounded" />
              <div className="w-40 h-3 bg-amber-200/60 rounded" />
            </div>
          </div>
          <div className="h-12 bg-white/80 rounded-xl" />
          <div className="h-12 bg-[#008751]/30 rounded-xl" />
        </div>
      </div>
    </main>
  );
}
