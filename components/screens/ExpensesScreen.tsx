import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useLocationContext } from "../../contexts/LocationContext";
import { useExpenseData } from "../../hooks/useExpenseData";
import { useUserProfile } from "../../hooks/useUserProfile";
import { getCurrencySymbol } from "../../lib/currencies";
import { ExpenseForm } from "../expense/ExpenseForm";
import { ExpenseHistoryTable } from "../expense/ExpenseHistoryTable";

export default function ExpensesScreen() {
  const { selectedLocation } = useLocationContext();
  const { profile } = useUserProfile();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const {
    accounts,
    expenseTypes,
    recentExpenses: expenses,
    loading,
    refetch: refreshData,
  } = useExpenseData();

  const [refreshing, setRefreshing] = useState(false);

  // Calculate total expenses by currency
  const totalExpenses = expenses.reduce(
    (acc, expense) => {
      acc[expense.currency] = (acc[expense.currency] || 0) + expense.amount;
      return acc;
    },
    { LKR: 0, USD: 0 } as { LKR: number; USD: number }
  );

  // Transform expenses to include account information for display
  const expensesWithAccounts = expenses.map((expense) => {
    const account = accounts.find((acc) => acc.id === expense.account_id);
    return {
      ...expense,
      accounts: {
        name: account?.name || "Unknown Account",
        currency: account?.currency || expense.currency,
      },
    };
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleExpenseAdded = () => {
    refreshData();
  };

  if (!profile) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-500">Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header Section */}
        <View className="bg-white border-b border-gray-200 px-6 py-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-gray-800">Expenses</Text>
            <TouchableOpacity
              onPress={() => setShowExpenseForm(true)}
              className="bg-blue-500 rounded-lg px-4 py-2 flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-medium ml-1">Add Expense</Text>
            </TouchableOpacity>
          </View>

         
        </View>

      

        {/* Expense History */}
        <View className="flex-1 bg-gray-50">
          <ExpenseHistoryTable
            expenses={expensesWithAccounts}
            accounts={accounts}
            loading={loading}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        </View>
      </View>

      {/* Add Expense Modal */}
      <ExpenseForm
        visible={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        accounts={accounts}
        expenseTypes={expenseTypes}
        selectedLocationId={selectedLocation}
        tenantId={profile?.tenant_id || ""}
        onSuccess={handleExpenseAdded}
      />
    </View>
  );
}
