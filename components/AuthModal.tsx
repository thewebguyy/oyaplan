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
      <DialogContent className="sm:max-w-md bg-white border-none shadow-[0px_24px_48px_rgba(0,0,0,0.15)] rounded-[24px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="type-subheading text-text-primary text-center">
            {modalReason || 'Sign in to continue'}
          </DialogTitle>
          <DialogDescription className="type-body text-text-muted text-center">
            Authentication protects your plans and unlocks advanced features like saving and earning Scout reputation.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-4">
            <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-brand-green/10 text-brand-green mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="type-body text-text-primary font-medium">Check your email</p>
            <p className="type-caption text-text-muted">
              We sent a magic link to {email}. Click it to sign in instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              className="w-full h-12 rounded-[12px] border-border-default type-label text-text-primary hover:bg-surface-grey transition-colors flex items-center justify-center gap-3"
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
                <div className="w-full border-t border-border-default"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-text-muted">Or magic link</span>
              </div>
            </div>

            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-[12px] bg-surface-grey border-transparent focus-visible:border-brand-green focus-visible:ring-1 focus-visible:ring-brand-green type-body px-4"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-[12px] bg-brand-green hover:bg-brand-green-70 text-white type-label transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Send Magic Link"}
              </Button>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

