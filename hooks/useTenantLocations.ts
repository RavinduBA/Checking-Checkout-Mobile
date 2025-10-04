import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserProfile } from './useUserProfile';

export interface TenantLocation {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  tenant_id: string;
  property_type?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export function useTenantLocations() {
  const { profile } = useUserProfile();
  const [locations, setLocations] = useState<TenantLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.tenant_id) {
      setLocations([]);
      setLoading(false);
      return;
    }

    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching locations:', error);
          setError(error.message);
          return;
        }

        setLocations(data || []);
      } catch (err) {
        console.error('Error in fetchLocations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [profile?.tenant_id]);

  const createLocation = async (locationData: Omit<TenantLocation, 'id' | 'created_at' | 'tenant_id'>) => {
    if (!profile?.tenant_id) {
      throw new Error('No tenant ID found');
    }

    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          ...locationData,
          tenant_id: profile.tenant_id
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setLocations(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating location:', err);
      throw err;
    }
  };

  const updateLocation = async (id: string, updates: Partial<TenantLocation>) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', profile?.tenant_id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setLocations(prev => prev.map(loc => loc.id === id ? data : loc));
      return data;
    } catch (err) {
      console.error('Error updating location:', err);
      throw err;
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('locations')
        .update({ is_active: false })
        .eq('id', id)
        .eq('tenant_id', profile?.tenant_id);

      if (error) {
        throw error;
      }

      // Update local state
      setLocations(prev => prev.filter(loc => loc.id !== id));
    } catch (err) {
      console.error('Error deleting location:', err);
      throw err;
    }
  };

  return {
    locations,
    loading,
    error,
    createLocation,
    updateLocation,
    deleteLocation,
    refetch: () => {
      if (profile?.tenant_id) {
        // Re-trigger the effect by updating a dependency
        setLoading(true);
      }
    }
  };
}
