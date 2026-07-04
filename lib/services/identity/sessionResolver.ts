import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export interface UserProfile {
  id: string;
  role: 'planner' | 'scout' | 'venue_operator' | 'admin';
  display_name?: string;
}

export type IdentityState = 
  | { type: 'anonymous'; sessionId: string; profile: null }
  | { type: 'authenticated'; sessionId: string; profile: UserProfile };

export class SessionResolver {
  /**
   * The canonical platform primitive for resolving identity.
   * NO service should manually read cookies or JWTs. They must call this.
   */
  static async resolveIdentity(): Promise<IdentityState> {
    const cookieStore = await cookies();
    
    // 1. Always attempt to extract the underlying anonymous session.
    // If it doesn't exist, generate a deterministic fallback (though middleware should have set it).
    let sessionId = cookieStore.get('oya_session_id')?.value;
    if (!sessionId) {
      sessionId = crypto.randomUUID();
    }

    // 2. Instantiate Supabase strictly for reading the auth state
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() { /* SessionResolver is read-only. Mutations happen in middleware */ }
      }
    });

    const { data: { user } } = await supabase.auth.getUser();

    // 3. Fallback to Anonymous
    if (!user) {
      return {
        type: 'anonymous',
        sessionId,
        profile: null
      };
    }

    // 4. Resolve Authenticated Profile
    // We fetch the profile directly to enforce RBAC downstream.
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, display_name')
      .eq('id', user.id)
      .single();

    return {
      type: 'authenticated',
      sessionId,
      profile: {
        id: user.id,
        role: profile?.role || 'planner',
        display_name: profile?.display_name
      }
    };
  }
}
