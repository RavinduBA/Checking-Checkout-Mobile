import React from "react";
import { Text, View } from "react-native";

export default function ReservationsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-xl font-semibold text-gray-800">
        Reservations Screen
      </Text>
      <Text className="text-gray-600 mt-2">
        View and manage hotel reservations
      </Text>
    </View>
  );
}
