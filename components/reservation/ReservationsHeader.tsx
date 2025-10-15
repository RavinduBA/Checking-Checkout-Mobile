import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ReservationsHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ReservationsHeader({
  activeTab,
  onTabChange,
}: ReservationsHeaderProps) {
  return (
    <View className="bg-white border-b border-gray-200">
      {/* Title */}
      <View className="px-4 py-4">
        <Text className="text-xl font-bold text-gray-800">Reservations</Text>
        <Text className="text-gray-500 mt-1">
          View and manage hotel reservations
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row px-4">
        <TouchableOpacity
          onPress={() => onTabChange("reservations")}
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === "reservations"
              ? "border-blue-500"
              : "border-transparent"
          }`}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons
              name="bed-outline"
              size={16}
              color={activeTab === "reservations" ? "#3B82F6" : "#6B7280"}
            />
            <Text
              className={`ml-2 font-medium ${
                activeTab === "reservations" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Reservations
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onTabChange("payments")}
          className={`flex-1 pb-3 border-b-2 ${
            activeTab === "payments" ? "border-blue-500" : "border-transparent"
          }`}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons
              name="card-outline"
              size={16}
              color={activeTab === "payments" ? "#3B82F6" : "#6B7280"}
            />
            <Text
              className={`ml-2 font-medium ${
                activeTab === "payments" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Payments
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
