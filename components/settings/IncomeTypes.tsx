import React from "react";
import { Text, View } from "react-native";

export default function IncomeTypes() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900 mb-2">
          Income Types
        </Text>
        <Text className="text-sm text-gray-600 leading-5">
          Configure different types of income sources and categories.
        </Text>
      </View>

      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-2xl font-bold text-gray-600 mb-3">
          Coming Soon
        </Text>
        <Text className="text-base text-gray-600 text-center leading-6">
          This feature will allow you to create and manage income types for
          better revenue tracking and categorization.
        </Text>
      </View>
    </View>
  );
}
