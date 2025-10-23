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
    <View className="flex-1">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-bold text-gray-900">
          Recent Expenses
        </Text>
        <View className="bg-rose-100 px-2.5 py-1 rounded-full">
          <Text className="text-xs font-bold text-rose-600">
            {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {expenses.length === 0 ? (
          <View className="bg-white rounded-2xl p-12 items-center border border-gray-100">
            <View className="bg-rose-50 rounded-full p-6 mb-4">
              <Ionicons name="receipt-outline" size={48} color="#f43f5e" />
            </View>
            <Text className="text-lg font-bold text-gray-900 mb-2">
              No expenses yet
            </Text>
            <Text className="text-gray-500 text-center px-4">
              Start tracking your expenses by adding your first entry
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {expenses.map((expense) => (
              <TouchableOpacity
                key={expense.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                activeOpacity={0.7}
                onPress={() => onExpensePress?.(expense)}
              >
                {/* Header Row */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <View className="bg-rose-50 rounded-lg p-1.5">
                        <Ionicons name="remove-circle" size={16} color="#ef4444" />
                      </View>
                      <Text className="font-bold text-gray-900 capitalize flex-1" numberOfLines={1}>
                        {expense.main_type}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500 capitalize ml-8">
                      {expense.sub_type}
                    </Text>
                  </View>
                  <View className="items-end ml-2">
                    <Text className="text-base font-bold text-rose-600">
                      -{getCurrencySymbol(expense.currency as CurrencyType)}
                      {expense.amount.toLocaleString()}
                    </Text>
                    <View className="bg-rose-500 px-2 py-0.5 rounded-full mt-1">
                      <Text className="text-[10px] font-bold text-white">
                        {expense.currency}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Details Row */}
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="calendar-outline" size={13} color="#6b7280" />
                      <Text className="text-xs text-gray-600">
                        {formatDate(expense.date)}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="wallet-outline" size={13} color="#6b7280" />
                      <Text className="text-xs text-gray-600" numberOfLines={1}>
                        {getAccountName(expense)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Note if exists */}
                {expense.note && (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <View className="flex-row items-start gap-2">
                      <Ionicons name="document-text-outline" size={13} color="#6b7280" />
                      <Text className="text-xs text-gray-600 flex-1" numberOfLines={2}>
                        {expense.note}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Load more indicator */}
        {loading && expenses.length > 0 && (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#ef4444" />
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
