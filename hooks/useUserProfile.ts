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
  first_login_completed: boolean;
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

        // If profile doesn't exist, handle different scenarios
        console.log('Profile not found, checking authentication status...', { error: error?.message });
        
        // Check if user is properly authenticated
        if (!user || !user.id || !user.email) {
          console.error('Invalid user data:', user);
          setError('Authentication data is incomplete');
          return;
        }

        // Check if this is a foreign key constraint error (user not in auth.users)
        if (error?.code === 'PGRST116') {
          // This is normal - just means no profile exists yet
          console.log('No profile exists, will try to create one');
        } else if (error?.message?.includes('Cannot coerce')) {
          // This usually means there are multiple rows or other query issues
          console.log('Query result issue, will try to create profile anyway');
        }

        try {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
              tenant_role: 'tenant_staff',
              is_tenant_admin: false,
              first_login_completed: false,
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            
            // If it's a foreign key constraint error, the user needs to be properly registered
            if (createError.code === '23503') {
              console.log('User not found in auth.users - authentication may not be properly synced with Supabase');
              setProfile(null);
              setError('Authentication error. Please try registering again or contact support.');
              return;
            } 
            // If profile already exists (duplicate key), try to fetch it again
            else if (createError.code === '23505') {
              console.log('Profile already exists, trying to fetch it again...');
              const { data: existingProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
              
              if (existingProfile && !fetchError) {
                console.log('Found existing profile:', existingProfile);
                setProfile(existingProfile);
                return;
              }
            }
            
            setError(createError.message);
            return;
          }

          console.log('Profile created successfully:', newProfile);
          setProfile(newProfile);
        } catch (profileCreateError) {
          console.error('Unexpected error creating profile:', profileCreateError);
          setError('Unable to create user profile. Please try logging out and back in.');
        }
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
