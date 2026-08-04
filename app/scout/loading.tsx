export default function ScoutLoading() {
  return (
    <main className="min-h-[100dvh] bg-[#FAFAF8] antialiased pb-24">
      {/* Top Nav Header */}
      <div className="w-full bg-white border-b border-border-default py-4 px-6 flex items-center justify-between">
        <div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="w-28 h-6 bg-emerald-100 rounded-full animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-6">
        {/* Profile Card Skeleton */}
        <div className="bg-white border border-border-default/60 rounded-[28px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 shrink-0" />
            <div className="space-y-2">
              <div className="w-36 h-5 bg-gray-200 rounded" />
              <div className="w-28 h-3.5 bg-gray-150 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-border-default/50 pt-4 md:pt-0 md:pl-8">
            <div className="text-center space-y-1">
              <div className="w-12 h-3 bg-gray-150 rounded mx-auto" />
              <div className="w-8 h-6 bg-gray-200 rounded mx-auto" />
            </div>
            <div className="text-center space-y-1">
              <div className="w-12 h-3 bg-gray-150 rounded mx-auto" />
              <div className="w-16 h-6 bg-emerald-200 rounded mx-auto" />
            </div>
            <div className="text-center space-y-1">
              <div className="w-12 h-3 bg-gray-150 rounded mx-auto" />
              <div className="w-8 h-6 bg-gray-200 rounded mx-auto" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Task List Skeleton */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-36 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-4 bg-gray-150 rounded animate-pulse" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-border-default/60 rounded-2xl p-5 space-y-3 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="w-20 h-3 bg-emerald-100 rounded" />
                      <div className="w-40 h-5 bg-gray-200 rounded" />
                      <div className="w-56 h-3 bg-gray-150 rounded" />
                    </div>
                    <div className="w-24 h-8 bg-gray-100 rounded-lg" />
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <div className="flex-1 h-10 bg-emerald-200/60 rounded-xl" />
                    <div className="w-28 h-10 bg-gray-100 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeletons */}
          <div className="space-y-6">
            <div className="bg-white border border-border-default/60 rounded-[24px] p-5 space-y-3 animate-pulse">
              <div className="w-32 h-4 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
            <div className="bg-white border border-border-default/60 rounded-[24px] p-5 space-y-3 animate-pulse">
              <div className="w-32 h-4 bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-100 rounded" />
                <div className="h-6 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
