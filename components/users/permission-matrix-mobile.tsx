import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUsersData } from "@/hooks/useUsersData";
import { permissionTypes } from "./types";

export function PermissionMatrix() {
  const { users, loading } = useUsersData();

  if (loading) {
    return (
      <View className="bg-white rounded-lg p-4 border border-gray-200">
        <Text className="text-base font-semibold mb-3">Permission Overview</Text>
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-sm text-gray-600 mt-3">Loading permissions...</Text>
        </View>
      </View>
    );
  }

  // Calculate permission coverage
  const totalUsers = users.length;
  const totalPermissions = permissionTypes.length;
  const permissionCoverage = permissionTypes.map((perm) => {
    const usersWithPermission = users.filter(
      (user) => user.permissions?.[perm.key] === true
    ).length;
    const percentage = totalUsers > 0 ? (usersWithPermission / totalUsers) * 100 : 0;
    return {
      ...perm,
      count: usersWithPermission,
      percentage: Math.round(percentage),
    };
  });

  const averageCoverage = permissionCoverage.length > 0
    ? Math.round(
        permissionCoverage.reduce((sum, p) => sum + p.percentage, 0) /
          permissionCoverage.length
      )
    : 0;

  return (
    <View className="bg-white rounded-lg p-4 border border-gray-200">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold">Permission Overview</Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-xs font-semibold text-blue-700">
            {averageCoverage}% Coverage
          </Text>
        </View>
      </View>

      <ScrollView className="max-h-96">
        <View className="gap-3">
          {permissionCoverage.map((perm) => (
            <View
              key={perm.key}
              className="border border-gray-200 rounded-lg p-3"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-900">
                    {perm.label}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    {perm.count} of {totalUsers} users
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold text-blue-600">
                    {perm.percentage}%
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <View
                  className={`h-full ${
                    perm.percentage >= 75
                      ? "bg-green-500"
                      : perm.percentage >= 50
                      ? "bg-blue-500"
                      : perm.percentage >= 25
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${perm.percentage}%` }}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Summary */}
      <View className="mt-4 pt-4 border-t border-gray-200">
        <View className="flex-row items-center gap-2">
          <Ionicons name="information-circle" size={16} color="#6b7280" />
          <Text className="text-xs text-gray-600">
            {totalUsers} {totalUsers === 1 ? "user" : "users"} with {totalPermissions} permission types
          </Text>
        </View>
      </View>
    </View>
  );
}
