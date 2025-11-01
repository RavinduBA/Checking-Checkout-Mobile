import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useLocationContext } from "../contexts/LocationContext";
import { supabase } from "../lib/supabase";
import { useUserProfile } from "./useUserProfile";

export interface User {
  id: string;
  name: string;
  email: string;
  is_tenant_admin: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  phone: string | null;
  avatar_url: string | null;
  tenant_role: string;
  permissions: Record<string, any>;
  location_count: number;
  total_permissions: number;
}

export function useUsersData() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserProfile();
  const { selectedLocation } = useLocationContext();

  const fetchUsers = useCallback(async () => {
    if (!profile?.tenant_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch users with enhanced profile information
      const { data: tenantPermissions, error: permissionsError } =
        await supabase
          .from("user_permissions")
          .select(`
            user_id,
            location_id,
            access_dashboard,
            access_income,
            access_expenses,
            access_reports,
            access_calendar,
            access_bookings,
            access_rooms,
            access_master_files,
            access_accounts,
            access_users,
            access_settings,
            access_booking_channels,
            tenant_role,
            profiles!inner(
              id, 
              name, 
              email, 
              tenant_id, 
              is_tenant_admin, 
              created_at,
              last_sign_in_at,
              phone,
              avatar_url
            ),
            locations!inner(id, name, is_active)
          `)
          .eq("tenant_id", profile.tenant_id)
          .eq("locations.is_active", true);

      if (permissionsError) throw permissionsError;

      // Group permissions by user and calculate additional metrics
      const userPermissionsMap = new Map<string, any>();

      (tenantPermissions || []).forEach((perm: any) => {
        const userId = perm.user_id;
        const profileData = perm.profiles;
        const location = perm.locations;

        // If a specific location is selected, only show users with access to that location
        if (selectedLocation && location.id !== selectedLocation) {
          return;
        }

        if (!userPermissionsMap.has(userId)) {
          userPermissionsMap.set(userId, {
            ...profileData,
            permissions: {},
            is_tenant_admin: profileData.is_tenant_admin || false,
            tenant_role: perm.tenant_role,
            location_count: 0,
            total_permissions: 0,
          });
        }

        const userRecord = userPermissionsMap.get(userId);
        userRecord.location_count += 1;

        // Count active permissions
        const permissionCount = [
          perm.access_dashboard,
          perm.access_income,
          perm.access_expenses,
          perm.access_reports,
          perm.access_calendar,
          perm.access_bookings,
          perm.access_rooms,
          perm.access_master_files,
          perm.access_accounts,
          perm.access_users,
          perm.access_settings,
          perm.access_booking_channels,
        ].filter(Boolean).length;

        userRecord.total_permissions = Math.max(
          userRecord.total_permissions,
          permissionCount
        );

        userRecord.permissions[location.name] = {
          dashboard: perm.access_dashboard || false,
          income: perm.access_income || false,
          expenses: perm.access_expenses || false,
          reports: perm.access_reports || false,
          calendar: perm.access_calendar || false,
          bookings: perm.access_bookings || false,
          rooms: perm.access_rooms || false,
          master_files: perm.access_master_files || false,
          accounts: perm.access_accounts || false,
          users: perm.access_users || false,
          settings: perm.access_settings || false,
          booking_channels: perm.access_booking_channels || false,
        };
      });

      const usersWithPermissions = Array.from(userPermissionsMap.values());
      setUsers(usersWithPermissions);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [profile?.tenant_id, selectedLocation]);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = useCallback(
    async (userId: string) => {
      if (!profile?.tenant_id) return false;

      try {
        const { error } = await supabase
          .from("user_permissions")
          .delete()
          .eq("user_id", userId)
          .eq("tenant_id", profile.tenant_id);

        if (error) throw error;

        await refetch();
        Alert.alert("Success", "User access has been removed successfully.");
        return true;
      } catch (error: any) {
        console.error("Error removing user:", error);
        Alert.alert("Error", error.message || "Failed to remove user");
        return false;
      }
    },
    [profile?.tenant_id, refetch]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, refetch, deleteUser };
}
