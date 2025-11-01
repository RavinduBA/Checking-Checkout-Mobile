import { useLocationContext } from "@/contexts/LocationContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Account {
  id: string;
  name: string;
  currency: string;
  current_balance: number;
  status: string;
  type: string;
  tenant_id: string;
  location_id: string;
}

interface AccountBalance {
  account: Account;
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransfers: number;
  transactionCount: number;
}

interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense" | "transfer_in" | "transfer_out";
  description: string;
  amount: number;
  account_name: string;
  currency: string;
  note?: string;
}

interface AccountCardProps {
  account: Account;
  balance: AccountBalance;
  onPress: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  balance,
  onPress,
}) => {
  const isPositive = balance.currentBalance >= 0;
  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 border border-gray-200 mb-3"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            {account.name}
          </Text>
          <Text className="text-xs text-gray-600">{account.type}</Text>
        </View>
        <View
          className={`px-2 py-1 rounded-md ${
            account.status === "active" ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              account.status === "active" ? "text-green-600" : "text-gray-600"
            }`}
          >
            {account.status}
          </Text>
        </View>
      </View>

      <View className="border-t border-gray-200 pt-3 mt-2">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-xs text-gray-600 mb-1">Current Balance</Text>
            <Text
              className={`text-xl font-bold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(balance.currentBalance, account.currency)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-600 mb-1">Transactions</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {balance.transactionCount}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-xs text-gray-600">Income</Text>
            <Text className="text-sm font-semibold text-green-600">
              {formatCurrency(balance.totalIncome, account.currency)}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-xs text-gray-600">Expenses</Text>
            <Text className="text-sm font-semibold text-red-600">
              {formatCurrency(balance.totalExpenses, account.currency)}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-end gap-1 mt-3">
        <Text className="text-xs text-blue-500 font-medium">View Details</Text>
        <Ionicons name="chevron-forward" size={14} color="#3b82f6" />
      </View>
    </TouchableOpacity>
  );
};

interface TransactionCardProps {
  transaction: Transaction;
  onPress: () => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const getTypeColor = () => {
    switch (transaction.type) {
      case "income":
        return "text-green-600";
      case "expense":
        return "text-red-600";
      case "transfer_in":
        return "text-blue-600";
      case "transfer_out":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getTypeIcon = () => {
    switch (transaction.type) {
      case "income":
        return "arrow-down-circle";
      case "expense":
        return "arrow-up-circle";
      case "transfer_in":
        return "arrow-forward-circle";
      case "transfer_out":
        return "arrow-back-circle";
      default:
        return "cash";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 border border-gray-200 mb-3"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-row items-start flex-1">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
              transaction.type === "income"
                ? "bg-green-100"
                : transaction.type === "expense"
                ? "bg-red-100"
                : "bg-blue-100"
            }`}
          >
            <Ionicons
              name={getTypeIcon() as any}
              size={18}
              color={
                transaction.type === "income"
                  ? "#16a34a"
                  : transaction.type === "expense"
                  ? "#dc2626"
                  : "#3b82f6"
              }
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-gray-900 mb-1">
              {transaction.description}
            </Text>
            <Text className="text-xs text-gray-600">
              {transaction.account_name}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              {new Date(transaction.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className={`text-lg font-bold ${getTypeColor()}`}>
            {transaction.type === "expense" ||
            transaction.type === "transfer_out"
              ? "-"
              : "+"}
            {formatCurrency(transaction.amount, transaction.currency)}
          </Text>
        </View>
      </View>
      {transaction.note && (
        <View className="mt-2 p-2 bg-gray-50 rounded">
          <Text className="text-xs text-gray-600">{transaction.note}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <View className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
      <View
        className="w-8 h-8 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text className="text-xs text-gray-600 mb-1">{title}</Text>
      <Text className="text-lg font-bold text-gray-900">{value}</Text>
    </View>
  );
};

type TabType = "balances" | "transactions";

export default function AccountsReportsMobile() {
  const { tenant } = useAuth();
  const { selectedLocation } = useLocationContext();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("balances");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchData();
  }, [tenant, selectedLocation]);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchAccountBalances();
      fetchTransactions();
    }
  }, [accounts, selectedAccount, dateFrom, dateTo]);

  const fetchData = async () => {
    if (!tenant?.id || !selectedLocation?.id) return;

    setLoading(true);
    try {
      const { data: accountsData, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("location_id", selectedLocation.id)
        .order("name");

      if (error) throw error;
      setAccounts(accountsData || []);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch accounts");
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountBalances = async () => {
    if (!tenant?.id || !selectedLocation?.id) return;

    try {
      const balances: AccountBalance[] = [];

      for (const account of accounts) {
        // Fetch income for this account (from payments table)
        let incomeQuery = supabase
          .from("payments")
          .select("amount")
          .eq("account_id", account.id)
          .eq("tenant_id", tenant.id);

        // Fetch expenses for this account
        let expenseQuery = supabase
          .from("expenses")
          .select("amount")
          .eq("account_id", account.id)
          .eq("tenant_id", tenant.id);

        // Fetch transfers from this account
        let transfersFromQuery = supabase
          .from("account_transfers")
          .select("amount")
          .eq("from_account_id", account.id)
          .eq("tenant_id", tenant.id);

        // Fetch transfers to this account
        let transfersToQuery = supabase
          .from("account_transfers")
          .select("amount, conversion_rate")
          .eq("to_account_id", account.id)
          .eq("tenant_id", tenant.id);

        // Apply date filters if specified
        if (dateFrom) {
          incomeQuery = incomeQuery.gte("date", dateFrom);
          expenseQuery = expenseQuery.gte("date", dateFrom);
          transfersFromQuery = transfersFromQuery.gte("created_at", dateFrom);
          transfersToQuery = transfersToQuery.gte("created_at", dateFrom);
        }
        if (dateTo) {
          incomeQuery = incomeQuery.lte("date", dateTo);
          expenseQuery = expenseQuery.lte("date", dateTo);
          transfersFromQuery = transfersFromQuery.lte("created_at", dateTo);
          transfersToQuery = transfersToQuery.lte("created_at", dateTo);
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
          (sum, item) => sum + parseFloat(item.amount.toString()),
          0
        );
        const totalExpenses = expenseData.reduce(
          (sum, item) => sum + parseFloat(item.amount.toString()),
          0
        );
        const transfersOut = transfersFromData.reduce(
          (sum, item) => sum + parseFloat(item.amount.toString()),
          0
        );
        const transfersIn = transfersToData.reduce(
          (sum, item) =>
            sum +
            parseFloat(item.amount.toString()) *
              parseFloat(item.conversion_rate.toString()),
          0
        );

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
    if (!tenant?.id || !selectedLocation?.id) return;

    try {
      const allTransactions: Transaction[] = [];

      for (const account of accounts) {
        if (selectedAccount !== "all" && account.id !== selectedAccount)
          continue;

        // Fetch income transactions
        let incomeQuery = supabase
          .from("income")
          .select("id, date, amount, type, note")
          .eq("account_id", account.id)
          .eq("tenant_id", tenant.id);

        // Fetch expense transactions
        let expenseQuery = supabase
          .from("expenses")
          .select("id, date, amount, main_type, sub_type, note")
          .eq("account_id", account.id)
          .eq("tenant_id", tenant.id);

        // Apply date filters
        if (dateFrom) {
          incomeQuery = incomeQuery.gte("date", dateFrom);
          expenseQuery = expenseQuery.gte("date", dateFrom);
        }
        if (dateTo) {
          incomeQuery = incomeQuery.lte("date", dateTo);
          expenseQuery = expenseQuery.lte("date", dateTo);
        }

        const [incomeResult, expenseResult] = await Promise.all([
          incomeQuery.order("date", { ascending: false }),
          expenseQuery.order("date", { ascending: false }),
        ]);

        // Process income transactions
        (incomeResult.data || []).forEach((item) => {
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
        (expenseResult.data || []).forEach((item) => {
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

  const filteredBalances = accountBalances.filter((balance) => {
    const matchesSearch = balance.account.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" || balance.account.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.account_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAccountPress = (accountId: string) => {
    console.log("View account:", accountId);
  };

  const handleTransactionPress = (transactionId: string) => {
    console.log("View transaction:", transactionId);
  };

  const handleExport = () => {
    // TODO: Implement CSV export for mobile
    Alert.alert("Export", "Export functionality will be implemented soon");
  };

  const getTotalAssets = () => {
    const total = accountBalances.reduce(
      (sum, balance) => sum + balance.currentBalance,
      0
    );
    const currency = accounts[0]?.currency || "USD";
    return `${currency} ${total
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const getActiveAccountsCount = () => {
    return accountBalances.filter((b) => b.account.status === "active").length;
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-sm text-gray-600 mt-4">Loading accounts...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      {/* Header Actions */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-base font-semibold text-gray-900">
          Account Reports
        </Text>
        <TouchableOpacity
          onPress={handleExport}
          className="flex-row items-center gap-1 bg-blue-500 px-3 py-2 rounded-lg"
        >
          <Ionicons name="download-outline" size={16} color="#fff" />
          <Text className="text-white text-xs font-medium">Export</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View className="flex-row gap-3 mb-4">
        <StatCard
          title="Total Assets"
          value={getTotalAssets()}
          icon="wallet"
          color="#10b981"
        />
        <StatCard
          title="Active"
          value={getActiveAccountsCount().toString()}
          icon="checkmark-circle"
          color="#3b82f6"
        />
      </View>

      {/* Search Bar */}
      <View className="bg-gray-100 rounded-lg px-3 py-2 mb-3 flex-row items-center">
        <Ionicons name="search" size={18} color="#666" />
        <TextInput
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-2 text-sm text-gray-900"
          placeholderTextColor="#999"
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View className="flex-row gap-2 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab("balances")}
          className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg ${
            activeTab === "balances" ? "bg-blue-500" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name="wallet-outline"
            size={18}
            color={activeTab === "balances" ? "#ffffff" : "#666666"}
          />
          <Text
            className={`text-sm font-medium ${
              activeTab === "balances" ? "text-white" : "text-gray-600"
            }`}
          >
            Balances
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("transactions")}
          className={`flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-lg ${
            activeTab === "transactions" ? "bg-blue-500" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name="list-outline"
            size={18}
            color={activeTab === "transactions" ? "#ffffff" : "#666666"}
          />
          <Text
            className={`text-sm font-medium ${
              activeTab === "transactions" ? "text-white" : "text-gray-600"
            }`}
          >
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips (only for balances tab) */}
      {activeTab === "balances" && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          <View className="flex-row gap-2">
            {["all", "active", "inactive"].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setFilterType(filter as any)}
                className={`px-4 py-2 rounded-full ${
                  filterType === filter ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filterType === filter ? "text-white" : "text-gray-700"
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Content based on active tab */}
      {activeTab === "balances" ? (
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Accounts ({filteredBalances.length})
          </Text>
          {filteredBalances.map((balance) => (
            <AccountCard
              key={balance.account.id}
              account={balance.account}
              balance={balance}
              onPress={() => handleAccountPress(balance.account.id)}
            />
          ))}

          {filteredBalances.length === 0 && (
            <View className="items-center py-10">
              <Ionicons name="folder-open-outline" size={48} color="#ccc" />
              <Text className="text-sm text-gray-600 mt-3">
                No accounts found
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Recent Transactions ({filteredTransactions.length})
          </Text>
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onPress={() => handleTransactionPress(transaction.id)}
            />
          ))}

          {filteredTransactions.length === 0 && (
            <View className="items-center py-10">
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text className="text-sm text-gray-600 mt-3">
                No transactions found
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
