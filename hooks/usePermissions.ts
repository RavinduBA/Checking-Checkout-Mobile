import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useLocationContext } from "../contexts/LocationContext";
import { supabase } from "../lib/supabase";
import { useUserProfile } from "./useUserProfile";

export interface UserPermissions {
  access_dashboard: boolean;
  access_income: boolean;
  access_expenses: boolean;
  access_reports: boolean;
  access_calendar: boolean;
  access_bookings: boolean;
  access_rooms: boolean;
  access_master_files: boolean;
  access_accounts: boolean;
  access_users: boolean;
  access_settings: boolean;
  access_booking_channels: boolean;
}

export function usePermissions() {
  const { user, isAuthenticated } = useAuthContext();
  const { profile } = useUserProfile();
  const { selectedLocation } = useLocationContext();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user?.id || !profile?.tenant_id || !selectedLocation) {
        setPermissions(null);
        setLoading(false);
        return;
      }

      // Only set loading to true if we don't have any permissions yet
      // This prevents the loading flash when switching locations
      if (!permissions) {
        setLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from("user_permissions")
          .select("*")
          .eq("user_id", user.id)
          .eq("tenant_id", profile.tenant_id)
          .eq("location_id", selectedLocation)
          .single();

        // PGRST116 = no rows returned (user has no permissions yet)
        if (error && error.code !== "PGRST116") {
          console.error("Error fetching permissions:", error);
          setPermissions(null);
        } else {
          setPermissions(data as UserPermissions);
        }
      } catch (error: any) {
        console.error("Exception fetching permissions:", error);
        setPermissions(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.id, profile?.tenant_id, selectedLocation]);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!isAuthenticated || !permissions) return false;
    // Tenant admins have all permissions
    if (profile?.is_tenant_admin) return true;
    return permissions[permission] || false;
  };

  const hasAnyPermission = (
    permissionsList?:
      | (keyof UserPermissions)[]
      | keyof UserPermissions
  ): boolean => {
    // Handle undefined or null
    if (!permissionsList) return false;
    
    // Handle single permission string
    if (typeof permissionsList === "string") {
      return hasPermission(permissionsList);
    }
    
    // Handle array of permissions
    if (Array.isArray(permissionsList)) {
      return permissionsList.some((perm) => hasPermission(perm));
    }
    
    return false;
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    isTenantOwner: profile?.is_tenant_admin || false,
  };
}
