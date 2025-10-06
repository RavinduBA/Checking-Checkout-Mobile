import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';



// This file handles all Supabase authentication logic and returns the state that your context provides.
//useAuth() connects directly to Supabase, tracks authentication changes, and returns:
// the user info,
// the session data,
// whether it’s still loading, and whether the user is logged in.


export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  };
}
