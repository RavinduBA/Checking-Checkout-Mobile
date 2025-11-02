import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useLocationContext } from "../../contexts/LocationContext";
import { useExpenseData } from "../../hooks/useExpenseData";
import { usePermissions } from "../../hooks/usePermissions";
import { useUserProfile } from "../../hooks/useUserProfile";
import { getCurrencySymbol } from "../../lib/currencies";
import { ExpenseForm } from "../expense/ExpenseForm";
import { ExpenseHistoryTable } from "../expense/ExpenseHistoryTable";

export default function ExpensesScreen() {
  const { selectedLocation } = useLocationContext();
  const { profile } = useUserProfile();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const {
    accounts,
    expenseTypes,
    recentExpenses: expenses,
    loading,
    refetch: refreshData,
  } = useExpenseData();

  const [refreshing, setRefreshing] = useState(false);

  // Permission check
  if (!hasPermission("access_expenses")) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-gray-50">
        <View className="bg-red-50 border border-red-200 rounded-lg p-6 items-center">
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text className="text-lg font-semibold text-red-900 mt-4">
            Access Denied
          </Text>
          <Text className="text-sm text-red-700 text-center mt-2">
            You don't have permission to access expenses. Please contact your
            administrator.
          </Text>
        </View>
      </View>
    );
  }

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
        <View className="bg-blue-600 px-4 pt-3 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-white">Expenses</Text>
              <Text className="text-blue-100 text-sm mt-1">
                Track your spending
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowExpenseForm(true)}
              className="bg-white rounded-xl px-4 py-2.5 flex-row items-center shadow-lg"
            >
              <Ionicons name="add-circle" size={20} color="#2563eb" />
              <Text className="text-blue-600 font-bold ml-1.5">Add</Text>
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          <View className="flex-row gap-3">
            {Object.entries(totalExpenses).map(([currency, amount]) => (
              <View
                key={currency}
                className="flex-1 bg-white rounded-xl p-3 shadow-sm"
              >
                <Text className="text-xs font-bold text-gray-500 uppercase mb-1">
                  Total {currency}
                </Text>
                <Text className="text-gray-900 font-bold text-lg">
                  {getCurrencySymbol(currency as "LKR" | "USD")}
                  {amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Expense History */}
        <View className="flex-1 px-4 pt-4">
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
