import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Back button header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200 mt-20">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("MainTabs", { screen: "Dashboard" })
          }
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text className="ml-2 text-lg font-semibold text-gray-700">
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Settings content */}
      <View className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Settings
          </Text>
          <Text className="text-gray-600">
            Configure application settings and preferences
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-xl p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Application Settings
          </Text>
          <Text className="text-gray-600">
            Here you can configure various application settings, notifications,
            themes, and other preferences.
          </Text>
        </View>
      </View>
    </View>
  );
}
