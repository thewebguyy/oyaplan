'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';

export async function signInAdmin(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || email.trim().length === 0) {
    redirect('/admin/login?error=invalid_credentials');
  }
  if (typeof password !== 'string' || password.length === 0) {
    redirect('/admin/login?error=invalid_credentials');
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect('/admin/login?error=invalid_credentials');
  }

  redirect('/admin');
}

export async function signOutAdmin() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
