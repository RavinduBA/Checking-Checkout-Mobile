import React from "react";
import { Text, View } from "react-native";

export default function HotelLocationsScreen() {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Hotel Locations
        </Text>
        <Text className="text-gray-600">
          Manage hotel locations and properties
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Location Management
        </Text>
        <Text className="text-gray-600">
          Here you can add, edit, and manage all hotel locations and their
          details.
        </Text>
      </View>
    </View>
  );
}
