import { type User, useUsersData } from "@/hooks/useUsersData";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { permissionTypes } from "./types";

interface PermissionMatrixProps {
  onEditUser?: (user: User) => void;
}

export function PermissionMatrix({ onEditUser }: PermissionMatrixProps) {
  const { users, loading } = useUsersData();
  const [activeTab, setActiveTab] = useState<"overview" | "detailed">(
    "overview"
  );

  const getPermissionCount = (permissions: any) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  const getTotalPermissions = (user: User) => {
    let total = 0;
    Object.values(user.permissions).forEach((locationPerms: any) => {
      total += getPermissionCount(locationPerms);
    });
    return total;
  };

  const getPermissionPercentage = (user: User) => {
    const totalPossible =
      Object.keys(user.permissions).length * permissionTypes.length;
    const actualPermissions = getTotalPermissions(user);
    return totalPossible > 0
      ? Math.round((actualPermissions / totalPossible) * 100)
      : 0;
  };

  if (loading) {
    return (
      <View className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
        <Text className="text-base font-semibold mb-3">Permission Matrix</Text>
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-sm text-gray-600 mt-3">
            Loading permissions...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
      <View className="flex-row items-center gap-2 mb-4">
        <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
        <Text className="text-base font-semibold">Permission Matrix</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab("overview")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "overview" ? "bg-blue-500" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-center text-sm font-medium ${
              activeTab === "overview" ? "text-white" : "text-gray-700"
            }`}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("detailed")}
          className={`flex-1 py-2 px-4 rounded-lg ${
            activeTab === "detailed" ? "bg-blue-500" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-center text-sm font-medium ${
              activeTab === "detailed" ? "text-white" : "text-gray-700"
            }`}
          >
            Detailed View
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="max-h-96">
        {activeTab === "overview" ? (
          <View className="gap-4">
            {users.map((user) => (
              <View
                key={user.id}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                {/* User Header */}
                <View className="flex-row items-start mb-3">
                  <View className="bg-blue-100 p-2 rounded-full mr-3">
                    <Ionicons name="person" size={16} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-900">
                      {user.name}
                    </Text>
                    <Text className="text-xs text-gray-600">{user.email}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2 py-1 rounded ${
                        user.is_tenant_admin ? "bg-purple-100" : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          user.is_tenant_admin
                            ? "text-purple-700"
                            : "text-gray-700"
                        }`}
                      >
                        {user.is_tenant_admin ? "Admin" : "User"}
                      </Text>
                    </View>
                    {onEditUser && (
                      <TouchableOpacity
                        onPress={() => onEditUser(user)}
                        className="p-1"
                      >
                        <Ionicons name="pencil" size={16} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Permission Coverage */}
                <View className="flex-row items-center gap-2 mb-2">
                  <Ionicons name="bar-chart" size={14} color="#6b7280" />
                  <Text className="text-xs text-gray-600">
                    Permission Coverage: {getPermissionPercentage(user)}%
                  </Text>
                </View>

                {/* Progress Bar */}
                <View className="bg-gray-200 h-2 rounded-full overflow-hidden mb-3">
                  <View
                    className="h-full bg-blue-500"
                    style={{ width: `${getPermissionPercentage(user)}%` }}
                  />
                </View>

                {/* Locations */}
                <View className="gap-2">
                  {Object.entries(user.permissions).map(([location, perms]) => (
                    <View
                      key={location}
                      className="p-3 bg-white rounded border border-gray-200"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-xs font-semibold text-blue-600">
                          {location}
                        </Text>
                        <View className="bg-gray-100 px-2 py-0.5 rounded">
                          <Text className="text-xs text-gray-700">
                            {getPermissionCount(perms)}/{permissionTypes.length}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row flex-wrap gap-1">
                        {permissionTypes
                          .filter((permType) => (perms as any)[permType.key])
                          .map((permType) => (
                            <View
                              key={permType.key}
                              className="bg-blue-100 px-2 py-1 rounded"
                            >
                              <Text className="text-xs text-blue-700">
                                {permType.label.split(" ")[0]}
                              </Text>
                            </View>
                          ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {users.length === 0 && (
              <View className="py-8 items-center">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={48}
                  color="#d1d5db"
                />
                <Text className="text-sm text-gray-500 mt-4">
                  No permission data available
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  Add users to see their permissions
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View className="gap-4">
            {users.map((user) => (
              <View
                key={user.id}
                className="p-4 border border-gray-200 rounded-lg"
              >
                {/* User Header */}
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="bg-blue-100 p-2 rounded-full">
                    <Ionicons name="person" size={16} color="#3b82f6" />
                  </View>
                  <Text className="text-sm font-semibold flex-1">
                    {user.name}
                  </Text>
                  <View
                    className={`px-2 py-1 rounded ${
                      user.is_tenant_admin ? "bg-purple-100" : "bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        user.is_tenant_admin
                          ? "text-purple-700"
                          : "text-gray-700"
                      }`}
                    >
                      {user.is_tenant_admin ? "Admin" : "User"}
                    </Text>
                  </View>
                </View>

                {/* Detailed Permissions */}
                {Object.keys(user.permissions).length > 0 ? (
                  <View className="gap-4">
                    {Object.entries(user.permissions).map(
                      ([location, perms]) => (
                        <View key={location}>
                          <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-sm font-semibold text-blue-600">
                              {location}
                            </Text>
                            <View className="bg-gray-100 px-2 py-1 rounded">
                              <Text className="text-xs text-gray-700">
                                {getPermissionCount(perms)}/
                                {permissionTypes.length} permissions
                              </Text>
                            </View>
                          </View>
                          <View className="gap-2">
                            {permissionTypes.map((permType) => (
                              <View
                                key={permType.key}
                                className={`flex-row items-center gap-2 p-2 rounded border ${
                                  (perms as any)[permType.key]
                                    ? "bg-green-50 border-green-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <View
                                  className={`w-3 h-3 rounded-full ${
                                    (perms as any)[permType.key]
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                />
                                <Text
                                  className={`text-xs font-medium ${
                                    (perms as any)[permType.key]
                                      ? "text-green-800"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {permType.label}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )
                    )}
                  </View>
                ) : (
                  <View className="py-4 items-center">
                    <Text className="text-xs text-gray-500 mb-2">
                      No location permissions set up yet
                    </Text>
                    {onEditUser && (
                      <TouchableOpacity
                        onPress={() => onEditUser(user)}
                        className="border border-gray-300 px-3 py-1.5 rounded"
                      >
                        <Text className="text-xs text-gray-700">
                          Configure Permissions
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
