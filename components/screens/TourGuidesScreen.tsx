import React from "react";
import { Text, View } from "react-native";

export default function TourGuidesScreen() {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Tour Guides
        </Text>
        <Text className="text-gray-600">
          Manage tour guide profiles and assignments
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Guide Management
        </Text>
        <Text className="text-gray-600">
          Add and manage tour guide information, specialties, and availability.
        </Text>
      </View>
    </View>
  );
}
