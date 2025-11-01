import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUsersData } from "@/hooks/useUsersData";

export function UserStats() {
  const { users, loading } = useUsersData();

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    totalAdmins: users.filter((u) => u.is_tenant_admin).length,
    totalRegularUsers: users.filter((u) => !u.is_tenant_admin).length,
    activeUsers: users.filter((u) => u.last_sign_in_at).length,
    recentUsers: users.filter((u) => {
      if (!u.created_at) return false;
      const createdDate = new Date(u.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdDate > sevenDaysAgo;
    }).length,
    averagePermissions:
      users.length > 0
        ? Math.round(
            users.reduce((sum, user) => sum + (user.total_permissions || 0), 0) /
              users.length
          )
        : 0,
  };

  if (loading) {
    return (
      <View className="bg-white rounded-lg p-4 border border-gray-200">
        <Text className="text-base font-semibold mb-3">User Statistics</Text>
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-sm text-gray-600 mt-3">Loading stats...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
      <Text className="text-base font-semibold mb-3">User Statistics</Text>

      {/* Stats Grid */}
      <View className="gap-3">
        {/* Row 1 */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-blue-50 rounded-lg p-3 border border-blue-200">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-blue-600 font-medium">
                Total Users
              </Text>
              <Ionicons name="people" size={16} color="#2563eb" />
            </View>
            <Text className="text-2xl font-bold text-blue-900">
              {stats.totalUsers}
            </Text>
            <Text className="text-xs text-blue-600 mt-1">
              All registered
            </Text>
          </View>

          <View className="flex-1 bg-purple-50 rounded-lg p-3 border border-purple-200">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-purple-600 font-medium">
                Admins
              </Text>
              <Ionicons name="shield" size={16} color="#9333ea" />
            </View>
            <Text className="text-2xl font-bold text-purple-900">
              {stats.totalAdmins}
            </Text>
            <Text className="text-xs text-purple-600 mt-1">
              {stats.totalUsers > 0
                ? Math.round((stats.totalAdmins / stats.totalUsers) * 100)
                : 0}
              % of total
            </Text>
          </View>
        </View>

        {/* Row 2 */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-green-50 rounded-lg p-3 border border-green-200">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-green-600 font-medium">
                Regular Users
              </Text>
              <Ionicons name="person" size={16} color="#16a34a" />
            </View>
            <Text className="text-2xl font-bold text-green-900">
              {stats.totalRegularUsers}
            </Text>
            <Text className="text-xs text-green-600 mt-1">
              Standard access
            </Text>
          </View>

          <View className="flex-1 bg-orange-50 rounded-lg p-3 border border-orange-200">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-orange-600 font-medium">
                Recent
              </Text>
              <Ionicons name="time" size={16} color="#ea580c" />
            </View>
            <Text className="text-2xl font-bold text-orange-900">
              {stats.recentUsers}
            </Text>
            <Text className="text-xs text-orange-600 mt-1">
              Last 7 days
            </Text>
          </View>
        </View>

        {/* Row 3 */}
        <View className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs text-indigo-600 font-medium">
              Avg Permissions
            </Text>
            <Ionicons name="trending-up" size={16} color="#4f46e5" />
          </View>
          <Text className="text-2xl font-bold text-indigo-900">
            {stats.averagePermissions}
          </Text>
          <Text className="text-xs text-indigo-600 mt-1">
            Per user access level
          </Text>
        </View>
      </View>
    </View>
  );
}
