import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function BillingSubscriptionsScreen() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Back button header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200 mt-20">
        <TouchableOpacity
          onPress={() => navigation.navigate("MainTabs", { screen: "Dashboard" })}
          className="flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text className="ml-2 text-lg font-semibold text-gray-700">
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Billing content */}
      <View className="flex-1 p-4">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Billing & Subscriptions
          </Text>
          <Text className="text-gray-600">
            Manage billing information and subscriptions
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-xl p-4">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Billing Management
          </Text>
          <Text className="text-gray-600">
            View and manage billing information, subscription plans, payment methods, and invoices.
          </Text>
        </View>
      </View>
    </View>
  );
}
