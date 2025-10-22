import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { convertCurrency } from "../../../../utils/currency";

interface AmountInputProps {
  amount: number;
  currency: string;
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: string, convertedAmount: number) => void;
  tenantId?: string;
  locationId?: string;
  baseAmount?: number;
  baseCurrency?: string;
  onDisplayedReservationAmountChange?: (amount: number) => void;
}

export function AmountInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  tenantId,
  locationId,
  baseAmount,
  baseCurrency,
  onDisplayedReservationAmountChange,
}: AmountInputProps) {
  const handleCurrencyChange = async (newCurrency: string) => {
    if (currency === newCurrency) return;

    // Validate required context before proceeding
    if (!tenantId || !locationId) {
      console.error("Missing tenant_id or location_id for currency conversion");
      // Just change currency without conversion if context is missing
      onCurrencyChange(newCurrency, amount);
      Alert.alert(
        "Warning",
        "Could not convert amount. Please verify the value."
      );
      return;
    }

    try {
      // Convert the current amount from the old currency to the new currency
      const convertedAmount = await convertCurrency(
        amount,
        currency,
        newCurrency,
        tenantId,
        locationId
      );

      // Also convert the reservation total amount for display if provided
      if (baseAmount && baseCurrency && onDisplayedReservationAmountChange) {
        const convertedReservationAmount = await convertCurrency(
          baseAmount,
          baseCurrency,
          newCurrency,
          tenantId,
          locationId
        );
        onDisplayedReservationAmountChange(
          Number(convertedReservationAmount.toFixed(2))
        );
      }

      onCurrencyChange(newCurrency, Number(convertedAmount.toFixed(2)));
    } catch (error) {
      console.error("Error converting currency:", error);
      // If conversion fails, just change the currency without converting amount
      onCurrencyChange(newCurrency, amount);
      Alert.alert(
        "Warning",
        "Could not convert amount. Please verify the value."
      );
    }
  };

  return (
    <View className="gap-4">
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Amount *</Text>
        <TextInput
          value={amount.toString()}
          onChangeText={(text) => onAmountChange(parseFloat(text) || 0)}
          placeholder="0.00"
          keyboardType="decimal-pad"
          className="border border-gray-300 rounded-lg px-3 py-3 text-base"
        />
      </View>
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Currency *
        </Text>
        <View className="border border-gray-300 rounded-lg">
          <Picker
            selectedValue={currency}
            onValueChange={handleCurrencyChange}
          >
            <Picker.Item label="LKR - Sri Lankan Rupee" value="LKR" />
            <Picker.Item label="USD - US Dollar" value="USD" />
            <Picker.Item label="EUR - Euro" value="EUR" />
            <Picker.Item label="GBP - British Pound" value="GBP" />
          </Picker>
        </View>
      </View>
    </View>
  );
}
