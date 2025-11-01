import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useUserProfile } from "./useUserProfile";
import { useLocationContext } from "../contexts/LocationContext";
import { supabase } from "../lib/supabase";

interface UserPermissions {
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

      try {
        const { data, error } = await supabase
          .from("user_permissions")
          .select("*")
          .eq("user_id", user.id)
          .eq("tenant_id", profile.tenant_id)
          .eq("location_id", selectedLocation)
          .single();

        if (error) throw error;
        setPermissions(data as UserPermissions);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setPermissions(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.id, profile?.tenant_id, selectedLocation]);

  const hasPermission = (permission: keyof UserPermissions) => {
    if (!isAuthenticated || !permissions) return false;
    // Tenant admins have all permissions
    if (profile?.is_tenant_admin) return true;
    return permissions[permission] || false;
  };

  const hasAnyPermission = (permissionsList: (keyof UserPermissions)[]) => {
    return permissionsList.some((perm) => hasPermission(perm));
  };

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    isTenantOwner: profile?.is_tenant_admin || false,
  };
}
