import React from "react";
import { Text, View } from "react-native";

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-xl font-semibold text-gray-800">
        Settings Screen
      </Text>
      <Text className="text-gray-600 mt-2">
        Configure application settings and preferences
      </Text>
    </View>
  );
}
