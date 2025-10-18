import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUserProfile } from "./useUserProfile";

export interface FormFieldPreferences {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export function useFormFieldPreferences() {
  const { profile } = useUserProfile();
  const [preferences, setPreferences] = useState<FormFieldPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!profile?.tenant_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("form_field_preferences")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences if none exist
        const defaultPreferences = {
          tenant_id: profile.tenant_id,
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
          .from("form_field_preferences")
          .insert(defaultPreferences)
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newData);
      }
    } catch (error) {
      console.error("Error fetching form field preferences:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.tenant_id]);

  const updatePreferences = async (updates: Partial<FormFieldPreferences>) => {
    if (!profile?.tenant_id || !preferences) return;

    try {
      const { data, error } = await supabase
        .from("form_field_preferences")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("tenant_id", profile.tenant_id)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
    } catch (error) {
      console.error("Error updating form field preferences:", error);
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
