import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CurrencyType, getCurrencySymbol } from "../../lib/currencies";

interface Expense {
  id: string;
  main_type: string;
  sub_type: string;
  amount: number;
  currency: string;
  account_id?: string;
  date: string;
  note?: string | null;
  accounts?: {
    name: string;
    currency: string;
  };
  locations?: {
    name: string;
  };
}

interface Account {
  id: string;
  name: string;
  currency: string;
}

interface ExpenseHistoryTableProps {
  expenses: Expense[];
  accounts: Account[];
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onExpensePress?: (expense: Expense) => void;
}

export function ExpenseHistoryTable({
  expenses,
  accounts,
  loading = false,
  onRefresh,
  refreshing = false,
  onExpensePress,
}: ExpenseHistoryTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAccountName = (expense: Expense) => {
    if (expense.accounts) {
      return expense.accounts.name;
    }
    const account = accounts.find((acc) => acc.id === expense.account_id);
    return account?.name || "Unknown Account";
  };

  const getAccountCurrency = (expense: Expense) => {
    if (expense.accounts) {
      return expense.accounts.currency;
    }
    const account = accounts.find((acc) => acc.id === expense.account_id);
    return account?.currency || expense.currency;
  };

  if (loading && expenses.length === 0) {
    return (
      <View className="bg-white rounded-lg border border-gray-200 p-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-800">
            Recent Expenses
          </Text>
        </View>
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-2">Loading expenses...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg border border-gray-200">
      <View className="px-6 py-4 border-b border-gray-200">
        <Text className="text-lg font-semibold text-gray-800">
          Recent Expenses
        </Text>
      </View>

      <ScrollView
        className="max-h-96"
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {expenses.length === 0 ? (
          <View className="py-16 items-center">
            <View className="bg-gray-100 rounded-full p-6 mb-4">
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-lg font-medium text-gray-800 mb-2">
              No expenses yet
            </Text>
            <Text className="text-gray-500 text-center px-8">
              Start tracking your expenses by adding your first expense entry
            </Text>
          </View>
        ) : (
          <View>
            {/* Table Header */}
            <View className="flex-row bg-gray-50 px-4 py-3 border-b border-gray-200">
              <Text className="flex-1 text-sm font-medium text-gray-700">
                Date
              </Text>
              <Text className="flex-2 text-sm font-medium text-gray-700">
                Category
              </Text>
              <Text className="flex-1 text-sm font-medium text-gray-700 text-right">
                Amount
              </Text>
              <Text className="flex-1 text-sm font-medium text-gray-700 text-right">
                Account
              </Text>
            </View>

            {/* Table Body */}
            {expenses.map((expense, index) => (
              <TouchableOpacity
                key={expense.id}
                className={`flex-row px-4 py-4 ${
                  index < expenses.length - 1 ? "border-b border-gray-100" : ""
                }`}
                onPress={() => onExpensePress?.(expense)}
              >
                {/* Date Column */}
                <View className="flex-1">
                  <Text className="text-sm text-gray-800">
                    {formatDate(expense.date)}
                  </Text>
                </View>

                {/* Category Column */}
                <View className="flex-2">
                  <Text className="text-sm font-medium text-gray-800 capitalize">
                    {expense.main_type}
                  </Text>
                  <Text className="text-xs text-gray-500 capitalize">
                    {expense.sub_type}
                  </Text>
                </View>

                {/* Amount Column */}
                <View className="flex-1 items-end">
                  <Text className="text-sm font-bold text-red-600">
                    -{getCurrencySymbol(expense.currency as CurrencyType)}
                    {expense.amount.toLocaleString()}
                  </Text>
                  <View className="px-1 py-0.5 bg-gray-100 rounded mt-1">
                    <Text className="text-xs text-gray-600">
                      {expense.currency}
                    </Text>
                  </View>
                </View>

                {/* Account Column */}
                <View className="flex-1 items-end">
                  <Text className="text-sm text-gray-800">
                    {getAccountName(expense)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    ({getAccountCurrency(expense)})
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Load more indicator */}
        {loading && expenses.length > 0 && (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
