import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

// Define the FormFieldPreferences type based on your database schema
export interface FormFieldPreferences {
  id?: string;
  tenant_id: string;
  show_guest_email: boolean;
  show_guest_phone: boolean;
  show_guest_address: boolean;
  show_guest_nationality: boolean;
  show_guest_passport_number: boolean;
  show_guest_id_number: boolean;
  show_adults: boolean;
  show_children: boolean;
  show_arrival_time: boolean;
  show_special_requests: boolean;
  show_advance_amount: boolean;
  show_paid_amount: boolean;
  show_guide: boolean;
  show_agent: boolean;
  show_booking_source: boolean;
  show_id_photos: boolean;
  show_guest_signature: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useFormFieldPreferences() {
  // For now, we'll skip the database call since we don't have proper tenant context
  // This should be replaced with actual tenant context when authentication is fully implemented
  const tenantId = null; // Will be set to actual tenant ID when auth is ready
  
  const [preferences, setPreferences] = useState<FormFieldPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!tenantId) {
      // Return default preferences without database call for now
      const defaultPreferences: FormFieldPreferences = {
        tenant_id: 'temp-tenant',
        show_guest_email: true,
        show_guest_phone: true,
        show_guest_address: true,
        show_guest_nationality: true,
        show_guest_passport_number: true,
        show_guest_id_number: false,
        show_adults: true,
        show_children: true,
        show_arrival_time: false,
        show_special_requests: true,
        show_advance_amount: true,
        show_paid_amount: true,
        show_guide: true,
        show_agent: true,
        show_booking_source: false,
        show_id_photos: false,
        show_guest_signature: false,
      };
      setPreferences(defaultPreferences);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_field_preferences')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if none exist
        const defaultPreferences: Omit<FormFieldPreferences, 'id' | 'created_at' | 'updated_at'> = {
          tenant_id: tenantId,
          show_guest_email: true,
          show_guest_phone: true,
          show_guest_address: true,
          show_guest_nationality: true,
          show_guest_passport_number: true,
          show_guest_id_number: false,
          show_adults: true,
          show_children: true,
          show_arrival_time: false,
          show_special_requests: true,
          show_advance_amount: true,
          show_paid_amount: true,
          show_guide: true,
          show_agent: true,
          show_booking_source: false,
          show_id_photos: false,
          show_guest_signature: false,
        };

        const { data: newData, error: insertError } = await supabase
          .from('form_field_preferences')
          .insert(defaultPreferences)
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newData);
      }
    } catch (error: any) {
      console.error('Error fetching form field preferences:', error);
      Alert.alert(
        'Error',
        'Failed to load form preferences. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const updatePreferences = async (updates: Partial<FormFieldPreferences>) => {
    if (!tenantId || !preferences) {
      // For now, just update the local state without database call
      if (preferences) {
        setPreferences({ ...preferences, ...updates });
        Alert.alert(
          'Success',
          'Form preferences updated locally (demo mode)',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('form_field_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      Alert.alert(
        'Success',
        'Form preferences updated successfully',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error updating form field preferences:', error);
      Alert.alert(
        'Error',
        'Failed to update form preferences. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
