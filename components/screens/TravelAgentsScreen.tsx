import React from "react";
import { Text, View } from "react-native";

export default function TravelAgentsScreen() {
  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Travel Agents
        </Text>
        <Text className="text-gray-600">
          Manage travel agent partnerships and contacts
        </Text>
      </View>

      <View className="flex-1 bg-white rounded-xl p-4">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Agent Network
        </Text>
        <Text className="text-gray-600">
          Manage travel agent relationships, contracts, and commission
          structures.
        </Text>
      </View>
    </View>
  );
}
