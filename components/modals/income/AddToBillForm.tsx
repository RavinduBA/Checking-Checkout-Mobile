import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useToast } from "../../../hooks/useToast";
import type { Database } from "../../../integrations/supabase/types";
import { supabase } from "../../../lib/supabase";
import { AmountInput } from "./shared/AmountInput";

type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
type IncomeType = {
  id: string;
  type_name: string;
  created_at: string;
  tenant_id: string;
};

interface AddToBillFormData {
  amount: number;
  currency: string;
  note: string;
  income_type_id: string;
}

interface AddToBillFormProps {
  reservation: Reservation;
  incomeTypes: IncomeType[];
  onSuccess: () => void;
  onCancel: () => void;
  profileId: string;
  tenantId: string;
  locationId: string;
  baseAmount: number;
  baseCurrency: string;
  displayedReservationAmount: number;
  onDisplayedReservationAmountChange: (amount: number) => void;
}

export function AddToBillForm({
  reservation,
  incomeTypes,
  onSuccess,
  onCancel,
  profileId,
  tenantId,
  locationId,
  baseAmount,
  baseCurrency,
  displayedReservationAmount,
  onDisplayedReservationAmountChange,
}: AddToBillFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<AddToBillFormData>({
    amount: Math.max(
      0,
      (reservation.total_amount || 0) - (reservation.paid_amount || 0)
    ),
    currency: reservation.currency || "LKR",
    note: `Reservation ${reservation.reservation_number}`,
    income_type_id:
      incomeTypes && incomeTypes.length > 0 ? incomeTypes[0].id : "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Add to bill: create income record with pending status
      // Database trigger will automatically update reservation total_amount and balance_amount
      const { error: incomeError } = await supabase.from("income").insert({
        booking_id: reservation.id,
        amount: formData.amount,
        currency: formData.currency as "LKR" | "USD" | "EUR" | "GBP",
        note:
          formData.note ||
          `Additional service for reservation ${reservation.reservation_number}`,
        income_type_id: formData.income_type_id || null,
        tenant_id: tenantId,
        location_id: locationId,
        account_id: null, // No account for pending items
        payment_method: "pending",
        type: "booking",
      });

      if (incomeError) throw incomeError;

      toast({
        title: "Success",
        description: "Item added to guest bill successfully",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error adding to bill:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to add item to bill. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (amount: number) => {
    setFormData((prev) => ({ ...prev, amount }));
  };

  const handleCurrencyChange = (currency: string, convertedAmount: number) => {
    setFormData((prev) => ({ ...prev, currency, amount: convertedAmount }));
  };

  return (
    <View className="gap-4">
      <View className="bg-gray-50 rounded-lg p-3">
        <View className="gap-2">
          <View className="flex-row">
            <Text className="font-semibold">Reservation: </Text>
            <Text>{reservation.reservation_number}</Text>
          </View>
          <View className="flex-row">
            <Text className="font-semibold">Guest: </Text>
            <Text>{reservation.guest_name}</Text>
          </View>
          <View className="flex-row">
            <Text className="font-semibold">Amount: </Text>
            <Text>
              {formData.currency} {displayedReservationAmount.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Income Type
        </Text>
        {incomeTypes && incomeTypes.length > 0 ? (
          <View className="border border-gray-300 rounded-lg">
            <Picker
              selectedValue={formData.income_type_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, income_type_id: value }))
              }
            >
              {incomeTypes.map((type) => (
                <Picker.Item
                  key={type.id}
                  label={type.type_name}
                  value={type.id}
                />
              ))}
            </Picker>
          </View>
        ) : (
          <View className="border border-yellow-300 bg-yellow-50 rounded-lg p-3">
            <Text className="text-sm text-yellow-800">
              Add income types in settings
            </Text>
          </View>
        )}
      </View>

      <AmountInput
        amount={formData.amount}
        currency={formData.currency}
        onAmountChange={handleAmountChange}
        onCurrencyChange={handleCurrencyChange}
        tenantId={tenantId}
        locationId={locationId}
        baseAmount={baseAmount}
        baseCurrency={baseCurrency}
        onDisplayedReservationAmountChange={onDisplayedReservationAmountChange}
      />

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Note</Text>
        <TextInput
          value={formData.note}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, note: text }))
          }
          placeholder="Add a note..."
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          className="border border-gray-300 rounded-lg px-3 py-3 text-base"
        />
      </View>

      <View className="bg-blue-50 rounded-lg p-3">
        <Text className="text-sm font-medium mb-1">Add to Guest Bill</Text>
        <Text className="text-xs text-gray-600">
          This item will be added to the guest's total bill to pay at checkout
        </Text>
      </View>

      <View className="flex-row gap-3 justify-end">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 bg-gray-600 py-3 rounded-lg"
          disabled={isSubmitting}
        >
          <Text className="text-white text-center font-semibold">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!formData.amount || isSubmitting}
          className={`flex-1 bg-blue-600 py-3 rounded-lg ${
            !formData.amount || isSubmitting ? "opacity-50" : ""
          }`}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="add-circle-outline" size={16} color="white" />
            <Text className="text-white font-semibold">Add to Bill</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
