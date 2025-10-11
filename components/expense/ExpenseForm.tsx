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
          {/* Categories Section */}
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

          {/* Details Section */}
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
        </ScrollView>
      </View>
    </Modal>
  );
}
