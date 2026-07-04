'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  isModalOpen: boolean;
  openModal: (reason?: string, returnTo?: string) => void;
  closeModal: () => void;
  modalReason: string | null;
  returnToPath: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<string | null>(null);
  const [returnToPath, setReturnToPath] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
      
      // Auto-close modal if they just signed in
      if (session && isModalOpen) {
        setIsModalOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isModalOpen]);

  const openModal = (reason?: string, returnTo?: string) => {
    setModalReason(reason || 'Sign in to continue');
    setReturnToPath(returnTo || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalReason(null);
    setReturnToPath(null);
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isModalOpen,
        openModal,
        closeModal,
        modalReason,
        returnToPath,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
