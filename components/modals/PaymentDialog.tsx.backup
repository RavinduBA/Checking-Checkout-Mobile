import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocationContext } from "../../hooks";
import { useAccounts } from "../../hooks/useAccounts";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { CurrencyType } from "../../lib/currencies";
import { supabase } from "../../lib/supabase";

interface PaymentDialogProps {
  visible: boolean;
  reservation: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentDialog({
  visible,
  reservation,
  onClose,
  onSuccess,
}: PaymentDialogProps) {
  const { user, tenant } = useAuth();
  const { selectedLocation } = useLocationContext();
  const { data: accounts } = useAccounts();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    amount: 0,
    currency: "LKR" as CurrencyType,
    payment_method: "cash",
    account_id: "",
    date: new Date(),
    note: "",
    type: "payment", // payment or expense
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethods] = useState([
    { value: "cash", label: "Cash" },
    { value: "card", label: "Credit/Debit Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "online", label: "Online Payment" },
    { value: "cheque", label: "Cheque" },
    { value: "pending", label: "Pending Payment" },
  ]);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (visible && reservation) {
      const balance = reservation.balance_amount || 0;
      setFormData({
        amount: Math.abs(balance), // Default to outstanding balance
        currency: reservation.currency || "LKR",
        payment_method: "cash",
        account_id: "",
        date: new Date(),
        note: "",
        type: balance > 0 ? "payment" : "expense",
      });
    }
  }, [visible, reservation]);

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      LKR: "Rs.",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    return symbols[currency] || currency;
  };

  const getBalanceInfo = () => {
    const roomBalance = reservation?.balance_amount || 0;
    const totalBalance = roomBalance;

    return {
      roomBalance,
      totalBalance,
      isPositiveBalance: totalBalance > 0,
      displayBalance: Math.abs(totalBalance),
    };
  };

  const validateForm = () => {
    if (formData.amount <= 0) {
      Alert.alert("Validation Error", "Amount must be greater than 0");
      return false;
    }

    if (!formData.payment_method) {
      Alert.alert("Validation Error", "Please select a payment method");
      return false;
    }

    if (!formData.account_id) {
      Alert.alert("Validation Error", "Please select an account");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const balanceInfo = getBalanceInfo();
      const isPayment = formData.type === "payment";

      // Create income or expense record
      const recordData = {
        tenant_id: tenant?.id,
        location_id: selectedLocation?.id,
        booking_id: reservation.id,
        amount: formData.amount,
        currency: formData.currency,
        payment_method: formData.payment_method,
        account_id: formData.account_id,
        date: formData.date.toISOString().split("T")[0],
        note: formData.note.trim() || null,
        created_by: user?.id,
      };

      let result;
      if (isPayment) {
        // Add income record
        result = await supabase.from("income").insert({
          ...recordData,
          type: "room_revenue",
          description: `Payment for reservation #${reservation.reservation_number}`,
        });
      } else {
        // Add expense record
        result = await supabase.from("expenses").insert({
          ...recordData,
          type: "guest_expense",
          description: `Expense for reservation #${reservation.reservation_number}`,
        });
      }

      if (result.error) throw result.error;

      // Update reservation paid/balance amounts
      const currentPaid = reservation.paid_amount || 0;
      const newPaidAmount = isPayment
        ? currentPaid + formData.amount
        : Math.max(0, currentPaid - formData.amount);

      const newBalanceAmount = reservation.total_amount - newPaidAmount;

      const { error: updateError } = await supabase
        .from("reservations")
        .update({
          paid_amount: newPaidAmount,
          balance_amount: newBalanceAmount,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reservation.id);

      if (updateError) throw updateError;

      // Update account balance
      const account = accounts?.find((acc) => acc.id === formData.account_id);
      if (account) {
        const balanceChange = isPayment ? formData.amount : -formData.amount;
        const newAccountBalance = (account.balance || 0) + balanceChange;

        await supabase
          .from("accounts")
          .update({ balance: newAccountBalance })
          .eq("id", formData.account_id);
      }

      toast({
        title: "Success",
        description: `${
          isPayment ? "Payment" : "Expense"
        } recorded successfully`,
        type: "success",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error recording transaction:", error);
      Alert.alert(
        "Error",
        `Failed to record ${formData.type}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const balanceInfo = getBalanceInfo();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-blue-600 px-4 py-3 pt-12 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">
              {formData.type === "payment"
                ? "Record Payment"
                : "Record Expense"}
            </Text>
            <Text className="text-blue-100 text-sm">
              {reservation?.guest_name} - #{reservation?.reservation_number}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {/* Balance Information */}
          <View className="mb-6">
            <View
              className={`rounded-lg p-4 border ${
                balanceInfo.isPositiveBalance
                  ? "bg-red-50 border-red-200"
                  : balanceInfo.totalBalance < 0
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Current Balance
              </Text>
              <Text
                className={`text-xl font-bold ${
                  balanceInfo.isPositiveBalance
                    ? "text-red-600"
                    : balanceInfo.totalBalance < 0
                    ? "text-green-600"
                    : "text-gray-600"
                }`}
              >
                {balanceInfo.isPositiveBalance
                  ? "Owed: "
                  : balanceInfo.totalBalance < 0
                  ? "Credit: "
                  : "Paid: "}
                {getCurrencySymbol(reservation?.currency || "LKR")}
                {balanceInfo.displayBalance.toFixed(2)}
              </Text>

              <View className="mt-2 pt-2 border-t border-gray-200">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Total Amount:</Text>
                  <Text className="text-sm font-medium">
                    {getCurrencySymbol(reservation?.currency || "LKR")}
                    {reservation?.total_amount || 0}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-600">Paid Amount:</Text>
                  <Text className="text-sm font-medium">
                    {getCurrencySymbol(reservation?.currency || "LKR")}
                    {reservation?.paid_amount || 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Transaction Type */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">Transaction Type</Text>
            <View className="flex-row bg-gray-100 rounded-lg p-1">
              <TouchableOpacity
                onPress={() =>
                  setFormData((prev) => ({ ...prev, type: "payment" }))
                }
                className={`flex-1 py-2 rounded-md ${
                  formData.type === "payment" ? "bg-blue-600" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    formData.type === "payment" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Payment
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setFormData((prev) => ({ ...prev, type: "expense" }))
                }
                className={`flex-1 py-2 rounded-md ${
                  formData.type === "expense" ? "bg-red-600" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-center font-medium ${
                    formData.type === "expense" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Expense
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">Amount</Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Amount *
              </Text>
              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <TextInput
                    value={formData.amount.toString()}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: parseFloat(text) || 0,
                      }))
                    }
                    placeholder="0.00"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                  />
                </View>
                <View className="w-24">
                  <View className="border border-gray-300 rounded-lg">
                    <Picker
                      selectedValue={formData.currency}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, currency: value }))
                      }
                      style={{ height: 50 }}
                    >
                      {Object.entries(CURRENCIES).map(([code, name]) => (
                        <Picker.Item key={code} label={code} value={code} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Amount Buttons */}
            <View className="flex-row space-x-2 mb-4">
              <TouchableOpacity
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: balanceInfo.displayBalance,
                  }))
                }
                className="flex-1 bg-blue-100 py-2 rounded-lg"
              >
                <Text className="text-center text-blue-700 text-sm font-medium">
                  Full Balance
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: balanceInfo.displayBalance / 2,
                  }))
                }
                className="flex-1 bg-gray-100 py-2 rounded-lg"
              >
                <Text className="text-center text-gray-700 text-sm font-medium">
                  Half Balance
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Method */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">Payment Method</Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.payment_method}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, payment_method: value }))
                }
                style={{ height: 50 }}
              >
                {paymentMethods.map((method) => (
                  <Picker.Item
                    key={method.value}
                    label={method.label}
                    value={method.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Account */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">Account</Text>
            <View className="border border-gray-300 rounded-lg">
              <Picker
                selectedValue={formData.account_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, account_id: value }))
                }
                style={{ height: 50 }}
              >
                <Picker.Item label="Select account" value="" />
                {accounts?.map((account) => (
                  <Picker.Item
                    key={account.id}
                    label={`${account.name} (${getCurrencySymbol(
                      account.currency
                    )}${account.balance || 0})`}
                    value={account.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Date */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="border border-gray-300 rounded-lg px-3 py-3"
            >
              <Text className="text-base">
                {formData.date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Note */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3">Note (Optional)</Text>
            <TextInput
              value={formData.note}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, note: text }))
              }
              placeholder="Add a note for this transaction..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="border border-gray-300 rounded-lg px-3 py-3 text-base"
            />
          </View>

          {/* Summary */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Transaction Summary
            </Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Type:</Text>
              <Text className="text-sm font-medium capitalize">
                {formData.type}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Amount:</Text>
              <Text className="text-sm font-medium">
                {getCurrencySymbol(formData.currency)}
                {formData.amount.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Method:</Text>
              <Text className="text-sm font-medium">
                {
                  paymentMethods.find(
                    (m) => m.value === formData.payment_method
                  )?.label
                }
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">New Balance:</Text>
              <Text
                className={`text-sm font-bold ${
                  formData.type === "payment"
                    ? balanceInfo.totalBalance - formData.amount > 0
                      ? "text-red-600"
                      : "text-green-600"
                    : balanceInfo.totalBalance + formData.amount > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {getCurrencySymbol(formData.currency)}
                {(formData.type === "payment"
                  ? balanceInfo.totalBalance - formData.amount
                  : balanceInfo.totalBalance + formData.amount
                ).toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-4 py-4 border-t border-gray-200 bg-gray-50 flex-row space-x-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 bg-gray-600 py-3 rounded-lg flex-row items-center justify-center"
          >
            <Ionicons name="close" size={16} color="white" />
            <Text className="text-white font-medium ml-2">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
              formData.type === "payment" ? "bg-blue-600" : "bg-red-600"
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons
                  name={formData.type === "payment" ? "card" : "remove-circle"}
                  size={16}
                  color="white"
                />
                <Text className="text-white font-medium ml-2">
                  Record {formData.type === "payment" ? "Payment" : "Expense"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData((prev) => ({ ...prev, date: selectedDate }));
              }
            }}
          />
        )}
      </View>
    </Modal>
  );
}
