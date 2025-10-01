import React from "react";
import { Text, View } from "react-native";

export default function UsersScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Text className="text-xl font-semibold text-gray-800">Users Screen</Text>
      <Text className="text-gray-600 mt-2">
        Manage user accounts and permissions
      </Text>
    </View>
  );
}
