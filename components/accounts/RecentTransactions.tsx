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
  type: "income" | "expense" | "transfer_in" | "transfer_out" | "transfer";
  currency: string;
  account_id: string;
  account_name: string;
  transfer_account?: string; // For transfers, the other account involved
  conversion_rate?: number;
  note?: string;
}

interface RecentTransactionsProps {
  accounts: AccountWithBalance[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function RecentTransactions({
  accounts,
  onRefresh: externalOnRefresh,
  refreshing: externalRefreshing,
}: RecentTransactionsProps) {
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

      // Fetch transfer transactions (both incoming and outgoing)
      const { data: transferData, error: transferError } = await supabase
        .from("account_transfers")
        .select(
          `
          id,
          created_at,
          note,
          amount,
          conversion_rate,
          from_account_id,
          to_account_id,
          from_account:accounts!account_transfers_from_account_id_fkey(id, name, currency),
          to_account:accounts!account_transfers_to_account_id_fkey(id, name, currency)
        `
        )
        .or(
          `from_account_id.in.(${accountIds.join(
            ","
          )}),to_account_id.in.(${accountIds.join(",")})`
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (transferError) throw transferError;

      // Combine and format transactions
      const formattedIncomes: Transaction[] = (incomeData || []).map(
        (item) => ({
          id: item.id,
          date: item.date,
          description:
            item.note || `${item.type} - ${item.payment_method}` || "Income",
          amount: item.amount,
          type: "income" as const,
          currency: item.currency,
          account_id: (item.accounts as any)?.id || "",
          account_name: (item.accounts as any)?.name || "Unknown Account",
          note: item.note,
        })
      );

      const formattedExpenses: Transaction[] = (expenseData || []).map(
        (item) => ({
          id: item.id,
          date: item.date,
          description:
            item.note || `${item.main_type} - ${item.sub_type}` || "Expense",
          amount: item.amount,
          type: "expense" as const,
          currency: item.currency,
          account_id: (item.accounts as any)?.id || "",
          account_name: (item.accounts as any)?.name || "Unknown Account",
          note: item.note,
        })
      );

      // Format transfer transactions - show one transaction per transfer (not separate in/out)
      const formattedTransfers: Transaction[] = (transferData || []).map(
        (item) => {
          const fromAccount = item.from_account as any;
          const toAccount = item.to_account as any;

          return {
            id: item.id,
            date: item.created_at,
            description: `Transfer from ${
              fromAccount?.name || "Unknown Account"
            } to ${toAccount?.name || "Unknown Account"}`,
            amount: item.amount,
            type: "transfer" as const,
            currency: fromAccount?.currency || "USD",
            account_id: item.from_account_id, // Use source account as primary
            account_name: fromAccount?.name || "Unknown Account",
            transfer_account: toAccount?.name || "Unknown Account",
            conversion_rate: item.conversion_rate,
            note: item.note,
          };
        }
      );

      // Combine and sort by date
      const allTransactions = [
        ...formattedIncomes,
        ...formattedExpenses,
        ...formattedTransfers,
      ]
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

  const getTransactionStyle = (type: Transaction["type"]) => {
    switch (type) {
      case "income":
        return {
          bgColor: "bg-green-100",
          textColor: "text-green-600",
          iconColor: "#10B981",
          iconName: "arrow-down" as const,
          prefix: "+",
        };
      case "expense":
        return {
          bgColor: "bg-red-100",
          textColor: "text-red-600",
          iconColor: "#EF4444",
          iconName: "arrow-up" as const,
          prefix: "-",
        };
      case "transfer":
      case "transfer_in":
        return {
          bgColor: "bg-blue-100",
          textColor: "text-blue-600",
          iconColor: "#3B82F6",
          iconName: "arrow-forward" as const,
          prefix: "",
        };
      case "transfer_out":
        return {
          bgColor: "bg-orange-100",
          textColor: "text-orange-600",
          iconColor: "#F97316",
          iconName: "arrow-back" as const,
          prefix: "-",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          textColor: "text-gray-600",
          iconColor: "#6B7280",
          iconName: "help" as const,
          prefix: "",
        };
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const style = getTransactionStyle(item.type);

    return (
      <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <View
              className={`w-10 h-10 rounded-full flex items-center justify-center ${style.bgColor}`}
            >
              <Ionicons
                name={style.iconName}
                size={18}
                color={style.iconColor}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-medium text-gray-800" numberOfLines={1}>
                {item.description}
              </Text>
              <Text className="text-sm text-gray-500 capitalize">
                {item.type === "transfer"
                  ? "Transfer"
                  : item.type.replace("_", " ")}
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text className={`font-bold ${style.textColor}`}>
              {item.type === "transfer" ? "" : style.prefix}
              {getCurrencySymbol(item.currency)}
              {item.amount.toLocaleString()}
            </Text>
            {item.conversion_rate && item.conversion_rate !== 1 && (
              <Text className="text-xs text-gray-500">
                Rate: {item.conversion_rate}
              </Text>
            )}
          </View>
        </View>
        <View className="flex-row items-center justify-between text-xs text-gray-500">
          <Text>
            {new Date(item.date).toLocaleDateString()}{" "}
            {new Date(item.date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {item.note && (
            <Text className="ml-4 max-w-48 truncate" numberOfLines={1}>
              {item.note}
            </Text>
          )}
        </View>
      </View>
    );
  };

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
          Income, expense, and transfer transactions will appear here
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
          refreshing={Boolean(
            externalRefreshing !== undefined ? externalRefreshing : refreshing
          )}
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
