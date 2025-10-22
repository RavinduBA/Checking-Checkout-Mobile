import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "../../../hooks/useToast";
import { supabase } from "../../../lib/supabase";
import { convertCurrency } from "../../../utils/currency";
import { AccountSelector } from "./shared/AccountSelector";
import { AmountInput } from "./shared/AmountInput";
import type { Database } from "../../../integrations/supabase/types";

type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
type Account = Database["public"]["Tables"]["accounts"]["Row"];
type IncomeType = {
  id: string;
  type_name: string;
  created_at: string;
  tenant_id: string;
};

interface ImmediatePaymentFormData {
  amount: number;
  currency: string;
  note: string;
  account_id: string;
  income_type_id: string;
  payment_method: string;
}

interface ImmediatePaymentFormProps {
  reservation: Reservation;
  accounts: Account[];
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

export function ImmediatePaymentForm({
  reservation,
  accounts,
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
}: ImmediatePaymentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with account's currency to avoid unnecessary conversions
  const initialAccount = accounts && accounts.length > 0 ? accounts[0] : null;
  const initialCurrency = initialAccount?.currency || "LKR";
  const reservationBalance = Math.max(
    0,
    (reservation.total_amount || 0) - (reservation.paid_amount || 0)
  );

  const [formData, setFormData] = useState<ImmediatePaymentFormData>({
    amount: reservationBalance,
    currency: initialCurrency,
    note: `Reservation ${reservation.reservation_number}`,
    account_id: initialAccount?.id || "",
    income_type_id:
      incomeTypes && incomeTypes.length > 0 ? incomeTypes[0].id : "",
    payment_method: "cash",
  });

  const handleSubmit = async () => {
    if (!formData.account_id) {
      Alert.alert("Error", "Please select an account for the payment.");
      return;
    }

    setIsSubmitting(true);

    try {
      // General income (not added to bill): create income record WITHOUT additional_service_id
      // This marks it as general hotel income that won't reduce the reservation balance
      // The trigger only reduces balance for income with additional_service_id (paid service items)
      const selectedAccount = accounts.find(
        (acc) => acc.id === formData.account_id
      );
      const accountCurrency = selectedAccount?.currency || "LKR";

      // Convert amount to account currency if needed
      let convertedAmount = formData.amount;
      if (formData.currency !== accountCurrency) {
        convertedAmount = await convertCurrency(
          formData.amount,
          formData.currency,
          accountCurrency,
          tenantId,
          locationId
        );
      }

      const { data: incomeData, error: incomeError } = await supabase
        .from("income")
        .insert({
          booking_id: reservation.id, // Link to reservation for tracking
          amount: convertedAmount,
          currency: accountCurrency as "LKR" | "USD" | "EUR" | "GBP",
          payment_method: formData.payment_method, // Set as paid (not pending)
          account_id: formData.account_id,
          income_type_id: formData.income_type_id || null,
          type: "booking" as const,
          note:
            formData.note ||
            `General income for reservation ${reservation.reservation_number}`,
          date: new Date().toISOString().split("T")[0], // Date only (YYYY-MM-DD)
          is_advance: false,
          additional_service_id: null, // NULL = general income, NOT payment against a service
          tenant_id: tenantId,
          location_id: locationId,
        })
        .select()
        .single();

      if (incomeError) throw incomeError;

      // Log currency conversion if currencies differ
      if (incomeData && formData.currency !== accountCurrency) {
        const { error: conversionLogError } = await supabase
          .from("currency_conversion_log")
          .insert({
            transaction_type: "income",
            transaction_id: incomeData.id,
            from_currency: formData.currency as "LKR" | "USD" | "EUR" | "GBP",
            to_currency: accountCurrency as "LKR" | "USD" | "EUR" | "GBP",
            from_amount: formData.amount,
            to_amount: convertedAmount,
            exchange_rate: convertedAmount / formData.amount,
            rate_source: "system",
            tenant_id: tenantId,
            created_by: profileId,
            notes: `General income for reservation ${reservation.reservation_number}`,
          });

        if (conversionLogError) {
          console.error(
            "Failed to log currency conversion:",
            conversionLogError
          );
          // Non-critical error, don't block transaction
        }
      }

      toast({
        title: "Success",
        description: "General income recorded successfully.",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error recording income:", error);
      Alert.alert(
        "Error",
        error?.message || "Failed to record income. Please try again."
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

  const handleAccountChange = (accountId: string) => {
    setFormData((prev) => ({ ...prev, account_id: accountId }));
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

      {incomeTypes && incomeTypes.length > 0 ? (
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Income Type
          </Text>
          <View className="border border-gray-300 rounded-lg">
            <Picker
              selectedValue={formData.income_type_id || ""}
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
        </View>
      ) : (
        <View className="border border-yellow-300 bg-yellow-50 rounded-lg p-3">
          <Text className="text-sm text-yellow-800">
            Add income types in settings
          </Text>
        </View>
      )}

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

      <AccountSelector
        accounts={accounts}
        selectedAccountId={formData.account_id}
        onAccountChange={handleAccountChange}
        required
      />

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </Text>
        <View className="border border-gray-300 rounded-lg">
          <Picker
            selectedValue={formData.payment_method}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, payment_method: value }))
            }
          >
            <Picker.Item label="Cash" value="cash" />
            <Picker.Item label="Credit/Debit Card" value="card" />
            <Picker.Item label="Bank Transfer" value="bank_transfer" />
            <Picker.Item label="Mobile Payment" value="mobile_payment" />
            <Picker.Item label="Cheque" value="cheque" />
          </Picker>
        </View>
      </View>

      <View className="bg-green-50 rounded-lg p-3">
        <Text className="text-sm font-medium mb-1">Immediate Payment</Text>
        <Text className="text-xs text-gray-600">
          This will be recorded as an immediate payment
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
          disabled={!formData.amount || !formData.account_id || isSubmitting}
          className={`flex-1 bg-blue-600 py-3 rounded-lg ${
            !formData.amount || !formData.account_id || isSubmitting
              ? "opacity-50"
              : ""
          }`}
        >
          <View className="flex-row items-center justify-center gap-2">
            <Ionicons name="checkmark-outline" size={16} color="white" />
            <Text className="text-white font-semibold">Record Payment</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
