import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUserProfile } from "../../hooks/useUserProfile";
import { supabase } from "../../lib/supabase";
import { formatCurrency } from "../../utils/currency";

interface Account {
  id: string;
  name: string;
  currency: string;
  current_balance: number;
  initial_balance: number;
  location_access: string[];
  tenant_id: string;
  created_at: string;
  updated_at?: string | null;
}

type AccountBalance = {
  account: Account;
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransfers: number;
  transactionCount: number;
};

type Transaction = {
  id: string;
  date: string;
  type: "income" | "expense" | "transfer_in" | "transfer_out";
  description: string;
  amount: number;
  account_name: string;
  currency: string;
  note?: string;
};

export default function AccountsReportsMobile() {
  const { profile } = useUserProfile();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"balances" | "transactions">(
    "balances"
  );

  // Modal states
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchData();
    }
  }, [profile?.tenant_id]);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchAccountBalances();
      fetchTransactions();
    }
  }, [accounts, selectedAccount, dateFrom, dateTo]);

  const fetchData = async () => {
    if (!profile?.tenant_id) {
      console.log("No tenant_id found in profile:", profile);
      setLoading(false);
      return;
    }

    console.log("Fetching accounts for tenant:", profile.tenant_id);
    setLoading(true);
    try {
      const { data: accountsData, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("name");

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Accounts fetched:", accountsData?.length || 0);
      setAccounts(accountsData || []);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch accounts");
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountBalances = async () => {
    if (!profile?.tenant_id) return;

    try {
      const balances: AccountBalance[] = [];

      for (const account of accounts) {
        // Fetch income for this account
        let incomeQuery = supabase
          .from("payments")
          .select("amount")
          .eq("account_id", account.id);

        // Fetch expenses for this account
        let expenseQuery = supabase
          .from("expenses")
          .select("amount")
          .eq("account_id", account.id);

        // Fetch transfers from this account
        let transfersFromQuery = supabase
          .from("account_transfers")
          .select("amount")
          .eq("from_account_id", account.id);

        // Fetch transfers to this account
        let transfersToQuery = supabase
          .from("account_transfers")
          .select("amount, conversion_rate")
          .eq("to_account_id", account.id);

        // Apply date filters if specified
        if (dateFrom) {
          const fromStr = dateFrom.toISOString().split("T")[0];
          incomeQuery = incomeQuery.gte("date", fromStr);
          expenseQuery = expenseQuery.gte("date", fromStr);
          transfersFromQuery = transfersFromQuery.gte("created_at", fromStr);
          transfersToQuery = transfersToQuery.gte("created_at", fromStr);
        }
        if (dateTo) {
          const toStr = dateTo.toISOString().split("T")[0];
          incomeQuery = incomeQuery.lte("date", toStr);
          expenseQuery = expenseQuery.lte("date", toStr);
          transfersFromQuery = transfersFromQuery.lte("created_at", toStr);
          transfersToQuery = transfersToQuery.lte("created_at", toStr);
        }

        const [
          incomeResult,
          expenseResult,
          transfersFromResult,
          transfersToResult,
        ] = await Promise.all([
          incomeQuery,
          expenseQuery,
          transfersFromQuery,
          transfersToQuery,
        ]);

        const incomeData = incomeResult.data || [];
        const expenseData = expenseResult.data || [];
        const transfersFromData = transfersFromResult.data || [];
        const transfersToData = transfersToResult.data || [];

        const totalIncome = incomeData.reduce(
          (sum: number, item: any) => sum + parseFloat(item.amount.toString()),
          0
        );
        const totalExpenses = expenseData.reduce(
          (sum: number, item: any) => sum + parseFloat(item.amount.toString()),
          0
        );
        const transfersOut = transfersFromData.reduce(
          (sum: number, item: any) => sum + parseFloat(item.amount.toString()),
          0
        );
        const transfersIn = transfersToData.reduce(
          (sum: number, item: any) =>
            sum +
            parseFloat(item.amount.toString()) *
              parseFloat(item.conversion_rate.toString()),
          0
        );

        // Use current_balance from database instead of manual calculation
        // The database automatically calculates this with triggers
        const currentBalance = account.current_balance;
        const transactionCount =
          incomeData.length +
          expenseData.length +
          transfersFromData.length +
          transfersToData.length;

        balances.push({
          account,
          currentBalance,
          totalIncome,
          totalExpenses,
          totalTransfers: transfersIn - transfersOut,
          transactionCount,
        });
      }

      setAccountBalances(balances);
    } catch (error) {
      console.error("Error fetching account balances:", error);
    }
  };

  const fetchTransactions = async () => {
    if (!profile?.tenant_id) return;

    try {
      const allTransactions: Transaction[] = [];

      for (const account of accounts) {
        if (selectedAccount !== "all" && account.id !== selectedAccount)
          continue;

        // Fetch income transactions
        let incomeQuery = supabase
          .from("income")
          .select("id, date, amount, type, note")
          .eq("account_id", account.id);

        // Fetch expense transactions
        let expenseQuery = supabase
          .from("expenses")
          .select("id, date, amount, main_type, sub_type, note")
          .eq("account_id", account.id);

        // Apply date filters
        if (dateFrom) {
          const fromStr = dateFrom.toISOString().split("T")[0];
          incomeQuery = incomeQuery.gte("date", fromStr);
          expenseQuery = expenseQuery.gte("date", fromStr);
        }
        if (dateTo) {
          const toStr = dateTo.toISOString().split("T")[0];
          incomeQuery = incomeQuery.lte("date", toStr);
          expenseQuery = expenseQuery.lte("date", toStr);
        }

        const [incomeResult, expenseResult] = await Promise.all([
          incomeQuery.order("date", { ascending: false }),
          expenseQuery.order("date", { ascending: false }),
        ]);

        // Process income transactions
        (incomeResult.data || []).forEach((item: any) => {
          allTransactions.push({
            id: item.id,
            date: item.date,
            type: "income",
            description: `${item.type} Income`,
            amount: parseFloat(item.amount.toString()),
            account_name: account.name,
            currency: account.currency,
            note: item.note,
          });
        });

        // Process expense transactions
        (expenseResult.data || []).forEach((item: any) => {
          allTransactions.push({
            id: item.id,
            date: item.date,
            type: "expense",
            description: `${item.main_type} - ${item.sub_type}`,
            amount: parseFloat(item.amount.toString()),
            account_name: account.name,
            currency: account.currency,
            note: item.note,
          });
        });
      }

      // Sort all transactions by date (newest first)
      allTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "income":
        return <Ionicons name="arrow-up-circle" size={20} color="#10b981" />;
      case "expense":
        return <Ionicons name="arrow-down-circle" size={20} color="#ef4444" />;
      case "transfer_in":
        return (
          <Ionicons name="arrow-forward-circle" size={20} color="#3b82f6" />
        );
      case "transfer_out":
        return <Ionicons name="arrow-back-circle" size={20} color="#f97316" />;
      default:
        return <Ionicons name="cash" size={20} color="#6b7280" />;
    }
  };

  const exportData = async () => {
    try {
      const csvContent = [
        [
          "Account",
          "Date",
          "Type",
          "Description",
          "Amount",
          "Currency",
          "Note",
        ],
        ...transactions.map((txn) => [
          txn.account_name,
          txn.date,
          txn.type,
          txn.description,
          txn.amount.toString(),
          txn.currency,
          txn.note || "",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      await Share.share({
        message: csvContent,
        title: `Account Report - ${new Date().toISOString().split("T")[0]}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
      console.error("Export error:", error);
    }
  };

  const filteredTransactions = transactions.filter(
    (txn) =>
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.account_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">Loading accounts...</Text>
      </View>
    );
  }

  if (!profile?.tenant_id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="mt-4 text-lg font-semibold text-gray-900">
          No Profile Found
        </Text>
        <Text className="mt-2 text-gray-600 text-center">
          Please make sure you're logged in with a valid account.
        </Text>
      </View>
    );
  }

  if (!loading && accounts.length === 0) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="card" size={24} color="#3b82f6" />
            <Text className="text-xl font-bold text-gray-900">
              Account Reports
            </Text>
          </View>
          <Text className="text-sm text-gray-600">
            View account balances and transactions
          </Text>
        </View>
        <View className="flex-1 items-center justify-center p-8 mt-20">
          <Ionicons name="wallet-outline" size={64} color="#9ca3af" />
          <Text className="mt-4 text-lg font-semibold text-gray-900">
            No Accounts Found
          </Text>
          <Text className="mt-2 text-gray-600 text-center">
            Create an account in the Master Files section to get started.
          </Text>
          <TouchableOpacity
            onPress={fetchData}
            className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Refresh</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <Ionicons name="card" size={24} color="#3b82f6" />
              <Text className="text-xl font-bold text-gray-900">
                Account Reports
              </Text>
            </View>
            <Text className="text-sm text-gray-600">
              View account balances and transactions
            </Text>
          </View>
          <TouchableOpacity
            onPress={exportData}
            className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center gap-2"
          >
            <Ionicons name="download" size={16} color="white" />
            <Text className="text-white font-medium">Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View className="bg-white mx-4 my-4 rounded-lg border border-gray-200">
        <View className="p-4 border-b border-gray-200">
          <Text className="text-base font-semibold text-gray-900">Filters</Text>
        </View>
        <View className="p-4 gap-4">
          {/* Account Filter */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Account
            </Text>
            <TouchableOpacity
              onPress={() => setShowAccountPicker(true)}
              className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
            >
              <Text className="text-gray-900">
                {selectedAccount === "all"
                  ? "All Accounts"
                  : accounts.find((a) => a.id === selectedAccount)?.name ||
                    "Select Account"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Date Filters */}
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                From Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowFromDatePicker(true)}
                className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
              >
                <Text className="text-gray-900">
                  {dateFrom ? dateFrom.toLocaleDateString() : "Select Date"}
                </Text>
                <Ionicons name="calendar" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                To Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowToDatePicker(true)}
                className="border border-gray-300 rounded-lg px-3 py-3 flex-row items-center justify-between"
              >
                <Text className="text-gray-900">
                  {dateTo ? dateTo.toLocaleDateString() : "Select Date"}
                </Text>
                <Ionicons name="calendar" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Refresh Button */}
          <TouchableOpacity
            onPress={fetchData}
            className="bg-blue-500 py-3 rounded-lg items-center"
          >
            <Text className="text-white font-medium">Refresh Data</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View className="bg-white mx-4 mb-4 rounded-lg border border-gray-200 overflow-hidden">
        <View className="flex-row border-b border-gray-200">
          <TouchableOpacity
            onPress={() => setActiveTab("balances")}
            className={`flex-1 py-3 items-center ${
              activeTab === "balances"
                ? "bg-blue-50 border-b-2 border-blue-500"
                : ""
            }`}
          >
            <Text
              className={`font-medium ${
                activeTab === "balances" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Balances
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("transactions")}
            className={`flex-1 py-3 items-center ${
              activeTab === "transactions"
                ? "bg-blue-50 border-b-2 border-blue-500"
                : ""
            }`}
          >
            <Text
              className={`font-medium ${
                activeTab === "transactions" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Transactions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Balances Tab Content */}
        {activeTab === "balances" && (
          <View className="p-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Account Balances
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              View current balances and transaction summaries
            </Text>

            {accountBalances.map((balance) => (
              <View
                key={balance.account.id}
                className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {balance.account.name}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <View className="bg-blue-100 px-2 py-0.5 rounded">
                        <Text className="text-xs font-medium text-blue-700">
                          {balance.account.currency}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-600">
                        {balance.transactionCount} transactions
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-gray-600">
                      Current Balance
                    </Text>
                    <Text className="text-lg font-bold text-gray-900">
                      {formatCurrency(
                        balance.currentBalance,
                        balance.account.currency
                      )}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <View className="flex-1 bg-green-50 rounded p-2 border border-green-200">
                    <Text className="text-xs text-gray-600 mb-1">Income</Text>
                    <Text className="text-sm font-semibold text-green-600">
                      +
                      {formatCurrency(
                        balance.totalIncome,
                        balance.account.currency
                      )}
                    </Text>
                  </View>
                  <View className="flex-1 bg-red-50 rounded p-2 border border-red-200">
                    <Text className="text-xs text-gray-600 mb-1">Expenses</Text>
                    <Text className="text-sm font-semibold text-red-600">
                      -
                      {formatCurrency(
                        balance.totalExpenses,
                        balance.account.currency
                      )}
                    </Text>
                  </View>
                  <View className="flex-1 bg-blue-50 rounded p-2 border border-blue-200">
                    <Text className="text-xs text-gray-600 mb-1">
                      Transfers
                    </Text>
                    <Text
                      className={`text-sm font-semibold ${
                        balance.totalTransfers >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {balance.totalTransfers >= 0 ? "+" : ""}
                      {formatCurrency(
                        Math.abs(balance.totalTransfers),
                        balance.account.currency
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Transactions Tab Content */}
        {activeTab === "transactions" && (
          <View className="p-4">
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Transaction History
              </Text>
              <Text className="text-sm text-gray-600 mb-3">
                View detailed transaction records
              </Text>

              {/* Search */}
              <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
                <Ionicons name="search" size={20} color="#6b7280" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search transactions..."
                  placeholderTextColor="#9ca3af"
                  className="flex-1 ml-2 text-gray-900"
                />
              </View>
            </View>

            {filteredTransactions.slice(0, 50).map((transaction) => (
              <View
                key={transaction.id}
                className="bg-white rounded-lg p-3 mb-3 border border-gray-200"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2 flex-1">
                    {getTransactionIcon(transaction.type)}
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {transaction.account_name}
                      </Text>
                      <Text className="text-xs text-gray-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text
                      className={`text-base font-semibold ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </Text>
                    <View className="bg-gray-100 px-2 py-0.5 rounded mt-1">
                      <Text className="text-xs text-gray-600">
                        {transaction.currency}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <View
                    className={`px-2 py-1 rounded ${
                      transaction.type === "income"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        transaction.type === "income"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {transaction.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    className="text-xs text-gray-600 flex-1 ml-2"
                    numberOfLines={1}
                  >
                    {transaction.description}
                  </Text>
                </View>

                {transaction.note && (
                  <Text className="text-xs text-gray-500 mt-2">
                    Note: {transaction.note}
                  </Text>
                )}
              </View>
            ))}

            {filteredTransactions.length > 50 && (
              <Text className="text-center text-gray-600 text-sm mt-3">
                Showing first 50 transactions
              </Text>
            )}

            {filteredTransactions.length === 0 && (
              <View className="py-8 items-center">
                <Ionicons
                  name="document-text-outline"
                  size={48}
                  color="#9ca3af"
                />
                <Text className="text-gray-600 mt-3">
                  No transactions found
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Account Picker Modal */}
      <Modal
        visible={showAccountPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccountPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Select Account
              </Text>
              <TouchableOpacity onPress={() => setShowAccountPicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
              <TouchableOpacity
                onPress={() => {
                  setSelectedAccount("all");
                  setShowAccountPicker(false);
                }}
                className="py-3 border-b border-gray-200 flex-row items-center justify-between"
              >
                <Text className="text-gray-900 font-medium">All Accounts</Text>
                {selectedAccount === "all" && (
                  <Ionicons name="checkmark" size={24} color="#3b82f6" />
                )}
              </TouchableOpacity>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  onPress={() => {
                    setSelectedAccount(account.id);
                    setShowAccountPicker(false);
                  }}
                  className="py-3 border-b border-gray-200 flex-row items-center justify-between"
                >
                  <View>
                    <Text className="text-gray-900 font-medium">
                      {account.name}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      ({account.currency})
                    </Text>
                  </View>
                  {selectedAccount === account.id && (
                    <Ionicons name="checkmark" size={24} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Pickers */}
      {showFromDatePicker && (
        <DateTimePicker
          value={dateFrom || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromDatePicker(false);
            if (selectedDate) setDateFrom(selectedDate);
          }}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={dateTo || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToDatePicker(false);
            if (selectedDate) setDateTo(selectedDate);
          }}
        />
      )}
    </ScrollView>
  );
}
