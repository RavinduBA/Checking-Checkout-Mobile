import React from "react";
import { Text, View } from "react-native";

export default function RoomsScreen() {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Rooms Management
        </Text>
        <Text className="text-gray-600">
          Manage room types, availability, and pricing
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Room Configuration
        </Text>
        <Text className="text-gray-600">
          Configure room types, amenities, pricing, and availability settings.
        </Text>
      </View>
    </View>
  );
}
