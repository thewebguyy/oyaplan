export function BeforeYouGo() {
  return (
    <div className="w-full mt-8 border border-[#E5E7EB] bg-[#FAFAF8] rounded-[24px] p-6 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-[#E5E7EB] pb-3">
        <h3 className="type-subheading text-[#111827] font-black text-base uppercase tracking-wider flex items-center gap-2">
          <span>🧠</span> Lagos Street Smarts (Before You Step Out)
        </h3>
        <span className="text-[10px] font-black text-[#008751] uppercase tracking-widest bg-[#008751]/10 px-2 py-0.5 rounded">
          Local Guide
        </span>
      </div>
      <ul className="space-y-4">
        <li className="flex items-start gap-3">
          <span className="text-xl leading-none" aria-hidden="true">🌉</span>
          <div className="text-xs sm:text-sm text-[#4B5563] leading-snug">
            <strong className="text-[#111827] font-bold">Bridge &amp; Traffic Corridor:</strong> Crossing Third Mainland or Lekki Toll past 5:30 PM? Add 35–45 mins buffer to your ride time so you don't lose table reservations.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-xl leading-none" aria-hidden="true">💳</span>
          <div className="text-xs sm:text-sm text-[#4B5563] leading-snug">
            <strong className="text-[#111827] font-bold">POS &amp; Transfer Backup:</strong> Card network dips on busy Friday/Saturday nights around 10 PM. Always keep your mobile banking app or instant transfer ready.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-xl leading-none" aria-hidden="true">👟</span>
          <div className="text-xs sm:text-sm text-[#4B5563] leading-snug">
            <strong className="text-[#111827] font-bold">Door Policy:</strong> Covered shoes strictly enforced after 8 PM for guys; bouncers won't bend the rules.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-xl leading-none" aria-hidden="true">⚡</span>
          <div className="text-xs sm:text-sm text-[#4B5563] leading-snug">
            <strong className="text-[#111827] font-bold">Midnight Surge:</strong> Bolt and Uber fares jump 1.3x–1.5x after midnight on the Island. Our estimate accounts for standard peak windows.
          </div>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-xl leading-none" aria-hidden="true">🍽️</span>
          <div className="text-xs sm:text-sm text-[#4B5563] leading-snug">
            <strong className="text-[#111827] font-bold">Last Order:</strong> Kitchen stops taking main food orders ~10:15 PM; afterwards it's small chops and bottle service only.
          </div>
        </li>
      </ul>
    </div>
  );
}
