'use client';

import { useState } from 'react';
import { useAuth } from './providers/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase';
import { AnalyticsService } from '@/lib/services/analytics/analyticsService';

export default function AuthModal() {
  const { isModalOpen, closeModal, modalReason, returnToPath } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    AnalyticsService.track('auth_initiated', {
      session_id: '00000000-0000-0000-0000-000000000000',
      properties: {
        category: 'Activation',
        source: 'magic_link',
        path: window.location.pathname,
        version: '1.0'
      }
    });

    const redirectUrl = new URL(window.location.origin + '/api/auth/callback');
    if (returnToPath) {
      redirectUrl.searchParams.set('next', returnToPath);
      const planMatch = returnToPath.match(/\/plan\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      if (planMatch) {
        redirectUrl.searchParams.set('save_plan', planMatch[1]);
      }
    }

    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl.toString(),
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    AnalyticsService.track('auth_initiated', {
      session_id: '00000000-0000-0000-0000-000000000000',
      properties: {
        category: 'Activation',
        source: 'google',
        path: window.location.pathname,
        version: '1.0'
      }
    });

    const redirectUrl = new URL(window.location.origin + '/api/auth/callback');
    if (returnToPath) {
      redirectUrl.searchParams.set('next', returnToPath);
      const planMatch = returnToPath.match(/\/plan\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
      if (planMatch) {
        redirectUrl.searchParams.set('save_plan', planMatch[1]);
      }
    }

    await supabaseBrowser.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString(),
      }
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-[0px_24px_48px_rgba(0,0,0,0.15)] rounded-[28px] p-6 sm:p-8">
        <DialogHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#008751]/10 text-[#008751]">
              ✨ OyaPlan Account
            </span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-[#1A1A1A] text-center tracking-tight">
            {modalReason || "Lock in your plan & save for later"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-[#6B7280] text-center font-medium">
            No passwords to remember. Access your plans anywhere.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-[#008751]/10 text-[#008751] mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base font-bold text-[#1A1A1A]">Check your inbox</p>
            <p className="text-xs text-[#6B7280]">
              We sent a magic link to <strong className="text-[#1A1A1A]">{email}</strong>. Click it to log in instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              className="w-full h-12 rounded-xl border border-gray-200 text-sm font-bold text-[#1A1A1A] hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-white px-3 text-[#6B7280] font-bold">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-3.5">
              <div className="space-y-1.5">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-gray-50 border border-gray-200 focus-visible:border-[#008751] focus-visible:ring-1 focus-visible:ring-[#008751] text-sm text-[#1A1A1A] font-medium px-4"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#008751] hover:bg-[#006b41] text-white font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Instant Magic Link 🚀"}
              </Button>
            </form>

            <div className="pt-2 text-center">
              <span className="text-[11px] font-bold text-[#6B7280]">
                🔒 100% Free • One-tap instant access
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

