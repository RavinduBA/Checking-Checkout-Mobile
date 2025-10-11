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
  date: string;
  note?: string | null;
  accounts: {
    name: string;
    currency: string;
  };
}

interface ExpenseHistoryProps {
  expenses: Expense[];
  loading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  onExpensePress?: (expense: Expense) => void;
}

export function ExpenseHistory({
  expenses,
  loading,
  onRefresh,
  refreshing,
  onExpensePress,
}: ExpenseHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const groupExpensesByDate = (expenses: Expense[]) => {
    const grouped: { [key: string]: Expense[] } = {};

    expenses.forEach((expense) => {
      const dateKey = expense.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(expense);
    });

    // Sort dates in descending order
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map((date) => ({
      date,
      expenses: grouped[date].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }));
  };

  if (loading && expenses.length === 0) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-2">Loading expenses...</Text>
      </View>
    );
  }

  if (expenses.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-1 justify-center items-center py-16">
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
      </ScrollView>
    );
  }

  const groupedExpenses = groupExpensesByDate(expenses);

  return (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {groupedExpenses.map(({ date, expenses: dayExpenses }) => (
        <View key={date} className="mb-6">
          {/* Date Header */}
          <View className="px-6 py-2">
            <Text className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {formatDate(date)}
            </Text>
          </View>

          {/* Expenses for this date */}
          <View className="bg-white mx-4 rounded-lg shadow-sm border border-gray-100">
            {dayExpenses.map((expense, index) => (
              <TouchableOpacity
                key={expense.id}
                className={`p-4 ${
                  index < dayExpenses.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
                onPress={() => onExpensePress?.(expense)}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    {/* Category */}
                    <View className="flex-row items-center mb-1">
                      <View className="bg-red-100 rounded-full p-1 mr-2">
                        <Ionicons
                          name="trending-down"
                          size={12}
                          color="#DC2626"
                        />
                      </View>
                      <Text className="font-medium text-gray-800">
                        {expense.main_type}
                      </Text>
                      {expense.sub_type !== expense.main_type && (
                        <>
                          <Text className="text-gray-400 mx-1">•</Text>
                          <Text className="text-sm text-gray-600">
                            {expense.sub_type}
                          </Text>
                        </>
                      )}
                    </View>

                    {/* Account */}
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="card-outline" size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-500 ml-1">
                        {expense.accounts.name}
                      </Text>
                    </View>

                    {/* Note */}
                    {expense.note && (
                      <Text
                        className="text-sm text-gray-500 mt-1"
                        numberOfLines={2}
                      >
                        {expense.note}
                      </Text>
                    )}
                  </View>

                  {/* Amount */}
                  <View className="items-end">
                    <Text className="text-lg font-bold text-red-600">
                      -{getCurrencySymbol(expense.currency as CurrencyType)}
                      {expense.amount.toLocaleString()}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <View className="px-2 py-1 bg-gray-100 rounded">
                        <Text className="text-xs text-gray-600">
                          {expense.currency}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Load more indicator */}
      {loading && expenses.length > 0 && (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}
    </ScrollView>
  );
}
