'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './providers/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, CheckCircle2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics/trackClient';
import { sanitizeReturnTo } from '@/lib/utils/returnTo';

export default function AuthModal() {
  const { isModalOpen, closeModal, modalReason, returnToPath } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeReturnTo = sanitizeReturnTo(returnToPath, '/');

  const buildCallbackUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://oyaplan.com';
    const redirectUrl = new URL(`${origin}/api/auth/callback`);
    if (safeReturnTo && safeReturnTo !== '/') {
      redirectUrl.searchParams.set('next', safeReturnTo);
      const planMatch = safeReturnTo.match(/\/plan\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      if (planMatch) {
        redirectUrl.searchParams.set('save_plan', planMatch[1]);
      }
    }
    return redirectUrl.toString();
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    trackEvent('auth_initiated', {
      category: 'Activation',
      source: 'modal_magic_link',
      path: window.location.pathname,
      version: '1.0'
    });

    const redirectUrl = buildCallbackUrl();

    const { error: signInError } = await supabaseBrowser.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirectUrl,
      }
    });

    if (signInError) {
      setError(signInError.message || 'Unable to send link. Please try again.');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);

    trackEvent('auth_initiated', {
      category: 'Activation',
      source: 'modal_google',
      path: window.location.pathname,
      version: '1.0'
    });

    const redirectUrl = buildCallbackUrl();

    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      }
    });
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setEmail('');
    closeModal();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white border-3 border-[#111111] shadow-[8px_8px_0px_0px_#111111] rounded-3xl p-6 sm:p-8 max-h-[90dvh] overflow-y-auto font-sans selection:bg-[#F9E828] selection:text-[#111111]">
        <DialogHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[#F9E828] text-[#111111] border border-[#111111] shadow-[2px_2px_0px_0px_#111111]">
              <Sparkles className="w-3.5 h-3.5 fill-[#111111]" />
              <span>ENTER THE SOFT LIFE 🌴</span>
            </span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black font-display text-[#111111] uppercase tracking-tight text-center">
            {modalReason || "Run Your Plan & Lock It In"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#555555] text-center font-medium leading-relaxed">
            Drop your email so we can lock in your saved outing plans and squad math. Zero spam, zero surprise billing.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="inline-flex w-16 h-16 items-center justify-center rounded-2xl bg-[#008751] text-white border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-black text-[#111111] font-display uppercase tracking-tight">Check your inbox!</p>
              <p className="text-xs sm:text-sm text-[#555555] font-medium">
                We sent a secure magic link to <strong className="text-[#111111]">{email}</strong>. Click it to log in instantly.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="mt-2 rounded-2xl border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] text-xs font-black uppercase tracking-wider bg-[#F9E828] hover:bg-[#ffe710] text-[#111111] cursor-pointer"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              className="w-full h-12 rounded-2xl border-2 border-[#111111] text-xs font-black uppercase tracking-wider text-[#111111] hover:bg-[#F6F6F2] transition-all flex items-center justify-center gap-3 shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#008751]" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[#111111]/20" />
              </div>
              <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-wider font-bold">
                <span className="bg-white px-3 text-[#777777]">or use your email</span>
              </div>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-3.5">
              <div className="space-y-1.5">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-2xl bg-[#F6F6F2] border-2 border-[#111111] focus-visible:border-[#008751] focus-visible:ring-0 text-xs sm:text-sm text-[#111111] font-medium px-4"
                  required
                />
              </div>
              {error && <p className="text-red-600 text-xs font-bold text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full h-12 rounded-2xl bg-[#F9E828] hover:bg-[#ffe710] text-[#111111] font-display font-black text-xs uppercase tracking-wider border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#111111]" /> : (
                  <>
                    <span>Send Instant Magic Link</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono font-bold text-[#777777] border-t border-[#111111]/15 gap-2">
              <span className="flex items-center gap-1 text-[#008751]">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Free • No password needed
              </span>
              <Link
                href={`/login${safeReturnTo !== '/' ? `?returnTo=${encodeURIComponent(safeReturnTo)}` : ''}`}
                onClick={handleClose}
                className="hover:text-[#111111] underline font-bold transition-colors"
              >
                Full sign-in screen →
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
