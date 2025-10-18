import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { type RoomSelection } from "../MultiRoomSelector";

interface PricingStepProps {
  roomSelections: RoomSelection[];
  convertedTotal: number;
  paymentCurrency: string;
}

export function PricingStep({
  roomSelections,
  convertedTotal,
  paymentCurrency,
}: PricingStepProps) {
  // Get currency symbol helper
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "LKR":
        return "Rs.";
      default:
        return "";
    }
  };

  if (roomSelections.length === 0) {
    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="space-y-4">
          <View className="flex-row items-center mb-4">
            <Ionicons name="calculator" size={24} color="#3B82F6" />
            <Text className="text-lg font-semibold ml-2 text-gray-900">
              Pricing Summary
            </Text>
          </View>
          <View className="bg-gray-50 border border-gray-200 rounded-lg p-6 items-center">
            <Ionicons name="calculator-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 text-center mt-2">
              Please select rooms to see pricing information.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="space-y-4">
        <View className="flex-row items-center mb-4">
          <Ionicons name="calculator" size={24} color="#3B82F6" />
          <Text className="text-lg font-semibold ml-2 text-gray-900">
            Pricing Summary
          </Text>
        </View>

        {/* Individual room breakdown */}
        <View className="space-y-3">
          {roomSelections.map((selection, index) => (
            <View
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">
                    Room Selection {index + 1}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {new Date(selection.check_in_date).toLocaleDateString()} -{" "}
                    {new Date(selection.check_out_date).toLocaleDateString()}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {selection.nights} night{selection.nights > 1 ? "s" : ""} •{" "}
                    {selection.adults} adult{selection.adults > 1 ? "s" : ""}
                    {selection.children > 0 &&
                      `, ${selection.children} child${
                        selection.children > 1 ? "ren" : ""
                      }`}
                  </Text>
                </View>
                <View className="text-right">
                  <Text className="font-semibold text-gray-900">
                    {getCurrencySymbol(selection.currency)}
                    {selection.total_amount.toFixed(2)}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {getCurrencySymbol(selection.currency)}
                    {selection.room_rate.toFixed(2)}/night
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Total Summary */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <View className="flex-row justify-between items-center">
            <Text className="font-semibold text-gray-900">
              Grand Total ({roomSelections.length} room
              {roomSelections.length > 1 ? "s" : ""}):
            </Text>
            <Text className="text-xl font-bold text-blue-700">
              {getCurrencySymbol(paymentCurrency)}
              {convertedTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Breakdown by Currency */}
        {roomSelections.length > 1 && (
          <View className="bg-white border border-gray-300 rounded-lg p-4">
            <Text className="font-medium text-gray-900 mb-3">
              Breakdown by Currency
            </Text>
            {Object.entries(
              roomSelections.reduce((acc, selection) => {
                if (!acc[selection.currency]) {
                  acc[selection.currency] = 0;
                }
                acc[selection.currency] += selection.total_amount;
                return acc;
              }, {} as Record<string, number>)
            ).map(([currency, amount]) => (
              <View
                key={currency}
                className="flex-row justify-between items-center py-1"
              >
                <Text className="text-gray-600">{currency} Total:</Text>
                <Text className="font-medium text-gray-900">
                  {getCurrencySymbol(currency)}
                  {amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
