import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUserProfile } from './useUserProfile';

export interface Room {
  id: string;
  location_id: string;
  room_number: string;
  room_type: string;
  bed_type: string;
  max_occupancy: number;
  base_price: number;
  currency: string;
  description?: string;
  amenities: string[];
  property_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  // Joined location data
  location?: {
    id: string;
    name: string;
  };
}

export function useRooms(locationId?: string) {
  const { profile } = useUserProfile();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.tenant_id) {
      setRooms([]);
      setLoading(false);
      return;
    }

    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching ALL rooms (active & inactive) for tenant_id:', profile.tenant_id);
        console.log('🔍 LocationId filter:', locationId);

        let query = supabase
          .from('rooms')
          .select(`
            *,
            location:locations!inner(
              id,
              name
            )
          `)
          .eq('tenant_id', profile.tenant_id);

        // Filter by location if provided
        if (locationId) {
          query = query.eq('location_id', locationId);
        }

        console.log('🔍 Executing rooms query...');
        const { data, error } = await query.order('room_number', { ascending: true });

        if (error) {
          console.error('❌ Error fetching rooms:', error);
          setError(error.message);
          return;
        }

        console.log('✅ Rooms fetched successfully:', data?.length || 0, 'rooms');
        console.log('📊 Rooms data:', data);
        setRooms(data || []);
      } catch (err) {
        console.error('Error in fetchRooms:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [profile?.tenant_id, locationId]);

  const createRoom = async (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'tenant_id' | 'location'>) => {
    if (!profile?.tenant_id) {
      console.error('No tenant ID found. Profile:', profile);
      throw new Error('No tenant ID found');
    }

    const dataToInsert = {
      ...roomData,
      tenant_id: profile.tenant_id
    };

    console.log('Creating room with data:', dataToInsert);
    console.log('User profile tenant_id:', profile.tenant_id);

    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([dataToInsert])
        .select(`
          *,
          location:locations!inner(
            id,
            name
          )
        `)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Room created successfully:', data);
      // Update local state
      setRooms(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating room:', err);
      throw err;
    }
  };

  const updateRoom = async (id: string, updates: Partial<Room>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', profile?.tenant_id)
        .select(`
          *,
          location:locations!inner(
            id,
            name
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setRooms(prev => prev.map(room => room.id === id ? data : room));
      return data;
    } catch (err) {
      console.error('Error updating room:', err);
      throw err;
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      // Hard delete - actually remove the record from the database
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id)
        .eq('tenant_id', profile?.tenant_id);

      if (error) {
        throw error;
      }

      console.log('Room deleted successfully from database');
      // Update local state
      setRooms(prev => prev.filter(room => room.id !== id));
    } catch (err) {
      console.error('Error deleting room:', err);
      throw err;
    }
  };

  return {
    rooms,
    loading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    refetch: () => {
      if (profile?.tenant_id) {
        // Re-trigger the effect by updating loading state
        setLoading(true);
      }
    }
  };
}
