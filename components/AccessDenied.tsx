import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export default function AccessDenied({ message }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <Ionicons name="lock-closed" size={48} color="#9ca3af" />
      <Text className="text-lg font-semibold text-gray-700 mt-4">
        Access Denied
      </Text>
      <Text className="text-sm text-gray-500 mt-2 text-center">
        {message || "You do not have permission to view this content."}
      </Text>
    </View>
  );
}
