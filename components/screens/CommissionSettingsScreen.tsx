import AccessDenied from "@/components/AccessDenied";
import React from "react";
import { Text, View } from "react-native";
import { usePermissions } from "../../hooks/usePermissions";

export default function CommissionSettingsScreen() {
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  if (permissionsLoading) {
    return (
      <View className="flex-1 bg-gray-50 p-4 justify-center items-center">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!hasPermission("access_settings")) {
    return (
      <AccessDenied message="You don't have permission to access Commission Settings." />
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Commission Settings
        </Text>
        <Text className="text-gray-600">
          Configure commission rates and payment terms
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Commission Configuration
        </Text>
        <Text className="text-gray-600">
          Set up commission rates, payment schedules, and incentive structures.
        </Text>
      </View>
    </View>
  );
}
