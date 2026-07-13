import React from "react";

export default function ForgeLoading() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 animate-hold-up">
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        {/* Recommendations Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
          <div className="space-y-4">
            <div className="w-64 h-8 bg-gray-200 rounded animate-none"></div>
            <div className="w-80 h-5 bg-gray-200 rounded animate-none"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-10 bg-gray-200 rounded-[10px] animate-none"></div>
            <div className="w-40 h-11 bg-gray-200 rounded-[10px] animate-none"></div>
          </div>
        </div>

        {/* Empty Receipt Grid Structure (No Shimmer) */}
        <div className="space-y-12">
          {/* Card 1 Skeleton */}
          <div className="w-full bg-[#FAFAFA] border-2 border-black rounded-[8px] overflow-hidden shadow-[0_8px_0_0_#000000]">
            <div className="p-8 border-b-2 border-black">
              <div className="w-32 h-4 bg-gray-200 mx-auto mb-4 animate-none"></div>
              <div className="w-48 h-12 bg-gray-200 mx-auto animate-none"></div>
            </div>
            <div className="flex flex-col font-mono text-sm">
              <div className="flex justify-between p-4 border-b border-black bg-[#F5F5F5]">
                <div className="w-20 h-4 bg-gray-200 animate-none"></div>
                <div className="w-20 h-4 bg-gray-200 animate-none"></div>
              </div>
              <div className="flex justify-between p-4 border-b border-black">
                <div className="w-32 h-4 bg-gray-200 animate-none"></div>
                <div className="w-16 h-4 bg-gray-200 animate-none"></div>
              </div>
              <div className="flex justify-between p-4 border-b border-black">
                <div className="w-24 h-4 bg-gray-200 animate-none"></div>
                <div className="w-16 h-4 bg-gray-200 animate-none"></div>
              </div>
              <div className="flex justify-between p-5 bg-black">
                <div className="w-40 h-4 bg-gray-800 animate-none"></div>
                <div className="w-20 h-6 bg-gray-800 animate-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
