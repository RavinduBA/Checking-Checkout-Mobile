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
import { supabase } from "../../lib/supabase";

interface Account {
  id: string;
  name: string;
  currency: "LKR" | "USD" | "EUR" | "GBP";
  current_balance: number;
  initial_balance: number;
  location_access: string[];
  tenant_id: string;
  created_at: string;
}

interface AccountTransferFormProps {
  visible: boolean;
  onClose: () => void;
  accounts: Account[];
  onTransferCompleted: () => void;
}

export function AccountTransferForm({
  visible,
  onClose,
  accounts,
  onTransferCompleted,
}: AccountTransferFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: 0,
    description: "",
  });

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "LKR":
        return "Rs.";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return "$";
    }
  };

  const resetForm = () => {
    setFormData({
      fromAccountId: "",
      toAccountId: "",
      amount: 0,
      description: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.fromAccountId || !formData.toAccountId) {
      Alert.alert(
        "Error",
        "Please select both source and destination accounts"
      );
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      Alert.alert("Error", "Source and destination accounts must be different");
      return;
    }

    if (formData.amount <= 0) {
      Alert.alert("Error", "Transfer amount must be greater than zero");
      return;
    }

    const fromAccount = accounts.find(
      (acc) => acc.id === formData.fromAccountId
    );
    const toAccount = accounts.find((acc) => acc.id === formData.toAccountId);

    if (!fromAccount || !toAccount) {
      Alert.alert("Error", "Invalid account selection");
      return;
    }

    if (fromAccount.currency !== toAccount.currency) {
      Alert.alert(
        "Error",
        "Can only transfer between accounts with the same currency"
      );
      return;
    }

    if (fromAccount.current_balance < formData.amount) {
      Alert.alert("Error", "Insufficient balance in source account");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Update both accounts in a transaction-like manner
      const { error: fromError } = await supabase
        .from("accounts")
        .update({
          current_balance: fromAccount.current_balance - formData.amount,
        })
        .eq("id", formData.fromAccountId);

      if (fromError) throw fromError;

      const { error: toError } = await supabase
        .from("accounts")
        .update({
          current_balance: toAccount.current_balance + formData.amount,
        })
        .eq("id", formData.toAccountId);

      if (toError) {
        // Rollback the first update if second fails
        await supabase
          .from("accounts")
          .update({
            current_balance: fromAccount.current_balance,
          })
          .eq("id", formData.fromAccountId);
        throw toError;
      }

      Alert.alert("Success", "Transfer completed successfully");
      onTransferCompleted();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error processing transfer:", error);
      Alert.alert("Error", "Failed to process transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fromAccount = accounts.find((acc) => acc.id === formData.fromAccountId);
  const toAccount = accounts.find((acc) => acc.id === formData.toAccountId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-6 py-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">
            Transfer Money
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg ${
              isSubmitting ? "bg-gray-300" : "bg-blue-500"
            }`}
          >
            <Text
              className={`font-medium ${
                isSubmitting ? "text-gray-500" : "text-white"
              }`}
            >
              {isSubmitting ? "Processing..." : "Transfer"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* From Account */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              From Account *
            </Text>
            <View className="space-y-2">
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      fromAccountId: account.id,
                    }))
                  }
                  className={`bg-white border rounded-lg px-4 py-3 ${
                    formData.fromAccountId === account.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        className={`font-medium ${
                          formData.fromAccountId === account.id
                            ? "text-blue-700"
                            : "text-gray-800"
                        }`}
                      >
                        {account.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {getCurrencySymbol(account.currency)}
                        {account.current_balance.toLocaleString()}
                      </Text>
                    </View>
                    <View className="px-2 py-1 bg-gray-100 rounded">
                      <Text className="text-xs text-gray-600">
                        {account.currency}
                      </Text>
                    </View>
                    {formData.fromAccountId === account.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#3B82F6"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* To Account */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              To Account *
            </Text>
            <View className="space-y-2">
              {accounts
                .filter((account) => account.id !== formData.fromAccountId)
                .map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        toAccountId: account.id,
                      }))
                    }
                    className={`bg-white border rounded-lg px-4 py-3 ${
                      formData.toAccountId === account.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text
                          className={`font-medium ${
                            formData.toAccountId === account.id
                              ? "text-green-700"
                              : "text-gray-800"
                          }`}
                        >
                          {account.name}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {getCurrencySymbol(account.currency)}
                          {account.current_balance.toLocaleString()}
                        </Text>
                      </View>
                      <View className="px-2 py-1 bg-gray-100 rounded">
                        <Text className="text-xs text-gray-600">
                          {account.currency}
                        </Text>
                      </View>
                      {formData.toAccountId === account.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#10B981"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Amount */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Amount *
            </Text>
            {fromAccount && (
              <Text className="text-xs text-gray-500 mb-2">
                Available: {getCurrencySymbol(fromAccount.currency)}
                {fromAccount.current_balance.toLocaleString()}
              </Text>
            )}
            <TextInput
              value={formData.amount.toString()}
              onChangeText={(text) => {
                const value = parseFloat(text) || 0;
                setFormData((prev) => ({ ...prev, amount: value }));
              }}
              placeholder="0.00"
              keyboardType="numeric"
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
            />
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder="Transfer description"
              multiline
              numberOfLines={3}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
            />
          </View>

          {/* Currency Warning */}
          {fromAccount &&
            toAccount &&
            fromAccount.currency !== toAccount.currency && (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                  <Text className="text-yellow-800 font-medium ml-2">
                    Currency Mismatch
                  </Text>
                </View>
                <Text className="text-yellow-700 text-sm mt-1">
                  Transfers are only allowed between accounts with the same
                  currency.
                </Text>
              </View>
            )}
        </ScrollView>
      </View>
    </Modal>
  );
}
