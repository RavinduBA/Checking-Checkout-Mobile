import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Reservation } from "../../hooks/useReservationsData";
import { formatCurrency } from "../../utils/currency";

interface Payment {
  id?: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  date: string;
}

interface PaymentDialogProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (payment: Omit<Payment, "id">) => void;
  selectedCurrency: "LKR" | "USD";
}

export function PaymentDialog({
  reservation,
  isOpen,
  onClose,
  onAddPayment,
  selectedCurrency,
}: PaymentDialogProps) {
  const [formData, setFormData] = useState({
    amount: "",
    method: "cash",
    reference: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      amount: "",
      method: "cash",
      reference: "",
      notes: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleSave = async () => {
    if (!reservation) return;

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid payment amount");
      return;
    }

    const paymentAmount = parseFloat(formData.amount);
    const remainingAmount =
      (reservation.total_amount || 0) - (reservation.paid_amount || 0);

    if (paymentAmount > remainingAmount) {
      Alert.alert(
        "Error",
        `Payment amount cannot exceed remaining balance of ${formatCurrency(
          remainingAmount,
          selectedCurrency
        )}`
      );
      return;
    }

    if (!formData.date) {
      Alert.alert("Error", "Please select a payment date");
      return;
    }

    setIsLoading(true);

    try {
      const payment: Omit<Payment, "id"> = {
        amount: paymentAmount,
        method: formData.method,
        reference: formData.reference.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        date: formData.date,
      };

      await onAddPayment(payment);
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to add payment");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: "cash" },
    { value: "card", label: "Credit/Debit Card", icon: "card" },
    { value: "bank_transfer", label: "Bank Transfer", icon: "business" },
    { value: "online", label: "Online Payment", icon: "globe" },
    { value: "other", label: "Other", icon: "ellipsis-horizontal" },
  ];

  if (!reservation) return null;

  const totalAmount = reservation.total_amount || 0;
  const paidAmount = reservation.paid_amount || 0;
  const remainingAmount = totalAmount - paidAmount;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-green-600 px-4 py-3 pt-12 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-lg font-semibold">
              Add Payment
            </Text>
            <Text className="text-green-100 text-sm">
              {reservation.reservation_number}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Payment Summary */}
          <View className="px-4 py-4 bg-gray-50 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Payment Summary
            </Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Amount:</Text>
                <Text className="font-semibold text-gray-900">
                  {formatCurrency(totalAmount, selectedCurrency)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Paid Amount:</Text>
                <Text className="font-semibold text-green-600">
                  {formatCurrency(paidAmount, selectedCurrency)}
                </Text>
              </View>
              <View className="flex-row justify-between border-t border-gray-200 pt-2">
                <Text className="text-gray-600 font-medium">Remaining:</Text>
                <Text className="font-bold text-red-600">
                  {formatCurrency(remainingAmount, selectedCurrency)}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Form */}
          <View className="px-4 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Payment Details
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Payment Amount *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.amount}
                onChangeText={(text) =>
                  setFormData({ ...formData, amount: text })
                }
                placeholder={`Max: ${formatCurrency(
                  remainingAmount,
                  selectedCurrency
                )}`}
                keyboardType="numeric"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Payment Method *
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.value}
                      onPress={() =>
                        setFormData({ ...formData, method: method.value })
                      }
                      className={`px-3 py-2 rounded-lg border flex-row items-center ${
                        formData.method === method.value
                          ? "bg-green-100 border-green-300"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <Ionicons
                        name={method.icon as any}
                        size={16}
                        color={
                          formData.method === method.value
                            ? "#16A34A"
                            : "#6B7280"
                        }
                      />
                      <Text
                        className={`text-sm font-medium ml-2 ${
                          formData.method === method.value
                            ? "text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Payment Date *
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.date}
                onChangeText={(text) =>
                  setFormData({ ...formData, date: text })
                }
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.reference}
                onChangeText={(text) =>
                  setFormData({ ...formData, reference: text })
                }
                placeholder="Transaction ID, check number, etc."
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Notes
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                value={formData.notes}
                onChangeText={(text) =>
                  setFormData({ ...formData, notes: text })
                }
                placeholder="Additional notes about the payment"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Quick Amount Buttons */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Quick Amount
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() =>
                    setFormData({
                      ...formData,
                      amount: (remainingAmount / 2).toString(),
                    })
                  }
                  className="px-3 py-2 bg-gray-100 rounded border"
                >
                  <Text className="text-sm text-gray-700">Half</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setFormData({
                      ...formData,
                      amount: remainingAmount.toString(),
                    })
                  }
                  className="px-3 py-2 bg-green-100 rounded border border-green-300"
                >
                  <Text className="text-sm text-green-700">Full Amount</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 border border-gray-300 py-3 rounded-lg flex-row items-center justify-center"
            >
              <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${
                isLoading ? "bg-gray-400" : "bg-green-600"
              }`}
            >
              {isLoading ? (
                <Text className="text-white font-medium">Processing...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Add Payment
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
