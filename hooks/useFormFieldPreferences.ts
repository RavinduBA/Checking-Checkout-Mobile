import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUserProfile } from "./useUserProfile";

export interface FormFieldPreferences {
  id?: string;
  tenant_id: string;
  show_guest_email?: boolean;
  show_guest_phone?: boolean;
  show_guest_address?: boolean;
  show_guest_nationality?: boolean;
  show_guest_passport_number?: boolean;
  show_guest_id_number?: boolean;
  show_adults?: boolean;
  show_children?: boolean;
  show_arrival_time?: boolean;
  show_special_requests?: boolean;
  show_advance_amount?: boolean;
  show_paid_amount?: boolean;
  show_guide?: boolean;
  show_agent?: boolean;
  show_booking_source?: boolean;
  show_id_photos?: boolean;
  show_guest_signature?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useFormFieldPreferences = () => {
  const [preferences, setPreferences] = useState<FormFieldPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useUserProfile();

  // Fetch preferences for the current tenant
  const fetchPreferences = async () => {
    try {
      if (!profile?.tenant_id) {
        setError("No tenant ID found");
        setLoading(false);
        return;
      }

      console.log("Fetching preferences for tenant:", profile.tenant_id);

      const { data, error: fetchError } = await supabase
        .from("form_field_preferences")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        throw fetchError;
      }

      if (!data) {
        console.log("No preferences found, creating default ones");
        // No preferences found, create default ones
        await createDefaultPreferences();
      } else {
        console.log("Found existing preferences:", data);
        setPreferences(data);
        setError(null); // Clear any previous errors
      }
    } catch (err: any) {
      console.error("Error fetching form field preferences:", err);
      setError(err.message || "Failed to fetch preferences");
    } finally {
      setLoading(false);
    }
  };

  // Create default preferences for the tenant
  const createDefaultPreferences = async () => {
    try {
      if (!profile?.tenant_id) {
        throw new Error("No tenant ID found");
      }

      console.log("Creating default preferences for tenant:", profile.tenant_id);

      const defaultPreferences: Partial<FormFieldPreferences> = {
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

      const { data, error: createError } = await supabase
        .from("form_field_preferences")
        .insert(defaultPreferences)
        .select()
        .single();

      if (createError) {
        console.error("Error creating default preferences:", createError);
        // If it's a duplicate key error, fetch the existing preferences
        if (createError.code === '23505') {
          console.log("Preferences already exist, fetching them...");
          const { data: existingData, error: fetchError } = await supabase
            .from("form_field_preferences")
            .select("*")
            .eq("tenant_id", profile.tenant_id)
            .single();
          
          if (existingData && !fetchError) {
            setPreferences(existingData);
            return;
          }
        }
        throw createError;
      }

      console.log("Default preferences created successfully:", data);
      setPreferences(data);
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error("Error creating default preferences:", err);
      setError(err.message || "Failed to create default preferences");
    }
  };

  // Update specific preferences
  const updatePreferences = async (updates: Partial<FormFieldPreferences>) => {
    try {
      if (!preferences?.id || !profile?.tenant_id) {
        throw new Error("No preferences found to update or missing tenant_id");
      }

      console.log("Updating preferences with:", {
        id: preferences.id,
        tenant_id: profile.tenant_id,
        updates
      });

      // Clean the updates object - remove any undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );

      const { data, error: updateError } = await supabase
        .from("form_field_preferences")
        .update({
          ...cleanUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", preferences.id)
        .eq("tenant_id", profile.tenant_id) // Add tenant_id constraint for security
        .select()
        .single();

      if (updateError) {
        console.error("Database update error:", updateError);
        throw updateError;
      }

      console.log("Update successful, new data:", data);
      setPreferences(data);
      setError(null); // Clear any previous errors
      return data;
    } catch (err: any) {
      console.error("Error updating preferences:", err);
      setError(err.message || "Failed to update preferences");
      throw err;
    }
  };

  // Reset preferences to defaults
  const resetToDefaults = async () => {
    try {
      if (!preferences?.id) {
        throw new Error("No preferences found to reset");
      }

      const defaultUpdates = {
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
        updated_at: new Date().toISOString(),
      };

      const { data, error: resetError } = await supabase
        .from("form_field_preferences")
        .update(defaultUpdates)
        .eq("id", preferences.id)
        .select()
        .single();

      if (resetError) {
        throw resetError;
      }

      setPreferences(data);
      return data;
    } catch (err: any) {
      console.error("Error resetting preferences:", err);
      setError(err.message || "Failed to reset preferences");
      throw err;
    }
  };

  // Load preferences when profile is available
  useEffect(() => {
    if (profile?.tenant_id) {
      fetchPreferences();
    }
  }, [profile?.tenant_id]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetToDefaults,
    refetch: fetchPreferences,
  };
};
