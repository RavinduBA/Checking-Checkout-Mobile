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
import { Account, ExpenseType } from "../../hooks/useExpenseData";
import { CurrencyType, getCurrencySymbol } from "../../lib/currencies";
import { supabase } from "../../lib/supabase";

interface ExpenseFormProps {
  visible: boolean;
  onClose: () => void;
  accounts: Account[];
  expenseTypes: ExpenseType[];
  selectedLocationId: string | null;
  tenantId: string;
  onSuccess: () => void;
}

export function ExpenseForm({
  visible,
  onClose,
  accounts,
  expenseTypes,
  selectedLocationId,
  tenantId,
  onSuccess,
}: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMainCategoryDropdown, setShowMainCategoryDropdown] =
    useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const [formData, setFormData] = useState({
    mainCategory: "",
    subCategory: "",
    amount: "",
    accountId: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
    currency: "LKR" as CurrencyType,
  });

  const resetForm = () => {
    setFormData({
      mainCategory: "",
      subCategory: "",
      amount: "",
      accountId: "",
      date: new Date().toISOString().slice(0, 10),
      note: "",
      currency: "LKR",
    });
    setShowMainCategoryDropdown(false);
    setShowSubCategoryDropdown(false);
    setShowAccountDropdown(false);
    setShowCurrencyDropdown(false);
  };

  const handleSubmit = async () => {
    if (!selectedLocationId) {
      Alert.alert("Error", "Please select a location first");
      return;
    }

    if (!formData.mainCategory || !formData.subCategory) {
      Alert.alert("Error", "Please select main and sub categories");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!formData.accountId) {
      Alert.alert("Error", "Please select an account");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("expenses").insert([
        {
          main_type: formData.mainCategory,
          sub_type: formData.subCategory,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          account_id: formData.accountId,
          location_id: selectedLocationId,
          date: formData.date,
          note: formData.note || null,
          tenant_id: tenantId,
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Expense added successfully");
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error adding expense:", error);
      Alert.alert("Error", "Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainCategories = [...new Set(expenseTypes.map((et) => et.main_type))];
  const subCategories = expenseTypes
    .filter((et) => et.main_type === formData.mainCategory)
    .map((et) => et.sub_type);

  const selectedAccount = accounts.find((acc) => acc.id === formData.accountId);

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
            Add Expense
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
              {isSubmitting ? "Adding..." : "Add"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Main Category */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Main Category *
            </Text>
            <View>
              <TouchableOpacity
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() =>
                  setShowMainCategoryDropdown(!showMainCategoryDropdown)
                }
              >
                <Text
                  className={
                    formData.mainCategory
                      ? "text-gray-800 font-medium"
                      : "text-gray-500"
                  }
                >
                  {formData.mainCategory || "Select main category"}
                </Text>
                <Ionicons
                  name={
                    showMainCategoryDropdown ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>

              {showMainCategoryDropdown && (
                <View className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-sm">
                  {mainCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          mainCategory: category,
                          subCategory: "", // Reset sub category when main changes
                        }));
                        setShowMainCategoryDropdown(false);
                      }}
                    >
                      <Text className="font-medium text-gray-800">
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Sub Category */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Sub Category *
            </Text>
            <View>
              <TouchableOpacity
                className={`bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between ${
                  !formData.mainCategory ? "bg-gray-100" : ""
                }`}
                onPress={() => {
                  if (formData.mainCategory) {
                    setShowSubCategoryDropdown(!showSubCategoryDropdown);
                  }
                }}
                disabled={!formData.mainCategory}
              >
                <Text
                  className={
                    !formData.mainCategory
                      ? "text-gray-400"
                      : formData.subCategory
                      ? "text-gray-800 font-medium"
                      : "text-gray-500"
                  }
                >
                  {!formData.mainCategory
                    ? "Select main category first"
                    : formData.subCategory || "Select sub category"}
                </Text>
                <Ionicons
                  name={showSubCategoryDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={!formData.mainCategory ? "#9CA3AF" : "#6B7280"}
                />
              </TouchableOpacity>

              {showSubCategoryDropdown && formData.mainCategory && (
                <View className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-sm">
                  {subCategories.map((subCategory) => (
                    <TouchableOpacity
                      key={subCategory}
                      className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                      onPress={() => {
                        setFormData((prev) => ({ ...prev, subCategory }));
                        setShowSubCategoryDropdown(false);
                      }}
                    >
                      <Text className="font-medium text-gray-800">
                        {subCategory}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Amount and Currency */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Amount *
              </Text>
              <View className="relative">
                <Text className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 z-10">
                  {getCurrencySymbol(formData.currency)}
                </Text>
                <TextInput
                  value={formData.amount}
                  onChangeText={(text) => {
                    // Only allow numbers and decimal point
                    const cleaned = text.replace(/[^0-9.]/g, "");
                    setFormData((prev) => ({ ...prev, amount: cleaned }));
                  }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-800"
                />
              </View>
            </View>

            <View className="w-32">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Currency *
              </Text>
              <View>
                <TouchableOpacity
                  className="bg-white border border-gray-200 rounded-lg px-3 py-3 flex-row items-center justify-between"
                  onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                >
                  <Text className="text-gray-800 font-medium">
                    {formData.currency}
                  </Text>
                  <Ionicons
                    name={showCurrencyDropdown ? "chevron-up" : "chevron-down"}
                    size={16}
                    color="#6B7280"
                  />
                </TouchableOpacity>

                {showCurrencyDropdown && (
                  <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-sm z-10">
                    {(["LKR", "USD"] as CurrencyType[]).map((currency) => (
                      <TouchableOpacity
                        key={currency}
                        className="px-3 py-3 border-b border-gray-100 last:border-b-0"
                        onPress={() => {
                          setFormData((prev) => ({ ...prev, currency }));
                          setShowCurrencyDropdown(false);
                        }}
                      >
                        <Text className="font-medium text-gray-800">
                          {currency}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Account */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Account *
            </Text>
            <View>
              <TouchableOpacity
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                onPress={() => setShowAccountDropdown(!showAccountDropdown)}
              >
                <View className="flex-1">
                  {selectedAccount ? (
                    <>
                      <Text className="font-medium text-gray-800">
                        {selectedAccount.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Balance: {getCurrencySymbol(selectedAccount.currency)}
                        {selectedAccount.current_balance.toLocaleString()}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-gray-500">Select account</Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  {selectedAccount && (
                    <View className="px-2 py-1 bg-gray-100 rounded mr-2">
                      <Text className="text-xs text-gray-600">
                        {selectedAccount.currency}
                      </Text>
                    </View>
                  )}
                  <Ionicons
                    name={showAccountDropdown ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#6B7280"
                  />
                </View>
              </TouchableOpacity>

              {showAccountDropdown && (
                <View className="bg-white border border-gray-200 border-t-0 rounded-b-lg shadow-sm">
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          accountId: account.id,
                        }));
                        setShowAccountDropdown(false);
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

          {/* Date */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Date *
            </Text>
            <TextInput
              value={formData.date}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, date: text }))
              }
              placeholder="YYYY-MM-DD"
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
            />
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </Text>
            <TextInput
              value={formData.note}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, note: text }))
              }
              placeholder="Add any notes about this expense"
              multiline
              numberOfLines={3}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
