import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTenant } from './useTenant';

interface Location {
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

export function useLocations() {
  const { tenant } = useTenant();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant?.id) {
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
          .eq('tenant_id', tenant.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setLocations(data || []);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [tenant?.id]);

  return {
    locations,
    loading,
    error,
  };
}
