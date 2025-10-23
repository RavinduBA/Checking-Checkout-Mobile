import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Account, ExpenseType } from "../../hooks/useExpenseData";
import { useUserProfile } from "../../hooks/useUserProfile";
import { CurrencyType, getCurrencySymbol } from "../../lib/currencies";
import { supabase } from "../../lib/supabase";
import { ExpenseCategories } from "./ExpenseCategories";
import { ExpenseDetails } from "./ExpenseDetails";

interface ExpenseFormData {
  mainCategory: string;
  subCategory: string;
  amount: string;
  accountId: string;
  date: string;
  note: string;
  currency: "LKR" | "USD";
}

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
  const { profile } = useUserProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMainCategoryDropdown, setShowMainCategoryDropdown] =
    useState(false);
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const [formData, setFormData] = useState<ExpenseFormData>({
    mainCategory: "",
    subCategory: "",
    amount: "",
    accountId: "",
    date: new Date().toISOString().slice(0, 10),
    note: "",
    currency: "LKR",
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
    if (!profile?.id) {
      Alert.alert("Error", "User profile not loaded. Please try again.");
      return;
    }

    if (!selectedLocationId) {
      Alert.alert("Error", "Please select a location first");
      return;
    }

    if (expenseTypes.length === 0) {
      Alert.alert(
        "No Expense Categories",
        "You need to create expense categories first. Please go to Settings -> Expense Categories to add some categories.",
        [{ text: "OK" }]
      );
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
      const expenseData = {
        main_type: formData.mainCategory,
        sub_type: formData.subCategory,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        account_id: formData.accountId,
        location_id: selectedLocationId,
        date: formData.date,
        note: formData.note || null,
        tenant_id: tenantId,
      };

      console.log("Inserting expense data:", expenseData);

      const { error } = await supabase.from("expenses").insert([expenseData]);

      if (error) {
        console.error("Expense insert error:", error);
        throw error;
      }

      // Fetch updated account balance (automatically updated by database trigger)
      const { data: updatedAccount } = await supabase
        .from("accounts")
        .select("current_balance, currency, name")
        .eq("id", formData.accountId)
        .single();

      const currentBalance = updatedAccount?.current_balance || 0;
      const accountCurrencySymbol = getCurrencySymbol(
        (updatedAccount?.currency as CurrencyType) || "LKR"
      );

      Alert.alert(
        "Success",
        `Expense added successfully!\n\n${
          updatedAccount?.name
        }\nNew Balance: ${accountCurrencySymbol}${currentBalance.toLocaleString()}`
      );
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
        <View className="bg-blue-600 px-4 pt-3 pb-4">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity 
              onPress={onClose}
              className="bg-white/20 rounded-full p-2"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-white">
                Add Expense
              </Text>
              <Text className="text-blue-100 text-xs mt-0.5">
                Track your spending
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-xl ${
                isSubmitting ? "bg-white/20" : "bg-white"
              }`}
            >
              <Text
                className={`font-bold ${
                  isSubmitting ? "text-white/50" : "text-blue-600"
                }`}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Categories Section */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="bg-blue-50 rounded-lg p-2">
                <Ionicons name="grid-outline" size={18} color="#3b82f6" />
              </View>
              <Text className="text-base font-bold text-gray-900">
                Category
              </Text>
            </View>
            <ExpenseCategories
              formData={formData}
              expenseTypes={expenseTypes}
              onFormDataChange={(data) =>
                setFormData((prev) => ({ ...prev, ...data }))
              }
              showMainCategoryDropdown={showMainCategoryDropdown}
              showSubCategoryDropdown={showSubCategoryDropdown}
              setShowMainCategoryDropdown={setShowMainCategoryDropdown}
              setShowSubCategoryDropdown={setShowSubCategoryDropdown}
            />
          </View>

          {/* Details Section */}
          <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="bg-blue-50 rounded-lg p-2">
                <Ionicons name="information-circle-outline" size={18} color="#3b82f6" />
              </View>
              <Text className="text-base font-bold text-gray-900">
                Details
              </Text>
            </View>
            <ExpenseDetails
              formData={formData}
              accounts={accounts}
              selectedLocation={selectedLocationId}
              onFormDataChange={(data) =>
                setFormData((prev) => ({ ...prev, ...data }))
              }
              showAccountDropdown={showAccountDropdown}
              showCurrencyDropdown={showCurrencyDropdown}
              setShowAccountDropdown={setShowAccountDropdown}
              setShowCurrencyDropdown={setShowCurrencyDropdown}
            />
          </View>

          {/* Bottom spacing */}
          <View className="h-20" />
        </ScrollView>
      </View>
    </Modal>
  );
}
