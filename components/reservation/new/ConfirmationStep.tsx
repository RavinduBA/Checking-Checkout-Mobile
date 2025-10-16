import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { GuestData } from "./GuestInformationStep";
import { PaymentData } from "./PaymentStep";
import { RoomSelection } from "./RoomSelectionStep";

interface ConfirmationStepProps {
  guestData: GuestData;
  roomSelections: RoomSelection[];
  paymentData: PaymentData;
  convertedTotal: number;
}

export function ConfirmationStep({
  guestData,
  roomSelections,
  paymentData,
  convertedTotal,
}: ConfirmationStepProps) {
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

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="space-y-6">
        <View className="flex-row items-center mb-4">
          <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
          <Text className="text-lg font-semibold ml-2 text-gray-900">
            Confirmation
          </Text>
        </View>

        {/* Guest Information Summary */}
        <View className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="person" size={20} color="#374151" />
            <Text className="font-semibold text-gray-900 ml-2">
              Guest Information
            </Text>
          </View>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="font-medium text-gray-700">Name:</Text>
              <Text className="text-gray-900 flex-1 text-right">
                {guestData.guest_name}
              </Text>
            </View>
            {guestData.guest_email && (
              <View className="flex-row justify-between">
                <Text className="font-medium text-gray-700">Email:</Text>
                <Text className="text-gray-900 flex-1 text-right">
                  {guestData.guest_email}
                </Text>
              </View>
            )}
            {guestData.guest_phone && (
              <View className="flex-row justify-between">
                <Text className="font-medium text-gray-700">Phone:</Text>
                <Text className="text-gray-900 flex-1 text-right">
                  {guestData.guest_phone}
                </Text>
              </View>
            )}
            {guestData.guest_nationality && (
              <View className="flex-row justify-between">
                <Text className="font-medium text-gray-700">Nationality:</Text>
                <Text className="text-gray-900 flex-1 text-right">
                  {guestData.guest_nationality}
                </Text>
              </View>
            )}
            <View className="flex-row justify-between">
              <Text className="font-medium text-gray-700">Booking Source:</Text>
              <Text className="text-gray-900 flex-1 text-right capitalize">
                {guestData.booking_source.replace("_", " ")}
              </Text>
            </View>
          </View>
        </View>

        {/* Room Selections Summary */}
        <View className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="bed" size={20} color="#374151" />
            <Text className="font-semibold text-gray-900 ml-2">
              Room Selections
            </Text>
          </View>
          <View className="space-y-3">
            {roomSelections.map((selection, index) => (
              <View
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-3"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-900">
                      Room Selection {index + 1}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {selection.room_number} - {selection.room_type}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {selection.nights} night{selection.nights > 1 ? "s" : ""}{" "}
                      • {selection.adults} adult
                      {selection.adults > 1 ? "s" : ""}
                      {selection.children > 0 &&
                        `, ${selection.children} child${
                          selection.children > 1 ? "ren" : ""
                        }`}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {new Date(selection.check_in_date).toLocaleDateString()} -{" "}
                      {new Date(selection.check_out_date).toLocaleDateString()}
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
        </View>

        {/* Payment Summary */}
        <View className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="card" size={20} color="#374151" />
            <Text className="font-semibold text-gray-900 ml-2">
              Payment Summary
            </Text>
          </View>
          <View className="space-y-2">
            <View className="flex-row justify-between items-center">
              <Text className="font-medium text-gray-700">Total Amount:</Text>
              <Text className="text-lg font-bold text-gray-900">
                {getCurrencySymbol(paymentData.currency)}
                {convertedTotal.toFixed(2)}
              </Text>
            </View>
            {paymentData.advance_amount > 0 && (
              <>
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-600">Advance Amount:</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {getCurrencySymbol(paymentData.currency)}
                    {paymentData.advance_amount.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center border-t border-gray-200 pt-2">
                  <Text className="text-sm font-medium text-gray-700">
                    Balance Amount:
                  </Text>
                  <Text className="text-sm font-bold text-gray-900">
                    {getCurrencySymbol(paymentData.currency)}
                    {Math.max(
                      0,
                      convertedTotal - paymentData.advance_amount
                    ).toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Special Requests */}
        {guestData.special_requests && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <Text className="font-semibold text-gray-900 mb-2">
              Special Requests
            </Text>
            <Text className="text-sm text-gray-700">
              {guestData.special_requests}
            </Text>
          </View>
        )}

        {/* Confirmation Notice */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <View className="ml-2 flex-1">
              <Text className="text-sm font-medium text-blue-800">
                Review Information
              </Text>
              <Text className="text-sm text-blue-700 mt-1">
                Please review all information above before confirming your
                reservation. Once confirmed, reservation numbers will be
                generated automatically.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
