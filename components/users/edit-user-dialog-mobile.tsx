import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Location, User, UserPermissions } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User | null;
  locations: Location[];
  tenant: { id: string } | null;
  onEditSuccess: () => void;
}

export default function EditUserDialogMobile({
  open,
  onOpenChange,
  user,
  locations,
  tenant,
  onEditSuccess,
}: Props) {
  const { hasPermission } = usePermissions();
  const [editingUser, setEditingUser] = useState<User | null>(user);

  useEffect(() => {
    setEditingUser(user ? { ...user } : null);
  }, [user]);

  const updateEditUserPermission = (
    locationName: string,
    permissionKey: string,
    value: boolean
  ) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      permissions: {
        ...editingUser.permissions,
        [locationName]: {
          ...editingUser.permissions?.[locationName],
          [permissionKey]: value,
        },
      },
    });
  };

  const handleSave = async () => {
    if (!editingUser || !tenant?.id) return;
    if (!hasPermission("access_users")) {
      Alert.alert("Error", "You don't have permission to edit users");
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name: editingUser.name })
        .eq("id", editingUser.id);
      if (profileError) throw profileError;

      for (const [locationName, permissions] of Object.entries(
        editingUser.permissions || {}
      ) as [string, UserPermissions][]) {
        const location = locations.find((l) => l.name === locationName);
        if (!location) continue;
        const { error: permissionError } = await supabase
          .from("user_permissions")
          .update({
            access_dashboard: (permissions as any).dashboard || false,
            access_income: (permissions as any).income || false,
            access_expenses: (permissions as any).expenses || false,
            access_reports: (permissions as any).reports || false,
            access_calendar: (permissions as any).calendar || false,
            access_bookings: (permissions as any).bookings || false,
            access_rooms: (permissions as any).rooms || false,
            access_master_files: (permissions as any).master_files || false,
            access_accounts: (permissions as any).accounts || false,
            access_users: (permissions as any).users || false,
            access_settings: (permissions as any).settings || false,
            access_booking_channels:
              (permissions as any).booking_channels || false,
          })
          .eq("user_id", editingUser.id)
          .eq("location_id", location.id)
          .eq("tenant_id", tenant.id);
        if (permissionError) throw permissionError;
      }

      onOpenChange(false);
      setEditingUser(null);
      onEditSuccess();
      Alert.alert("User Updated", `${editingUser.name}'s permissions updated`);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to update user");
    }
  };

  if (!open) return null;

  return (
    <View className="flex-1 bg-black/40 justify-center items-center p-4">
      <View className="bg-white w-full max-h-[90%] rounded-lg p-4">
        <Text className="text-lg font-semibold mb-2">
          Edit User Permissions
        </Text>
        {editingUser && (
          <ScrollView>
            <View className="mb-3">
              <Text className="text-sm">Full Name</Text>
              <TextInput
                value={editingUser.name}
                onChangeText={(t) =>
                  setEditingUser({ ...editingUser, name: t })
                }
                className="border rounded px-2 py-2 mt-1"
              />
            </View>

            <View>
              <Text className="text-base font-semibold mb-2">
                Location Permissions
              </Text>
              {locations.map((location) => (
                <View key={location.id} className="mb-3 border rounded p-3">
                  <Text className="font-medium mb-2">{location.name}</Text>
                  <View className="flex-row flex-wrap">
                    {[
                      ["dashboard", "Dashboard"],
                      ["income", "Income"],
                      ["expenses", "Expenses"],
                      ["reports", "Reports"],
                      ["calendar", "Calendar"],
                      ["bookings", "Bookings"],
                      ["rooms", "Rooms"],
                      ["master_files", "Master Files"],
                      ["accounts", "Accounts"],
                      ["users", "Users"],
                      ["settings", "Settings"],
                      ["booking_channels", "Booking Channels"],
                    ].map(([key, label]) => (
                      <View
                        key={String(key)}
                        className="flex-row items-center justify-between w-1/2 mb-2"
                      >
                        <Text>{label}</Text>
                        <Switch
                          value={
                            editingUser.permissions?.[location.name]?.[
                              key as string
                            ] || false
                          }
                          onValueChange={(val) =>
                            updateEditUserPermission(
                              location.name,
                              key as string,
                              val
                            )
                          }
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                onPress={() => onOpenChange(false)}
                className="flex-1 border rounded px-3 py-2"
              >
                <Text className="text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-blue-500 rounded px-3 py-2"
              >
                <Text className="text-center text-white">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}
