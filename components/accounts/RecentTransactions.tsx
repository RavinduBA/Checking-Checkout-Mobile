import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

interface Account {
  id: string;
  name: string;
  currency: "LKR" | "USD" | "EUR" | "GBP";
  current_balance: number;
  initial_balance: number;
  location_access: string[];
  tenant_id: string;
  created_at: string;
}

type AccountWithBalance = Account & { currentBalance: number };

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  currency: string;
  account_id: string;
  account_name: string;
}

interface RecentTransactionsProps {
  accounts: AccountWithBalance[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function RecentTransactions({ accounts, onRefresh: externalOnRefresh, refreshing: externalRefreshing }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "LKR":
        return "Rs.";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return "$";
    }
  };

  const fetchTransactions = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      if (accounts.length === 0) {
        setTransactions([]);
        return;
      }

      const accountIds = accounts.map((acc) => acc.id);

      // Fetch income transactions
      const { data: incomeData, error: incomeError } = await supabase
        .from("income")
        .select(
          `
          id,
          date,
          note,
          amount,
          currency,
          payment_method,
          type,
          accounts(id, name)
        `
        )
        .in("account_id", accountIds)
        .order("date", { ascending: false })
        .limit(20);

      if (incomeError) throw incomeError;

      // Fetch expense transactions
      const { data: expenseData, error: expenseError } = await supabase
        .from("expenses")
        .select(
          `
          id,
          date,
          note,
          main_type,
          sub_type,
          amount,
          currency,
          accounts(id, name)
        `
        )
        .in("account_id", accountIds)
        .order("date", { ascending: false })
        .limit(20);

      if (expenseError) throw expenseError;

      // Combine and format transactions
      const formattedIncomes: Transaction[] = (incomeData || []).map(
        (item) => ({
          id: item.id,
          date: item.date,
          description: item.note || `${item.type} - ${item.payment_method}` || "Income",
          amount: item.amount,
          type: "income" as const,
          currency: item.currency,
          account_id: (item.accounts as any)?.id || "",
          account_name: (item.accounts as any)?.name || "Unknown Account",
        })
      );

      const formattedExpenses: Transaction[] = (expenseData || []).map(
        (item) => ({
          id: item.id,
          date: item.date,
          description: item.note || `${item.main_type} - ${item.sub_type}` || "Expense",
          amount: item.amount,
          type: "expense" as const,
          currency: item.currency,
          account_id: (item.accounts as any)?.id || "",
          account_name: (item.accounts as any)?.name || "Unknown Account",
        })
      );

      // Combine and sort by date
      const allTransactions = [...formattedIncomes, ...formattedExpenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20);

      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [accounts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              item.type === "income" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <Ionicons
              name={item.type === "income" ? "arrow-down" : "arrow-up"}
              size={18}
              color={item.type === "income" ? "#10B981" : "#EF4444"}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-medium text-gray-800" numberOfLines={1}>
              {item.description}
            </Text>
            <Text className="text-sm text-gray-500">{item.account_name}</Text>
          </View>
        </View>

        <View className="items-end">
          <Text
            className={`font-bold ${
              item.type === "income" ? "text-green-600" : "text-red-600"
            }`}
          >
            {item.type === "income" ? "+" : "-"}
            {getCurrencySymbol(item.currency)}
            {item.amount.toLocaleString()}
          </Text>
          <Text className="text-xs text-gray-500">{formatDate(item.date)}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-500 mt-4">Loading transactions...</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
        <Text className="text-gray-500 text-center text-base mb-2 mt-4">
          No transactions found
        </Text>
        <Text className="text-gray-400 text-center text-sm">
          Income and expense transactions will appear here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl
          refreshing={externalRefreshing !== undefined ? externalRefreshing : refreshing}
          onRefresh={externalOnRefresh || (() => fetchTransactions(true))}
          colors={["#3B82F6"]}
        />
      }
    />
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <View className="space-y-3">
      {[1, 2, 3, 4, 5].map((index) => (
        <View
          key={index}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-gray-200 rounded-full" />
              <View className="ml-3 flex-1">
                <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <View className="h-3 bg-gray-200 rounded w-1/2" />
              </View>
            </View>
            <View className="items-end">
              <View className="h-4 bg-gray-200 rounded w-16 mb-2" />
              <View className="h-3 bg-gray-200 rounded w-12" />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
