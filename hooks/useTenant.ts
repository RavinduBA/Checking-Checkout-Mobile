import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserProfile } from './useUserProfile';

export interface Tenant {
  id: string;
  name: string;
  owner_profile_id: string;
  trial_ends_at: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export function useTenant() {
  const { profile } = useUserProfile();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.tenant_id) {
      setTenant(null);
      setLoading(false);
      return;
    }

    const fetchTenant = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single();

        if (error) {
          console.error('Error fetching tenant:', error);
          setError(error.message);
          setTenant(null);
        } else {
          setTenant(data);
        }
      } catch (err) {
        console.error('Error in fetchTenant:', err);
        setError('Failed to fetch tenant data');
        setTenant(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [profile?.tenant_id]);

  return {
    tenant,
    loading,
    error,
    isOwner: tenant && profile ? tenant.owner_profile_id === profile.id : false,
  };
}
