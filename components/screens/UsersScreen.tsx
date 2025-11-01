import { useAuthContext } from "@/contexts/AuthContext";
import { useLocationContext } from "@/contexts/LocationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useUserProfile } from "@/hooks/useUserProfile";
import { type User as UsersDataUser, useUsersData } from "@/hooks/useUsersData";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Import mobile-friendly components from users folder
import {
	EditUserDialogMobile,
	InviteMemberDialogMobile,
	UsersList,
	UserStats,
	PermissionMatrix,
} from "@/components/users";

export default function UsersScreen() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showEditUser, setShowEditUser] = useState(false);
  const { user: currentUser } = useAuthContext();
  const { profile } = useUserProfile();
  const { hasPermission } = usePermissions();
  const { locations } = useLocationContext();
  const { loading } = useUsersData();

  const handleEditUser = (user: UsersDataUser) => {
    // Convert to simple shape suitable for mobile edit dialog
    const convertedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      is_tenant_admin: user.is_tenant_admin,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      phone: user.phone,
      avatar_url: user.avatar_url,
      tenant_role: user.tenant_role,
      permissions: user.permissions,
      location_count: user.location_count,
      total_permissions: user.total_permissions,
    };
    setEditingUser(convertedUser);
    setShowEditUser(true);
  };

  const handleInviteSuccess = () => setShowInviteDialog(false);
  const handleEditSuccess = () => {
    setShowEditUser(false);
    setEditingUser(null);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-sm text-gray-600 mt-3">Loading users...</Text>
      </View>
    );
  }

  return (
		<ScrollView className="flex-1 p-4">
			<View className="flex-row justify-between items-center mb-4">
				<Text className="text-xl font-bold">Users</Text>
				{hasPermission("access_users") && (
					<TouchableOpacity
						onPress={() => setShowInviteDialog(true)}
						className="bg-blue-500 px-3 py-2 rounded-lg"
					>
						<Text className="text-white">Invite Member</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* User Statistics */}
			<UserStats />

			{/* Permission Overview */}
			<PermissionMatrix />

			{/* Users List */}
			<UsersList onEditUser={handleEditUser} />

      {/* Invite dialog (mobile) */}
      <Modal
        visible={showInviteDialog}
        animationType="slide"
        transparent={Platform.OS !== "web"}
      >
        <InviteMemberDialogMobile
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          locations={locations}
          tenant={profile?.tenant_id ? { id: profile.tenant_id } : null}
          currentUserId={currentUser?.id}
          onInviteSuccess={handleInviteSuccess}
        />
      </Modal>

      {/* Edit dialog (mobile) */}
      <Modal
        visible={showEditUser}
        animationType="slide"
        transparent={Platform.OS !== "web"}
      >
        <EditUserDialogMobile
          open={showEditUser}
          onOpenChange={setShowEditUser}
          user={editingUser}
          locations={locations}
          tenant={profile?.tenant_id ? { id: profile.tenant_id } : null}
          onEditSuccess={handleEditSuccess}
        />
      </Modal>
    </ScrollView>
  );
}
