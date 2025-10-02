import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-gray-50">
      <ActivityIndicator size="large" color="#2563eb" />
      <Text className="text-gray-600 mt-4 text-lg">Loading...</Text>
    </View>
  );
}
