import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useLocationContext } from "../../contexts/LocationContext";
import { useExpenseData } from "../../hooks/useExpenseData";
import { useUserProfile } from "../../hooks/useUserProfile";
import { CurrencyType, getCurrencySymbol } from "../../lib/currencies";
import { ExpenseForm } from "../expense/ExpenseForm";
import { ExpenseHistory } from "../expense/ExpenseHistory";

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

  const handleExpensePress = (expense: any) => {
    // TODO: Navigate to expense details screen
    Alert.alert(
      "Expense Details",
      `${expense.main_type} - ${expense.sub_type}\nAmount: ${getCurrencySymbol(
        expense.currency as CurrencyType
      )}${expense.amount.toLocaleString()}\nAccount: ${expense.accounts.name}${
        expense.note ? `\nNote: ${expense.note}` : ""
      }`,
      [{ text: "OK" }]
    );
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

          {/* Summary Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="space-x-4"
          >
            {/* Total Expenses */}
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 w-48">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-red-700">
                  Total Expenses
                </Text>
                <View className="bg-red-200 rounded-full p-1">
                  <Ionicons name="trending-down" size={16} color="#DC2626" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-red-700">
                {getCurrencySymbol("LKR")}
                {totalExpenses.LKR.toLocaleString()}
              </Text>
              {totalExpenses.USD > 0 && (
                <Text className="text-sm text-red-600 mt-1">
                  + {getCurrencySymbol("USD")}
                  {totalExpenses.USD.toLocaleString()}
                </Text>
              )}
            </View>

            {/* Active Accounts */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-48">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-blue-700">
                  Active Accounts
                </Text>
                <View className="bg-blue-200 rounded-full p-1">
                  <Ionicons name="card" size={16} color="#2563EB" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-blue-700">
                {accounts.length}
              </Text>
              <Text className="text-sm text-blue-600 mt-1">
                Available for expenses
              </Text>
            </View>

            {/* Expense Categories */}
            <View className="bg-green-50 border border-green-200 rounded-lg p-4 w-48">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-green-700">
                  Categories
                </Text>
                <View className="bg-green-200 rounded-full p-1">
                  <Ionicons name="list" size={16} color="#059669" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-green-700">
                {new Set(expenseTypes.map((et) => et.main_type)).size}
              </Text>
              <Text className="text-sm text-green-600 mt-1">
                Main categories
              </Text>
            </View>

            {/* Recent Expenses */}
            <View className="bg-purple-50 border border-purple-200 rounded-lg p-4 w-48">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-purple-700">
                  This Month
                </Text>
                <View className="bg-purple-200 rounded-full p-1">
                  <Ionicons name="calendar" size={16} color="#7C3AED" />
                </View>
              </View>
              <Text className="text-2xl font-bold text-purple-700">
                {
                  expenses.filter((exp) => {
                    const expenseDate = new Date(exp.date);
                    const now = new Date();
                    return (
                      expenseDate.getMonth() === now.getMonth() &&
                      expenseDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </Text>
              <Text className="text-sm text-purple-600 mt-1">
                Expense entries
              </Text>
            </View>
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View className="bg-white border-b border-gray-200 px-6 py-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="space-x-3"
          >
            <TouchableOpacity className="bg-gray-100 rounded-lg px-4 py-2 flex-row items-center">
              <Ionicons name="filter" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2 font-medium">Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-100 rounded-lg px-4 py-2 flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2 font-medium">Date Range</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-100 rounded-lg px-4 py-2 flex-row items-center">
              <Ionicons name="list-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2 font-medium">Category</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-100 rounded-lg px-4 py-2 flex-row items-center">
              <Ionicons name="card-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2 font-medium">Account</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-100 rounded-lg px-4 py-2 flex-row items-center">
              <Ionicons name="download-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2 font-medium">Export</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Expense History */}
        <View className="flex-1 bg-gray-50">
          <ExpenseHistory
            expenses={expensesWithAccounts}
            loading={loading}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            onExpensePress={handleExpensePress}
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
