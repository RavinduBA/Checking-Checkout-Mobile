import { supabase } from '../supabase';

export interface Location {
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

export interface CreateLocationData {
  name: string;
  is_active: boolean;
  tenant_id: string;
  property_type?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateLocationData {
  name?: string;
  is_active?: boolean;
  property_type?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Get all locations for a tenant
export const getLocations = async (tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching locations:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [], error: null };
  } catch (error) {
    console.error('Error in getLocations:', error);
    return { success: false, error: 'An unexpected error occurred', data: [] };
  }
};

// Create a new location
export const createLocation = async (locationData: CreateLocationData) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .insert([locationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error in createLocation:', error);
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
};

// Update a location
export const updateLocation = async (locationId: string, locationData: UpdateLocationData) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .update(locationData)
      .eq('id', locationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error in updateLocation:', error);
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
};

// Delete a location
export const deleteLocation = async (locationId: string) => {
  try {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', locationId);

    if (error) {
      console.error('Error deleting location:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteLocation:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

// Get a single location by ID
export const getLocationById = async (locationId: string) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (error) {
      console.error('Error fetching location:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error in getLocationById:', error);
    return { success: false, error: 'An unexpected error occurred', data: null };
  }
};
