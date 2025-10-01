import React from "react";
import { Text, View } from "react-native";

export default function CommissionSettingsScreen() {
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
