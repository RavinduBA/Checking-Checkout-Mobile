import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserProfile } from './useUserProfile';

export interface Guide {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  commission_rate: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  address?: string;
  license_number?: string;
}

export function useGuides() {
  const { profile } = useUserProfile();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.tenant_id) {
      setGuides([]);
      setLoading(false);
      return;
    }

    const fetchGuides = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching guides for tenant_id:', profile.tenant_id);

        const { data, error } = await supabase
          .from('guides')
          .select('*')
          .eq('tenant_id', profile.tenant_id)
          .order('name', { ascending: true });

        if (error) {
          console.error('❌ Error fetching guides:', error);
          setError(error.message);
          return;
        }

        console.log('✅ Guides fetched successfully:', data?.length || 0, 'guides');
        setGuides(data || []);
      } catch (err) {
        console.error('Error in fetchGuides:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, [profile?.tenant_id]);

  const createGuide = async (guideData: Omit<Guide, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>) => {
    if (!profile?.tenant_id) {
      console.error('No tenant ID found. Profile:', profile);
      throw new Error('No tenant ID found');
    }

    // Convert undefined values to null for database compatibility
    const dataToInsert = {
      name: guideData.name,
      phone: guideData.phone || null,
      email: guideData.email || null,
      commission_rate: guideData.commission_rate,
      is_active: guideData.is_active,
      notes: guideData.notes || null,
      address: guideData.address || null,
      license_number: guideData.license_number || null,
      tenant_id: profile.tenant_id
    };

    console.log('Creating guide with data:', dataToInsert);

    try {
      const { data, error } = await supabase
        .from('guides')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Guide created successfully:', data);
      // Update local state
      setGuides(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating guide:', err);
      throw err;
    }
  };

  const updateGuide = async (id: string, updates: Partial<Guide>) => {
    try {
      // Convert undefined values to null for database compatibility
      const updatesToApply = Object.keys(updates).reduce((acc, key) => {
        const value = updates[key as keyof Guide];
        acc[key as keyof Guide] = (value === undefined ? null : value) as any;
        return acc;
      }, {} as Partial<Guide>);

      const { data, error } = await supabase
        .from('guides')
        .update({
          ...updatesToApply,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', profile?.tenant_id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Guide updated successfully:', data);
      // Update local state
      setGuides(prev => prev.map(guide => guide.id === id ? data : guide));
      return data;
    } catch (err) {
      console.error('Error updating guide:', err);
      throw err;
    }
  };

  const deleteGuide = async (id: string) => {
    try {
      // Hard delete - actually remove the record from the database
      const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', id)
        .eq('tenant_id', profile?.tenant_id);

      if (error) {
        throw error;
      }

      console.log('Guide deleted successfully from database');
      // Update local state
      setGuides(prev => prev.filter(guide => guide.id !== id));
    } catch (err) {
      console.error('Error deleting guide:', err);
      throw err;
    }
  };

  return {
    guides,
    loading,
    error,
    createGuide,
    updateGuide,
    deleteGuide,
    refetch: () => {
      if (profile?.tenant_id) {
        setLoading(true);
      }
    }
  };
}
