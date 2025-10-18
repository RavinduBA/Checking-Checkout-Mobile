import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useFormFieldPreferences } from "../../../hooks/useFormFieldPreferences";
import { Database } from "../../../integrations/supabase/types";
import { CurrencySelector } from "../../common/CurrencySelector";
import { type RoomSelection } from "../MultiRoomSelector";

type CurrencyType = Database["public"]["Enums"]["currency_type"];

export interface PaymentData {
  advance_amount: number;
  currency: CurrencyType;
}

interface PaymentStepProps {
  paymentData: PaymentData;
  onPaymentDataChange: (field: string, value: any) => void;
  roomSelections: RoomSelection[];
  convertedTotal: number;
}

export function PaymentStep({
  paymentData,
  onPaymentDataChange,
  roomSelections,
  convertedTotal,
}: PaymentStepProps) {
  const { preferences: fieldPreferences } = useFormFieldPreferences();

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
      <View className="space-y-4">
        <View className="flex-row items-center mb-4">
          <Ionicons name="card" size={24} color="#3B82F6" />
          <Text className="text-lg font-semibold ml-2 text-gray-900">
            Payment Information
          </Text>
        </View>

        {/* Payment Currency */}
        <View className="space-y-2">
          <Text className="text-sm font-medium text-gray-700">
            Payment Currency
          </Text>
          <CurrencySelector
            currency={paymentData.currency}
            onCurrencyChange={(currency) =>
              onPaymentDataChange("currency", currency)
            }
            label="Payment Currency"
            showGoogleSearchLink={false}
          />
        </View>

        {/* Advance Amount */}
        {fieldPreferences?.show_advance_amount !== false && (
          <View className="space-y-2">
            <Text className="text-sm font-medium text-gray-700">
              Advance Amount
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-3 py-3 text-gray-900"
              value={paymentData.advance_amount.toString()}
              onChangeText={(value) =>
                onPaymentDataChange("advance_amount", parseFloat(value) || 0)
              }
              placeholder="Enter advance amount"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Total Summary */}
        {roomSelections.length > 0 && (
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <Text className="font-semibold text-gray-900">Payment Summary</Text>

            <View className="space-y-2">
              <View className="flex-row justify-between items-center">
                <Text className="font-medium text-gray-900">
                  Grand Total ({roomSelections.length} room
                  {roomSelections.length > 1 ? "s" : ""}):
                </Text>
                <Text className="text-xl font-bold text-blue-700">
                  {getCurrencySymbol(paymentData.currency)}
                  {convertedTotal.toFixed(2)}
                </Text>
              </View>

              {paymentData.advance_amount > 0 && (
                <>
                  <View className="flex-row justify-between items-center text-sm">
                    <Text className="text-gray-600">Advance Amount:</Text>
                    <Text className="font-medium text-gray-900">
                      {getCurrencySymbol(paymentData.currency)}
                      {paymentData.advance_amount.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center border-t border-blue-200 pt-2">
                    <Text className="font-semibold text-gray-900">
                      Balance Amount:
                    </Text>
                    <Text className="font-bold text-blue-700">
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
        )}

        {/* Payment Notes */}
        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#D97706" />
            <View className="ml-2 flex-1">
              <Text className="text-sm font-medium text-yellow-800">
                Payment Information
              </Text>
              <Text className="text-sm text-yellow-700 mt-1">
                The advance amount will be recorded as an initial payment. The
                remaining balance can be collected later during check-in or
                checkout.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
