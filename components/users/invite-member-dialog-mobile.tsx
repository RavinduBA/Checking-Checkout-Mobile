import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { supabase } from "@/integrations/supabase/client";

type Location = any;
type InvitePermissions = Record<string, boolean>;

const defaultInvitePermissions: InvitePermissions = {
  access_dashboard: false,
  access_income: false,
  access_expenses: false,
  access_reports: false,
  access_calendar: false,
  access_bookings: false,
  access_rooms: false,
  access_master_files: false,
  access_accounts: false,
  access_users: false,
  access_settings: false,
  access_booking_channels: false,
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  locations: Location[];
  tenant: { id: string } | null;
  currentUserId?: string;
  onInviteSuccess: () => void;
}

export default function InviteMemberDialogMobile({
  open,
  onOpenChange,
  locations,
  tenant,
  currentUserId,
  onInviteSuccess,
}: Props) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLocationId, setInviteLocationId] = useState("");
  const [invitePermissions, setInvitePermissions] = useState<InvitePermissions>(
    defaultInvitePermissions,
  );
  const [inviteLoading, setInviteLoading] = useState(false);

  const handleInvite = async () => {
    if (!tenant?.id || !inviteEmail.trim() || !currentUserId) return;
    if (!inviteLocationId) {
      Alert.alert("Location Required", "Please select a location to invite the user to");
      return;
    }

    try {
      setInviteLoading(true);

      // Try RPC first (if available)
      const rpcName = "add_user_to_location";
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(rpcName, {
          email: inviteEmail.trim().toLowerCase(),
          tenant_id: tenant.id,
          location_id: inviteLocationId,
          added_by: currentUserId,
          permissions: invitePermissions,
        } as any);
        if (rpcError) throw rpcError;
        // assume rpc returns success flag
        Alert.alert("Invitation Sent", "User invited successfully");
      } catch (rpcErr) {
        // Fallback: insert into profiles/user_permissions and send notification via edge function
        // Upsert profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .upsert({ email: inviteEmail.trim().toLowerCase() })
          .select()
          .single();
        if (profileError) throw profileError;

        // Insert user_permissions
        const { error: permError } = await supabase.from("user_permissions").insert({
          user_id: profileData.id,
          location_id: inviteLocationId,
          tenant_id: tenant.id,
          tenant_role: "tenant_staff",
          ...invitePermissions,
        });
        if (permError) throw permError;

        Alert.alert("Invitation Sent", "User added to location");
      }

      setInviteEmail("");
      setInviteLocationId("");
      setInvitePermissions(defaultInvitePermissions);
      onOpenChange(false);
      onInviteSuccess();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to send invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  if (!open) return null;

  return (
    <View className="flex-1 bg-black/40 justify-center items-center p-4">
      <View className="bg-white w-full max-h-[90%] rounded-lg p-4">
        <Text className="text-lg font-semibold mb-2">Invite Member</Text>
        <ScrollView>
          <View className="mb-3">
            <Text className="text-sm">Email Address</Text>
            <TextInput
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border rounded px-2 py-2 mt-1"
            />
          </View>

          <View className="mb-3">
            <Text className="text-sm">Location</Text>
            {locations.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                onPress={() => setInviteLocationId(loc.id)}
                className={`py-2 px-2 rounded ${inviteLocationId === loc.id ? 'bg-blue-100' : ''}`}
              >
                <Text>{loc.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-3">
            <Text className="text-base font-semibold mb-2">Permissions</Text>
            {Object.entries(invitePermissions).map(([key, val]) => (
              <View key={key} className="flex-row items-center justify-between mb-2">
                <Text>{key.replace('access_', '').replace('_', ' ')}</Text>
                <Switch
                  value={!!val}
                  onValueChange={(v) => setInvitePermissions((p) => ({ ...p, [key]: v }))}
                />
              </View>
            ))}
          </View>

          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity onPress={() => onOpenChange(false)} className="flex-1 border rounded px-3 py-2">
              <Text className="text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleInvite} className="flex-1 bg-blue-500 rounded px-3 py-2">
              <Text className="text-center text-white">{inviteLoading ? 'Sending...' : (!inviteLocationId ? 'Select Location' : 'Send Invitation')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
