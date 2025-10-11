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
import { getCurrencySymbol, getConversionRate, CurrencyType, DEFAULT_EXCHANGE_RATES } from "../../lib/currencies";
import { supabase } from "../../lib/supabase";

interface Account {
  id: string;
  name: string;
  currency: CurrencyType;
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
  const [currentExchangeRate, setCurrentExchangeRate] = useState(DEFAULT_EXCHANGE_RATES);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: 0,
    conversionRate: 1,
    description: "",
  });

  // Use centralized conversion rate function with current exchange rates
  const getConversionRateWithCurrent = (fromCurrency: CurrencyType, toCurrency: CurrencyType) => {
    return getConversionRate(fromCurrency, toCurrency, currentExchangeRate);
  };

  const resetForm = () => {
    setFormData({
      fromAccountId: "",
      toAccountId: "",
      amount: 0,
      conversionRate: 1,
      description: "",
    });
    setShowFromDropdown(false);
    setShowToDropdown(false);
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

    if (fromAccount.current_balance < formData.amount) {
      Alert.alert("Error", "Insufficient balance in source account");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // First, record the transfer in the account_transfers table
      const { error: transferError } = await supabase
        .from("account_transfers")
        .insert({
          from_account_id: formData.fromAccountId,
          to_account_id: formData.toAccountId,
          amount: formData.amount,
          conversion_rate: formData.conversionRate,
          note:
            formData.description ||
            `Transfer from ${fromAccount.name} to ${toAccount.name}`,
          tenant_id: fromAccount.tenant_id,
        });

      if (transferError) throw transferError;

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
          current_balance:
            toAccount.current_balance +
            formData.amount * formData.conversionRate,
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
            <Text className="text-sm font-medium text-gray-700 mb-2">
              From Account *
            </Text>
            <View>
              <TouchableOpacity
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowFromDropdown(!showFromDropdown)}
              >
                <View className="flex-1">
                  {fromAccount ? (
                    <>
                      <Text className="font-medium text-gray-800">
                        {fromAccount.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Available: {getCurrencySymbol(fromAccount.currency)}
                        {fromAccount.current_balance.toLocaleString()}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-500">Select from account</Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  {fromAccount && (
                    <View className="px-2 py-1 bg-gray-100 rounded mr-2">
                      <Text className="text-xs text-gray-600">
                        {fromAccount.currency}
                      </Text>
                    </View>
                  )}
                  <Ionicons 
                    name={showFromDropdown ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </View>
              </TouchableOpacity>
              
              {/* Dropdown Options */}
              {showFromDropdown && (
                <View className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-sm">
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                      onPress={() => {
                        const toAccount = accounts.find(
                          (acc) => acc.id === formData.toAccountId
                        );
                        setFormData((prev) => ({
                          ...prev,
                          fromAccountId: account.id,
                          conversionRate: toAccount
                            ? getConversionRateWithCurrent(
                                account.currency,
                                toAccount.currency
                              )
                            : 1,
                        }));
                        setShowFromDropdown(false);
                      }}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-medium text-gray-800">
                            {account.name}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            Available: {getCurrencySymbol(account.currency)}
                            {account.current_balance.toLocaleString()}
                          </Text>
                        </View>
                        <View className="px-2 py-1 bg-gray-100 rounded">
                          <Text className="text-xs text-gray-600">
                            {account.currency}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* To Account */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              To Account *
            </Text>
            <View>
              <TouchableOpacity
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowToDropdown(!showToDropdown)}
              >
                <View className="flex-1">
                  {toAccount ? (
                    <>
                      <Text className="font-medium text-gray-800">
                        {toAccount.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Balance: {getCurrencySymbol(toAccount.currency)}
                        {toAccount.current_balance.toLocaleString()}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-500">Select to account</Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  {toAccount && (
                    <View className="px-2 py-1 bg-gray-100 rounded mr-2">
                      <Text className="text-xs text-gray-600">
                        {toAccount.currency}
                      </Text>
                    </View>
                  )}
                  <Ionicons 
                    name={showToDropdown ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#6B7280" 
                  />
                </View>
              </TouchableOpacity>
              
              {/* Dropdown Options */}
              {showToDropdown && (
                <View className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-sm">
                  {accounts
                    .filter((account) => account.id !== formData.fromAccountId)
                    .map((account) => (
                      <TouchableOpacity
                        key={account.id}
                        className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                        onPress={() => {
                          const fromAccount = accounts.find(
                            (acc) => acc.id === formData.fromAccountId
                          );
                          setFormData((prev) => ({
                            ...prev,
                            toAccountId: account.id,
                            conversionRate: fromAccount
                              ? getConversionRateWithCurrent(
                                  fromAccount.currency,
                                  account.currency
                                )
                              : 1,
                          }));
                          setShowToDropdown(false);
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="font-medium text-gray-800">
                              {account.name}
                            </Text>
                            <Text className="text-sm text-gray-500">
                              Balance: {getCurrencySymbol(account.currency)}
                              {account.current_balance.toLocaleString()}
                            </Text>
                          </View>
                          <View className="px-2 py-1 bg-gray-100 rounded">
                            <Text className="text-xs text-gray-600">
                              {account.currency}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          </View>

          {/* Exchange Rate Settings */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              Exchange Rates
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1">USD to LKR</Text>
                <TextInput
                  value={currentExchangeRate.usdToLkr.toString()}
                  onChangeText={(text) => {
                    const rate = parseFloat(text) || 300;
                    setCurrentExchangeRate({
                      usdToLkr: rate,
                      lkrToUsd: 1 / rate,
                    });
                    // Update conversion rate if accounts are selected
                    if (fromAccount && toAccount) {
                      setFormData((prev) => ({
                        ...prev,
                        conversionRate: getConversionRateWithCurrent(
                          fromAccount.currency,
                          toAccount.currency
                        ),
                      }));
                    }
                  }}
                  keyboardType="numeric"
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-600 mb-1">LKR to USD</Text>
                <TextInput
                  value={currentExchangeRate.lkrToUsd.toFixed(4)}
                  onChangeText={(text) => {
                    const rate = parseFloat(text) || 0.0033;
                    setCurrentExchangeRate({
                      lkrToUsd: rate,
                      usdToLkr: 1 / rate,
                    });
                    // Update conversion rate if accounts are selected
                    if (fromAccount && toAccount) {
                      setFormData((prev) => ({
                        ...prev,
                        conversionRate: getConversionRateWithCurrent(
                          fromAccount.currency,
                          toAccount.currency
                        ),
                      }));
                    }
                  }}
                  keyboardType="numeric"
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                />
              </View>
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
            {/* Show conversion preview */}
            {fromAccount &&
              toAccount &&
              fromAccount.currency !== toAccount.currency &&
              formData.amount > 0 && (
                <Text className="text-xs text-blue-600 mt-2">
                  {formData.amount} {fromAccount.currency} ={" "}
                  {(formData.amount * formData.conversionRate).toFixed(2)}{" "}
                  {toAccount.currency}
                </Text>
              )}
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
              placeholder={
                fromAccount &&
                toAccount &&
                fromAccount.currency !== toAccount.currency
                  ? `Transfer with conversion rate: ${formData.conversionRate.toFixed(
                      4
                    )}`
                  : "Transfer description"
              }
              multiline
              numberOfLines={3}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
            />
            {fromAccount &&
              toAccount &&
              fromAccount.currency !== toAccount.currency && (
                <Text className="text-xs text-blue-600 mt-1">
                  Exchange rate: 1 {fromAccount.currency} ={" "}
                  {formData.conversionRate.toFixed(4)} {toAccount.currency}
                </Text>
              )}
          </View>

          {/* Currency Info */}
          {fromAccount &&
            toAccount &&
            fromAccount.currency !== toAccount.currency && (
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="information-circle" size={20} color="#3B82F6" />
                  <Text className="text-blue-800 font-medium ml-2">
                    Currency Conversion
                  </Text>
                </View>
                <Text className="text-blue-700 text-sm mt-1">
                  Transfer will be converted from {fromAccount.currency} to {toAccount.currency} using the current exchange rate.
                </Text>
              </View>
            )}
        </ScrollView>
      </View>
    </Modal>
  );
}
