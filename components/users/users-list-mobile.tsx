import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { useUsersData, type User } from "@/hooks/useUsersData";

interface UsersListProps {
  onEditUser: (user: User) => void;
}

export function UsersList({ onEditUser }: UsersListProps) {
  const { users, loading, deleteUser } = useUsersData();

  const handleDeleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      "Remove User Access",
      `Are you sure you want to remove ${userName}'s access? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await deleteUser(userId);
          },
        },
      ]
    );
  };

  const formatLastActivity = (lastSignIn: string | null | undefined) => {
    if (!lastSignIn) return "Never";
    try {
      return formatDistanceToNow(new Date(lastSignIn), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <View className="bg-white rounded-lg p-4 border border-gray-200">
        <Text className="text-base font-semibold mb-3">Team Members</Text>
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-sm text-gray-600 mt-3">Loading users...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg p-4 border border-gray-200">
      <View className="flex-row items-center mb-3">
        <Ionicons name="people" size={20} color="#666" />
        <Text className="text-base font-semibold ml-2">
          Team Members ({users.length})
        </Text>
      </View>

      <ScrollView className="max-h-[600px]">
        {users.map((user) => (
          <View
            key={user.id}
            className="border-b border-gray-200 py-3 last:border-b-0"
          >
            {/* User Info */}
            <View className="flex-row items-start mb-2">
              {/* Avatar */}
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Text className="text-blue-600 font-semibold text-sm">
                  {getUserInitials(user.name)}
                </Text>
              </View>

              {/* User Details */}
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">
                  {user.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="mail-outline" size={12} color="#666" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {user.email}
                  </Text>
                </View>
                {user.phone && (
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="call-outline" size={12} color="#666" />
                    <Text className="text-xs text-gray-600 ml-1">
                      {user.phone}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Role & Location */}
            <View className="flex-row gap-2 mb-2 flex-wrap">
              <View
                className={`px-2 py-1 rounded ${
                  user.is_tenant_admin ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={user.is_tenant_admin ? "shield" : "person"}
                    size={12}
                    color={user.is_tenant_admin ? "#3b82f6" : "#666"}
                  />
                  <Text
                    className={`text-xs ml-1 ${
                      user.is_tenant_admin ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {user.is_tenant_admin ? "Administrator" : "User"}
                  </Text>
                </View>
              </View>

              <View className="px-2 py-1 rounded bg-gray-100">
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={12} color="#666" />
                  <Text className="text-xs text-gray-600 ml-1">
                    {user.location_count || 0} location
                    {(user.location_count || 0) !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              {user.tenant_role && (
                <View className="px-2 py-1 rounded bg-gray-100">
                  <Text className="text-xs text-gray-600">
                    {user.tenant_role
                      .replace("tenant_", "")
                      .replace("_", " ")}
                  </Text>
                </View>
              )}
            </View>

            {/* Last Activity */}
            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={12} color="#666" />
              <Text className="text-xs text-gray-600 ml-1">
                Last active: {formatLastActivity(user.last_sign_in_at)}
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row gap-2 mt-2">
              <TouchableOpacity
                onPress={() => onEditUser(user)}
                className="flex-1 bg-blue-500 py-2 rounded-lg flex-row items-center justify-center"
              >
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text className="text-white text-sm ml-1 font-medium">
                  Edit Permissions
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteUser(user.id, user.name)}
                className="bg-red-500 px-3 py-2 rounded-lg items-center justify-center"
              >
                <Ionicons name="trash-outline" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {users.length === 0 && (
        <View className="items-center py-8">
          <Ionicons name="people-outline" size={48} color="#ccc" />
          <Text className="text-sm text-gray-600 mt-3">
            No team members found
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            Invite users to get started
          </Text>
        </View>
      )}
    </View>
  );
}
