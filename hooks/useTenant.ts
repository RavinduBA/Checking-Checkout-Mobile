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

  // Additional computed properties for compatibility with web app
  const hasActiveTrial = tenant?.trial_ends_at 
    ? new Date(tenant.trial_ends_at) > new Date() 
    : false;

  // For mobile app, we'll assume all users have active subscriptions for now
  const hasActiveSubscription = true;

  const canAccessFeature = (feature: string) => {
    // If no tenant, no access
    if (!tenant) return false;

    // Always allow access during trial
    if (hasActiveTrial) return true;

    // For mobile app, allow all features for active subscriptions
    if (hasActiveSubscription) return true;

    // No access without trial or subscription
    return false;
  };

  const isTrialExpired = tenant?.trial_ends_at
    ? new Date(tenant.trial_ends_at) <= new Date()
    : false;

  const trialDaysLeft = tenant?.trial_ends_at
    ? Math.max(
        0,
        Math.ceil(
          (new Date(tenant.trial_ends_at).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  const needsSubscription = !hasActiveTrial && !hasActiveSubscription;

  return {
    tenant,
    loading,
    error,
    isOwner: tenant && profile ? tenant.owner_profile_id === profile.id : false,
    hasActiveTrial,
    hasActiveSubscription,
    canAccessFeature,
    isTrialExpired,
    trialDaysLeft,
    needsSubscription,
    subscription: null, // Mobile app doesn't have subscription data yet
    tenantLoading: loading,
    refreshTenant: () => {
      // Re-fetch tenant data
      if (profile?.tenant_id) {
        const fetchTenant = async () => {
          try {
            const { data, error } = await supabase
              .from('tenants')
              .select('*')
              .eq('id', profile.tenant_id)
              .single();

            if (error) {
              console.error('Error refreshing tenant:', error);
              setError(error.message);
              setTenant(null);
            } else {
              setTenant(data);
            }
          } catch (err) {
            console.error('Error in refreshTenant:', err);
            setError('Failed to refresh tenant data');
            setTenant(null);
          }
        };

        fetchTenant();
      }
    },
  };
}
