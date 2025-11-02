import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface AccessDeniedProps {
  feature?: string;
}

export function AccessDenied({ feature = "this feature" }: AccessDeniedProps) {
  return (
    <View className="flex-1 items-center justify-center p-6 bg-gray-50">
      <View className="bg-red-50 border border-red-200 rounded-lg p-6 items-center max-w-md">
        <Ionicons name="alert-circle" size={48} color="#dc2626" />
        <Text className="text-lg font-semibold text-red-900 mt-4 text-center">
          Access Denied
        </Text>
        <Text className="text-sm text-red-700 text-center mt-2">
          You don't have permission to access {feature}. Please contact your
          administrator to request access.
        </Text>
      </View>
    </View>
  );
}
