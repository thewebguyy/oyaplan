export default function VenueCardMockup() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 font-body">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Photo Section (Framed, no bleed, clean edges) */}
        <div className="p-2 pb-0 relative">
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-200">
            {/* We use a placeholder div since we don't have an image asset, but let's style it like a photo */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center" />
            
            {/* Solid, high-contrast flat color blocks floating on the image */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <div className="bg-[#E05C3A] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                Rooftop Lounge
              </div>
            </div>
            
            {/* Combined Trust Status & Freshness Tag (Compliant with ADR-008) */}
            <div className="absolute top-3 right-3">
              <div className="bg-[#008751] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Verified • 2 days ago
              </div>
            </div>
          </div>
        </div>

        {/* Text Section (Massive typography, lots of whitespace) */}
        <div className="pt-8 pb-6 px-6 flex flex-col">
          {/* Magazine headline style typography using the locked token */}
          <h2 className="type-venue-hero text-gray-900 mb-2 uppercase">
            THE<br/>ORCHID<br/>HOUSE
          </h2>
          <p className="text-gray-500 font-medium tracking-tight mt-4 text-sm uppercase">Victoria Island, Lagos</p>
        </div>

        {/* Data Row */}
        <div className="mt-auto border-t border-gray-100 px-6 py-4 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Within budget
            </span>
          </div>
          <div className="text-right">
            <span className="font-sans font-semibold text-gray-900 tracking-tight text-lg">₦45,000</span>
            <span className="text-xs text-gray-400 font-medium ml-1">/ person</span>
          </div>
        </div>
      </div>
    </div>
  );
}
