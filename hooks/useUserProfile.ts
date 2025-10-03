import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tenant_id: string | null;
  tenant_role: string;
  is_tenant_admin: boolean;
  phone?: string;
  created_at: string;
}

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get the profile normally
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          console.log('Profile found:', data);
          setProfile(data);
          return;
        }

        // If profile doesn't exist, try to create it
        console.log('Profile not found, attempting to create one...', { error: error?.message });
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!.split('@')[0],
            tenant_role: 'tenant_admin',
            is_tenant_admin: false,
            first_login_completed: false,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setError(createError.message);
          return;
        }

        console.log('Profile created successfully:', newProfile);
        setProfile(newProfile);
      } catch (err) {
        console.error('Error in fetchProfile:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  return {
    profile,
    loading: loading || authLoading,
    error,
    tenantId: profile?.tenant_id || null,
    isAuthenticated: !!user && !!profile,
  };
}
