import { signInAdmin } from '@/lib/actions/adminAuth';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Subtle cartographic coordinate background markers */}
      <div className="absolute top-4 left-6 hidden sm:flex items-center gap-2 text-[10px] font-mono font-bold text-[#111111]/40 uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-[#008751]" />
        <span>LAGOS OPERATIONAL SECTOR // GRID: 06°27&apos;11&quot;N 03°23&apos;45&quot;E</span>
      </div>

      <div className="absolute top-4 right-6 hidden sm:flex items-center gap-2 text-[10px] font-mono font-bold text-[#111111]/40 uppercase tracking-widest">
        <span>GATEWAY: ADMIN-AUTH-V1</span>
      </div>

      {/* Cartographic Terminal Container */}
      <div className="w-full max-w-sm bg-white border-2 border-[#111111] rounded-lg shadow-[6px_6px_0px_#111111] overflow-hidden">
        {/* Terminal Titlebar */}
        <div className="px-5 py-3 bg-[#010528] text-white flex items-center justify-between border-b-2 border-[#111111]">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-[#008751] text-white flex items-center justify-center font-mono font-black text-[10px] border border-white/20">
              OP
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
              CONTROL TERMINAL
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#008751] animate-pulse" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#F6C642]">
              ONLINE
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="font-display font-black text-2xl text-[#111111] tracking-tight">
              OyaPlan Admin
            </h1>
            <p className="font-mono text-xs text-[#111111]/60 mt-1">
              Sign in to continue
            </p>
          </div>

          {error === 'invalid_credentials' && (
            <div className="p-3 bg-red-50 border-2 border-[#D72638] rounded text-xs font-mono font-bold text-[#D72638] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Incorrect email or password.</span>
            </div>
          )}

          <form action={signInAdmin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F8] border-2 border-[#111111]/20 rounded font-mono text-sm text-[#111111] placeholder:text-[#111111]/30 focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#111111]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F8] border-2 border-[#111111]/20 rounded font-mono text-sm text-[#111111] placeholder:text-[#111111]/30 focus:outline-none focus:border-[#008751] focus:ring-2 focus:ring-[#008751]/20 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#008751] text-white text-xs font-mono font-black uppercase tracking-wider rounded border border-[#006e42] shadow-[3px_3px_0px_#111111] hover:bg-[#007345] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#008751] cursor-pointer"
            >
              Sign in
            </button>
          </form>
        </div>

        {/* Terminal Footer */}
        <div className="border-t border-[#111111]/10 bg-[#FAF8F8] px-6 py-2.5 text-center">
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-[#111111]/50">
            SECURE TERMINAL // AUTHORIZED ACCESS ONLY
          </span>
        </div>
      </div>

      {/* Bottom coordinate tag */}
      <div className="mt-8 text-center hidden sm:block">
        <span className="font-mono text-[10px] text-[#111111]/40 uppercase tracking-widest">
          OYAPLAN ADMINISTRATIVE LEDGER SYSTEM • EPSILON-LAGOS
        </span>
      </div>
    </main>
  );
}
